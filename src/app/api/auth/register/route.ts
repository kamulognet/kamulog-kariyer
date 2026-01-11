import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { formatPhoneNumber } from '@/utils/helpers'

import { z } from 'zod'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import { verifyReptika } from '@/lib/reptika'

const registerSchema = z.object({
    name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
    phoneNumber: z.string().regex(/^[0-9]{10}$/, 'Telefon numarası 10 haneli olmalıdır (Başında 0 olmadan)'),
})

// 6 haneli rastgele doğrulama kodu oluştur
function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

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

        // Verify Reptika bot detection
        const isHuman = await verifyReptika(formatPhoneNumber(phoneNumber))
        if (!isHuman) {
            return NextResponse.json(
                { error: 'Bot tespit edildi. Kayıt yapılamıyor.' },
                { status: 400 }
            )
        }

        // Check existing user
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            // If user exists and email is verified
            if (existingUser.emailVerified) {
                return NextResponse.json(
                    { error: 'Bu e-posta adresi zaten kullanılıyor' },
                    { status: 400 }
                )
            }

            // If user exists but email not verified, update and send new code
            const verificationCode = generateVerificationCode()
            const verificationExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 dakika

            await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    password: await bcrypt.hash(password, 12),
                    name,
                    phoneNumber: formatPhoneNumber(phoneNumber),
                    verificationCode,
                    verificationExpires,
                }
            })

            // Send verification code via WhatsApp
            const whatsappMessage = `Kayıt doğrulama kodunuz: ${verificationCode}`
            await sendWhatsAppMessage(existingUser.phoneNumber || formatPhoneNumber(phoneNumber), whatsappMessage)

            return NextResponse.json({
                success: true,
                requiresVerification: true,
                message: 'Doğrulama kodu WhatsApp üzerinden gönderildi.'
            })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Generate verification code for new user
        const verificationCode = generateVerificationCode()
        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // Create user (email not verified, requires WhatsApp verification)
        await prisma.user.create({
            data: {
                name,
                email,
                phoneNumber: formatPhoneNumber(phoneNumber),
                password: hashedPassword,
                role: 'USER',
                emailVerified: null,
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

        // Send verification code via WhatsApp
        const whatsappMessage = `Kayıt doğrulama kodunuz: ${verificationCode}`
        await sendWhatsAppMessage(formatPhoneNumber(phoneNumber), whatsappMessage)

        return NextResponse.json({
            success: true,
            requiresVerification: true,
            message: 'Doğrulama kodu WhatsApp üzerinden gönderildi.'
        })
    } catch (error: any) {
        console.error('Register error:', error)

        if (error?.code === 'P2002') {
            const field = error.meta?.target?.[0]
            if (field === 'email') {
                return NextResponse.json(
                    { error: 'Bu e-posta adresi zaten kayıtlı' },
                    { status: 400 }
                )
            }
            if (field === 'phoneNumber') {
                return NextResponse.json(
                    { error: 'Bu telefon numarası zaten kayıtlı' },
                    { status: 400 }
                )
            }
            return NextResponse.json(
                { error: 'Bu bilgiler zaten kayıtlı' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.' },
            { status: 500 }
        )
    }
}
