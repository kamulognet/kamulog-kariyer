import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Moderatörün kendi danışanlarının mesajlarını getir
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
        }

        if (session.user.role !== 'MODERATOR') {
            return NextResponse.json({ error: 'Bu sayfa sadece moderatörler içindir' }, { status: 403 })
        }

        // Moderatörün bağlı olduğu danışmanı bul
        const consultant = await prisma.consultant.findUnique({
            where: { userId: session.user.id }
        })

        if (!consultant) {
            return NextResponse.json({
                error: 'Bu hesaba bağlı bir danışman profili bulunamadı',
                rooms: [],
                stats: { totalRooms: 0, totalMessages: 0, unreadCount: 0 }
            })
        }

        const { searchParams } = new URL(request.url)
        const roomId = searchParams.get('roomId')

        // Tek oda isteniyor
        if (roomId) {
            const room = await prisma.chatRoom.findUnique({
                where: { id: roomId },
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    messages: { orderBy: { createdAt: 'asc' } }
                }
            })

            if (!room || room.consultantId !== consultant.id) {
                return NextResponse.json({ error: 'Oda bulunamadı veya erişim yok' }, { status: 404 })
            }

            // Okunmamış mesajları okundu olarak işaretle
            await prisma.chatMessage.updateMany({
                where: {
                    roomId: roomId,
                    senderType: 'USER',
                    isRead: false
                },
                data: { isRead: true }
            })

            return NextResponse.json({ room })
        }

        // Tüm odaları getir
        const rooms = await prisma.chatRoom.findMany({
            where: { consultantId: consultant.id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1 // Son mesaj
                },
                _count: { select: { messages: true } }
            },
            orderBy: { updatedAt: 'desc' }
        })

        // Okunmamış mesaj sayısı
        const unreadCount = await prisma.chatMessage.count({
            where: {
                senderType: 'USER',
                isRead: false,
                room: { consultantId: consultant.id }
            }
        })

        // İstatistikler
        const totalMessages = await prisma.chatMessage.count({
            where: { room: { consultantId: consultant.id } }
        })

        // Odaları formatla
        const formattedRooms = rooms.map(room => ({
            id: room.id,
            user: room.user,
            status: room.status,
            lastMessage: room.messages[0] || null,
            messageCount: room._count.messages,
            unreadCount: 0, // Her odanın okunmamış sayısını ayrıca hesaplayabiliriz
            createdAt: room.createdAt,
            updatedAt: room.updatedAt
        }))

        return NextResponse.json({
            consultant: {
                id: consultant.id,
                name: consultant.name,
                title: consultant.title
            },
            rooms: formattedRooms,
            stats: {
                totalRooms: rooms.length,
                totalMessages,
                unreadCount
            }
        })
    } catch (error) {
        console.error('Moderator chats error:', error)
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
    }
}

// POST - Mesaj gönder (danışman olarak)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || session.user.role !== 'MODERATOR') {
            return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
        }

        const consultant = await prisma.consultant.findUnique({
            where: { userId: session.user.id }
        })

        if (!consultant) {
            return NextResponse.json({ error: 'Danışman profili bulunamadı' }, { status: 404 })
        }

        const { roomId, content } = await request.json()

        if (!roomId || !content?.trim()) {
            return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 })
        }

        // Odanın bu danışmana ait olduğunu kontrol et
        const room = await prisma.chatRoom.findUnique({
            where: { id: roomId }
        })

        if (!room || room.consultantId !== consultant.id) {
            return NextResponse.json({ error: 'Bu odaya erişim yok' }, { status: 403 })
        }

        if (room.status === 'CLOSED') {
            return NextResponse.json({ error: 'Bu görüşme kapatılmış' }, { status: 400 })
        }

        // Mesajı kaydet
        const message = await prisma.chatMessage.create({
            data: {
                roomId: roomId,
                senderId: consultant.id,
                senderType: 'CONSULTANT',
                content: content.trim()
            }
        })

        // Oda güncelleme zamanını güncelle
        await prisma.chatRoom.update({
            where: { id: roomId },
            data: { updatedAt: new Date() }
        })

        return NextResponse.json({ success: true, message })
    } catch (error) {
        console.error('Send message error:', error)
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
    }
}
