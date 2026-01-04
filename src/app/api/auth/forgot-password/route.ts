import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordReset } from '@/services/email.service'
import { generateVerificationCode } from '@/utils/helpers'

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email adresi gereklidir' },
                { status: 400 }
            )
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        })

        // Security: Always return success even if user not found
        if (!user) {
            return NextResponse.json({
                success: true,
                message: 'Eğer bu email kayıtlıysa, şifre sıfırlama bağlantısı gönderildi'
            })
        }

        // Generate reset code
        const resetCode = generateVerificationCode()
        const resetExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // Save code to database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                verificationCode: resetCode,
                verificationExpires: resetExpires
            }
        })

        // Send reset email
        const emailSent = await sendPasswordReset(email, resetCode)

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
