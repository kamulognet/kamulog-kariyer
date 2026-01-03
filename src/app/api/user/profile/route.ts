import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                phoneNumber: true,
                address: true,
                city: true,
                district: true,
                taxNumber: true,
                taxOffice: true,
                credits: true,
                role: true,
                subscription: true,
            }
        })

        return NextResponse.json({ user })
    } catch (error) {
        console.error('Profile fetch error:', error)
        return NextResponse.json({ error: 'Profil bilgileri yüklenemedi' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const body = await req.json()
        const {
            name,
            phoneNumber,
            address,
            city,
            district,
            taxNumber,
            taxOffice,
            password
        } = body

        const updateData: any = {
            name,
            phoneNumber,
            address,
            city,
            district,
            taxNumber,
            taxOffice,
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10)
            updateData.password = hashedPassword
        }

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                phoneNumber: true,
            }
        })

        return NextResponse.json({ message: 'Profil güncellendi', user })
    } catch (error) {
        console.error('Profile update error:', error)
        return NextResponse.json({ error: 'Profil güncellenemedi' }, { status: 500 })
    }
}
