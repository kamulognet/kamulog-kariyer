import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Order {
    id: string
    plan: string
    amount: number
    status: string
    createdAt: string
    expiresAt?: string
}

// GET - Kullanıcının siparişlerini getir
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
        }

        // Satış kayıtlarını ve abonelikleri birleştir
        const [salesRecords, subscription] = await Promise.all([
            prisma.salesRecord.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    plan: true,
                    amount: true,
                    status: true,
                    createdAt: true
                }
            }),
            prisma.subscription.findUnique({
                where: { userId: session.user.id },
                select: {
                    id: true,
                    plan: true,
                    status: true,
                    expiresAt: true,
                    createdAt: true
                }
            })
        ])

        // Siparişleri formatla
        const orders: Order[] = salesRecords.map(record => ({
            id: record.id,
            plan: record.plan,
            amount: record.amount,
            status: record.status === 'completed' ? 'ACTIVE' :
                record.status === 'pending' ? 'PENDING' : 'EXPIRED',
            createdAt: record.createdAt.toISOString(),
            expiresAt: undefined
        }))

        // Eğer aktif abonelik varsa ve satış kaydı yoksa
        if (subscription && !salesRecords.find(s => s.plan === subscription.plan)) {
            orders.unshift({
                id: subscription.id,
                plan: subscription.plan,
                amount: 0,
                status: subscription.status,
                createdAt: subscription.createdAt.toISOString(),
                expiresAt: subscription.expiresAt?.toISOString()
            })
        }

        return NextResponse.json(orders)
    } catch (error) {
        console.error('Error fetching orders:', error)
        return NextResponse.json({ error: 'Siparişler yüklenemedi' }, { status: 500 })
    }
}
