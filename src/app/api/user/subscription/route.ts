import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get user subscription and orders
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user with subscription and credits
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                credits: true,
                subscription: true,
            }
        })

        // Get order history
        const orders = await prisma.salesRecord.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
                id: true,
                orderNumber: true,
                plan: true,
                amount: true,
                status: true,
                createdAt: true,
            }
        })

        return NextResponse.json({
            subscription: user?.subscription || null,
            credits: user?.credits || 0,
            orders
        })
    } catch (error) {
        console.error('Error fetching subscription:', error)
        return NextResponse.json({ error: 'Failed to load subscription' }, { status: 500 })
    }
}
