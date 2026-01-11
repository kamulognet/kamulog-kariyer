import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { analyzeCVCompatibility } from '@/lib/openai'

// Varsayılan jeton maliyeti
const DEFAULT_ANALYZE_TOKEN_COST = 5

// Analiz jeton maliyetini admin ayarlarından al
async function getAnalyzeTokenCost() {
    try {
        const setting = await prisma.siteSettings.findUnique({
            where: { key: 'job_analyze_token_cost' }
        })
        if (setting?.value) {
            return parseInt(setting.value, 10) || DEFAULT_ANALYZE_TOKEN_COST
        }
    } catch (error) {
        console.error('Error fetching analyze token cost:', error)
    }
    return DEFAULT_ANALYZE_TOKEN_COST
}

// Sınırsız plan kontrolü
async function hasUnlimitedPlan(userId: string): Promise<boolean> {
    try {
        const subscription = await prisma.subscription.findUnique({
            where: { userId },
            select: { plan: true, status: true }
        })

        if (!subscription || subscription.status !== 'ACTIVE') return false

        const planSetting = await prisma.siteSettings.findUnique({
            where: { key: 'subscription_plans' }
        })

        if (planSetting?.value) {
            const plans = JSON.parse(planSetting.value)
            const userPlan = plans.find((p: any) => p.name === subscription.plan)
            return userPlan?.isUnlimited === true
        }
        return false
    } catch (error) {
        console.error('Error checking unlimited plan:', error)
        return false
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { cvId, jobId } = await req.json()

        if (!cvId || !jobId) {
            return NextResponse.json({ error: 'CV ID ve İlan ID gerekli' }, { status: 400 })
        }

        // Sınırsız plan kontrolü
        const isUnlimited = await hasUnlimitedPlan(session.user.id)

        if (isUnlimited) {
            console.log(`[Job Analyze] User ${session.user.id} has UNLIMITED plan - skipping credit checks`)
        }

        // Jeton maliyetini al
        const tokenCost = await getAnalyzeTokenCost()

        // Kullanıcı kredisini kontrol et
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { credits: true }
        })

        let updatedUser = { credits: user?.credits || 0 }

        // Sınırsız değilse jeton kontrolü ve düşürme
        if (!isUnlimited) {
            if (!user || user.credits < tokenCost) {
                return NextResponse.json({
                    error: `Bu analiz için ${tokenCost} jeton gerekiyor. Mevcut jetonunuz: ${user?.credits || 0}`,
                    credits: user?.credits || 0,
                    required: tokenCost,
                }, { status: 403 })
            }

            // Verileri getir
            const [cv, job] = await Promise.all([
                prisma.cV.findUnique({ where: { id: cvId } }),
                prisma.jobListing.findUnique({ where: { id: jobId } }),
            ])

            if (!cv || !job) {
                return NextResponse.json({ error: 'Veri bulunamadı' }, { status: 404 })
            }

            // Jetonları düş
            updatedUser = await prisma.user.update({
                where: { id: session.user.id },
                data: { credits: { decrement: tokenCost } },
                select: { credits: true }
            })

            console.log(`[Job Analyze] Deducted ${tokenCost} tokens from user ${session.user.id}. New balance: ${updatedUser.credits}`)
        }

        // Verileri getir (sınırsız kullanıcılar için de gerekli)
        const [cv, job] = await Promise.all([
            prisma.cV.findUnique({ where: { id: cvId } }),
            prisma.jobListing.findUnique({ where: { id: jobId } }),
        ])

        if (!cv || !job) {
            return NextResponse.json({ error: 'Veri bulunamadı' }, { status: 404 })
        }

        // AI Analizi
        const cvData = JSON.parse(cv.data)
        const analysisResult = await analyzeCVCompatibility(cvData, {
            title: job.title,
            company: job.company,
            description: job.description,
            requirements: job.requirements ?? undefined,
        })

        // Analizi kaydet
        const analysis = await prisma.cVAnalysis.create({
            data: {
                userId: session.user.id,
                cvId: cv.id,
                jobId: job.id,
                score: analysisResult.score,
                feedback: analysisResult.feedback,
            },
        })

        return NextResponse.json({
            analysis,
            creditsUsed: isUnlimited ? 0 : tokenCost,
            remainingCredits: isUnlimited ? -1 : updatedUser.credits,
            isUnlimited,
        })
    } catch (error) {
        console.error('Analysis error:', error)
        return NextResponse.json({ error: 'Analiz başarısız' }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const analyses = await prisma.cVAnalysis.findMany({
            where: { userId: session.user.id },
            include: {
                job: true,
                cv: {
                    select: { title: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json({ analyses })
    } catch (error) {
        return NextResponse.json({ error: 'Analizler yüklenemedi' }, { status: 500 })
    }
}
