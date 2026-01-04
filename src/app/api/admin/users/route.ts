import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Default plans with tokens (fallback)
const DEFAULT_PLAN_TOKENS: Record<string, number> = {
    FREE: 10,
    BASIC: 100,
    PREMIUM: 500
}

// Get plan tokens from settings
async function getPlanTokens(planId: string): Promise<number> {
    console.log(`[admin/users getPlanTokens] Looking for plan: ${planId}`)

    try {
        const setting = await prisma.siteSettings.findUnique({
            where: { key: 'subscription_plans' }
        })

        console.log(`[admin/users getPlanTokens] SiteSettings found: ${!!setting}`)

        if (setting?.value) {
            const plans = JSON.parse(setting.value)
            console.log(`[admin/users getPlanTokens] Parsed plans count: ${plans.length}`)

            const plan = plans.find((p: any) => p.id === planId)
            console.log(`[admin/users getPlanTokens] Found plan for ${planId}:`, plan ? `tokens=${plan.tokens}` : 'NOT FOUND')

            if (plan?.tokens !== undefined && plan.tokens !== null) {
                console.log(`[admin/users getPlanTokens] Returning tokens from settings: ${plan.tokens}`)
                return plan.tokens
            }
        }
    } catch (error) {
        console.error('[admin/users getPlanTokens] Error fetching plan tokens:', error)
    }

    const fallbackTokens = DEFAULT_PLAN_TOKENS[planId] || 0
    console.log(`[admin/users getPlanTokens] Using fallback tokens for ${planId}: ${fallbackTokens}`)
    return fallbackTokens
}

// Admin middleware
async function checkAdmin() {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
        return null
    }
    return session
}

// Kullanıcı listesi
export async function GET(req: NextRequest) {
    const session = await checkAdmin()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const search = searchParams.get('search') || ''
        const skip = (page - 1) * limit

        const where = search
            ? {
                OR: [
                    { name: { contains: search } },
                    { email: { contains: search } },
                    { phoneNumber: { contains: search } },
                ],
            }
            : {}

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phoneNumber: true,
                    credits: true,
                    role: true,
                    createdAt: true,
                    subscription: {
                        select: {
                            plan: true,
                            status: true,
                            expiresAt: true,
                        },
                    },
                    _count: {
                        select: { cvs: true },
                    },
                },
            }),
            prisma.user.count({ where }),
        ])

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Admin users error:', error)
        return NextResponse.json({ error: 'Kullanıcılar yüklenemedi' }, { status: 500 })
    }
}

// Generate order code
function generateOrderCode(): string {
    const prefix = 'ADM'
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `${prefix}-${timestamp}-${random}`
}

// Kullanıcı güncelle (tam CRUD)
export async function PUT(req: NextRequest) {
    const session = await checkAdmin()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { userId, userIds, name, phoneNumber, credits, role, plan } = body

        // Toplu İşlem
        if (userIds && Array.isArray(userIds)) {
            let updatedCount = 0

            // Kredi Ekleme (Mevcut kredinin üzerine eklenir)
            if (credits !== undefined) {
                const result = await prisma.user.updateMany({
                    where: { id: { in: userIds } },
                    data: { credits: { increment: credits } }
                })
                updatedCount = result.count

                // Log
                await prisma.adminLog.create({
                    data: {
                        adminId: session.user.id,
                        action: 'BULK_UPDATE',
                        targetType: 'USER',
                        targetId: 'BULK',
                        details: JSON.stringify({
                            action: 'ADD_CREDITS',
                            count: updatedCount,
                            amount: credits,
                            userIds
                        }),
                    },
                })
            }

            return NextResponse.json({ message: `${updatedCount} kullanıcı güncellendi` })
        }

        if (!userId) {
            return NextResponse.json({ error: 'userId gerekli' }, { status: 400 })
        }

        // Kullanıcı bilgilerini güncelle
        const updateData: any = {}
        if (name !== undefined) updateData.name = name
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber
        if (credits !== undefined) updateData.credits = credits
        if (role && ['USER', 'ADMIN'].includes(role)) updateData.role = role

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                credits: true,
                role: true,
            },
        })

        // Plan güncellemesi varsa subscription'ı da güncelle
        let tokensAdded = 0

        if (plan && plan !== 'FREE') {
            const existingSubscription = await prisma.subscription.findUnique({
                where: { userId },
            })

            const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            const orderCode = generateOrderCode()

            // Get tokens from admin plan settings
            tokensAdded = await getPlanTokens(plan)

            // Update or create subscription
            if (existingSubscription) {
                await prisma.subscription.update({
                    where: { userId },
                    data: {
                        plan,
                        status: 'ACTIVE',
                        expiresAt: newExpiresAt,
                        orderCode: orderCode,
                    },
                })
            } else {
                await prisma.subscription.create({
                    data: {
                        userId,
                        plan,
                        status: 'ACTIVE',
                        expiresAt: newExpiresAt,
                        orderCode: orderCode,
                    },
                })
            }

            // Add tokens to user credits (if credits not manually set)
            if (tokensAdded > 0 && credits === undefined) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { credits: { increment: tokensAdded } }
                })
            }

            // Get plan info for sales record
            let planName = plan
            let planPrice = 0
            try {
                const setting = await prisma.siteSettings.findUnique({
                    where: { key: 'subscription_plans' }
                })
                if (setting?.value) {
                    const plans = JSON.parse(setting.value)
                    const planInfo = plans.find((p: any) => p.id === plan)
                    if (planInfo) {
                        planName = planInfo.name
                        planPrice = planInfo.price || 0
                    }
                }
            } catch (e) {
                console.error('Error fetching plan info:', e)
            }

            // Create sales record (COMPLETED - admin verified)
            await prisma.salesRecord.create({
                data: {
                    userId,
                    orderNumber: orderCode,
                    plan: planName,
                    amount: planPrice,
                    status: 'COMPLETED',
                    paymentMethod: 'ADMIN',
                    notes: `Admin tarafından verildi: ${session.user.email}. ${tokensAdded} jeton yüklendi.`
                }
            })
        } else if (plan === 'FREE') {
            // Downgrade to free - deactivate subscription
            const existingSubscription = await prisma.subscription.findUnique({
                where: { userId },
            })

            if (existingSubscription) {
                await prisma.subscription.update({
                    where: { userId },
                    data: {
                        plan: 'FREE',
                        status: 'INACTIVE',
                        expiresAt: null,
                    },
                })
            }
        }

        // Admin log kaydı
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id,
                action: 'UPDATE',
                targetType: 'USER',
                targetId: userId,
                details: JSON.stringify({
                    changes: { name, phoneNumber, credits, role, plan },
                    tokensAdded,
                    updatedBy: session.user.email,
                }),
            },
        })

        return NextResponse.json({
            user,
            message: tokensAdded > 0
                ? `Kullanıcı güncellendi ve ${tokensAdded} jeton yüklendi`
                : 'Kullanıcı güncellendi',
            tokensAdded
        })
    } catch (error) {
        console.error('Update user error:', error)
        return NextResponse.json({ error: 'Kullanıcı güncellenemedi' }, { status: 500 })
    }
}

// Kullanıcı sil
export async function DELETE(req: NextRequest) {
    const session = await checkAdmin()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Bulk Delete Support via JSON body
        let userIds: string[] = []

        try {
            const body = await req.json().catch(() => null)
            if (body && body.userIds) {
                userIds = body.userIds
            }
        } catch (e) { }

        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('userId')
        if (userId) userIds.push(userId)

        if (userIds.length === 0) {
            return NextResponse.json({ error: 'userId veya userIds gerekli' }, { status: 400 })
        }

        // Admin kendini silemesin
        if (userIds.includes(session.user.id)) {
            return NextResponse.json({ error: 'Kendinizi silemezsiniz' }, { status: 400 })
        }

        // Silme işlemi
        const result = await prisma.user.deleteMany({
            where: { id: { in: userIds } }
        })

        // Admin log kaydı
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id,
                action: 'BULK_DELETE',
                targetType: 'USER',
                targetId: 'BULK',
                details: JSON.stringify({
                    count: result.count,
                    deletedUserIds: userIds,
                    deletedBy: session.user.email,
                }),
            },
        })

        return NextResponse.json({ message: `${result.count} kullanıcı silindi` })
    } catch (error) {
        console.error('Delete user error:', error)
        return NextResponse.json({ error: 'Kullanıcı silinemedi' }, { status: 500 })
    }
}
