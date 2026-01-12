import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - List all consultants (admin only)
export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
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
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()

        // userId varsa moderator rolünü kontrol et
        if (body.userId) {
            const user = await prisma.user.findUnique({ where: { id: body.userId } })
            if (!user || user.role !== 'MODERATOR') {
                return NextResponse.json({ error: 'Seçilen kullanıcı moderatör değil' }, { status: 400 })
            }
            // Başka danışmana bağlı mı kontrol et
            const existingConsultant = await prisma.consultant.findUnique({ where: { userId: body.userId } })
            if (existingConsultant) {
                return NextResponse.json({ error: 'Bu moderatör zaten bir danışmana bağlı' }, { status: 400 })
            }
        }

        const consultant = await prisma.consultant.create({
            data: {
                name: body.name,
                phone: body.phone,
                title: body.title,
                description: body.description || null,
                isActive: body.isActive ?? true,
                userId: body.userId || null
            }
        })

        return NextResponse.json({ consultant })
    } catch (error) {
        console.error('Create consultant error:', error)
        return NextResponse.json({ error: 'Danışman oluşturulamadı' }, { status: 500 })
    }
}

// PUT - Update consultant (admin only)
export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { id, ...data } = body

        if (!id) {
            return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })
        }

        // userId değişiyorsa kontrol et
        if (data.userId) {
            const user = await prisma.user.findUnique({ where: { id: data.userId } })
            if (!user || user.role !== 'MODERATOR') {
                return NextResponse.json({ error: 'Seçilen kullanıcı moderatör değil' }, { status: 400 })
            }
            // Başka danışmana bağlı mı kontrol et
            const existingConsultant = await prisma.consultant.findFirst({
                where: { userId: data.userId, NOT: { id: id } }
            })
            if (existingConsultant) {
                return NextResponse.json({ error: 'Bu moderatör zaten başka bir danışmana bağlı' }, { status: 400 })
            }
        }

        const consultant = await prisma.consultant.update({
            where: { id },
            data: {
                name: data.name,
                phone: data.phone,
                title: data.title,
                description: data.description || null,
                isActive: data.isActive,
                userId: data.userId || null
            }
        })

        return NextResponse.json({ consultant })
    } catch (error) {
        console.error('Update consultant error:', error)
        return NextResponse.json({ error: 'Danışman güncellenemedi' }, { status: 500 })
    }
}

