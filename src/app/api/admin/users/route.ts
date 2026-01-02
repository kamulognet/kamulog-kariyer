import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Admin middleware
async function checkAdmin() {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
        return null
    }
    return session
}

// Kullanıcı listesi
export async function GET(req: NextRequest) {
    const session = await checkAdmin()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const search = searchParams.get('search') || ''
        const skip = (page - 1) * limit

        const where = search
            ? {
                OR: [
                    { name: { contains: search } },
                    { email: { contains: search } },
                    { phoneNumber: { contains: search } },
                ],
            }
            : {}

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phoneNumber: true,
                    credits: true,
                    role: true,
                    createdAt: true,
                    subscription: {
                        select: {
                            plan: true,
                            status: true,
                            expiresAt: true,
                        },
                    },
                    _count: {
                        select: { cvs: true },
                    },
                },
            }),
            prisma.user.count({ where }),
        ])

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Admin users error:', error)
        return NextResponse.json({ error: 'Kullanıcılar yüklenemedi' }, { status: 500 })
    }
}

// Kullanıcı güncelle (tam CRUD)
export async function PUT(req: NextRequest) {
    const session = await checkAdmin()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { userId, name, phoneNumber, credits, role, plan } = body

        if (!userId) {
            return NextResponse.json({ error: 'userId gerekli' }, { status: 400 })
        }

        // Kullanıcı bilgilerini güncelle
        const updateData: any = {}
        if (name !== undefined) updateData.name = name
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber
        if (credits !== undefined) updateData.credits = credits
        if (role && ['USER', 'ADMIN'].includes(role)) updateData.role = role

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                credits: true,
                role: true,
            },
        })

        // Plan güncellemesi varsa subscription'ı da güncelle
        if (plan) {
            const existingSubscription = await prisma.subscription.findUnique({
                where: { userId },
            })

            if (existingSubscription) {
                await prisma.subscription.update({
                    where: { userId },
                    data: {
                        plan,
                        status: plan === 'FREE' ? 'INACTIVE' : 'ACTIVE',
                        expiresAt: plan !== 'FREE' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
                    },
                })
            } else if (plan !== 'FREE') {
                await prisma.subscription.create({
                    data: {
                        userId,
                        plan,
                        status: 'ACTIVE',
                        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    },
                })
            }
        }

        // Admin log kaydı
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id,
                action: 'UPDATE',
                targetType: 'USER',
                targetId: userId,
                details: JSON.stringify({
                    changes: { name, phoneNumber, credits, role, plan },
                    updatedBy: session.user.email,
                }),
            },
        })

        return NextResponse.json({ user, message: 'Kullanıcı güncellendi' })
    } catch (error) {
        console.error('Update user error:', error)
        return NextResponse.json({ error: 'Kullanıcı güncellenemedi' }, { status: 500 })
    }
}

// Kullanıcı sil
export async function DELETE(req: NextRequest) {
    const session = await checkAdmin()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'userId gerekli' }, { status: 400 })
        }

        // Admin kendini silemesin
        if (userId === session.user.id) {
            return NextResponse.json({ error: 'Kendinizi silemezsiniz' }, { status: 400 })
        }

        // Kullanıcı bilgilerini al (log için)
        const userToDelete = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
        })

        if (!userToDelete) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
        }

        // Kullanıcıyı sil (ilişkili veriler cascade ile silinir)
        await prisma.user.delete({
            where: { id: userId },
        })

        // Admin log kaydı
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id,
                action: 'DELETE',
                targetType: 'USER',
                targetId: userId,
                details: JSON.stringify({
                    deletedUser: userToDelete,
                    deletedBy: session.user.email,
                }),
            },
        })

        return NextResponse.json({ message: 'Kullanıcı silindi' })
    } catch (error) {
        console.error('Delete user error:', error)
        return NextResponse.json({ error: 'Kullanıcı silinemedi' }, { status: 500 })
    }
}
