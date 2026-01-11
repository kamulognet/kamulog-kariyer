import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const LEGAL_PAGES = [
    'kvkk',
    'gizlilik',
    'kullanim-kosullari',
    'mesafeli-satis',
    'iptal-iade',
    'cerez-politikasi'
]

const TOAST_KEYS = [
    'toast_whatsapp_wait',
    'toast_login_success',
    'toast_register_success',
    'toast_verification_sent'
]

// GET - Yasal sayfa içeriklerini getir
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const page = searchParams.get('page')
        const type = searchParams.get('type') // 'legal' | 'toast'

        if (type === 'toast') {
            // Toast mesajlarını getir
            const settings = await prisma.siteSettings.findMany({
                where: { key: { startsWith: 'toast_' } }
            })
            const toasts = TOAST_KEYS.map(k => ({
                key: k,
                title: getToastTitle(k),
                value: settings.find(s => s.key === k)?.value || getDefaultToast(k)
            }))
            return NextResponse.json({ toasts })
        }

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

// POST - Yasal sayfa veya toast içeriğini güncelle
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const { page, content, toastKey, toastValue } = await request.json()

        // Toast güncelleme
        if (toastKey) {
            if (!TOAST_KEYS.includes(toastKey)) {
                return NextResponse.json({ error: 'Geçersiz toast anahtarı' }, { status: 400 })
            }
            await prisma.siteSettings.upsert({
                where: { key: toastKey },
                update: { value: toastValue },
                create: { key: toastKey, value: toastValue }
            })
            return NextResponse.json({ success: true })
        }

        // Yasal sayfa güncelleme
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
        case 'mesafeli-satis': return 'Mesafeli Satış Sözleşmesi'
        case 'iptal-iade': return 'İptal ve İade Politikası'
        case 'cerez-politikasi': return 'Çerez Politikası'
        default: return page
    }
}

function getToastTitle(key: string): string {
    switch (key) {
        case 'toast_whatsapp_wait': return 'WhatsApp Bağlantı Bekleme Mesajı'
        case 'toast_login_success': return 'Giriş Başarılı Mesajı'
        case 'toast_register_success': return 'Kayıt Başarılı Mesajı'
        case 'toast_verification_sent': return 'Doğrulama Kodu Gönderildi Mesajı'
        default: return key
    }
}

function getDefaultToast(key: string): string {
    switch (key) {
        case 'toast_whatsapp_wait': return 'WhatsApp bağlantısı kontrol ediliyor...'
        case 'toast_login_success': return 'Giriş başarılı! Yönlendiriliyorsunuz...'
        case 'toast_register_success': return 'Kayıt başarılı! Hoş geldiniz!'
        case 'toast_verification_sent': return 'Doğrulama kodu WhatsApp numaranıza gönderildi.'
        default: return ''
    }
}

function getDefaultContent(page: string): string {
    const companyInfo = `
**Satıcı/Hizmet Sağlayıcı:** Suat Hayri Şahin – Kamulog.net
**Vergi Kimlik No:** 7960109842
**Adres:** Atatürk Mahallesi, Çelikel Sokak, Sancaktepe/İSTANBUL PK: 34785
**E-Posta:** destek@kamulogkariyer.com
**Telefon:** +90 (XXX) XXX XX XX
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

*Son güncelleme: Ocak 2026*`

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

*Son güncelleme: Ocak 2026*`

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

*Son güncelleme: Ocak 2026*`

        case 'mesafeli-satis':
            return `# Mesafeli Satış Sözleşmesi

${companyInfo}

## MADDE 1 - TARAFLAR

### 1.1 SATICI BİLGİLERİ
- **Ünvan:** Kamulog.net - Kariyer Kamulog
- **Adres:** Atatürk Mahallesi, Çelikel Sokak, Sancaktepe/İSTANBUL PK: 34785
- **E-posta:** destek@kamulogkariyer.com
- **Vergi No:** 7960109842

### 1.2 ALICI BİLGİLERİ
Üyelik formunda belirtilen bilgiler geçerlidir.

## MADDE 2 - SÖZLEŞMENİN KONUSU

İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait kamulogkariyer.com web sitesinden elektronik ortamda satın aldığı dijital abonelik hizmetinin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.

## MADDE 3 - HİZMET BİLGİLERİ

### 3.1 Temel Paket
- Fiyat: 199 TL/ay
- AI destekli CV oluşturma
- Sınırsız CV düzenleme
- PDF indirme
- Günlük 5 iş ilanı başvurusu

### 3.2 Premium Paket
- Fiyat: 399 TL/ay
- Tüm Temel özellikler
- Kariyer danışmanlığı
- Özel şablon tasarımları
- Sınırsız iş başvurusu
- Öncelikli destek

## MADDE 4 - GENEL HÜKÜMLER

4.1 ALICI, hizmet konusu aboneliğin temel nitelikleri, satış fiyatı, ödeme şekli ve hizmetin içeriğine ilişkin tüm bilgileri okuduğunu, anladığını ve elektronik ortamda gerekli onayı verdiğini kabul eder.

4.2 Dijital içerik satışlarında, hizmetin ifasına başlandıktan sonra cayma hakkı kullanılamaz.

## MADDE 5 - ÖDEME VE TESLİMAT

5.1 Ödeme, banka havalesi veya kredi kartı ile yapılabilir.

5.2 Abonelik, ödemenin onaylanmasının ardından derhal aktif hale gelir.

## MADDE 6 - CAYMA HAKKI

6.1 Dijital içerik ve hizmet abonelikleri için, hizmetin ifasına başlandığı andan itibaren cayma hakkı bulunmamaktadır (6502 sayılı Kanun madde 53/ç).

6.2 Kullanıcı, satın alma öncesinde bu durumu kabul ettiğini beyan eder.

## MADDE 7 - UYUŞMAZLIK

İşbu sözleşmeden doğan uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.

*Son güncelleme: Ocak 2026*`

        case 'iptal-iade':
            return `# İptal ve İade Politikası

${companyInfo}

## 1. GENEL BİLGİ

Kariyer Kamulog platformunda sunulan hizmetler dijital içerik ve abonelik hizmetleridir. Bu nedenle 6502 sayılı Tüketicinin Korunması Hakkında Kanun'un 53. maddesi uyarınca, dijital içeriklerin ifasına başlandığı andan itibaren cayma hakkı bulunmamaktadır.

## 2. ABONELİK İPTALİ

### 2.1 İptal Koşulları
- Aktif aboneliğinizi istediğiniz zaman iptal edebilirsiniz.
- İptal işlemi, mevcut fatura döneminin sonuna kadar geçerlidir.
- İptal sonrası kalan süre boyunca hizmetleri kullanmaya devam edersiniz.

### 2.2 İptal Nasıl Yapılır?
1. Hesap ayarlarınıza gidin
2. "Abonelik" bölümünü açın
3. "Aboneliği İptal Et" butonuna tıklayın
4. İptal nedeninizi belirtin

## 3. İADE DURUMU

### 3.1 İade Yapılamayan Durumlar
- Ödeme yapıldıktan ve hizmet aktif edildikten sonra
- Herhangi bir CV oluşturma işlemi yapıldıktan sonra
- AI sohbet özelliği kullanıldıktan sonra

### 3.2 İade Yapılabilen Durumlar
- Teknik sorunlardan dolayı hizmetin hiç kullanılamaması
- Yanlışlıkla mükerrer ödeme yapılması
- Ödeme yapıldı ancak sistem tarafından abonelik aktif edilmedi

## 4. İADE SÜRECİ

İade talebiniz onaylandığında:
- Kredi kartı ödemelerinde 5-10 iş günü içinde
- Banka havalesi ödemelerinde 3-5 iş günü içinde
iade işlemi gerçekleştirilir.

## 5. İLETİŞİM

İade ve iptal talepleriniz için:
- **E-posta:** destek@kamulogkariyer.com
- **Konu:** Abonelik İade Talebi

*Son güncelleme: Ocak 2026*`

        case 'cerez-politikasi':
            return `# Çerez (Cookie) Politikası

${companyInfo}

## 1. ÇEREZLERİN KULLANIMI

Kariyer Kamulog web sitesi, kullanıcı deneyimini iyileştirmek ve hizmetlerimizi geliştirmek amacıyla çerezler kullanmaktadır.

## 2. KULLANILAN ÇEREZ TÜRLERİ

### 2.1 Zorunlu Çerezler
- Oturum yönetimi
- Güvenlik doğrulaması
- Kullanıcı kimlik doğrulama

### 2.2 Performans Çerezleri
- Sayfa yükleme hızı analizi
- Hata tespiti

### 2.3 İşlevsel Çerezler
- Dil tercihi
- Tema tercihi (açık/koyu mod)

## 3. ÇEREZLERİ YÖNETME

Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz. Ancak bu durumda bazı site özellikleri düzgün çalışmayabilir.

## 4. ÜÇÜNCÜ TARAF ÇEREZLERİ

Sitemizde aşağıdaki üçüncü taraf hizmetleri kullanılmaktadır:
- Google Analytics (ziyaretçi istatistikleri)

*Son güncelleme: Ocak 2026*`

        default:
            return ''
    }
}

