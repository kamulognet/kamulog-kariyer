import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import openai, { generateCVChat, type ChatMessage } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

// Varsayılan değerler
const DEFAULT_CHAT_TOKEN_COST = 2
const DEFAULT_SESSION_TOKEN_LIMIT = 25

// Chat jeton maliyetini ve session limitini al
async function getChatSettings() {
    try {
        const settings = await prisma.siteSettings.findMany({
            where: {
                key: {
                    in: ['cv_chat_token_cost', 'cv_chat_session_limit']
                }
            }
        })

        let tokenCost = DEFAULT_CHAT_TOKEN_COST
        let sessionLimit = DEFAULT_SESSION_TOKEN_LIMIT

        settings.forEach(s => {
            if (s.key === 'cv_chat_token_cost') {
                tokenCost = parseInt(s.value, 10) || DEFAULT_CHAT_TOKEN_COST
            } else if (s.key === 'cv_chat_session_limit') {
                sessionLimit = parseInt(s.value, 10) || DEFAULT_SESSION_TOKEN_LIMIT
            }
        })

        return { tokenCost, sessionLimit }
    } catch (error) {
        console.error('Error fetching chat settings:', error)
        return { tokenCost: DEFAULT_CHAT_TOKEN_COST, sessionLimit: DEFAULT_SESSION_TOKEN_LIMIT }
    }
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

        // Jeton ayarlarını al
        const { tokenCost, sessionLimit } = await getChatSettings()

        // Session bazlı jeton kullanım kontrolü
        if (sessionId) {
            const chatSession = await prisma.chatSession.findUnique({
                where: { id: sessionId }
            })

            if (chatSession) {
                const messageCount = messages.filter((m: ChatMessage) => m.role === 'user').length
                const usedTokens = messageCount * tokenCost

                if (usedTokens >= sessionLimit) {
                    return NextResponse.json({
                        error: `Bu sohbet için jeton limitine ulaştınız (${sessionLimit} jeton). Yeni bir sohbet başlatın.`,
                        sessionLimitReached: true,
                        usedTokens,
                        sessionLimit,
                    }, { status: 403 })
                }
            }
        }

        // Kullanıcı CV Chat jeton kontrolü (ayrı jeton havuzu)
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { cvChatTokens: true }
        })

        if (!user || user.cvChatTokens < tokenCost) {
            return NextResponse.json({
                error: `Bu mesaj için ${tokenCost} jeton gerekiyor. Mevcut CV sohbet jetonunuz: ${user?.cvChatTokens || 0}`,
                cvChatTokens: user?.cvChatTokens || 0,
                required: tokenCost,
            }, { status: 403 })
        }

        // CV Chat jetonlarını düş (genel krediler değil)
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { cvChatTokens: { decrement: tokenCost } },
            select: { cvChatTokens: true }
        })

        console.log(`[CV Chat] Deducted ${tokenCost} cvChatTokens from user ${session.user.id}. New balance: ${updatedUser.cvChatTokens}`)

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
            remainingCredits: updatedUser.cvChatTokens,
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

        // Kullanıcının fatura bilgilerini al
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                name: true,
                phoneNumber: true,
                address: true,
                city: true,
                district: true
            }
        })

        const chatSession = await prisma.chatSession.create({
            data: {
                userId: session.user.id,
                messages: JSON.stringify([]),
            },
        })

        // Kullanıcının mevcut bilgilerini döndür (AI bunu kullanabilir)
        return NextResponse.json({
            sessionId: chatSession.id,
            userInfo: {
                name: user?.name || '',
                phone: user?.phoneNumber || '',
                address: user?.address || '',
                city: user?.city || '',
                district: user?.district || ''
            }
        })
    } catch (error) {
        console.error('Create session error:', error)
        return NextResponse.json(
            { error: 'Session oluşturulamadı' },
            { status: 500 }
        )
    }
}
