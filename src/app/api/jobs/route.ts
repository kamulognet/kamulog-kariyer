import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const type = searchParams.get('type') // PUBLIC, PRIVATE

        const where = type ? { type } : {}

        const jobs = await prisma.jobListing.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ jobs })
    } catch (error) {
        console.error('Get jobs error:', error)
        return NextResponse.json({ error: 'İş ilanları yüklenemedi' }, { status: 500 })
    }
}

// Sadece admin ilan ekleyebilir (şimdilik manuel veya script ile eklenecek)
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const job = await prisma.jobListing.create({
            data: body,
        })
        return NextResponse.json({ job })
    } catch (error) {
        return NextResponse.json({ error: 'İlan oluşturulamadı' }, { status: 500 })
    }
}
