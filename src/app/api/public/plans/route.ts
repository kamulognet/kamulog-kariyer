import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Default plans (same as admin settings)
const DEFAULT_PLANS = [
    {
        id: 'FREE',
        name: 'Ücretsiz',
        price: 0,
        tokens: 10,
        features: ['1 CV oluşturma', '20 AI sohbet mesajı', '3 iş eşleştirme'],
        popular: false,
        tag: null,
    },
    {
        id: 'BASIC',
        name: 'Plus',
        price: 79,
        tokens: 100,
        features: ['10 CV oluşturma', '200 AI sohbet mesajı', '50 iş eşleştirme', 'PDF CV yükleme & analiz', 'Öncelikli destek'],
        popular: true,
        tag: 'EN POPÜLER',
    },
    {
        id: 'PREMIUM',
        name: 'Premium',
        price: 149,
        tokens: 500,
        features: ['Sınırsız CV oluşturma', 'Sınırsız AI sohbet', 'Sınırsız iş eşleştirme', 'PDF CV yükleme & analiz', '1-1 kariyer danışmanlığı'],
        popular: false,
        tag: 'SINIRSIZ',
    },
]

// Public API - no auth required
export async function GET() {
    try {
        const setting = await prisma.siteSettings.findUnique({
            where: { key: 'subscription_plans' },
        })

        if (setting?.value) {
            const plans = JSON.parse(setting.value)
            return NextResponse.json({ plans })
        }

        return NextResponse.json({ plans: DEFAULT_PLANS })
    } catch (error) {
        console.error('Error fetching plans:', error)
        return NextResponse.json({ plans: DEFAULT_PLANS })
    }
}
