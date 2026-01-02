import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Admin middleware
async function checkAdmin() {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
        return null
    }
    return session
}

// Abonelik listesi
export async function GET(req: NextRequest) {
    const session = await checkAdmin()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status') // PENDING, ACTIVE, EXPIRED
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        const where = status ? { status } : {}

        const [subscriptions, total] = await Promise.all([
            prisma.subscription.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
            prisma.subscription.count({ where }),
        ])

        return NextResponse.json({
            subscriptions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Admin subscriptions error:', error)
        return NextResponse.json({ error: 'Abonelikler yüklenemedi' }, { status: 500 })
    }
}

// Abonelik onayla
export async function POST(req: NextRequest) {
    const session = await checkAdmin()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { subscriptionId, action, plan, months = 1 } = await req.json()

        if (!subscriptionId || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Geçersiz parametreler' }, { status: 400 })
        }

        if (action === 'approve') {
            const expiresAt = new Date()
            expiresAt.setMonth(expiresAt.getMonth() + months)

            const subscription = await prisma.subscription.update({
                where: { id: subscriptionId },
                data: {
                    status: 'ACTIVE',
                    plan: plan || 'BASIC',
                    expiresAt,
                },
                include: {
                    user: {
                        select: { name: true, email: true },
                    },
                },
            })

            return NextResponse.json({
                message: 'Abonelik onaylandı',
                subscription,
            })
        } else {
            const subscription = await prisma.subscription.update({
                where: { id: subscriptionId },
                data: { status: 'CANCELLED' },
            })

            return NextResponse.json({
                message: 'Abonelik reddedildi',
                subscription,
            })
        }
    } catch (error) {
        console.error('Update subscription error:', error)
        return NextResponse.json({ error: 'Abonelik güncellenemedi' }, { status: 500 })
    }
}

// Sipariş kodu ile abonelik aktifle
export async function PUT(req: NextRequest) {
    const session = await checkAdmin()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { orderCode, plan = 'BASIC', months = 1 } = await req.json()

        if (!orderCode) {
            return NextResponse.json({ error: 'Sipariş kodu gerekli' }, { status: 400 })
        }

        const subscription = await prisma.subscription.findFirst({
            where: { orderCode },
        })

        if (!subscription) {
            return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 })
        }

        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + months)

        const updated = await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                status: 'ACTIVE',
                plan,
                expiresAt,
            },
            include: {
                user: {
                    select: { name: true, email: true },
                },
            },
        })

        return NextResponse.json({
            message: 'Abonelik aktifleştirildi',
            subscription: updated,
        })
    } catch (error) {
        console.error('Activate by order code error:', error)
        return NextResponse.json({ error: 'Abonelik aktifleştirilemedi' }, { status: 500 })
    }
}
