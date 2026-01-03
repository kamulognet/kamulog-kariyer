/**
 * İş İlanı Çekme Servisi
 * 
 * Bu servis örnek iş ilanları oluşturur.
 * Gerçek bir uygulamada puppeteer veya cheerio ile web scraping yapılabilir.
 */

export interface ScrapedJob {
    title: string
    company: string
    location: string
    description: string
    requirements: string
    type: 'PUBLIC' | 'PRIVATE'
    sourceUrl: string
    applicationUrl: string
    salary?: string
    deadline?: string
}

// Kamu sektörü ilanları için örnek veriler
const publicJobTemplates = [
    {
        title: 'Memur Alımı',
        companies: ['Sağlık Bakanlığı', 'İçişleri Bakanlığı', 'Milli Eğitim Bakanlığı', 'Adalet Bakanlığı', 'Maliye Bakanlığı'],
        locations: ['Ankara', 'İstanbul', 'İzmir', 'Antalya', 'Bursa'],
        descriptions: [
            'KPSS puanına göre atama yapılacaktır. Genel idare hizmetleri sınıfından olup, ofis işlerinde görev alacaktır.',
            'Merkez teşkilatında görevlendirilmek üzere personel alınacaktır.',
            'İl ve ilçe müdürlüklerinde istihdam edilmek üzere nitelikli personel aranmaktadır.',
        ],
    },
    {
        title: 'Mühendis Alımı',
        companies: ['DSİ Genel Müdürlüğü', 'Karayolları Genel Müdürlüğü', 'TCDD', 'Belediyeler', 'İller Bankası'],
        locations: ['Ankara', 'İstanbul', 'Konya', 'Kayseri', 'Samsun'],
        descriptions: [
            'Altyapı projelerinde görev alacak inşaat/makine/elektrik mühendisi alınacaktır.',
            'Merkez ve taşra teşkilatında istihdam edilmek üzere mühendis kadrosu açılmıştır.',
        ],
    },
    {
        title: 'Öğretmen Alımı',
        companies: ['Milli Eğitim Bakanlığı'],
        locations: ['Türkiye Geneli'],
        descriptions: [
            'Öğretmenlik alanlarında 10.000 sözleşmeli öğretmen alınacaktır. KPSS Eğitim Bilimleri puanı ile başvuru yapılabilir.',
            'Teknik lise ve meslek lisesi öğretmeni alımı yapılacaktır.',
        ],
    },
    {
        title: 'Sağlık Personeli Alımı',
        companies: ['Sağlık Bakanlığı', 'Devlet Hastaneleri', 'Üniversite Hastaneleri'],
        locations: ['Türkiye Geneli', 'Ankara', 'İstanbul', 'İzmir'],
        descriptions: [
            'Hemşire, ebe, sağlık teknikeri pozisyonlarında istihdam edilmek üzere personel alınacaktır.',
            'Acil sağlık hizmetleri için paramedik ve ATT alımı yapılacaktır.',
        ],
    },
    {
        title: 'Polis Memuru Alımı',
        companies: ['Emniyet Genel Müdürlüğü'],
        locations: ['Türkiye Geneli'],
        descriptions: [
            'POMEM ve PMYO başvuruları başlamıştır. 5.000 polis memuru alınacaktır.',
            'Özel harekat polisi alımı için başvurular kabul edilmektedir.',
        ],
    },
]

// Özel sektör ilanları için örnek veriler
const privateJobTemplates = [
    {
        title: 'Yazılım Geliştirici',
        companies: ['TechSoft A.Ş.', 'Dijital Çözümler Ltd.', 'YazılımPark', 'KodMaster', 'InnoTech'],
        locations: ['İstanbul', 'Ankara', 'İzmir', 'Remote'],
        descriptions: [
            'Full-stack yazılım geliştirici arıyoruz. React, Node.js, Python deneyimi tercih sebebidir.',
            'Mobil uygulama geliştirme ekibimize katılacak React Native/Flutter geliştiricisi aranmaktadır.',
            'Backend geliştirici (Java/Spring Boot) pozisyonu için yetenekli adaylar aranmaktadır.',
        ],
    },
    {
        title: 'Satış Temsilcisi',
        companies: ['ÜrünMarket', 'Satış A.Ş.', 'TürkTicaret', 'PazarlamaPro'],
        locations: ['İstanbul', 'Bursa', 'Antalya', 'İzmir', 'Kocaeli'],
        descriptions: [
            'Saha satış ekibimize deneyimli satış temsilcisi alınacaktır. Ehliyet şartı aranmaktadır.',
            'B2B satış deneyimine sahip, hedef odaklı satış uzmanı aranmaktadır.',
        ],
    },
    {
        title: 'Muhasebe Uzmanı',
        companies: ['Finans A.Ş.', 'DenetimPro', 'Mali Müşavirlik Ofisi', 'HoldingX'],
        locations: ['İstanbul', 'Ankara', 'Bursa'],
        descriptions: [
            'Ön muhasebe ve genel muhasebe işlemlerinde uzman arıyoruz. SMMM ruhsatı tercih sebebidir.',
            'Şirket muhasebesinin tüm süreçlerini yönetebilecek deneyimli muhasebeci aranmaktadır.',
        ],
    },
    {
        title: 'İnsan Kaynakları Uzmanı',
        companies: ['HR Solutions', 'İK Danışmanlık', 'Kurumsal Şirket A.Ş.'],
        locations: ['İstanbul', 'Ankara'],
        descriptions: [
            'Bordro, özlük işleri ve işe alım süreçlerinde deneyimli İK uzmanı aranmaktadır.',
            'Yetenek yönetimi ve organizasyonel gelişim projeleri yürütecek HR Business Partner pozisyonu açıktır.',
        ],
    },
    {
        title: 'Grafik Tasarımcı',
        companies: ['Reklam Ajansı X', 'KreativMarket', 'Dijital Medya A.Ş.'],
        locations: ['İstanbul', 'İzmir', 'Remote'],
        descriptions: [
            'Sosyal medya ve dijital kampanyalar için deneyimli grafik tasarımcı alınacaktır.',
            'UI/UX tasarım deneyimine sahip, Adobe programlarına hakim tasarımcı aranmaktadır.',
        ],
    },
    {
        title: 'Proje Yöneticisi',
        companies: ['ProjeMax', 'Danışmanlık A.Ş.', 'YönetimPro'],
        locations: ['İstanbul', 'Ankara'],
        descriptions: [
            'IT projelerinde deneyimli, PMP sertifikalı proje yöneticisi aranmaktadır.',
            'Agile/Scrum metodolojileriyle çalışabilecek teknik proje yöneticisi pozisyonu açıktır.',
        ],
    },
]

// Gereksinimler şablonu
const requirementsTemplates: Record<string, string[]> = {
    'Memur Alımı': [
        '4 yıllık üniversite mezunu olmak',
        'KPSS\'den en az 70 puan almış olmak',
        'Erkeklerde askerlik hizmetini tamamlamış olmak',
        '657 sayılı Kanunun 48. maddesindeki şartları taşımak',
    ],
    'Mühendis Alımı': [
        'İlgili mühendislik bölümlerinden mezun olmak',
        'KPSS P3 puanı ile başvuru yapılacaktır',
        'En az 2 yıl deneyim tercih sebebidir',
        'Şantiye şefi sertifikası avantaj sağlar',
    ],
    'Yazılım Geliştirici': [
        'Bilgisayar Mühendisliği veya ilgili bölüm mezunu',
        'En az 3 yıl yazılım geliştirme deneyimi',
        'JavaScript, TypeScript, Python bilen',
        'Git versiyon kontrol sistemine hakim',
        'Problem çözme ve analitik düşünme yeteneği',
    ],
    'Satış Temsilcisi': [
        'En az lise mezunu',
        '2 yıl saha satış deneyimi',
        'B sınıfı ehliyet',
        'İletişim becerileri yüksek',
        'Hedef odaklı çalışabilme',
    ],
    default: [
        'Üniversite mezunu olmak',
        'İlgili alanda deneyim sahibi olmak',
        'Türkçe ve tercihen İngilizce bilmek',
        'Takım çalışmasına yatkın olmak',
    ],
}

function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

function generateRequirements(title: string): string {
    const reqs = requirementsTemplates[title] || requirementsTemplates.default
    return reqs.map((r, i) => `${i + 1}. ${r}`).join('\n')
}

export function generateSampleJobs(count: number = 10): ScrapedJob[] {
    const jobs: ScrapedJob[] = []

    // Yarısı kamu, yarısı özel sektör
    const publicCount = Math.ceil(count / 2)
    const privateCount = count - publicCount

    // Maaş aralıkları kamu
    const publicSalaries = ['22.104 TL (Asgari)', '25.000 - 30.000 TL', '30.000 - 40.000 TL', '35.000 - 45.000 TL']
    // Maaş aralıkları özel
    const privateSalaries = ['28.000 - 35.000 TL', '35.000 - 50.000 TL', '45.000 - 65.000 TL', '60.000 - 90.000 TL', '80.000+ TL']

    // Kamu kaynakları
    const publicSources = [
        { url: 'https://kariyerkapisi.gov.tr/', name: 'Kariyer Kapısı' },
        { url: 'https://www.ilan.gov.tr/ilan/kategori/8/kamu-akademik-personel', name: 'İlan.gov.tr' },
        { url: 'https://esube.iskur.gov.tr/', name: 'İŞKUR' },
    ]

    // Kamu ilanları
    for (let i = 0; i < publicCount; i++) {
        const template = getRandomElement(publicJobTemplates)
        const jobId = `${Date.now()}-${i}`

        // Kaynakları sırayla döndür
        const source = publicSources[i % publicSources.length]

        // Son başvuru tarihi (60 gün - 2 ay)
        const deadline = new Date()
        deadline.setDate(deadline.getDate() + 60)

        jobs.push({
            title: template.title,
            company: getRandomElement(template.companies),
            location: getRandomElement(template.locations),
            description: getRandomElement(template.descriptions),
            requirements: generateRequirements(template.title),
            type: 'PUBLIC',
            sourceUrl: source.url,
            applicationUrl: source.url, // Başvuru linki kaynakla aynı olsun
            salary: undefined, // Maaş kaldırıldı
            deadline: deadline.toISOString().split('T')[0]
        })
    }

    // Özel sektör ilanları
    for (let i = 0; i < privateCount; i++) {
        const template = getRandomElement(privateJobTemplates)
        const jobId = `${Date.now()}-${i}`

        // Son başvuru tarihi (60 gün - 2 ay)
        const deadline = new Date()
        deadline.setDate(deadline.getDate() + 60)

        jobs.push({
            title: template.title,
            company: getRandomElement(template.companies),
            location: getRandomElement(template.locations),
            description: getRandomElement(template.descriptions),
            requirements: generateRequirements(template.title),
            type: 'PRIVATE',
            sourceUrl: 'https://www.kariyer.net/is-ilanlari',
            applicationUrl: 'https://www.kariyer.net/is-ilanlari',
            salary: undefined,
            deadline: deadline.toISOString().split('T')[0]
        })
    }

    return jobs
}

/**
 * Gerçek web scraping için örnek yapı (puppeteer kullanarak)
 * 
 * NOT: Bu fonksiyon şu an devre dışıdır, gerçek scraping için
 * puppeteer bağımlılığı eklenmeli ve uygun web sitesi hedefleri belirlemelidir.
 */
export async function scrapeJobsFromWeb(_url: string): Promise<ScrapedJob[]> {
    // Gerçek uygulamada burada puppeteer veya axios + cheerio kullanılabilir
    // Örnek:
    // const browser = await puppeteer.launch()
    // const page = await browser.newPage()
    // await page.goto(url)
    // ... scraping logic

    console.log('Web scraping şu an simüle ediliyor, örnek veriler döndürülüyor.')
    return generateSampleJobs(10)
}
