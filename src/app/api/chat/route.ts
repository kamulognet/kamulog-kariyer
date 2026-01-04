import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import openai, { generateCVChat, type ChatMessage } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

// Varsayılan jeton maliyeti
const DEFAULT_CHAT_TOKEN_COST = 2

// Chat jeton maliyetini admin ayarlarından al
async function getChatTokenCost() {
    try {
        const setting = await prisma.siteSettings.findUnique({
            where: { key: 'cv_chat_token_cost' }
        })
        if (setting?.value) {
            return parseInt(setting.value, 10) || DEFAULT_CHAT_TOKEN_COST
        }
    } catch (error) {
        console.error('Error fetching chat token cost:', error)
    }
    return DEFAULT_CHAT_TOKEN_COST
}

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

        // Jeton maliyetini al
        const tokenCost = await getChatTokenCost()

        // Kullanıcı jeton kontrolü
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { credits: true }
        })

        if (!user || user.credits < tokenCost) {
            return NextResponse.json({
                error: `Bu mesaj için ${tokenCost} jeton gerekiyor. Mevcut jetonunuz: ${user?.credits || 0}`,
                credits: user?.credits || 0,
                required: tokenCost,
            }, { status: 403 })
        }

        // Jetonları düş
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { credits: { decrement: tokenCost } },
            select: { credits: true }
        })

        console.log(`[CV Chat] Deducted ${tokenCost} tokens from user ${session.user.id}. New balance: ${updatedUser.credits}`)

        // OpenAI chat
        const rawResponse = await generateCVChat(messages as ChatMessage[])

        // [CV_READY] kontrolü
        const isFinished = rawResponse.includes('[CV_READY]')
        const response = rawResponse.replace('[CV_READY]', '').trim()

        // Session'ı kaydet/güncelle
        if (sessionId) {
            await prisma.chatSession.update({
                where: { id: sessionId },
                data: {
                    messages: JSON.stringify([...messages, { role: 'assistant', content: rawResponse }]),
                    updatedAt: new Date(),
                },
            })
        }

        return NextResponse.json({
            message: response,
            isFinished,
            creditsUsed: tokenCost,
            remainingCredits: updatedUser.credits,
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
