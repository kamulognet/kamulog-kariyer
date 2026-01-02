import { prisma } from './prisma'

// Kullanım limitleri
const LIMITS = {
    FREE: {
        CV_CREATED: 1,
        CHAT_MESSAGE: 20,
        PDF_EXPORT: 1,
    },
    BASIC: {
        CV_CREATED: 5,
        CHAT_MESSAGE: 100,
        PDF_EXPORT: 10,
    },
    PREMIUM: {
        CV_CREATED: -1, // Sınırsız
        CHAT_MESSAGE: -1,
        PDF_EXPORT: -1,
    },
}

type UsageType = 'CV_CREATED' | 'CHAT_MESSAGE' | 'PDF_EXPORT'
type Plan = 'FREE' | 'BASIC' | 'PREMIUM'

// Mevcut ay YYYYMM formatında
function getCurrentMonth(): number {
    const now = new Date()
    return now.getFullYear() * 100 + (now.getMonth() + 1)
}

// Kullanıcının plan bilgisini al
async function getUserPlan(userId: string): Promise<Plan> {
    const subscription = await prisma.subscription.findUnique({
        where: { userId },
    })

    if (!subscription || subscription.status !== 'ACTIVE') {
        return 'FREE'
    }

    // Premium süresi dolmuş mu kontrol et
    if (subscription.expiresAt && subscription.expiresAt < new Date()) {
        await prisma.subscription.update({
            where: { userId },
            data: { status: 'EXPIRED' },
        })
        return 'FREE'
    }

    return subscription.plan as Plan
}

// Kullanıcının aylık kullanımını al
async function getUsage(userId: string, type: UsageType): Promise<number> {
    const month = getCurrentMonth()

    const record = await prisma.usageRecord.findUnique({
        where: {
            userId_type_month: {
                userId,
                type,
                month,
            },
        },
    })

    return record?.count || 0
}

// Limit kontrolü
export async function checkLimit(userId: string, type: UsageType): Promise<{
    allowed: boolean
    remaining: number
    limit: number
    current: number
}> {
    const plan = await getUserPlan(userId)
    const limit = LIMITS[plan][type]
    const current = await getUsage(userId, type)

    // -1 sınırsız demek
    if (limit === -1) {
        return {
            allowed: true,
            remaining: -1,
            limit: -1,
            current,
        }
    }

    return {
        allowed: current < limit,
        remaining: Math.max(0, limit - current),
        limit,
        current,
    }
}

// Kullanım artır
export async function incrementUsage(userId: string, type: UsageType): Promise<void> {
    const month = getCurrentMonth()

    await prisma.usageRecord.upsert({
        where: {
            userId_type_month: {
                userId,
                type,
                month,
            },
        },
        update: {
            count: { increment: 1 },
        },
        create: {
            userId,
            type,
            month,
            count: 1,
        },
    })
}

// Kullanıcının tüm kullanım istatistikleri
export async function getUsageStats(userId: string): Promise<{
    plan: Plan
    usage: {
        cv: { current: number; limit: number; remaining: number }
        chat: { current: number; limit: number; remaining: number }
        pdf: { current: number; limit: number; remaining: number }
    }
}> {
    const plan = await getUserPlan(userId)

    const [cvCheck, chatCheck, pdfCheck] = await Promise.all([
        checkLimit(userId, 'CV_CREATED'),
        checkLimit(userId, 'CHAT_MESSAGE'),
        checkLimit(userId, 'PDF_EXPORT'),
    ])

    return {
        plan,
        usage: {
            cv: { current: cvCheck.current, limit: cvCheck.limit, remaining: cvCheck.remaining },
            chat: { current: chatCheck.current, limit: chatCheck.limit, remaining: chatCheck.remaining },
            pdf: { current: pdfCheck.current, limit: pdfCheck.limit, remaining: pdfCheck.remaining },
        },
    }
}

// Plan bilgilerini döndür
export function getPlanLimits(plan: Plan) {
    return LIMITS[plan]
}
