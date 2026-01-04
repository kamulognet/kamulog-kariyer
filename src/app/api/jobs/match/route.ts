import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { matchCVWithJobs, analyzeSingleJobMatch, suggestBestJobs } from '@/lib/job-matcher'

// Varsayılan jeton maliyetleri
const DEFAULT_TOKEN_COSTS = {
    suggest: 10, // BANA UYGUN İŞLER
    analyze: 5,  // YAPAY ZEKA ANALİZİ
    match: 5,    // Toplu eşleştirme
}

// Jeton maliyetlerini admin ayarlarından al
async function getTokenCosts() {
    try {
        const setting = await prisma.siteSettings.findUnique({
            where: { key: 'job_match_token_costs' }
        })
        if (setting?.value) {
            const costs = JSON.parse(setting.value)
            return {
                suggest: costs.suggest ?? DEFAULT_TOKEN_COSTS.suggest,
                analyze: costs.analyze ?? DEFAULT_TOKEN_COSTS.analyze,
                match: costs.match ?? DEFAULT_TOKEN_COSTS.match,
            }
        }
    } catch (error) {
        console.error('Error fetching token costs:', error)
    }
    return DEFAULT_TOKEN_COSTS
}

// POST - CV ile iş ilanlarını eşleştir
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 })
        }

        const body = await request.json()
        const { cvId, jobId, type, action = 'match' } = body

        // Kullanıcının kredisi var mı kontrol et
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { credits: true, subscription: true },
        })

        if (!user) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
        }

        // Jeton maliyetlerini al
        const tokenCosts = await getTokenCosts()
        const creditCost = action === 'suggest' ? tokenCosts.suggest :
            action === 'analyze' ? tokenCosts.analyze : tokenCosts.match

        console.log(`[Job Match] Action: ${action}, Token cost: ${creditCost}, User credits: ${user.credits}`)

        // Premium kontrolü
        const isPremium = user.subscription?.plan === 'PREMIUM'

        // Jeton kontrolü (Premium hariç herkes için)
        if (!isPremium) {
            if (user.credits < creditCost) {
                return NextResponse.json({
                    error: `Bu işlem için ${creditCost} jeton gerekiyor. Mevcut jetonunuz: ${user.credits}`,
                    credits: user.credits,
                    required: creditCost,
                }, { status: 403 })
            }

            // Jetonları düş
            await prisma.user.update({
                where: { id: session.user.id },
                data: { credits: { decrement: creditCost } },
            })
            console.log(`[Job Match] Deducted ${creditCost} tokens from user ${session.user.id}`)
        }

        // CV'yi getir
        const cv = await prisma.cV.findFirst({
            where: { id: cvId, userId: session.user.id },
        })

        if (!cv) {
            return NextResponse.json({ error: 'CV bulunamadı' }, { status: 404 })
        }

        let cvData
        try {
            cvData = JSON.parse(cv.data)
        } catch {
            return NextResponse.json({ error: 'CV verisi okunamadı' }, { status: 400 })
        }

        // Action'a göre işlem yap
        if (action === 'analyze' && jobId) {
            // Tek bir ilan için detaylı analiz
            const job = await prisma.jobListing.findUnique({ where: { id: jobId } })
            if (!job) {
                return NextResponse.json({ error: 'İlan bulunamadı' }, { status: 404 })
            }

            const analysis = await analyzeSingleJobMatch(cvData, {
                id: job.id,
                title: job.title,
                company: job.company,
                location: job.location || undefined,
                description: job.description,
                requirements: job.requirements || undefined,
                type: job.type,
            })

            // Analiz kaydı
            await prisma.cVAnalysis.create({
                data: {
                    userId: session.user.id,
                    cvId: cv.id,
                    jobId: job.id,
                    score: analysis.score,
                    feedback: analysis.feedback,
                }
            })

            return NextResponse.json({
                analysis,
                job: {
                    id: job.id,
                    title: job.title,
                    company: job.company,
                    type: job.type,
                },
                creditsUsed: isPremium ? 0 : creditCost,
                remainingCredits: isPremium ? -1 : user.credits - creditCost,
            })
        } else if (action === 'suggest') {
            // En uygun ilanları öner - Pool size artırıldı
            const jobs = await prisma.jobListing.findMany({
                where: type && type !== 'ALL' ? { type } : undefined,
                take: 50,
            })

            const suggestions = await suggestBestJobs(cvData, jobs.map(j => ({
                id: j.id,
                title: j.title,
                company: j.company,
                location: j.location || undefined,
                description: j.description,
                requirements: j.requirements || undefined,
                type: j.type,
            })), 5)

            // Önerilen ilanların detaylarını getir
            const suggestedJobs = suggestions
                .map(s => {
                    const job = jobs.find(j => j.id === s.jobId)
                    return job ? { ...job, suggestionReason: s.reason, isAlternative: s.isAlternative } : null
                })
                .filter(Boolean)

            return NextResponse.json({
                suggestions: suggestedJobs,
                creditsUsed: isPremium ? 0 : creditCost,
                remainingCredits: isPremium ? -1 : user.credits - creditCost,
            })
        } else {
            // Toplu eşleştirme
            const jobs = await prisma.jobListing.findMany({
                where: type && type !== 'ALL' ? { type } : undefined,
            })

            const matches = await matchCVWithJobs(
                cvData,
                jobs.map(j => ({
                    id: j.id,
                    title: j.title,
                    company: j.company,
                    location: j.location || undefined,
                    description: j.description,
                    requirements: j.requirements || undefined,
                    type: j.type,
                })),
                { type }
            )

            return NextResponse.json({
                matches,
                totalJobs: jobs.length,
                creditsUsed: isPremium ? 0 : creditCost,
                remainingCredits: isPremium ? -1 : user.credits - creditCost,
            })
        }
    } catch (error) {
        console.error('Error matching jobs:', error)
        return NextResponse.json({ error: 'İş eşleştirme sırasında hata oluştu' }, { status: 500 })
    }
}
