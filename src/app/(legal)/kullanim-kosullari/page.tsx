import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
    title: 'Kullanım Koşulları | Kullanım Şartları - Kariyer Kamulog',
    description: 'Kariyer Kamulog Kullanım Koşulları ve Kullanım Şartları - Platform kullanım kuralları, abonelik, ödeme ve sorumluluklar hakkında detaylı bilgi.',
    keywords: [
        'kullanım koşulları',
        'kullanım şartları',
        'kariyer kamulog şartlar',
        'platform kuralları',
        'abonelik koşulları',
        'hizmet şartları'
    ],
    openGraph: {
        title: 'Kullanım Koşulları | Kariyer Kamulog',
        description: 'Kariyer Kamulog Kullanım Koşulları - Platform kullanım şartları ve sorumluluklar.',
        url: 'https://kariyerkamulog.com/kullanim-kosullari',
    },
    alternates: {
        canonical: 'https://kariyerkamulog.com/kullanim-kosullari',
    },
}

// Markdown'u HTML'e çevir (basit)
function parseMarkdown(md: string): string {
    let result = md
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-purple-400 mt-6 mb-3">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-purple-400 mt-8 mb-4">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mb-6">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^- (.*$)/gim, '<li class="text-slate-300">$1</li>')
        .replace(/\n\n/g, '</p><p class="text-slate-300 leading-relaxed my-4">')
        .replace(/\n/g, '<br/>')

    // Wrap li elements in ul
    result = result.replace(/(<li[^>]*>.*?<\/li>)+/g, '<ul class="list-disc list-inside space-y-2 my-4">$&</ul>')

    return result
}

// Varsayılan içerik
const DEFAULT_CONTENT = `
# Kullanım Koşulları

## 1. Giriş ve Kabul

Bu Kullanım Koşulları, **Kariyer Kamulog** platformunu ("Platform", "Hizmet") kullanımınızı düzenlemektedir. Platformu kullanarak bu koşulları kabul etmiş sayılırsınız.

**Platform Sahibi:** Suat Hayri Şahin – Kamulog.net
**Vergi Kimlik No:** 7960109842
**Adres:** Atatürk Mahallesi, Çelikel Sokak, Sancaktepe/İSTANBUL PK: 34785
**E-Posta:** destek@kamulogkariyer.com

## 2. Hizmet Tanımı

Kariyer Kamulog, aşağıdaki hizmetleri sunmaktadır:

- Yapay zeka destekli CV oluşturma ve düzenleme
- Kamu ve özel sektör iş ilanları listeleme
- CV-iş ilanı eşleştirme ve uyumluluk analizi
- Kariyer danışmanlığı hizmetleri (Premium)
- PDF CV indirme ve dışa aktarma

## 3. Önemli Uyarı - İşe Yerleştirme

**Kariyer Kamulog, herhangi bir işe yerleştirme garantisi sunmamaktadır.**

- Platform, yalnızca bilgilendirme ve araç sağlama amacı taşımaktadır
- CV analizi ve iş eşleştirme sonuçları yapay zeka desteklidir ve kesin değildir
- İş başvuruları ve mülakat süreçleri tamamen kullanıcının sorumluluğundadır
- Herhangi bir iş garantisi veya vaadi bulunmamaktadır

## 4. Hesap Oluşturma ve Güvenlik

- Hesap oluşturmak için 18 yaşından büyük olmalısınız
- Doğru ve güncel bilgiler sağlamakla yükümlüsünüz
- Hesap güvenliğinizden siz sorumlusunuz
- Şifrenizi başkalarıyla paylaşmamalısınız
- Şüpheli aktiviteleri derhal bildirmelisiniz

## 5. Abonelik ve Ödemeler

- Abonelik planları aylık olarak faturalandırılır
- Fiyatlar TL cinsinden belirtilmiştir ve KDV dahildir
- Ödemeler banka havalesi yoluyla alınmaktadır
- Ödeme onayı ile hesabınıza jeton/kredi yüklenir
- Kullanılmayan jetonlar/krediler sonraki aya devretmez

## 6. İade Politikası

Dijital hizmet yapısı gereği, kullanılmış jetonlar/krediler için iade yapılmamaktadır. Ancak aşağıdaki durumlarda iade değerlendirilebilir:

- Teknik hata nedeniyle hizmet alınamaması
- Mükerrer ödeme yapılması
- Ödeme sonrası hesap aktif edilmemesi

İade talepleri için **destek@kamulogkariyer.com** adresine başvurunuz.

## 7. Kullanıcı Yükümlülükleri

Platform kullanımında aşağıdaki kurallara uymakla yükümlüsünüz:

- Doğru ve gerçek bilgiler sağlamak
- Başkalarının bilgilerini izinsiz kullanmamak
- Platformu yasa dışı amaçlarla kullanmamak
- Spam veya zararlı içerik paylaşmamak
- Teknik altyapıya zarar vermemek
- Otomatik veri toplama araçları kullanmamak

## 8. Fikri Mülkiyet

- Platform tasarımı, kodu ve içeriği Platform'a aittir
- CV içerikleriniz size aittir
- Platform logosunu ve markasını izinsiz kullanamazsınız
- İçerikleri ticari amaçla kopyalayamazsınız

## 9. Sorumluluk Sınırlaması

Platform, yasaların izin verdiği en geniş ölçüde:

- Hizmet kesintilerinden dolayı sorumluluk kabul etmez
- Yapay zeka çıktılarının doğruluğunu garanti etmez
- Kullanıcının iş başvuru sonuçlarından sorumlu değildir
- Üçüncü taraf sitelerine bağlantılardan sorumlu değildir
- Dolaylı, özel veya cezai zararlardan sorumlu tutulamaz

## 10. Hesap Askıya Alma ve Fesih

Aşağıdaki durumlarda hesabınız askıya alınabilir veya feshedilebilir:

- Kullanım koşullarının ihlali
- Yasa dışı faaliyetler
- Diğer kullanıcılara zarar verici davranışlar
- Sahte veya yanıltıcı bilgi sağlama

## 11. Değişiklikler

Bu Kullanım Koşulları'nı önceden bildirim yapmaksızın değiştirme hakkını saklı tutuyoruz. Önemli değişiklikler e-posta yoluyla bildirilecektir. Değişiklikler sonrası platformu kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir.

## 12. Uygulanacak Hukuk ve Uyuşmazlıklar

Bu Kullanım Koşulları, Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.

## 13. İletişim

Kullanım koşulları hakkında sorularınız için:

**E-Posta:** destek@kamulogkariyer.com
**Adres:** Atatürk Mahallesi, Çelikel Sokak, Sancaktepe/İSTANBUL PK: 34785

*Son güncelleme: Ocak 2025*
`

async function getContent(): Promise<string> {
    try {
        const content = await prisma.siteSettings.findUnique({
            where: { key: 'legal_kullanim-kosullari' }
        })
        return content?.value || DEFAULT_CONTENT
    } catch {
        return DEFAULT_CONTENT
    }
}

export default async function KullanimKosullariPage() {
    const content = await getContent()
    const htmlContent = parseMarkdown(content)

    return (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 md:p-12">
            <div
                className="prose prose-invert prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: `<p class="text-slate-300 leading-relaxed">${htmlContent}</p>` }}
            />
        </div>
    )
}
