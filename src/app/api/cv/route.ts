import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkLimit, incrementUsage } from '@/lib/usage-limiter'
import { extractCVData, generateProfessionalSummary } from '@/lib/openai'

// CV listesi
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const cvs = await prisma.cV.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                template: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        return NextResponse.json({ cvs })
    } catch (error) {
        console.error('Get CVs error:', error)
        return NextResponse.json({ error: 'CVler yüklenemedi' }, { status: 500 })
    }
}

// Yeni CV oluştur
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Limit kontrolü
        const limitCheck = await checkLimit(session.user.id, 'CV_CREATED')
        if (!limitCheck.allowed) {
            return NextResponse.json({
                error: 'Aylık CV oluşturma limitinize ulaştınız',
                limit: limitCheck.limit,
                current: limitCheck.current,
            }, { status: 429 })
        }

        const { title, chatSessionId, template = 'modern' } = await req.json()

        if (!title || !chatSessionId) {
            return NextResponse.json(
                { error: 'Title ve chatSessionId gerekli' },
                { status: 400 }
            )
        }

        // Chat session'ı al
        const chatSession = await prisma.chatSession.findUnique({
            where: { id: chatSessionId },
        })

        if (!chatSession) {
            return NextResponse.json({ error: 'Chat session bulunamadı' }, { status: 404 })
        }

        // Chat mesajlarından CV verisi extract et
        const messages = JSON.parse(chatSession.messages || '[]')
        const cvData = await extractCVData(messages)

        // Profesyonel özet oluştur
        const summary = await generateProfessionalSummary(cvData)
        const fullCVData = { ...cvData, summary }

        // CV oluştur
        const cv = await prisma.cV.create({
            data: {
                userId: session.user.id,
                title,
                data: JSON.stringify(fullCVData),
                template,
            },
        })

        // Chat session'a CV'yi bağla
        await prisma.chatSession.update({
            where: { id: chatSessionId },
            data: { cvId: cv.id },
        })

        // Kullanımı artır
        await incrementUsage(session.user.id, 'CV_CREATED')

        // CV'den elde edilen adres bilgilerini kullanıcı profiline kaydet (fatura bilgisi yoksa)
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { address: true, city: true }
        })

        // Eğer kullanıcının fatura adresi boşsa, CV'deki bilgileri kaydet
        if (!user?.address && cvData.personalInfo) {
            const updateData: {
                name?: string
                phoneNumber?: string
                address?: string
                city?: string
            } = {}

            // CV'den alınan bilgileri kullan
            if (cvData.personalInfo.fullName) {
                updateData.name = cvData.personalInfo.fullName
            }
            if (cvData.personalInfo.phone) {
                updateData.phoneNumber = cvData.personalInfo.phone
            }
            if (cvData.personalInfo.address) {
                updateData.address = cvData.personalInfo.address

                // Adres içinden şehir çıkar (örn: "İstanbul, Kadıköy" veya "Ankara")
                const addressParts = cvData.personalInfo.address.split(',').map((s: string) => s.trim())
                if (addressParts.length > 0) {
                    // İlk parça genellikle şehir
                    const possibleCity = addressParts[0]
                    if (possibleCity && possibleCity.length > 1) {
                        updateData.city = possibleCity
                    }
                }
            }

            // Sadece en az bir veri varsa güncelle
            if (Object.keys(updateData).length > 0) {
                await prisma.user.update({
                    where: { id: session.user.id },
                    data: updateData
                })
                console.log(`[CV] Updated user profile with CV data for user ${session.user.id}`)
            }
        }

        return NextResponse.json({
            message: 'CV oluşturuldu',
            cv: {
                id: cv.id,
                title: cv.title,
                data: fullCVData,
            },
        })
    } catch (error: unknown) {
        console.error('Create CV error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
        return NextResponse.json({ error: `CV oluşturulamadı: ${errorMessage}` }, { status: 500 })
    }
}
