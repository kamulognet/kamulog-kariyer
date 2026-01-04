import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendVerificationCode } from '@/services/email.service'
import { generateVerificationCode, formatPhoneNumber } from '@/utils/helpers'
import { z } from 'zod'

const registerSchema = z.object({
    name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
    email: z.string().email('Geçerli bir email giriniz'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
    phoneNumber: z.string().regex(/^[0-9]{10}$/, 'Telefon numarası 10 haneli olmalıdır (Başında 0 olmadan)'),
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        // Validation
        const result = registerSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            )
        }

        const { name, email, password, phoneNumber } = result.data

        // Check existing user
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            // If user exists but email not verified, resend code
            if (!existingUser.emailVerified) {
                const verificationCode = generateVerificationCode()
                const verificationExpires = new Date(Date.now() + 10 * 60 * 1000)

                await prisma.user.update({
                    where: { id: existingUser.id },
                    data: {
                        verificationCode,
                        verificationExpires,
                        password: await bcrypt.hash(password, 12),
                        name,
                        phoneNumber: formatPhoneNumber(phoneNumber),
                    }
                })

                const emailSent = await sendVerificationCode(email, verificationCode)
                if (!emailSent) {
                    return NextResponse.json(
                        { error: 'Doğrulama kodu gönderilemedi' },
                        { status: 500 }
                    )
                }

                return NextResponse.json({
                    success: true,
                    requiresVerification: true,
                    message: 'Doğrulama kodu email adresinize gönderildi'
                })
            }

            return NextResponse.json(
                { error: 'Bu email adresi zaten kullanılıyor' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Generate verification code
        const verificationCode = generateVerificationCode()
        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000)

        // Create user (email not verified)
        await prisma.user.create({
            data: {
                name,
                email,
                phoneNumber: formatPhoneNumber(phoneNumber),
                password: hashedPassword,
                role: 'USER',
                verificationCode,
                verificationExpires,
                subscription: {
                    create: {
                        plan: 'FREE',
                        status: 'ACTIVE',
                    },
                },
            },
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
            requiresVerification: true,
            message: 'Doğrulama kodu email adresinize gönderildi'
        })
    } catch (error: any) {
        console.error('Register error:', error)

        if (error?.code === 'P2002') {
            return NextResponse.json(
                { error: 'Bu email veya telefon numarası zaten kayıtlı' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: error?.message || 'Kayıt işlemi başarısız. Lütfen bilgilerinizi kontrol edin.' },
            { status: 500 }
        )
    }
}
