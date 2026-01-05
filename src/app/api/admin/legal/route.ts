import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const LEGAL_PAGES = ['kvkk', 'gizlilik', 'kullanim-kosullari']

// GET - Yasal sayfa içeriklerini getir
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const page = searchParams.get('page')

        if (page) {
            // Tek sayfa
            const content = await prisma.siteSettings.findUnique({
                where: { key: `legal_${page}` }
            })
            return NextResponse.json({
                page,
                content: content?.value || getDefaultContent(page)
            })
        }

        // Tüm sayfalar
        const settings = await prisma.siteSettings.findMany({
            where: { key: { startsWith: 'legal_' } }
        })

        const pages = LEGAL_PAGES.map(p => ({
            key: p,
            title: getPageTitle(p),
            hasCustomContent: settings.some(s => s.key === `legal_${p}`)
        }))

        return NextResponse.json({ pages })
    } catch (error) {
        console.error('Legal GET error:', error)
        return NextResponse.json({ error: 'İçerik alınamadı' }, { status: 500 })
    }
}

// POST - Yasal sayfa içeriğini güncelle
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const { page, content } = await request.json()

        if (!page || !LEGAL_PAGES.includes(page)) {
            return NextResponse.json({ error: 'Geçersiz sayfa' }, { status: 400 })
        }

        await prisma.siteSettings.upsert({
            where: { key: `legal_${page}` },
            update: { value: content },
            create: { key: `legal_${page}`, value: content }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Legal POST error:', error)
        return NextResponse.json({ error: 'İçerik kaydedilemedi' }, { status: 500 })
    }
}

function getPageTitle(page: string): string {
    switch (page) {
        case 'kvkk': return 'KVKK Aydınlatma Metni'
        case 'gizlilik': return 'Gizlilik Politikası'
        case 'kullanim-kosullari': return 'Kullanım Koşulları'
        default: return page
    }
}

function getDefaultContent(page: string): string {
    // Varsayılan içerikler - sayfalar ilk defa düzenlenene kadar gösterilir
    const companyInfo = `
**Veri Sorumlusu:** Suat Hayri Şahin – Kamulog.net
**Vergi Kimlik No:** 7960109842
**Adres:** Atatürk Mahallesi, Çelikel Sokak, Sancaktepe/İSTANBUL PK: 34785
**E-Posta:** destek@kamulogkariyer.com
`

    switch (page) {
        case 'kvkk':
            return `# KVKK Aydınlatma Metni

${companyInfo}

## 1. Veri Sorumlusu
6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca, kişisel verileriniz veri sorumlusu olarak Kamulog.net tarafından işlenmektedir.

## 2. İşlenen Kişisel Veriler
- Kimlik Bilgileri: Ad, soyad
- İletişim Bilgileri: E-posta, telefon
- Özgeçmiş Bilgileri: Eğitim, iş deneyimi
- Finansal Bilgiler: Fatura adresi

## 3. Kişisel Verilerin İşlenme Amaçları
- Üyelik işlemlerinin gerçekleştirilmesi
- CV oluşturma hizmetlerinin sunulması
- Abonelik ve ödeme işlemleri

*Son güncelleme: Ocak 2025*`

        case 'gizlilik':
            return `# Gizlilik Politikası

${companyInfo}

## 1. Giriş
Bu Gizlilik Politikası, Kariyer Kamulog platformunun kullanıcılarının kişisel verilerinin nasıl toplandığını açıklamaktadır.

## 2. Topladığımız Bilgiler
- Kayıt bilgileri (ad, soyad, e-posta)
- CV bilgileri
- Çerez verileri

## 3. Çerezler
Platform, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır.

*Son güncelleme: Ocak 2025*`

        case 'kullanim-kosullari':
            return `# Kullanım Koşulları

${companyInfo}

## 1. Kabul
Platformu kullanarak bu koşulları kabul etmiş sayılırsınız.

## 2. Hizmet Tanımı
- CV oluşturma ve düzenleme
- İş ilanları listeleme
- Kariyer danışmanlığı (Premium)

## 3. Önemli Uyarı
**Kariyer Kamulog, herhangi bir işe yerleştirme garantisi sunmamaktadır.**

*Son güncelleme: Ocak 2025*`

        default:
            return ''
    }
}
