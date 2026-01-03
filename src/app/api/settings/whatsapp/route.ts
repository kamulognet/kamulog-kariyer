import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const defaultSettings = {
    phoneNumber: '',
    enabled: true,
    defaultMessage: 'Merhaba, bilgi almak istiyorum.'
}

// GET - WhatsApp ayarlarını getir (public)
export async function GET() {
    try {
        const setting = await prisma.siteSettings.findUnique({
            where: { key: 'whatsapp_settings' }
        })

        if (setting?.value) {
            const content = typeof setting.value === 'string'
                ? JSON.parse(setting.value)
                : setting.value
            return NextResponse.json({ ...defaultSettings, ...content })
        }

        return NextResponse.json(defaultSettings)
    } catch (error) {
        console.error('Error fetching whatsapp settings:', error)
        return NextResponse.json(defaultSettings)
    }
}

// PUT - WhatsApp ayarlarını güncelle (admin only)
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const body = await request.json()
        const { phoneNumber, enabled, defaultMessage } = body

        const settings = {
            phoneNumber: phoneNumber || '',
            enabled: enabled !== false,
            defaultMessage: defaultMessage || defaultSettings.defaultMessage
        }

        await prisma.siteSettings.upsert({
            where: { key: 'whatsapp_settings' },
            update: { value: JSON.stringify(settings) },
            create: { key: 'whatsapp_settings', value: JSON.stringify(settings) }
        })

        // Admin log
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id,
                action: 'UPDATE',
                targetType: 'SETTINGS',
                details: JSON.stringify({ type: 'whatsapp_settings' })
            }
        })

        return NextResponse.json({ success: true, settings })
    } catch (error) {
        console.error('Error updating whatsapp settings:', error)
        return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 })
    }
}
