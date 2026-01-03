import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
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
            return NextResponse.json(
                { error: 'Bu email adresi zaten kullanılıyor' },
                { status: 400 }
            )
        }

        // Şifre hashleme
        const hashedPassword = await bcrypt.hash(password, 12)

        // Kullanıcı oluştur
        const user = await prisma.user.create({
            data: {
                name,
                email,
                phoneNumber: `+90${phoneNumber}`,
                password: hashedPassword,
                role: 'USER',
                subscription: {
                    create: {
                        plan: 'FREE',
                        status: 'ACTIVE',
                    },
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        })

        return NextResponse.json({
            message: 'Kayıt başarılı',
            user,
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
