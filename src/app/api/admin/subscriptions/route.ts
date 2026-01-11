import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Default plans with tokens (fallback when no settings found)
const DEFAULT_PLANS = [
    { id: 'FREE', tokens: 10 },
    { id: 'BASIC', tokens: 100 },
    { id: 'PREMIUM', tokens: 500 },
]

// Get plan tokens from settings or default
async function getPlanTokens(planId: string): Promise<number> {
    console.log(`[getPlanTokens] Looking for plan: ${planId}`)

    try {
        const setting = await prisma.siteSettings.findUnique({
            where: { key: 'subscription_plans' }
        })

        console.log(`[getPlanTokens] SiteSettings found: ${!!setting}`)

        if (setting?.value) {
            const plans = JSON.parse(setting.value)
            console.log(`[getPlanTokens] Parsed plans count: ${plans.length}`)

            const plan = plans.find((p: any) => p.id === planId)
            console.log(`[getPlanTokens] Found plan for ${planId}:`, plan ? `tokens=${plan.tokens}` : 'NOT FOUND')

            if (plan?.tokens !== undefined && plan.tokens !== null) {
                console.log(`[getPlanTokens] Returning tokens from settings: ${plan.tokens}`)
                return plan.tokens
            }
        }
    } catch (error) {
        console.error('[getPlanTokens] Error fetching plan tokens:', error)
    }

    // Fallback to default
    const defaultPlan = DEFAULT_PLANS.find(p => p.id === planId)
    const fallbackTokens = defaultPlan?.tokens || 0
    console.log(`[getPlanTokens] Using fallback tokens for ${planId}: ${fallbackTokens}`)
    return fallbackTokens
}

// Admin middleware
async function checkAdmin() {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
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
                            credits: true,
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

            const selectedPlan = plan || 'BASIC'

            const subscription = await prisma.subscription.update({
                where: { id: subscriptionId },
                data: {
                    status: 'ACTIVE',
                    plan: selectedPlan,
                    expiresAt,
                },
                include: {
                    user: {
                        select: { name: true, email: true, credits: true },
                    },
                },
            })

            // Get tokens from admin plan settings
            const tokenAmount = await getPlanTokens(selectedPlan)

            if (tokenAmount > 0) {
                await prisma.user.update({
                    where: { id: subscription.userId },
                    data: { credits: { increment: tokenAmount } }
                })
            }

            // Log the action
            await prisma.adminLog.create({
                data: {
                    adminId: session.user.id,
                    action: 'APPROVE',
                    targetType: 'SUBSCRIPTION',
                    targetId: subscriptionId,
                    details: JSON.stringify({
                        plan: selectedPlan,
                        tokensAdded: tokenAmount,
                        months
                    })
                }
            })

            return NextResponse.json({
                message: `Abonelik onaylandı ve ${tokenAmount} jeton yüklendi`,
                subscription,
                tokensAdded: tokenAmount
            })
        } else {
            const subscription = await prisma.subscription.update({
                where: { id: subscriptionId },
                data: { status: 'CANCELLED' },
            })

            // Log the action
            await prisma.adminLog.create({
                data: {
                    adminId: session.user.id,
                    action: 'REJECT',
                    targetType: 'SUBSCRIPTION',
                    targetId: subscriptionId,
                }
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
                    select: { name: true, email: true, credits: true },
                },
            },
        })

        // Get tokens from admin plan settings
        const tokenAmount = await getPlanTokens(plan)

        if (tokenAmount > 0) {
            await prisma.user.update({
                where: { id: updated.userId },
                data: { credits: { increment: tokenAmount } }
            })
        }

        // Log the action
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id,
                action: 'ACTIVATE',
                targetType: 'SUBSCRIPTION',
                targetId: subscription.id,
                details: JSON.stringify({
                    orderCode,
                    plan,
                    tokensAdded: tokenAmount,
                    months
                })
            }
        })

        return NextResponse.json({
            message: `Abonelik aktifleştirildi ve ${tokenAmount} jeton yüklendi`,
            subscription: updated,
            tokensAdded: tokenAmount
        })
    } catch (error) {
        console.error('Activate by order code error:', error)
        return NextResponse.json({ error: 'Abonelik aktifleştirilemedi' }, { status: 500 })
    }
}
