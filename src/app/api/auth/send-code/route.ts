import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationCodeEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email ve şifre gereklidir' },
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

        // Şifre kontrolü
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Hatalı şifre' },
                { status: 401 }
            )
        }

        // 6 haneli doğrulama kodu oluştur
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

        // 10 dakika geçerlilik süresi
        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000)

        // Kodu veritabanına kaydet
        await prisma.user.update({
            where: { id: user.id },
            data: {
                verificationCode,
                verificationExpires
            }
        })

        // Email gönder
        const emailSent = await sendVerificationCodeEmail(email, verificationCode)

        if (!emailSent) {
            return NextResponse.json(
                { error: 'Doğrulama kodu gönderilemedi. Lütfen tekrar deneyin.' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Doğrulama kodu email adresinize gönderildi'
        })
    } catch (error) {
        console.error('Send code error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        )
    }
}
