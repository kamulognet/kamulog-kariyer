import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { analyzeCVCompatibility } from '@/lib/openai'
import { incrementUsage } from '@/lib/usage-limiter'

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

        // Kullanıcı kredisini kontrol et
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { credits: true }
        })

        if (!user || user.credits < 1) {
            return NextResponse.json({ error: 'Yetersiz kredi. Lütfen kredi yükleyin.' }, { status: 403 })
        }

        // Verileri getir
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

        // Transaction ile analizi kaydet ve krediyi düş
        const [analysis] = await prisma.$transaction([
            prisma.cVAnalysis.create({
                data: {
                    userId: session.user.id,
                    cvId: cv.id,
                    jobId: job.id,
                    score: analysisResult.score,
                    feedback: analysisResult.feedback,
                },
            }),
            prisma.user.update({
                where: { id: session.user.id },
                data: { credits: { decrement: 1 } }
            })
        ])

        return NextResponse.json({ analysis })
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
