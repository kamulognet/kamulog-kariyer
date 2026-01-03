import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import openai, { generateCVChat, type ChatMessage } from '@/lib/openai'
import { checkLimit, incrementUsage } from '@/lib/usage-limiter'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { messages, sessionId } = await req.json()

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Messages required' }, { status: 400 })
        }

        // Limit kontrolü
        const limitCheck = await checkLimit(session.user.id, 'CHAT_MESSAGE')
        if (!limitCheck.allowed) {
            return NextResponse.json({
                error: 'Aylık chat limitinize ulaştınız',
                limit: limitCheck.limit,
                current: limitCheck.current,
            }, { status: 429 })
        }

        // OpenAI chat
        const rawResponse = await generateCVChat(messages as ChatMessage[])

        // [CV_READY] kontrolü
        const isFinished = rawResponse.includes('[CV_READY]')
        const response = rawResponse.replace('[CV_READY]', '').trim()

        // Kullanımı artır
        await incrementUsage(session.user.id, 'CHAT_MESSAGE')

        // Session'ı kaydet/güncelle
        if (sessionId) {
            await prisma.chatSession.update({
                where: { id: sessionId },
                data: {
                    messages: JSON.stringify([...messages, { role: 'assistant', content: rawResponse }]), // DB'ye orijinal halini kaydet (etiketle beraber olabilir, sorun yok)
                    updatedAt: new Date(),
                },
            })
        }

        return NextResponse.json({
            message: response,
            isFinished,
            remaining: limitCheck.remaining - 1,
        })
    } catch (error: unknown) {
        console.error('Chat error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
        return NextResponse.json(
            { error: `Chat işlemi başarısız: ${errorMessage}` },
            { status: 500 }
        )
    }
}

// Yeni chat session oluştur
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const chatSession = await prisma.chatSession.create({
            data: {
                userId: session.user.id,
                messages: JSON.stringify([]),
            },
        })

        return NextResponse.json({ sessionId: chatSession.id })
    } catch (error) {
        console.error('Create session error:', error)
        return NextResponse.json(
            { error: 'Session oluşturulamadı' },
            { status: 500 }
        )
    }
}
