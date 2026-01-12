import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Premium/Sınırsız kontrolü - isUnlimited flag'ını kontrol eder
async function isPremiumUser(userId: string): Promise<boolean> {
    const subscription = await prisma.subscription.findFirst({
        where: {
            userId,
            status: 'ACTIVE'
        }
    })

    if (!subscription) {
        return false
    }

    // Plan adı PREMIUM ise doğrudan kabul et (geriye dönük uyumluluk)
    if (subscription.plan === 'PREMIUM') {
        return true
    }

    // SiteSettings'ten subscription_plans JSON'ını çek
    const plansSetting = await prisma.siteSettings.findUnique({
        where: { key: 'subscription_plans' }
    })

    if (plansSetting?.value) {
        try {
            const plans = JSON.parse(plansSetting.value as string)
            const userPlan = plans.find((p: { name: string }) => p.name === subscription.plan)
            if (userPlan?.isUnlimited) {
                return true
            }
        } catch (e) {
            console.error('Failed to parse subscription plans:', e)
        }
    }

    return false
}

// GET - Sohbet odaları veya mesajları getir
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 })
        }

        // Premium kontrolü
        const isPremium = await isPremiumUser(session.user.id)
        if (!isPremium) {
            return NextResponse.json({ error: 'Bu özellik Premium üyelere özeldir' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const roomId = searchParams.get('roomId')
        const consultantId = searchParams.get('consultantId')

        // Danışman listesi
        if (!roomId && !consultantId) {
            const consultants = await prisma.consultant.findMany({
                where: { isActive: true },
                orderBy: { name: 'asc' }
            })

            // Kullanıcının sohbet odaları
            const rooms = await prisma.chatRoom.findMany({
                where: { userId: session.user.id },
                include: {
                    consultant: { select: { id: true, name: true, title: true, avatarUrl: true } },
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                }
            })

            // Okunmamış mesaj sayısı
            const unreadCounts = await prisma.chatMessage.groupBy({
                by: ['roomId'],
                where: {
                    room: { userId: session.user.id },
                    senderType: 'CONSULTANT',
                    isRead: false
                },
                _count: { id: true }
            })

            const unreadMap = new Map(unreadCounts.map(u => [u.roomId, u._count.id]))

            const roomsWithUnread = rooms.map(room => ({
                ...room,
                unreadCount: unreadMap.get(room.id) || 0,
                lastMessage: room.messages[0] || null
            }))

            return NextResponse.json({ consultants, rooms: roomsWithUnread })
        }

        // Belirli danışmanla sohbet odası al/oluştur
        if (consultantId && !roomId) {
            let room = await prisma.chatRoom.findUnique({
                where: {
                    userId_consultantId: {
                        userId: session.user.id,
                        consultantId
                    }
                },
                include: {
                    consultant: { select: { id: true, name: true, title: true, avatarUrl: true, phone: true } }
                }
            })

            if (!room) {
                room = await prisma.chatRoom.create({
                    data: {
                        userId: session.user.id,
                        consultantId
                    },
                    include: {
                        consultant: { select: { id: true, name: true, title: true, avatarUrl: true, phone: true } }
                    }
                })
            }

            return NextResponse.json({ room })
        }

        // Mesajları getir
        if (roomId) {
            // Odanın bu kullanıcıya ait olduğunu kontrol et
            const room = await prisma.chatRoom.findFirst({
                where: { id: roomId, userId: session.user.id },
                include: {
                    consultant: { select: { id: true, name: true, title: true, avatarUrl: true, phone: true } }
                }
            })

            if (!room) {
                return NextResponse.json({ error: 'Sohbet odası bulunamadı' }, { status: 404 })
            }

            const messages = await prisma.chatMessage.findMany({
                where: { roomId },
                orderBy: { createdAt: 'asc' }
            })

            // Danışman mesajlarını okundu olarak işaretle
            await prisma.chatMessage.updateMany({
                where: {
                    roomId,
                    senderType: 'CONSULTANT',
                    isRead: false
                },
                data: { isRead: true }
            })

            return NextResponse.json({ room, messages })
        }

        return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 })
    } catch (error) {
        console.error('Chat GET error:', error)
        return NextResponse.json({ error: 'Mesajlar alınamadı' }, { status: 500 })
    }
}

// POST - Mesaj gönder
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 })
        }

        // Premium kontrolü
        const isPremium = await isPremiumUser(session.user.id)
        if (!isPremium) {
            return NextResponse.json({ error: 'Bu özellik Premium üyelere özeldir' }, { status: 403 })
        }

        const { roomId, content } = await request.json()

        if (!roomId || !content?.trim()) {
            return NextResponse.json({ error: 'Mesaj içeriği gerekli' }, { status: 400 })
        }

        // Odanın bu kullanıcıya ait olduğunu kontrol et
        const room = await prisma.chatRoom.findFirst({
            where: { id: roomId, userId: session.user.id }
        })

        if (!room) {
            return NextResponse.json({ error: 'Sohbet odası bulunamadı' }, { status: 404 })
        }

        // Görüşme kapalı mı kontrol et
        if (room.status === 'CLOSED') {
            return NextResponse.json({ error: 'Bu görüşme kapatılmış, yeni mesaj gönderemezsiniz' }, { status: 400 })
        }

        // Mesaj oluştur
        const message = await prisma.chatMessage.create({
            data: {
                roomId,
                senderId: session.user.id,
                senderType: 'USER',
                content: content.trim()
            }
        })

        // Oda güncelleme zamanını değiştir
        await prisma.chatRoom.update({
            where: { id: roomId },
            data: { updatedAt: new Date() }
        })

        return NextResponse.json({ success: true, message })
    } catch (error) {
        console.error('Chat POST error:', error)
        return NextResponse.json({ error: 'Mesaj gönderilemedi' }, { status: 500 })
    }
}

// PATCH - Görüşmeyi kapat veya yeniden başlat
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 })
        }

        const { roomId, action } = await request.json()

        if (!roomId || (action !== 'close' && action !== 'restart')) {
            return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 })
        }

        // Odanın bu kullanıcıya ait olduğunu veya admin/moderatör olduğunu kontrol et
        const room = await prisma.chatRoom.findFirst({
            where: { id: roomId },
            include: { consultant: true }
        })

        if (!room) {
            return NextResponse.json({ error: 'Sohbet odası bulunamadı' }, { status: 404 })
        }

        // Oda sahibi, admin veya ilgili moderatör işlem yapabilir
        const isOwner = room.userId === session.user.id
        const isAdmin = session.user.role === 'ADMIN'
        const isModerator = session.user.role === 'MODERATOR' && room.consultant?.userId === session.user.id

        if (!isOwner && !isAdmin && !isModerator) {
            return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 })
        }

        if (action === 'close') {
            if (room.status === 'CLOSED') {
                return NextResponse.json({ error: 'Bu görüşme zaten kapatılmış' }, { status: 400 })
            }

            const updatedRoom = await prisma.chatRoom.update({
                where: { id: roomId },
                data: {
                    status: 'CLOSED',
                    closedAt: new Date(),
                    closedBy: session.user.id
                }
            })

            return NextResponse.json({ success: true, room: updatedRoom })
        } else if (action === 'restart') {
            // Sadece oda sahibi yeniden başlatabilir
            if (!isOwner) {
                return NextResponse.json({ error: 'Sadece kullanıcı sohbeti yeniden başlatabilir' }, { status: 403 })
            }

            if (room.status !== 'CLOSED') {
                return NextResponse.json({ error: 'Sohbet zaten aktif' }, { status: 400 })
            }

            const updatedRoom = await prisma.chatRoom.update({
                where: { id: roomId },
                data: {
                    status: 'ACTIVE',
                    closedAt: null,
                    closedBy: null
                }
            })

            return NextResponse.json({ success: true, room: updatedRoom })
        }

        return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 })
    } catch (error) {
        console.error('Chat PATCH error:', error)
        return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 })
    }
}

