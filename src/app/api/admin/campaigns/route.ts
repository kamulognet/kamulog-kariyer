import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Tüm kuponları listele
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' }
        })

        // İstatistikler
        const stats = {
            total: coupons.length,
            active: coupons.filter(c => c.isActive).length,
            totalUsage: coupons.reduce((sum, c) => sum + c.usageCount, 0)
        }

        return NextResponse.json({ coupons, stats })
    } catch (error) {
        console.error('Get coupons error:', error)
        return NextResponse.json({ error: 'Failed to get coupons' }, { status: 500 })
    }
}

// POST - Yeni kupon oluştur
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { code, name, discountType, discountValue, validFrom, validUntil, maxUsage, planRestriction, isActive } = body

        if (!code || !discountValue) {
            return NextResponse.json({ error: 'Kupon kodu ve indirim değeri gerekli' }, { status: 400 })
        }

        // Kod kontrolü
        const existingCoupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() }
        })

        if (existingCoupon) {
            return NextResponse.json({ error: 'Bu kupon kodu zaten mevcut' }, { status: 400 })
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase(),
                name: name || null,
                discountType: discountType || 'PERCENT',
                discountValue: parseFloat(discountValue),
                validFrom: validFrom ? new Date(validFrom) : new Date(),
                validUntil: validUntil ? new Date(validUntil) : null,
                maxUsage: maxUsage ? parseInt(maxUsage) : null,
                planRestriction: planRestriction || null,
                isActive: isActive !== false
            }
        })

        return NextResponse.json({ coupon, message: 'Kupon başarıyla oluşturuldu' })
    } catch (error) {
        console.error('Create coupon error:', error)
        return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
    }
}

// PUT - Kupon güncelle
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { id, code, name, discountType, discountValue, validFrom, validUntil, maxUsage, planRestriction, isActive } = body

        if (!id) {
            return NextResponse.json({ error: 'Kupon ID gerekli' }, { status: 400 })
        }

        // Kod değiştiyse, başka kuponla çakışma kontrolü
        if (code) {
            const existingCoupon = await prisma.coupon.findFirst({
                where: {
                    code: code.toUpperCase(),
                    NOT: { id }
                }
            })
            if (existingCoupon) {
                return NextResponse.json({ error: 'Bu kupon kodu zaten mevcut' }, { status: 400 })
            }
        }

        const updateData: any = {}
        if (code !== undefined) updateData.code = code.toUpperCase()
        if (name !== undefined) updateData.name = name
        if (discountType !== undefined) updateData.discountType = discountType
        if (discountValue !== undefined) updateData.discountValue = parseFloat(discountValue)
        if (validFrom !== undefined) updateData.validFrom = new Date(validFrom)
        if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : null
        if (maxUsage !== undefined) updateData.maxUsage = maxUsage ? parseInt(maxUsage) : null
        if (planRestriction !== undefined) updateData.planRestriction = planRestriction || null
        if (isActive !== undefined) updateData.isActive = isActive

        const coupon = await prisma.coupon.update({
            where: { id },
            data: updateData
        })

        return NextResponse.json({ coupon, message: 'Kupon güncellendi' })
    } catch (error) {
        console.error('Update coupon error:', error)
        return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 })
    }
}

// DELETE - Kupon sil
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Kupon ID gerekli' }, { status: 400 })
        }

        await prisma.coupon.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Kupon silindi' })
    } catch (error) {
        console.error('Delete coupon error:', error)
        return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 })
    }
}
