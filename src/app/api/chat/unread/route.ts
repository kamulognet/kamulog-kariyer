import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Okunmamış mesaj sayısını getir (rol bazlı)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
        }

        const userId = session.user.id
        const role = session.user.role

        let unreadCount = 0

        if (role === 'ADMIN') {
            // Admin: Tüm danışman mesajlarındaki okunmamış sayısı
            unreadCount = await prisma.chatMessage.count({
                where: {
                    isRead: false,
                    senderType: 'USER' // Kullanıcılardan gelen okunmamış mesajlar
                }
            })
        } else if (role === 'MODERATOR') {
            // Moderatör: Kendi danışmanına bağlı kullanıcılardan gelen okunmamış mesajlar
            const consultant = await prisma.consultant.findUnique({
                where: { userId: userId }
            })

            if (consultant) {
                unreadCount = await prisma.chatMessage.count({
                    where: {
                        isRead: false,
                        senderType: 'USER',
                        room: {
                            consultantId: consultant.id
                        }
                    }
                })
            }
        } else {
            // Normal kullanıcı: Danışmanlardan gelen okunmamış mesajlar
            unreadCount = await prisma.chatMessage.count({
                where: {
                    isRead: false,
                    senderType: 'CONSULTANT',
                    room: {
                        userId: userId
                    }
                }
            })
        }

        return NextResponse.json({ unreadCount })
    } catch (error) {
        console.error('Unread count error:', error)
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
    }
}
