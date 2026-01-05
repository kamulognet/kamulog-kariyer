import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - List active consultants (premium users see full info, others see limited)
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        // Danışmanları getir
        const consultants = await prisma.consultant.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        })

        // Premium kontrolü
        let isPremium = false
        if (session?.user?.id) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: {
                    subscription: {
                        select: { plan: true, status: true }
                    }
                }
            })
            isPremium = user?.subscription?.status === 'ACTIVE' && user?.subscription?.plan === 'PREMIUM'
        }

        // Premium olmayan kullanıcılar için telefon numarasını gizle
        const safeConsultants = consultants.map(c => ({
            id: c.id,
            name: c.name,
            title: c.title,
            description: c.description,
            phone: isPremium ? c.phone : null, // Sadece Premium'a göster
            createdAt: c.createdAt
        }))

        return NextResponse.json({
            consultants: safeConsultants,
            isPremium
        })
    } catch (error) {
        console.error('Get public consultants error:', error)
        return NextResponse.json({ error: 'Danışmanlar yüklenemedi' }, { status: 500 })
    }
}
