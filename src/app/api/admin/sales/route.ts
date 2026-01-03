import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Random sipariş numarası oluştur: KK-XXXXXX
function generateOrderNumber(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Karışıklığı önlemek için I, O, 1, 0 çıkarıldı
    let code = ''
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `KK-${code}`
}

// GET - Satış kayıtlarını listele
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '25')
        const search = searchParams.get('search') // Sipariş no veya kullanıcı bilgisi
        const status = searchParams.get('status')
        const plan = searchParams.get('plan')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        // Filtreler
        const where: any = {}

        if (status) where.status = status
        if (plan) where.plan = plan

        if (startDate || endDate) {
            where.createdAt = {}
            if (startDate) where.createdAt.gte = new Date(startDate)
            if (endDate) where.createdAt.lte = new Date(endDate)
        }

        if (search) {
            where.OR = [
                { orderNumber: { contains: search.toUpperCase() } },
                { user: { email: { contains: search } } },
                { user: { name: { contains: search } } },
                { user: { phoneNumber: { contains: search } } },
            ]
        }

        const [sales, total, stats] = await Promise.all([
            prisma.salesRecord.findMany({
                where,
                include: {
                    user: {
                        select: { id: true, name: true, email: true, phoneNumber: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.salesRecord.count({ where }),
            // İstatistikler
            prisma.salesRecord.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { amount: true },
                _count: { id: true },
            }),
        ])

        // Plan bazlı istatistikler
        const planStats = await prisma.salesRecord.groupBy({
            by: ['plan'],
            where: { status: 'COMPLETED' },
            _sum: { amount: true },
            _count: { id: true },
        })

        return NextResponse.json({
            sales,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            stats: {
                totalRevenue: stats._sum.amount || 0,
                totalSales: stats._count.id || 0,
                byPlan: planStats.reduce((acc, s) => {
                    acc[s.plan] = { revenue: s._sum.amount || 0, count: s._count.id }
                    return acc
                }, {} as Record<string, { revenue: number; count: number }>),
            }
        })
    } catch (error) {
        console.error('Error fetching sales:', error)
        return NextResponse.json({ error: 'Satışlar yüklenirken hata oluştu' }, { status: 500 })
    }
}

// POST - Yeni satış kaydı oluştur
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const body = await request.json()
        const { userId, subscriptionId, plan, amount, paymentMethod, notes } = body

        // Benzersiz sipariş numarası oluştur
        let orderNumber: string
        let isUnique = false
        do {
            orderNumber = generateOrderNumber()
            const existing = await prisma.salesRecord.findUnique({
                where: { orderNumber }
            })
            isUnique = !existing
        } while (!isUnique)

        // 1. Abonelik oluştur veya güncelle (30 günlük)
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30)

        // Mevcut abonelik var mı kontrol et
        const existingSubscription = await prisma.subscription.findUnique({
            where: { userId }
        })

        let subscription

        if (existingSubscription) {
            subscription = await prisma.subscription.update({
                where: { userId },
                data: {
                    plan,
                    status: 'ACTIVE',
                    expiresAt,
                    orderCode: orderNumber, // Sync with sales record
                }
            })
        } else {
            subscription = await prisma.subscription.create({
                data: {
                    userId,
                    plan,
                    status: 'ACTIVE',
                    expiresAt,
                    orderCode: orderNumber, // Sync with sales record
                }
            })
        }

        // 2. Kredileri güncelle
        let creditAmount = 0
        if (plan === 'BASIC') creditAmount = 50
        if (plan === 'PREMIUM') creditAmount = 1000

        console.log(`[Sales API] Plan: ${plan}, Credit Amount to add: ${creditAmount} for User: ${userId}`)

        if (creditAmount > 0) {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: creditAmount } }
            })
            console.log(`[Sales API] User credits updated. New balance: ${updatedUser.credits}`)
        } else {
            console.log(`[Sales API] No credits to add for plan: ${plan}`)
        }

        // 3. Satış kaydını oluştur ve abonelikle ilişkilendir
        const sale = await prisma.salesRecord.create({
            data: {
                orderNumber,
                userId,
                subscriptionId: subscription.id, // Abonelik ID'si eklendi
                plan,
                amount: parseFloat(amount),
                paymentMethod,
                notes,
                status: 'COMPLETED',
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        })

        // Admin log
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id,
                action: 'CREATE',
                targetType: 'SALES',
                targetId: sale.id,
                details: JSON.stringify({ orderNumber, plan, amount }),
            }
        })

        return NextResponse.json({ sale })
    } catch (error) {
        console.error('Error creating sale:', error)
        return NextResponse.json({ error: 'Satış kaydı oluşturulurken hata oluştu' }, { status: 500 })
    }
}

// PUT - Satış kaydını güncelle
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const body = await request.json()
        const { id, status, notes } = body

        const sale = await prisma.salesRecord.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(notes !== undefined && { notes }),
            }
        })

        // Admin log
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id,
                action: 'UPDATE',
                targetType: 'SALES',
                targetId: id,
                details: JSON.stringify({ status, notes }),
            }
        })

        return NextResponse.json({ sale })
    } catch (error) {
        console.error('Error updating sale:', error)
        return NextResponse.json({ error: 'Satış kaydı güncellenirken hata oluştu' }, { status: 500 })
    }
}

// DELETE - Satış kaydını sil
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })
        }

        // Satış kaydını bul (log için)
        const sale = await prisma.salesRecord.findUnique({
            where: { id },
            include: { user: { select: { email: true } } }
        })

        if (!sale) {
            return NextResponse.json({ error: 'Satış kaydı bulunamadı' }, { status: 404 })
        }

        // Kaydı sil
        await prisma.salesRecord.delete({
            where: { id }
        })

        // Admin log
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id,
                action: 'DELETE',
                targetType: 'SALES',
                targetId: id,
                details: JSON.stringify({
                    orderNumber: sale.orderNumber,
                    userEmail: sale.user.email,
                    amount: sale.amount
                }),
            }
        })

        return NextResponse.json({ message: 'Satış kaydı silindi' })
    } catch (error) {
        console.error('Error deleting sale:', error)
        return NextResponse.json({ error: 'Satış kaydı silinirken hata oluştu' }, { status: 500 })
    }
}

