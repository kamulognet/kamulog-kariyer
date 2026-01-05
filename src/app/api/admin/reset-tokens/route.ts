import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Tüm kullanıcıların cvChatTokens'ını plan limitine sıfırla
export async function POST() {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Plan ayarlarını al
        const setting = await prisma.siteSettings.findUnique({
            where: { key: 'subscription_plans' }
        })

        let planLimits: Record<string, number> = {
            'FREE': 25,
            'BASIC': 100,
            'PREMIUM': 500
        }

        if (setting?.value) {
            const plans = JSON.parse(setting.value)
            for (const plan of plans) {
                planLimits[plan.id] = plan.cvChatTokens || planLimits[plan.id] || 25
            }
        }

        // Tüm kullanıcıları getir
        const users = await prisma.user.findMany({
            select: {
                id: true,
                cvChatTokens: true,
                subscription: {
                    select: { plan: true, status: true }
                }
            }
        })

        let resetCount = 0
        let skippedCount = 0

        for (const user of users) {
            // Kullanıcının planını belirle
            const userPlan = user.subscription?.status === 'ACTIVE'
                ? user.subscription.plan
                : 'FREE'

            const planLimit = planLimits[userPlan] || 25

            // Eğer kullanıcının jetonu plan limitinden fazlaysa sıfırla
            if (user.cvChatTokens > planLimit) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { cvChatTokens: planLimit }
                })
                resetCount++
            } else {
                skippedCount++
            }
        }

        return NextResponse.json({
            success: true,
            message: `${resetCount} kullanıcının jetonları sıfırlandı, ${skippedCount} kullanıcı zaten limit altındaydı.`,
            resetCount,
            skippedCount,
            planLimits
        })
    } catch (error) {
        console.error('Reset tokens error:', error)
        return NextResponse.json({ error: 'Sıfırlama başarısız' }, { status: 500 })
    }
}
