import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - List all consultants (admin only)
export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const consultants = await prisma.consultant.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json({ consultants })
    } catch (error) {
        console.error('Get consultants error:', error)
        return NextResponse.json({ error: 'Danışmanlar yüklenemedi' }, { status: 500 })
    }
}

// POST - Create new consultant (admin only)
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()

        const consultant = await prisma.consultant.create({
            data: {
                name: body.name,
                phone: body.phone,
                title: body.title,
                description: body.description || null,
                isActive: body.isActive ?? true
            }
        })

        return NextResponse.json({ consultant })
    } catch (error) {
        console.error('Create consultant error:', error)
        return NextResponse.json({ error: 'Danışman oluşturulamadı' }, { status: 500 })
    }
}
