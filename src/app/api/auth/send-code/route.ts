import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationCode } from '@/services/email.service'
import { generateVerificationCode } from '@/utils/helpers'
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

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user || !user.password) {
            return NextResponse.json(
                { error: 'Email veya şifre hatalı' },
                { status: 401 }
            )
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password)
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Email veya şifre hatalı' },
                { status: 401 }
            )
        }

        // Generate verification code
        const verificationCode = generateVerificationCode()
        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // Save code to database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                verificationCode,
                verificationExpires
            }
        })

        // Send verification email
        const emailSent = await sendVerificationCode(email, verificationCode)

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
