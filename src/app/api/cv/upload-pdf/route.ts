import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parsePDFCV, generateMissingInfoQuestions } from '@/lib/openai'

// Maksimum dosya boyutu (1GB)
const MAX_FILE_SIZE = 1024 * 1024 * 1024 // 1GB in bytes

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

        // Dosya boyutu kontrolü
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({
                error: `Dosya boyutu çok büyük. Maksimum ${Math.round(MAX_FILE_SIZE / (1024 * 1024 * 1024))} GB yükleyebilirsiniz.`
            }, { status: 400 })
        }

        console.log(`[PDF Upload] File: ${file.name}, Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`)

        // PDF dosyasını buffer'a çevir
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // pdf-parse ile PDF'i işle (canvas rendering disabled)
        let pdfText = ''
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const pdfParse = require('pdf-parse')

            // Disable page rendering to avoid canvas/DOMMatrix issues
            const options = {
                // Custom page render function that doesn't use canvas
                pagerender: function (pageData: any) {
                    return pageData.getTextContent().then(function (textContent: any) {
                        let text = ''
                        for (const item of textContent.items) {
                            text += item.str + ' '
                        }
                        return text
                    })
                }
            }

            const pdfData = await pdfParse(buffer, options)
            pdfText = pdfData.text
        } catch (parseError) {
            console.error('PDF parse error:', parseError)
            return NextResponse.json({
                error: 'PDF dosyası okunamadı. Lütfen başka bir PDF deneyin veya metin tabanlı bir PDF yükleyin.'
            }, { status: 400 })
        }

        if (!pdfText || pdfText.trim().length < 50) {
            return NextResponse.json({
                error: 'PDF dosyasından yeterli metin çıkarılamadı. Lütfen metin tabanlı bir PDF yükleyin.'
            }, { status: 400 })
        }

        console.log(`[PDF Upload] Extracted text length: ${pdfText.length} characters`)

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
