import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Yasal sayfa içeriğini getir (public)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = searchParams.get('page')

        if (!page) {
            return NextResponse.json({ error: 'Sayfa belirtilmedi' }, { status: 400 })
        }

        const content = await prisma.siteSettings.findUnique({
            where: { key: `legal_${page}` }
        })

        return NextResponse.json({
            content: content?.value || null
        })
    } catch (error) {
        console.error('Legal content GET error:', error)
        return NextResponse.json({ error: 'İçerik alınamadı' }, { status: 500 })
    }
}
