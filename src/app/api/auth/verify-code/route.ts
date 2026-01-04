import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const { email, code } = await request.json()

        if (!email || !code) {
            return NextResponse.json(
                { error: 'Email ve doğrulama kodu gereklidir' },
                { status: 400 }
            )
        }

        // Kullanıcıyı bul
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Kullanıcı bulunamadı' },
                { status: 404 }
            )
        }

        // Kod kontrolü
        if (user.verificationCode !== code) {
            return NextResponse.json(
                { error: 'Geçersiz doğrulama kodu' },
                { status: 400 }
            )
        }

        // Süre kontrolü
        if (!user.verificationExpires || new Date() > user.verificationExpires) {
            return NextResponse.json(
                { error: 'Doğrulama kodunun süresi dolmuş. Yeni kod talep edin.' },
                { status: 400 }
            )
        }

        // Kodu temizle ve email'i doğrulanmış olarak işaretle
        await prisma.user.update({
            where: { id: user.id },
            data: {
                verificationCode: null,
                verificationExpires: null,
                emailVerified: new Date()
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Doğrulama başarılı'
        })
    } catch (error) {
        console.error('Verify code error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        )
    }
}
