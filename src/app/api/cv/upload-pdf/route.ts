import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parsePDFCV } from '@/lib/openai'

// Maksimum dosya boyutu (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB in bytes

// PDF dosyasını yükle ve AI ile analiz et
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

        // unpdf ile PDF'den metin çıkar
        let pdfText = ''
        try {
            const { extractText } = await import('unpdf')
            const result = await extractText(buffer)
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

        console.log(`[PDF Upload] Parsing CV with AI...`)

        // AI ile CV verisini parse et
        let cvData
        try {
            cvData = await parsePDFCV(pdfText)
            cvData.rawText = pdfText // Ham metni de sakla
            cvData.fileName = file.name
            cvData.uploadedAt = new Date().toISOString()
            console.log(`[PDF Upload] AI parsing successful. Name: ${cvData.personalInfo?.fullName || 'unknown'}`)
        } catch (aiError: any) {
            console.error('AI parse error:', aiError?.message || aiError)
            // AI parse başarısız olursa ham metin ile kaydet
            cvData = {
                rawText: pdfText,
                fileName: file.name,
                uploadedAt: new Date().toISOString(),
                personalInfo: { fullName: '', email: '', phone: '', address: '', birthDate: '', linkedIn: '' },
                education: [],
                experience: [],
                skills: { technical: [], languages: [], software: [] },
                certificates: [],
                summary: '',
            }
        }

        // CV'yi veritabanına kaydet
        const savedCV = await prisma.cV.create({
            data: {
                userId: session.user.id,
                title: cvData.personalInfo?.fullName || file.name.replace('.pdf', '').replace('.PDF', ''),
                data: JSON.stringify(cvData),
                template: 'modern',
            },
        })

        console.log(`[PDF Upload] CV saved successfully with ID: ${savedCV.id}`)

        // Kullanıcının fatura bilgisi yoksa CV'den çıkarılan bilgileri kaydet
        if (cvData.personalInfo) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { address: true, city: true, phoneNumber: true, name: true }
            })

            const updateData: Record<string, string> = {}

            // Eksik bilgileri CV'den al
            if (!user?.name && cvData.personalInfo.fullName) {
                updateData.name = cvData.personalInfo.fullName
            }
            if (!user?.phoneNumber && cvData.personalInfo.phone) {
                // Telefonu +90 formatına çevir
                let phone = cvData.personalInfo.phone.replace(/\D/g, '')
                if (phone.startsWith('90')) phone = phone.slice(2)
                if (phone.startsWith('0')) phone = phone.slice(1)
                if (phone.length === 10) {
                    updateData.phoneNumber = `+90${phone}`
                }
            }
            if (!user?.address && cvData.personalInfo.address) {
                updateData.address = cvData.personalInfo.address

                // Adres içinden şehir çıkar
                const addressParts = cvData.personalInfo.address.split(',').map((s: string) => s.trim())
                if (addressParts.length > 0 && !user?.city) {
                    const possibleCity = addressParts[0]
                    if (possibleCity && possibleCity.length > 1) {
                        updateData.city = possibleCity
                    }
                }
            }

            if (Object.keys(updateData).length > 0) {
                await prisma.user.update({
                    where: { id: session.user.id },
                    data: updateData
                })
                console.log(`[PDF Upload] Updated user profile with CV data: ${Object.keys(updateData).join(', ')}`)
            }
        }

        return NextResponse.json({
            success: true,
            cvId: savedCV.id,
            message: 'CV başarıyla yüklendi ve analiz edildi! İş ilanlarıyla eşleşme için "Eşleşen İlanlar" butonunu kullanabilirsiniz.',
            fileName: file.name,
            textLength: pdfText.length,
            parsedName: cvData.personalInfo?.fullName || null,
        })
    } catch (error) {
        console.error('PDF upload error:', error)
        return NextResponse.json(
            { error: 'PDF işleme sırasında bir hata oluştu' },
            { status: 500 }
        )
    }
}
