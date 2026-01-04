import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Maksimum dosya boyutu (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB in bytes

// PDF dosyasını yükle (AI analizi YOK - sadece metin çıkar ve kaydet)
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

        console.log(`[PDF Upload] Saving CV with raw text...`)

        // Ham metin olarak CV verisi oluştur (AI analizi YOK)
        const cvData = {
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

        // CV'yi veritabanına kaydet
        const savedCV = await prisma.cV.create({
            data: {
                userId: session.user.id,
                title: file.name.replace('.pdf', '').replace('.PDF', ''),
                data: JSON.stringify(cvData),
                template: 'modern',
            },
        })

        console.log(`[PDF Upload] CV saved successfully with ID: ${savedCV.id}`)

        return NextResponse.json({
            success: true,
            cvId: savedCV.id,
            message: 'CV başarıyla yüklendi! İş ilanlarıyla eşleşme için "Eşleşen İlanlar" butonunu kullanabilirsiniz.',
            fileName: file.name,
            textLength: pdfText.length,
        })
    } catch (error) {
        console.error('PDF upload error:', error)
        return NextResponse.json(
            { error: 'PDF işleme sırasında bir hata oluştu' },
            { status: 500 }
        )
    }
}
