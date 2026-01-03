import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { matchCVWithJobs, analyzeSingleJobMatch, suggestBestJobs } from '@/lib/job-matcher'
import { checkLimit, incrementUsage } from '@/lib/usage-limiter'

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

        // Limit ve Kredi Kontrolü
        const isPremium = user.subscription?.plan === 'PREMIUM'
        const creditCost = action === 'analyze' ? 2 : 1

        // Kullanım limitini kontrol et
        const usageCheck = await checkLimit(session.user.id, 'JOB_MATCH')

        let canProceed = false
        let useCredit = false

        if (usageCheck.allowed) {
            // Limiti dolmamış, işlem yapabilir (kredisiz)
            canProceed = true
            useCredit = false
        } else {
            // Limiti dolmuş, kredisi varsa krediyle devam edebilir
            if (user.credits >= creditCost) {
                canProceed = true
                useCredit = true
            }
        }

        // Premium her türlü geçer
        if (isPremium) {
            canProceed = true
            useCredit = false
        }

        if (!canProceed) {
            return NextResponse.json({
                error: 'İşlem limitiniz doldu ve yeterli krediniz yok',
                credits: user.credits,
                required: creditCost,
                usageLimit: usageCheck.limit,
                usageCurrent: usageCheck.current
            }, { status: 403 })
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

        // Krediyi düş veya kullanımı artır
        if (!isPremium) {
            if (useCredit) {
                await prisma.user.update({
                    where: { id: session.user.id },
                    data: { credits: { decrement: creditCost } },
                })
            } else {
                // Kredi kullanmıyorsa monthly limit artır
                await incrementUsage(session.user.id, 'JOB_MATCH')
            }
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
