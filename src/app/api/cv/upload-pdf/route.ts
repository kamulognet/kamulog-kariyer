import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parsePDFCV, generateMissingInfoQuestions } from '@/lib/openai'

// PDF dosyasını yükle ve analiz et
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get('pdf') as File | null

        if (!file) {
            return NextResponse.json({ error: 'PDF dosyası gerekli' }, { status: 400 })
        }

        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return NextResponse.json({ error: 'Sadece PDF dosyaları kabul edilir' }, { status: 400 })
        }

        // PDF dosyasını buffer'a çevir
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // pdf-parse ile PDF'i işle
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse')
        const pdfData = await pdfParse(buffer)
        const pdfText = pdfData.text

        if (!pdfText || pdfText.trim().length < 50) {
            return NextResponse.json({
                error: 'PDF dosyasından yeterli metin çıkarılamadı. Lütfen metin tabanlı bir PDF yükleyin.'
            }, { status: 400 })
        }

        // AI ile CV verisi çıkar
        const cvData = await parsePDFCV(pdfText)

        // Eksik alanlar varsa sorular oluştur
        let missingQuestions = ''
        if (cvData.missingFields && cvData.missingFields.length > 0) {
            missingQuestions = await generateMissingInfoQuestions(cvData.missingFields)
        }

        // Chat session oluştur ve CV verisini kaydet
        const chatSession = await prisma.chatSession.create({
            data: {
                userId: session.user.id,
                messages: JSON.stringify([
                    {
                        role: 'system',
                        content: 'PDF CV yüklendi ve analiz edildi.'
                    },
                    {
                        role: 'assistant',
                        content: missingQuestions || 'CV\'niz başarıyla analiz edildi! Bilgileriniz tamamlandı. "CV Oluştur" butonuna tıklayarak profesyonel CV\'nizi oluşturabilirsiniz.'
                    }
                ]),
            },
        })

        // Geçici CV verisi olarak kaydet
        const tempCV = await prisma.cV.create({
            data: {
                userId: session.user.id,
                title: 'PDF\'den Yüklenen CV',
                data: JSON.stringify(cvData),
                template: 'modern',
            },
        })

        // Session'a CV'yi bağla
        await prisma.chatSession.update({
            where: { id: chatSession.id },
            data: { cvId: tempCV.id },
        })

        return NextResponse.json({
            success: true,
            sessionId: chatSession.id,
            cvId: tempCV.id,
            cvData,
            missingFields: cvData.missingFields || [],
            welcomeMessage: missingQuestions || 'CV\'niz başarıyla analiz edildi! Bilgileriniz tamamlandı. "CV Oluştur" butonuna tıklayarak profesyonel CV\'nizi oluşturabilirsiniz.',
        })
    } catch (error) {
        console.error('PDF upload error:', error)
        return NextResponse.json(
            { error: 'PDF işleme sırasında bir hata oluştu' },
            { status: 500 }
        )
    }
}
