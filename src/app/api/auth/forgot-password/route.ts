import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email adresi gereklidir' },
                { status: 400 }
            )
        }

        // Kullanıcıyı bul
        const user = await prisma.user.findUnique({
            where: { email }
        })

        // Güvenlik için kullanıcı bulunamasa bile başarılı mesajı ver
        if (!user) {
            return NextResponse.json({
                success: true,
                message: 'Eğer bu email kayıtlıysa, şifre sıfırlama bağlantısı gönderildi'
            })
        }

        // 6 haneli sıfırlama kodu oluştur
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString()

        // 10 dakika geçerlilik süresi
        const resetExpires = new Date(Date.now() + 10 * 60 * 1000)

        // Kodu veritabanına kaydet
        await prisma.user.update({
            where: { id: user.id },
            data: {
                verificationCode: resetCode,
                verificationExpires: resetExpires
            }
        })

        // Email gönder
        const emailSent = await sendPasswordResetEmail(email, resetCode)

        if (!emailSent) {
            return NextResponse.json(
                { error: 'Email gönderilemedi. Lütfen tekrar deneyin.' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Şifre sıfırlama kodu email adresinize gönderildi'
        })
    } catch (error) {
        console.error('Forgot password error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        )
    }
}
