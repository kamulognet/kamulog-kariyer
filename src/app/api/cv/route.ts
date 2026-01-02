import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkLimit, incrementUsage } from '@/lib/usage-limiter'
import { extractCVData, generateProfessionalSummary } from '@/lib/openai'

// CV listesi
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const cvs = await prisma.cV.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                template: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        return NextResponse.json({ cvs })
    } catch (error) {
        console.error('Get CVs error:', error)
        return NextResponse.json({ error: 'CVler yüklenemedi' }, { status: 500 })
    }
}

// Yeni CV oluştur
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Limit kontrolü
        const limitCheck = await checkLimit(session.user.id, 'CV_CREATED')
        if (!limitCheck.allowed) {
            return NextResponse.json({
                error: 'Aylık CV oluşturma limitinize ulaştınız',
                limit: limitCheck.limit,
                current: limitCheck.current,
            }, { status: 429 })
        }

        const { title, chatSessionId, template = 'modern' } = await req.json()

        if (!title || !chatSessionId) {
            return NextResponse.json(
                { error: 'Title ve chatSessionId gerekli' },
                { status: 400 }
            )
        }

        // Chat session'ı al
        const chatSession = await prisma.chatSession.findUnique({
            where: { id: chatSessionId },
        })

        if (!chatSession) {
            return NextResponse.json({ error: 'Chat session bulunamadı' }, { status: 404 })
        }

        // Chat mesajlarından CV verisi extract et
        const messages = JSON.parse(chatSession.messages || '[]')
        const cvData = await extractCVData(messages)

        // Profesyonel özet oluştur
        const summary = await generateProfessionalSummary(cvData)
        const fullCVData = { ...cvData, summary }

        // CV oluştur
        const cv = await prisma.cV.create({
            data: {
                userId: session.user.id,
                title,
                data: JSON.stringify(fullCVData),
                template,
            },
        })

        // Chat session'a CV'yi bağla
        await prisma.chatSession.update({
            where: { id: chatSessionId },
            data: { cvId: cv.id },
        })

        // Kullanımı artır
        await incrementUsage(session.user.id, 'CV_CREATED')

        return NextResponse.json({
            message: 'CV oluşturuldu',
            cv: {
                id: cv.id,
                title: cv.title,
                data: fullCVData,
            },
        })
    } catch (error: unknown) {
        console.error('Create CV error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
        return NextResponse.json({ error: `CV oluşturulamadı: ${errorMessage}` }, { status: 500 })
    }
}
