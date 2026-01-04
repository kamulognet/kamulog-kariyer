import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateMissingInfoQuestions } from '@/lib/openai'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

// Maksimum dosya boyutu (10MB for OpenAI)
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

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

        // Dosya boyutu kontrolü (OpenAI limiti)
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({
                error: `Dosya boyutu çok büyük. Maksimum 10 MB yükleyebilirsiniz.`
            }, { status: 400 })
        }

        console.log(`[PDF Upload] File: ${file.name}, Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`)

        // PDF dosyasını base64'e çevir
        const bytes = await file.arrayBuffer()
        const base64 = Buffer.from(bytes).toString('base64')

        console.log(`[PDF Upload] Sending to OpenAI for analysis...`)

        // OpenAI GPT-4 ile PDF'den CV verisi çıkar (doğrudan dosya olarak)
        let cvData: any = null
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `Sen bir CV analiz uzmanısın. Verilen PDF CV'sini analiz et ve aşağıdaki JSON formatında yapılandırılmış veri döndür:
{
  "personalInfo": { "fullName": "", "birthDate": "", "email": "", "phone": "", "address": "", "linkedIn": "" },
  "education": [{ "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "", "gpa": "" }],
  "experience": [{ "company": "", "position": "", "startDate": "", "endDate": "", "description": "", "responsibilities": [] }],
  "skills": { "technical": [], "languages": [], "software": [] },
  "certificates": [{ "name": "", "issuer": "", "date": "" }],
  "summary": "",
  "missingFields": []
}
Eksik alanları "missingFields" dizisine ekle. Sadece JSON döndür, başka bir şey yazma.`
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'file',
                                file: {
                                    filename: file.name,
                                    file_data: `data:application/pdf;base64,${base64}`,
                                },
                            } as any,
                            {
                                type: 'text',
                                text: 'Bu PDF CV dosyasını analiz et ve yapılandırılmış CV verisi olarak JSON formatında döndür.',
                            },
                        ],
                    },
                ],
                max_tokens: 4000,
                temperature: 0.1,
            })

            const content = response.choices[0]?.message?.content || ''
            console.log(`[PDF Upload] OpenAI response received, length: ${content.length}`)

            // JSON'u parse et
            const jsonMatch = content.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                cvData = JSON.parse(jsonMatch[0])
            } else {
                throw new Error('OpenAI yanıtından JSON parse edilemedi')
            }
        } catch (parseError: any) {
            console.error('PDF parse error:', parseError?.message || parseError)
            return NextResponse.json({
                error: 'PDF analiz edilemedi. Lütfen metin içeren bir CV yükleyin.'
            }, { status: 400 })
        }

        console.log(`[PDF Upload] CV data extracted successfully`)

        // AI ile CV verisi çıkar

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
