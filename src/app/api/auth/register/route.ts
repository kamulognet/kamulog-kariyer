import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendVerificationCodeEmail } from '@/lib/email'
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

        // Validasyon
        const result = registerSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            )
        }

        const { name, email, password, phoneNumber } = result.data

        // Email kontrolü
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            // Eğer kullanıcı var ama emaili doğrulanmamışsa, doğrulama kodu gönder
            if (!existingUser.emailVerified) {
                const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
                const verificationExpires = new Date(Date.now() + 10 * 60 * 1000)

                await prisma.user.update({
                    where: { id: existingUser.id },
                    data: {
                        verificationCode,
                        verificationExpires,
                        // Şifreyi de güncelle (belki farklı bir şifre girmiştir)
                        password: await bcrypt.hash(password, 12),
                        name,
                        phoneNumber: `+90${phoneNumber}`,
                    }
                })

                const emailSent = await sendVerificationCodeEmail(email, verificationCode)
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

        // Şifre hashleme
        const hashedPassword = await bcrypt.hash(password, 12)

        // 6 haneli doğrulama kodu oluştur
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 dakika

        // Kullanıcı oluştur (email doğrulanmamış olarak)
        await prisma.user.create({
            data: {
                name,
                email,
                phoneNumber: `+90${phoneNumber}`,
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

        // Doğrulama kodu gönder
        const emailSent = await sendVerificationCodeEmail(email, verificationCode)
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
        console.error('Error message:', error?.message)
        console.error('Error code:', error?.code)

        // Prisma unique constraint error
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
