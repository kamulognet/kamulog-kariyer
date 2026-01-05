import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmationEmail } from '@/lib/email'

// Sipariş numarası oluştur
function generateOrderNumber() {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `KK-${timestamp}-${random}`
}

// Plan tokenlarını al
async function getPlanTokens(planId: string): Promise<{ tokens: number, cvChatTokens: number }> {
    try {
        const setting = await prisma.siteSettings.findUnique({
            where: { key: 'subscription_plans' }
        })
        if (setting?.value) {
            const plans = JSON.parse(setting.value)
            const plan = plans.find((p: any) => p.id === planId)
            return {
                tokens: plan?.tokens || 0,
                cvChatTokens: plan?.cvChatTokens || 0
            }
        }
    } catch (e) {
        console.error('Error getting plan tokens:', e)
    }
    return { tokens: 0, cvChatTokens: 0 }
}

// POST - Yeni sipariş oluştur
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 })
        }

        const body = await request.json()
        const { plan, amount, planName, couponCode, couponDiscount, isFree, originalAmount } = body

        console.log('Order request:', { plan, amount, planName, couponCode, isFree, userId: session.user.id })

        if (!plan) {
            return NextResponse.json({ error: 'Plan gerekli' }, { status: 400 })
        }

        if (amount === undefined || amount === null) {
            return NextResponse.json({ error: 'Tutar gerekli' }, { status: 400 })
        }

        const orderNumber = generateOrderNumber()

        // Kupon kontrolü ve kullanım sayısını artır
        if (couponCode) {
            try {
                await prisma.coupon.update({
                    where: { code: couponCode.toUpperCase() },
                    data: { usageCount: { increment: 1 } }
                })
                console.log(`Coupon ${couponCode} usage incremented`)
            } catch (e) {
                console.error('Error incrementing coupon usage:', e)
            }
        }

        // Satış kaydı oluştur
        const salesRecord = await prisma.salesRecord.create({
            data: {
                userId: session.user.id,
                plan: String(plan),
                amount: Number(amount),
                status: isFree ? 'COMPLETED' : 'PENDING', // Ücretsiz siparişler direkt tamamlanır
                orderNumber,
                paymentMethod: isFree ? 'COUPON_100' : 'BANK_TRANSFER',
                notes: couponCode ? `Kupon: ${couponCode} | İndirim: ${couponDiscount}₺` : null
            }
        })

        console.log('Order created:', salesRecord)

        // %100 indirimli kupon = Otomatik aktivasyon
        if (isFree) {
            const planTokens = await getPlanTokens(plan)

            // Abonelik oluştur/güncelle
            await prisma.subscription.upsert({
                where: { userId: session.user.id },
                update: {
                    plan: String(plan),
                    status: 'ACTIVE',
                    orderCode: orderNumber,
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 gün
                },
                create: {
                    userId: session.user.id,
                    plan: String(plan),
                    status: 'ACTIVE',
                    orderCode: orderNumber,
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
            })

            // Jetonları yükle (hem genel krediler hem CV chat jetonları)
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    credits: { increment: planTokens.tokens },
                    cvChatTokens: { increment: planTokens.cvChatTokens }
                }
            })
            console.log(`Auto-activated subscription for user ${session.user.id}. Added ${planTokens.tokens} credits and ${planTokens.cvChatTokens} cvChatTokens.`)
        }

        // Kullanıcı bilgilerini al
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { name: true, email: true, phoneNumber: true, address: true, city: true, district: true }
        })

        // Ödeme bilgilerini al
        let paymentInfo = null
        try {
            const paymentSetting = await prisma.siteSettings.findUnique({
                where: { key: 'payment_info' }
            })
            if (paymentSetting?.value) {
                paymentInfo = typeof paymentSetting.value === 'string'
                    ? JSON.parse(paymentSetting.value)
                    : paymentSetting.value
            }
        } catch (e) {
            console.error('Error loading payment info:', e)
        }

        // Email gönder (ücretsiz siparişler için farklı içerik olabilir)
        if (user?.email && !isFree) {
            await sendOrderConfirmationEmail({
                orderCode: orderNumber,
                planName: planName || plan,
                amount: Number(amount),
                userName: user.name || 'Değerli Müşterimiz',
                userEmail: user.email,
                bankName: paymentInfo?.bankName,
                iban: paymentInfo?.iban,
                companyName: paymentInfo?.companyName
            })
        }

        return NextResponse.json({
            success: true,
            autoActivated: isFree,
            order: {
                id: salesRecord.id,
                orderCode: orderNumber,
                plan: salesRecord.plan,
                amount: salesRecord.amount,
                status: isFree ? 'completed' : 'pending',
                createdAt: salesRecord.createdAt,
                user
            }
        })
    } catch (error) {
        console.error('Error creating order:', error)
        return NextResponse.json({
            error: 'Sipariş oluşturulamadı',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
