import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const defaultContent = {
    about: 'Kariyer Kamulog, yapay zeka destekli CV oluşturma ve iş eşleştirme platformudur.',
    contact: 'E-posta: info@kariyerkamulog.com\nTelefon: +90 555 123 4567',
    privacy: 'Gizlilik politikası...',
    terms: 'Kullanım şartları...'
}

// GET - Sayfa içeriklerini getir (public)
export async function GET() {
    try {
        const setting = await prisma.siteSettings.findUnique({
            where: { key: 'page_content' }
        })

        if (setting?.value) {
            const content = typeof setting.value === 'string'
                ? JSON.parse(setting.value)
                : setting.value
            return NextResponse.json(content)
        }

        return NextResponse.json(defaultContent)
    } catch (error) {
        console.error('Error fetching page content:', error)
        return NextResponse.json(defaultContent)
    }
}

// PUT - Sayfa içeriklerini güncelle (admin only)
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const body = await request.json()
        const { about, contact, privacy, terms } = body

        const content = {
            about: about || defaultContent.about,
            contact: contact || defaultContent.contact,
            privacy: privacy || defaultContent.privacy,
            terms: terms || defaultContent.terms
        }

        await prisma.siteSettings.upsert({
            where: { key: 'page_content' },
            update: { value: JSON.stringify(content) },
            create: { key: 'page_content', value: JSON.stringify(content) }
        })

        // Admin log
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id,
                action: 'UPDATE',
                targetType: 'SETTINGS',
                details: JSON.stringify({ type: 'page_content' })
            }
        })

        return NextResponse.json({ success: true, content })
    } catch (error) {
        console.error('Error updating page content:', error)
        return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 })
    }
}
