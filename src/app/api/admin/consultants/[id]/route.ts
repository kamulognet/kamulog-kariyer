import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT - Update consultant
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id } = await params
        const body = await req.json()

        const consultant = await prisma.consultant.update({
            where: { id },
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
        console.error('Update consultant error:', error)
        return NextResponse.json({ error: 'Danışman güncellenemedi' }, { status: 500 })
    }
}

// DELETE - Delete consultant
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id } = await params
        await prisma.consultant.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete consultant error:', error)
        return NextResponse.json({ error: 'Danışman silinemedi' }, { status: 500 })
    }
}
