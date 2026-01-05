import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const DEFAULT_SESSION_LIMIT = 20
const DEFAULT_TOKEN_COST = 2

// GET - Kullanıcının planına göre chat limit ayarlarını döndür
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        // Varsayılan değerler
        let sessionLimit = DEFAULT_SESSION_LIMIT
        const tokenCost = DEFAULT_TOKEN_COST
        let cvApplicationLimit = 3
        let cvApplicationsUsed = 0

        if (session?.user?.id) {
            // Kullanıcının aboneliğini al
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: {
                    cvApplicationsUsed: true,
                    subscription: {
                        select: { plan: true, status: true }
                    }
                }
            })

            cvApplicationsUsed = user?.cvApplicationsUsed || 0
            const userPlan = user?.subscription?.status === 'ACTIVE'
                ? user.subscription.plan
                : 'FREE'

            // Plan ayarlarını al
            const setting = await prisma.siteSettings.findUnique({
                where: { key: 'subscription_plans' }
            })

            if (setting?.value) {
                const plans = JSON.parse(setting.value)
                const currentPlan = plans.find((p: any) => p.id === userPlan)

                if (currentPlan) {
                    sessionLimit = currentPlan.chatLimit || DEFAULT_SESSION_LIMIT
                    cvApplicationLimit = currentPlan.cvApplicationLimit || 3
                }
            }
        }

        return NextResponse.json({
            sessionLimit,
            tokenCost,
            cvApplicationLimit,
            cvApplicationsUsed,
            cvApplicationsRemaining: cvApplicationLimit === 0 ? -1 : Math.max(0, cvApplicationLimit - cvApplicationsUsed)
        })
    } catch (error) {
        console.error('Get chat limits error:', error)
        return NextResponse.json({
            sessionLimit: DEFAULT_SESSION_LIMIT,
            tokenCost: DEFAULT_TOKEN_COST,
            cvApplicationLimit: 3,
            cvApplicationsUsed: 0,
            cvApplicationsRemaining: 3
        })
    }
}

