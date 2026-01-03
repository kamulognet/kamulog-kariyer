import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Sipariş numarası oluştur
function generateOrderNumber() {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `KK-${timestamp}-${random}`
}

// POST - Yeni sipariş oluştur
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 })
        }

        const body = await request.json()
        const { plan, amount } = body

        if (!plan || amount === undefined) {
            return NextResponse.json({ error: 'Plan ve tutar gerekli' }, { status: 400 })
        }

        const orderNumber = generateOrderNumber()

        // Satış kaydı oluştur (pending durumunda)
        const salesRecord = await prisma.salesRecord.create({
            data: {
                userId: session.user.id,
                plan,
                amount,
                status: 'pending',
                orderNumber,
                paymentMethod: 'BANK_TRANSFER'
            }
        })

        // Kullanıcı bilgilerini al
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { name: true, email: true, phoneNumber: true, address: true, city: true, district: true }
        })

        return NextResponse.json({
            success: true,
            order: {
                id: salesRecord.id,
                orderCode: orderNumber,
                plan,
                amount,
                status: 'pending',
                createdAt: salesRecord.createdAt,
                user
            }
        })
    } catch (error) {
        console.error('Error creating order:', error)
        return NextResponse.json({ error: 'Sipariş oluşturulamadı' }, { status: 500 })
    }
}
