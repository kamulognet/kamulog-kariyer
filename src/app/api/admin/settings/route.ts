import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Varsayılan abonelik planları
const DEFAULT_SUBSCRIPTION_PLANS = [
    {
        id: 'FREE',
        name: 'Ücretsiz',
        price: 0,
        tokens: 10,
        chatLimit: 20,           // Sohbet başına jeton limiti
        cvApplicationLimit: 3,  // CV başvuru sayısı limiti
        features: [
            '1 CV oluşturma',
            '20 AI sohbet mesajı',
            '3 iş başvurusu',
        ],
        popular: false,
        tag: null,
    },
    {
        id: 'BASIC',
        name: 'Plus',
        price: 79,
        tokens: 100,
        chatLimit: 50,
        cvApplicationLimit: 25,
        features: [
            '10 CV oluşturma',
            '50 AI sohbet mesajı',
            '25 iş başvurusu',
            'PDF CV yükleme & analiz',
            'Öncelikli destek',
        ],
        popular: true,
        tag: 'EN POPÜLER',
    },
    {
        id: 'PREMIUM',
        name: 'Premium',
        price: 149,
        tokens: 500,
        chatLimit: 0,           // 0 = sınırsız
        cvApplicationLimit: 0, // 0 = sınırsız
        features: [
            'Sınırsız CV oluşturma',
            'Sınırsız AI sohbet',
            'Sınırsız iş başvurusu',
            'PDF CV yükleme & analiz',
            '1-1 kariyer danışmanlığı',
        ],
        popular: false,
        tag: 'SINIRSIZ',
    },
]

// Ayarları getir
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Admin kontrolü
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const searchParams = req.nextUrl.searchParams
        const key = searchParams.get('key')

        if (key) {
            // Tek bir ayar getir
            const setting = await prisma.siteSettings.findUnique({
                where: { key },
            })

            if (!setting) {
                // Varsayılan değeri döndür
                if (key === 'subscription_plans') {
                    return NextResponse.json({
                        key,
                        value: DEFAULT_SUBSCRIPTION_PLANS,
                        isDefault: true
                    })
                }
                return NextResponse.json({ error: 'Ayar bulunamadı' }, { status: 404 })
            }

            return NextResponse.json({
                key: setting.key,
                value: JSON.parse(setting.value),
                updatedAt: setting.updatedAt,
            })
        }

        // Tüm ayarları getir
        const settings = await prisma.siteSettings.findMany()

        const settingsMap: Record<string, unknown> = {}
        settings.forEach(s => {
            settingsMap[s.key] = JSON.parse(s.value)
        })

        // Varsayılan değerleri ekle
        if (!settingsMap['subscription_plans']) {
            settingsMap['subscription_plans'] = DEFAULT_SUBSCRIPTION_PLANS
        }

        return NextResponse.json({ settings: settingsMap })
    } catch (error) {
        console.error('Get settings error:', error)
        return NextResponse.json({ error: 'Ayarlar yüklenemedi' }, { status: 500 })
    }
}

// Ayarları güncelle
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Admin kontrolü
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { key, value } = await req.json()

        if (!key || value === undefined) {
            return NextResponse.json({ error: 'Key ve value gerekli' }, { status: 400 })
        }

        // Ayarı güncelle veya oluştur
        const setting = await prisma.siteSettings.upsert({
            where: { key },
            update: {
                value: JSON.stringify(value),
                updatedBy: session.user.id,
            },
            create: {
                key,
                value: JSON.stringify(value),
                updatedBy: session.user.id,
            },
        })

        // Admin log kaydet
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id,
                action: 'UPDATE',
                targetType: 'SETTINGS',
                targetId: setting.id,
                details: JSON.stringify({ key, value }),
            },
        })

        return NextResponse.json({
            success: true,
            setting: {
                key: setting.key,
                value: JSON.parse(setting.value),
                updatedAt: setting.updatedAt,
            },
        })
    } catch (error) {
        console.error('Update settings error:', error)
        return NextResponse.json({ error: 'Ayarlar güncellenemedi' }, { status: 500 })
    }
}
