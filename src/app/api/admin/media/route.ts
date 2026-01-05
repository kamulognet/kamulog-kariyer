import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// GET - Kategorileri ve medyaları listele
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const categoryId = searchParams.get('categoryId')

        // Kategorileri getir
        const categories = await prisma.mediaCategory.findMany({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { media: true } } }
        })

        // Medyaları getir
        const media = await prisma.media.findMany({
            where: categoryId ? { categoryId } : undefined,
            orderBy: { createdAt: 'desc' },
            include: { category: { select: { name: true } } }
        })

        return NextResponse.json({ categories, media })
    } catch (error) {
        console.error('Media list error:', error)
        return NextResponse.json({ error: 'Medya listesi alınamadı' }, { status: 500 })
    }
}

// POST - Yeni kategori veya medya ekle
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const formData = await request.formData()
        const action = formData.get('action') as string

        if (action === 'createCategory') {
            const name = formData.get('name') as string
            if (!name) {
                return NextResponse.json({ error: 'Kategori adı gerekli' }, { status: 400 })
            }

            const slug = name
                .toLowerCase()
                .replace(/ğ/g, 'g')
                .replace(/ü/g, 'u')
                .replace(/ş/g, 's')
                .replace(/ı/g, 'i')
                .replace(/ö/g, 'o')
                .replace(/ç/g, 'c')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')

            const category = await prisma.mediaCategory.create({
                data: { name, slug }
            })

            return NextResponse.json({ success: true, category })
        }

        if (action === 'uploadMedia') {
            const file = formData.get('file') as File
            const categoryId = formData.get('categoryId') as string | null

            if (!file) {
                return NextResponse.json({ error: 'Dosya gerekli' }, { status: 400 })
            }

            // Dosyayı kaydet
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            // Upload klasörünü oluştur
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'media')
            await mkdir(uploadDir, { recursive: true })

            // Benzersiz dosya adı
            const timestamp = Date.now()
            const ext = path.extname(file.name)
            const filename = `${timestamp}${ext}`
            const filepath = path.join(uploadDir, filename)

            await writeFile(filepath, buffer)

            // Veritabanına kaydet
            const media = await prisma.media.create({
                data: {
                    filename: file.name,
                    url: `/uploads/media/${filename}`,
                    mimeType: file.type,
                    size: file.size,
                    categoryId: categoryId || null
                }
            })

            return NextResponse.json({ success: true, media })
        }

        return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 })
    } catch (error) {
        console.error('Media create error:', error)
        return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 })
    }
}

// DELETE - Kategori veya medya sil
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const mediaId = searchParams.get('mediaId')
        const categoryId = searchParams.get('categoryId')

        if (mediaId) {
            await prisma.media.delete({ where: { id: mediaId } })
            return NextResponse.json({ success: true })
        }

        if (categoryId) {
            await prisma.mediaCategory.delete({ where: { id: categoryId } })
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })
    } catch (error) {
        console.error('Media delete error:', error)
        return NextResponse.json({ error: 'Silme başarısız' }, { status: 500 })
    }
}
