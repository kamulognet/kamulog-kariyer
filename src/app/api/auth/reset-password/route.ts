import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const { email, code, newPassword } = await request.json()

        if (!email || !code || !newPassword) {
            return NextResponse.json(
                { error: 'Email, doğrulama kodu ve yeni şifre gereklidir' },
                { status: 400 }
            )
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'Şifre en az 6 karakter olmalıdır' },
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

        // Şifreyi hashle ve güncelle
        const hashedPassword = await bcrypt.hash(newPassword, 12)

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                verificationCode: null,
                verificationExpires: null
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Şifreniz başarıyla güncellendi'
        })
    } catch (error) {
        console.error('Reset password error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        )
    }
}
