import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Tek CV getir
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const { id } = await params

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const cv = await prisma.cV.findUnique({
            where: { id },
        })

        if (!cv) {
            return NextResponse.json({ error: 'CV bulunamadı' }, { status: 404 })
        }

        // Kullanıcı kendi CV'sine veya admin mi kontrol et
        if (cv.userId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
        }

        return NextResponse.json({
            cv: {
                id: cv.id,
                title: cv.title,
                data: cv.data, // Return raw string - client will parse
                template: cv.template,
                createdAt: cv.createdAt,
                updatedAt: cv.updatedAt,
            },
        })
    } catch (error) {
        console.error('Get CV error:', error)
        return NextResponse.json({ error: 'CV yüklenemedi' }, { status: 500 })
    }
}

// CV güncelle
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const { id } = await params

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const cv = await prisma.cV.findUnique({
            where: { id },
        })

        if (!cv || cv.userId !== session.user.id) {
            return NextResponse.json({ error: 'CV bulunamadı' }, { status: 404 })
        }

        const { title, data, template } = await req.json()

        const updated = await prisma.cV.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(data && { data: JSON.stringify(data) }),
                ...(template && { template }),
            },
        })

        return NextResponse.json({
            message: 'CV güncellendi',
            cv: { ...updated, data: JSON.parse(updated.data) },
        })
    } catch (error) {
        console.error('Update CV error:', error)
        return NextResponse.json({ error: 'CV güncellenemedi' }, { status: 500 })
    }
}

// CV sil
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const { id } = await params

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const cv = await prisma.cV.findUnique({
            where: { id },
        })

        if (!cv || cv.userId !== session.user.id) {
            return NextResponse.json({ error: 'CV bulunamadı' }, { status: 404 })
        }

        await prisma.cV.delete({ where: { id } })

        return NextResponse.json({ message: 'CV silindi' })
    } catch (error) {
        console.error('Delete CV error:', error)
        return NextResponse.json({ error: 'CV silinemedi' }, { status: 500 })
    }
}
