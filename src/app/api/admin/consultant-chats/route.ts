import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Tüm danışman sohbetlerini getir
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const consultantId = searchParams.get('consultantId')
        const roomId = searchParams.get('roomId')

        // MODERATOR ise kendi danışman kaydını bul
        let moderatorConsultantId: string | null = null
        if (session.user.role === 'MODERATOR') {
            const myConsultant = await prisma.consultant.findUnique({
                where: { userId: session.user.id }
            })
            if (!myConsultant) {
                return NextResponse.json({ error: 'Danışman kaydınız bulunamadı' }, { status: 403 })
            }
            moderatorConsultantId = myConsultant.id
        }

        // Belirli bir odanın mesajları
        if (roomId) {
            const whereClause: any = { id: roomId }
            // MODERATOR ise sadece kendi odalarını görebilir
            if (moderatorConsultantId) {
                whereClause.consultantId = moderatorConsultantId
            }

            const room = await prisma.chatRoom.findFirst({
                where: whereClause,
                include: {
                    user: { select: { id: true, name: true, email: true, phoneNumber: true } },
                    consultant: { select: { id: true, name: true, title: true } },
                    messages: {
                        orderBy: { createdAt: 'asc' }
                    }
                }
            })

            if (!room) {
                return NextResponse.json({ error: 'Sohbet bulunamadı' }, { status: 404 })
            }

            return NextResponse.json({ room })
        }

        // Danışman listesi ve istatistikleri
        const consultantWhereClause: any = { isActive: true }
        // MODERATOR ise sadece kendi kaydını görsün
        if (moderatorConsultantId) {
            consultantWhereClause.id = moderatorConsultantId
        }

        const consultants = await prisma.consultant.findMany({
            where: consultantWhereClause,
            include: {
                chatRooms: {
                    include: {
                        user: { select: { name: true, email: true } },
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1
                        },
                        _count: { select: { messages: true } }
                    },
                    orderBy: { updatedAt: 'desc' }
                },
                _count: { select: { chatRooms: true } }
            },
            orderBy: { name: 'asc' }
        })

        // Belirli danışmanın sohbetleri
        if (consultantId) {
            // MODERATOR başka danışmanın sohbetlerine erişemez
            if (moderatorConsultantId && consultantId !== moderatorConsultantId) {
                return NextResponse.json({ error: 'Bu danışmanın sohbetlerine erişim yetkiniz yok' }, { status: 403 })
            }
            const consultant = consultants.find((c: { id: string }) => c.id === consultantId)
            return NextResponse.json({ consultant })
        }

        // Genel istatistikler
        const stats = {
            totalConsultants: consultants.length,
            totalRooms: consultants.reduce((sum: number, c: { _count: { chatRooms: number } }) => sum + c._count.chatRooms, 0),
            totalMessages: moderatorConsultantId
                ? await prisma.chatMessage.count({
                    where: { room: { consultantId: moderatorConsultantId } }
                })
                : await prisma.chatMessage.count()
        }

        return NextResponse.json({ consultants, stats })
    } catch (error) {
        console.error('Admin chat GET error:', error)
        return NextResponse.json({ error: 'Veri alınamadı' }, { status: 500 })
    }
}

// POST - Danışman olarak mesaj gönder (admin)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const { roomId, consultantId, content } = await request.json()

        if (!roomId || !consultantId || !content?.trim()) {
            return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 })
        }

        // Odanın bu danışmana ait olduğunu kontrol et
        const room = await prisma.chatRoom.findFirst({
            where: { id: roomId, consultantId }
        })

        if (!room) {
            return NextResponse.json({ error: 'Sohbet odası bulunamadı' }, { status: 404 })
        }

        // Danışman mesajı oluştur
        const message = await prisma.chatMessage.create({
            data: {
                roomId,
                senderId: consultantId,
                senderType: 'CONSULTANT',
                content: content.trim()
            }
        })

        // Oda güncelleme zamanını değiştir
        await prisma.chatRoom.update({
            where: { id: roomId },
            data: { updatedAt: new Date() }
        })

        // Log kaydı
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id,
                action: 'CONSULTANT_MESSAGE',
                targetType: 'CHAT',
                targetId: roomId,
                details: `Danışman mesajı gönderildi. Danışman: ${consultantId}`
            }
        })

        return NextResponse.json({ success: true, message })
    } catch (error) {
        console.error('Admin chat POST error:', error)
        return NextResponse.json({ error: 'Mesaj gönderilemedi' }, { status: 500 })
    }
}
