import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parsePDFCV, generateMissingInfoQuestions } from '@/lib/openai'

// Maksimum dosya boyutu (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB in bytes

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
                error: `Dosya boyutu çok büyük. Maksimum 50 MB yükleyebilirsiniz.`
            }, { status: 400 })
        }

        console.log(`[PDF Upload] File: ${file.name}, Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`)

        // PDF dosyasını buffer'a çevir
        const bytes = await file.arrayBuffer()
        const buffer = new Uint8Array(bytes)

        // unpdf ile PDF'den metin çıkar (canvas gerektirmez, pure JS)
        let pdfText = ''
        try {
            const { extractText } = await import('unpdf')
            const result = await extractText(buffer)
            // text string veya string array olabilir
            pdfText = Array.isArray(result.text) ? result.text.join('\n') : result.text
            console.log(`[PDF Upload] Extracted text length: ${pdfText.length} characters`)
        } catch (parseError: any) {
            console.error('PDF parse error:', parseError?.message || parseError)
            return NextResponse.json({
                error: 'PDF dosyası okunamadı. Lütfen metin tabanlı bir PDF yükleyin.'
            }, { status: 400 })
        }

        if (!pdfText || pdfText.trim().length < 50) {
            return NextResponse.json({
                error: 'PDF dosyasından yeterli metin çıkarılamadı. Lütfen metin tabanlı bir PDF yükleyin (taranmış/görüntü PDF desteklenmez).'
            }, { status: 400 })
        }

        console.log(`[PDF Upload] Sending ${pdfText.length} chars to OpenAI for analysis...`)

        // AI ile CV verisi çıkar
        const cvData = await parsePDFCV(pdfText)

        console.log(`[PDF Upload] CV data extracted successfully`)

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
