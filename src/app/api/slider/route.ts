import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Aktif slider medyalarını getir (public)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const categoryName = searchParams.get('category')

        // Tüm aktif medyaları getir veya kategori adına göre filtrele
        const media = await prisma.media.findMany({
            where: {
                isActive: true,
                ...(categoryName ? {
                    category: {
                        name: {
                            contains: categoryName,
                            mode: 'insensitive' as const
                        }
                    }
                } : {})
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
