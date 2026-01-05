import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const type = searchParams.get('type') // PUBLIC, PRIVATE, ALL

        // ALL veya boş ise tümünü getir
        const where = (type && type !== 'ALL') ? { type } : {}

        const jobs = await prisma.jobListing.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        })

        // Kullanıcının Premium olup olmadığını kontrol et
        const session = await getServerSession(authOptions)
        let isPremium = false

        if (session?.user?.id) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: {
                    subscription: {
                        select: { plan: true, status: true }
                    }
                }
            })

            // Sadece PREMIUM ve aktif abonelik
            isPremium = user?.subscription?.status === 'ACTIVE' && user?.subscription?.plan === 'PREMIUM'
        }

        // employerPhone'u sadece Premium kullanıcılara göster
        const safeJobs = jobs.map(job => ({
            ...job,
            employerPhone: isPremium ? job.employerPhone : null
        }))

        return NextResponse.json({ jobs: safeJobs, isPremium })
    } catch (error) {
        console.error('Get jobs error:', error)
        return NextResponse.json({ error: 'İş ilanları yüklenemedi' }, { status: 500 })
    }
}

// Sadece admin ilan ekleyebilir
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()

        // Veri temizleme - boş stringleri null yap, deadline'ı DateTime formatına çevir
        const jobData = {
            title: body.title,
            company: body.company,
            location: body.location || null,
            type: body.type || 'PRIVATE',
            description: body.description,
            requirements: body.requirements || null,
            sourceUrl: body.sourceUrl || null,
            applicationUrl: body.applicationUrl || null,
            salary: body.salary || null,
            deadline: body.deadline ? new Date(body.deadline) : null,
            employerPhone: body.employerPhone || null, // İşveren telefonu (opsiyonel)
        }

        const job = await prisma.jobListing.create({
            data: jobData,
        })
        return NextResponse.json({ job })
    } catch (error: any) {
        console.error('Job create error:', error)
        return NextResponse.json({ error: error?.message || 'İlan oluşturulamadı' }, { status: 500 })
    }
}
