import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Aktif slider medyalarını getir (public)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category') || 'slider'

        // Kategori slug'ına göre medyaları getir
        const media = await prisma.media.findMany({
            where: {
                isActive: true,
                category: {
                    slug: category
                }
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                url: true,
                filename: true,
                link: true
            }
        })

        return NextResponse.json({ media })
    } catch (error) {
        console.error('Public media list error:', error)
        return NextResponse.json({ media: [] })
    }
}
