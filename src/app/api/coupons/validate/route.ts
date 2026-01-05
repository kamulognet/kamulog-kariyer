import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Kupon kodunu doğrula ve indirim hesapla
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 })
        }

        const body = await req.json()
        const { code, planId, originalPrice } = body

        if (!code) {
            return NextResponse.json({ error: 'Kupon kodu gerekli' }, { status: 400 })
        }

        // Kuponu bul
        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() }
        })

        if (!coupon) {
            return NextResponse.json({ error: 'Geçersiz kupon kodu', valid: false }, { status: 400 })
        }

        // Aktiflik kontrolü
        if (!coupon.isActive) {
            return NextResponse.json({ error: 'Bu kupon artık geçerli değil', valid: false }, { status: 400 })
        }

        // Tarih kontrolü
        const now = new Date()
        if (coupon.validFrom > now) {
            return NextResponse.json({ error: 'Bu kupon henüz geçerli değil', valid: false }, { status: 400 })
        }
        if (coupon.validUntil && coupon.validUntil < now) {
            return NextResponse.json({ error: 'Bu kuponun süresi dolmuş', valid: false }, { status: 400 })
        }

        // Kullanım limiti kontrolü
        if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
            return NextResponse.json({ error: 'Bu kupon kullanım limitine ulaştı', valid: false }, { status: 400 })
        }

        // Plan kısıtı kontrolü
        if (coupon.planRestriction && planId && coupon.planRestriction !== planId) {
            return NextResponse.json({
                error: `Bu kupon sadece ${coupon.planRestriction} planı için geçerli`,
                valid: false
            }, { status: 400 })
        }

        // İndirim hesapla
        let discountAmount = 0
        let finalPrice = originalPrice || 0

        if (coupon.discountType === 'PERCENT') {
            discountAmount = (originalPrice * coupon.discountValue) / 100
            finalPrice = originalPrice - discountAmount
        } else {
            discountAmount = coupon.discountValue
            finalPrice = Math.max(0, originalPrice - discountAmount)
        }

        // %100 indirim kontrolü
        const isFree = coupon.discountType === 'PERCENT' && coupon.discountValue >= 100

        return NextResponse.json({
            valid: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                name: coupon.name,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                planRestriction: coupon.planRestriction
            },
            discountAmount,
            finalPrice: Math.max(0, finalPrice),
            isFree,
            message: isFree ? 'Ücretsiz abonelik kuponu!' : `%${coupon.discountValue} indirim uygulandı`
        })
    } catch (error) {
        console.error('Validate coupon error:', error)
        return NextResponse.json({ error: 'Kupon doğrulanamadı', valid: false }, { status: 500 })
    }
}
