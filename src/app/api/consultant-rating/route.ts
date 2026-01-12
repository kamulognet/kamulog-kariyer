import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Danışman puanla
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
        }

        const { roomId, rating, comment } = await request.json()

        if (!roomId || !rating) {
            return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 })
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Puan 1-5 arası olmalıdır' }, { status: 400 })
        }

        // Odayı kontrol et
        const room = await prisma.chatRoom.findUnique({
            where: { id: roomId },
            include: { consultant: true }
        })

        if (!room) {
            return NextResponse.json({ error: 'Görüşme bulunamadı' }, { status: 404 })
        }

        if (room.userId !== session.user.id) {
            return NextResponse.json({ error: 'Bu görüşmeyi puanlama yetkiniz yok' }, { status: 403 })
        }

        if (room.status !== 'CLOSED') {
            return NextResponse.json({ error: 'Görüşme henüz bitmedi' }, { status: 400 })
        }

        // Daha önce puanlandı mı kontrol et
        const existingRating = await prisma.consultantRating.findUnique({
            where: { roomId: roomId }
        })

        if (existingRating) {
            return NextResponse.json({ error: 'Bu görüşme zaten puanlandı' }, { status: 400 })
        }

        // Puanlamayı kaydet
        const newRating = await prisma.consultantRating.create({
            data: {
                roomId: roomId,
                consultantId: room.consultantId,
                userId: session.user.id,
                rating: rating,
                comment: comment || null
            }
        })

        return NextResponse.json({ success: true, rating: newRating })
    } catch (error) {
        console.error('Rating error:', error)
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
    }
}

// GET - Danışman ortalama puanını getir
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const consultantId = searchParams.get('consultantId')

        if (!consultantId) {
            return NextResponse.json({ error: 'consultantId gerekli' }, { status: 400 })
        }

        const ratings = await prisma.consultantRating.findMany({
            where: { consultantId: consultantId }
        })

        if (ratings.length === 0) {
            return NextResponse.json({ average: 0, count: 0 })
        }

        const sum = ratings.reduce((acc, r) => acc + r.rating, 0)
        const average = sum / ratings.length

        return NextResponse.json({
            average: Math.round(average * 10) / 10,
            count: ratings.length
        })
    } catch (error) {
        console.error('Get rating error:', error)
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
    }
}
