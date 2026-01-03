import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Email değiştirme talebi - Kod gönder
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const { newEmail } = await req.json()
        if (!newEmail) {
            return NextResponse.json({ error: 'Yeni e-posta adresi gerekli' }, { status: 400 })
        }

        // Email zaten kullanımda mı?
        const existing = await prisma.user.findUnique({ where: { email: newEmail } })
        if (existing) {
            return NextResponse.json({ error: 'Bu e-posta adresi zaten kullanımda' }, { status: 400 })
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
        const verificationExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 dk

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                newEmail,
                emailChangeCode: verificationCode,
                verificationExpires
            }
        })

        // GÜVENLİK NOTU: Burada gerçek bir e-posta gönderilmeli. 
        // Şimdilik sadece logluyoruz.
        console.log(`[Email Change Request] User: ${session.user.id}, New Email: ${newEmail}, Code: ${verificationCode}`)

        return NextResponse.json({ message: 'Doğrulama kodu gönderildi (Simüle edildi)' })
    } catch (error) {
        console.error('Email change request error:', error)
        return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 })
    }
}

// Kodu doğrula ve maili değiştir
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const { code } = await req.json()
        if (!code) {
            return NextResponse.json({ error: 'Doğrulama kodu gerekli' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (!user || !user.emailChangeCode || !user.newEmail) {
            return NextResponse.json({ error: 'Aktif bir değişiklik talebi bulunamadı' }, { status: 400 })
        }

        if (user.emailChangeCode !== code) {
            return NextResponse.json({ error: 'Geçersiz doğrulama kodu' }, { status: 400 })
        }

        if (user.verificationExpires && new Date() > user.verificationExpires) {
            return NextResponse.json({ error: 'Doğrulama kodunun süresi dolmuş' }, { status: 400 })
        }

        // Güncelle
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                email: user.newEmail,
                newEmail: null,
                emailChangeCode: null,
                verificationExpires: null,
                emailVerified: new Date()
            }
        })

        return NextResponse.json({ message: 'E-posta adresiniz başarıyla güncellendi' })
    } catch (error) {
        console.error('Email verification error:', error)
        return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 })
    }
}
