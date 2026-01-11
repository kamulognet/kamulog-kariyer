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

// Sınırsız plan kontrolü
async function hasUnlimitedPlan(userId: string): Promise<boolean> {
    try {
        const subscription = await prisma.subscription.findUnique({
            where: { userId },
            select: { plan: true, status: true }
        })

        if (!subscription || subscription.status !== 'ACTIVE') return false

        // Plan ayarlarından isUnlimited kontrolü
        const planSetting = await prisma.siteSettings.findUnique({
            where: { key: 'subscription_plans' }
        })

        if (planSetting?.value) {
            const plans = JSON.parse(planSetting.value)
            const userPlan = plans.find((p: any) => p.id === subscription.plan)
            return userPlan?.isUnlimited === true
        }
        return false
    } catch (error) {
        console.error('Error checking unlimited plan:', error)
        return false
    }
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

        // Sınırsız plan kontrolü
        const isUnlimited = await hasUnlimitedPlan(session.user.id)

        if (isUnlimited) {
            console.log(`[Job Match] User ${session.user.id} has UNLIMITED plan - skipping credit checks`)
        }

        // Kullanıcının kredisi ve şehir bilgisi var mı kontrol et
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                credits: true,
                subscription: true,
                city: true,  // Fatura adresi şehri
            },
        })

        if (!user) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
        }

        // Jeton maliyetlerini al
        const tokenCosts = await getTokenCosts()
        const creditCost = action === 'suggest' ? tokenCosts.suggest :
            action === 'analyze' ? tokenCosts.analyze : tokenCosts.match

        console.log(`[Job Match] Action: ${action}, Token cost: ${creditCost}, User credits: ${user.credits}, Plan: ${user.subscription?.plan || 'FREE'}, Unlimited: ${isUnlimited}`)

        let updatedUser = { credits: user.credits }

        // Sınırsız değilse jeton kontrolü yap
        if (!isUnlimited) {
            if (user.credits < creditCost) {
                return NextResponse.json({
                    error: `Bu işlem için ${creditCost} jeton gerekiyor. Mevcut jetonunuz: ${user.credits}`,
                    credits: user.credits,
                    required: creditCost,
                }, { status: 403 })
            }

            // Jetonları düş
            updatedUser = await prisma.user.update({
                where: { id: session.user.id },
                data: { credits: { decrement: creditCost } },
                select: { credits: true }
            })
            console.log(`[Job Match] Deducted ${creditCost} tokens from user ${session.user.id}. New balance: ${updatedUser.credits}`)
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
                creditsUsed: creditCost,
                remainingCredits: updatedUser.credits,
            })
        } else if (action === 'suggest') {
            // Şehir bilgisini belirle: 1) Fatura adresi 2) CV'den
            let userCity = user.city

            // CV'den şehir al (fatura adresi yoksa)
            if (!userCity && cvData.personalInfo?.address) {
                // CV adresinden şehir çıkarmaya çalış
                const cvAddress = cvData.personalInfo.address
                // Türkiye şehirlerinden eşleşen bul
                const turkishCities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Şanlıurfa', 'Kocaeli', 'Mersin', 'Diyarbakır', 'Hatay', 'Manisa', 'Kayseri', 'Samsun', 'Balıkesir', 'Kahramanmaraş', 'Van', 'Aydın', 'Denizli', 'Sakarya', 'Tekirdağ', 'Muğla', 'Eskişehir', 'Mardin', 'Trabzon', 'Erzurum', 'Ordu', 'Malatya', 'Afyonkarahisar', 'Adıyaman', 'Elazığ', 'Sivas', 'Şırnak', 'Tokat', 'Ağrı', 'Isparta', 'Çorum', 'Kütahya', 'Aksaray', 'Düzce', 'Giresun', 'Uşak', 'Batman', 'Rize', 'Osmaniye', 'Zonguldak', 'Niğde', 'Amasya', 'Edirne', 'Bolu', 'Çanakkale', 'Siirt', 'Kastamonu', 'Kırıkkale', 'Yozgat', 'Muş', 'Nevşehir', 'Bitlis', 'Kırşehir', 'Karaman', 'Kırklareli', 'Bingöl', 'Karabük', 'Sinop', 'Hakkari', 'Bartın', 'Artvin', 'Iğdır', 'Çankırı', 'Gümüşhane', 'Yalova', 'Erzincan', 'Bilecik', 'Tunceli', 'Kilis', 'Ardahan', 'Bayburt']
                for (const city of turkishCities) {
                    if (cvAddress.toLowerCase().includes(city.toLowerCase())) {
                        userCity = city
                        break
                    }
                }
            }

            // İlan türüne göre filtreleme yap
            let jobs
            const requestedType = type || 'ALL'

            if (requestedType === 'PRIVATE' || requestedType === 'ALL') {
                // PRIVATE ilanlar için şehir gerekli
                if (!userCity && (requestedType === 'PRIVATE' || requestedType === 'ALL')) {
                    // Sadece PRIVATE istendi ve şehir yok
                    if (requestedType === 'PRIVATE') {
                        // Jetonu iade et
                        await prisma.user.update({
                            where: { id: session.user.id },
                            data: { credits: { increment: creditCost } }
                        })
                        return NextResponse.json({
                            error: 'Özel sektör ilanlarını görmek için lütfen profilinizden fatura adresinizi (şehir bilginizi) doldurun.',
                            errorType: 'CITY_REQUIRED',
                            redirectTo: '/panel/profil'
                        }, { status: 400 })
                    }
                }
            }

            if (requestedType === 'ALL') {
                // Hem KAMU hem ÖZEL ilanları getir
                // KAMU: tüm şehirler, ÖZEL: kullanıcının şehrindekiler
                const publicJobs = await prisma.jobListing.findMany({
                    where: { type: 'PUBLIC' },
                    take: 25,
                })

                const privateJobs = userCity ? await prisma.jobListing.findMany({
                    where: {
                        type: 'PRIVATE',
                        location: { contains: userCity, mode: 'insensitive' }
                    },
                    take: 25,
                }) : []

                jobs = [...publicJobs, ...privateJobs]
            } else if (requestedType === 'PUBLIC') {
                // Kamu ilanları - tüm şehirler
                jobs = await prisma.jobListing.findMany({
                    where: { type: 'PUBLIC' },
                    take: 50,
                })
            } else {
                // Özel sektör ilanları - sadece kullanıcının şehri
                jobs = await prisma.jobListing.findMany({
                    where: {
                        type: 'PRIVATE',
                        location: { contains: userCity!, mode: 'insensitive' }
                    },
                    take: 50,
                })
            }

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
                userCity: userCity || null,
                creditsUsed: creditCost,
                remainingCredits: updatedUser.credits,
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
                creditsUsed: creditCost,
                remainingCredits: updatedUser.credits,
            })
        }
    } catch (error) {
        console.error('Error matching jobs:', error)
        return NextResponse.json({ error: 'İş eşleştirme sırasında hata oluştu' }, { status: 500 })
    }
}
