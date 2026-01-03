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
        companies: ['Sağlık Bakanlığı', 'İçişleri Bakanlığı', 'Milli Eğitim Bakanlığı', 'Adalet Bakanlığı', 'Maliye Bakanlığı', 'Çevre ve Şehircilik Bakanlığı', 'Ulaştırma Bakanlığı'],
        locations: ['Ankara', 'İstanbul', 'İzmir', 'Antalya', 'Bursa', 'Konya', 'Adana', 'Gaziantep'],
        descriptions: [
            'KPSS puanına göre atama yapılacaktır. Genel idare hizmetleri sınıfından olup, ofis işlerinde görev alacaktır.',
            'Merkez teşkilatında görevlendirilmek üzere personel alınacaktır.',
            'İl ve ilçe müdürlüklerinde istihdam edilmek üzere nitelikli personel aranmaktadır.',
        ],
    },
    {
        title: 'Mühendis Alımı',
        companies: ['DSİ Genel Müdürlüğü', 'Karayolları Genel Müdürlüğü', 'TCDD', 'Belediyeler', 'İller Bankası', 'THY', 'BOTAŞ'],
        locations: ['Ankara', 'İstanbul', 'Konya', 'Kayseri', 'Samsun', 'Trabzon', 'Erzurum'],
        descriptions: [
            'Altyapı projelerinde görev alacak inşaat/makine/elektrik mühendisi alınacaktır.',
            'Merkez ve taşra teşkilatında istihdam edilmek üzere mühendis kadrosu açılmıştır.',
        ],
    },
    {
        title: 'Öğretmen Alımı',
        companies: ['Milli Eğitim Bakanlığı'],
        locations: ['Türkiye Geneli', 'Doğu Anadolu', 'Güneydoğu Anadolu', 'Karadeniz'],
        descriptions: [
            'Öğretmenlik alanlarında 10.000 sözleşmeli öğretmen alınacaktır. KPSS Eğitim Bilimleri puanı ile başvuru yapılabilir.',
            'Teknik lise ve meslek lisesi öğretmeni alımı yapılacaktır.',
            'Branş öğretmeni alımı - Matematik, Fizik, Kimya, Biyoloji, İngilizce.',
        ],
    },
    {
        title: 'Sağlık Personeli Alımı',
        companies: ['Sağlık Bakanlığı', 'Devlet Hastaneleri', 'Üniversite Hastaneleri', 'Şehir Hastaneleri'],
        locations: ['Türkiye Geneli', 'Ankara', 'İstanbul', 'İzmir', 'Antalya'],
        descriptions: [
            'Hemşire, ebe, sağlık teknikeri pozisyonlarında istihdam edilmek üzere personel alınacaktır.',
            'Acil sağlık hizmetleri için paramedik ve ATT alımı yapılacaktır.',
            'Laboratuvar teknisyeni ve radyoloji teknikeri alınacaktır.',
        ],
    },
    {
        title: 'Polis Memuru Alımı',
        companies: ['Emniyet Genel Müdürlüğü'],
        locations: ['Türkiye Geneli'],
        descriptions: [
            'POMEM ve PMYO başvuruları başlamıştır. 5.000 polis memuru alınacaktır.',
            'Özel harekat polisi alımı için başvurular kabul edilmektedir.',
            '10.000 kadro ile polis alımı yapılacaktır.',
        ],
    },
    {
        title: 'Temizlik Personeli Alımı',
        companies: ['Belediyeler', 'Devlet Hastaneleri', 'Okullar', 'Kamu Kurumları', 'Bakanlıklar'],
        locations: ['Türkiye Geneli', 'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Konya'],
        descriptions: [
            'Kadrolu temizlik personeli alımı yapılacaktır. KPSS şartı aranmamaktadır.',
            'Kamu binalarında temizlik hizmetlerinde çalıştırılmak üzere personel alınacaktır.',
            'Hastane ve okullarda görev yapacak temizlik personeli aranmaktadır.',
        ],
    },
    {
        title: 'Güvenlik Görevlisi Alımı',
        companies: ['Belediyeler', 'Devlet Hastaneleri', 'Üniversiteler', 'Bakanlıklar', 'Adliyeler'],
        locations: ['Türkiye Geneli', 'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Eskişehir'],
        descriptions: [
            'Silahlı/silahsız özel güvenlik personeli alımı yapılacaktır.',
            'Kamu kurumlarında görev yapacak güvenlik görevlisi aranmaktadır.',
            'Koruma ve güvenlik hizmetlerinde çalıştırılmak üzere personel alınacaktır.',
        ],
    },
    {
        title: 'Şoför Alımı',
        companies: ['Belediyeler', 'Bakanlıklar', 'Kamu Kurumları', 'TCDD', 'Üniversiteler'],
        locations: ['Türkiye Geneli', 'İstanbul', 'Ankara', 'İzmir'],
        descriptions: [
            'Makam şoförü ve servis şoförü alımı yapılacaktır. E sınıfı ehliyet tercih edilir.',
            'Kamu kurumlarında hizmet verecek şoför alınacaktır.',
            'Hasta nakil ambulansı şoförü aranmaktadır.',
        ],
    },
    {
        title: 'Aşçı Alımı',
        companies: ['Devlet Hastaneleri', 'Okullar', 'Yurtlar', 'Bakanlıklar', 'Belediyeler'],
        locations: ['Türkiye Geneli', 'İstanbul', 'Ankara', 'İzmir', 'Antalya'],
        descriptions: [
            'Toplu yemek üretim tesislerinde görev yapacak aşçı alınacaktır.',
            'Okul ve yurtlarda çalışacak yemek personeli aranmaktadır.',
            'Hastane mutfağında çalıştırılmak üzere aşçı/aşçı yardımcısı alınacaktır.',
        ],
    },
    {
        title: 'Büro Personeli Alımı',
        companies: ['Belediyeler', 'Kaymakamlıklar', 'Valilikler', 'Bakanlıklar', 'SGK'],
        locations: ['Türkiye Geneli', 'Ankara', 'İstanbul', 'İzmir', 'Bursa'],
        descriptions: [
            'Genel idare hizmetlerinde görev alacak büro personeli alınacaktır.',
            'Evrak kayıt, arşiv ve yazışma işlerinde çalıştırılmak üzere personel aranmaktadır.',
            'Müşteri hizmetleri ve danışma birimlerinde görev yapacak personel alınacaktır.',
        ],
    },
]

// Özel sektör ilanları için örnek veriler
const privateJobTemplates = [
    {
        title: 'Yazılım Geliştirici',
        companies: ['TechSoft A.Ş.', 'Dijital Çözümler Ltd.', 'YazılımPark', 'KodMaster', 'InnoTech', 'SoftwareLab'],
        locations: ['İstanbul', 'Ankara', 'İzmir', 'Remote'],
        descriptions: [
            'Full-stack yazılım geliştirici arıyoruz. React, Node.js, Python deneyimi tercih sebebidir.',
            'Mobil uygulama geliştirme ekibimize katılacak React Native/Flutter geliştiricisi aranmaktadır.',
            'Backend geliştirici (Java/Spring Boot) pozisyonu için yetenekli adaylar aranmaktadır.',
        ],
    },
    {
        title: 'Satış Temsilcisi',
        companies: ['ÜrünMarket', 'Satış A.Ş.', 'TürkTicaret', 'PazarlamaPro', 'B2B Solutions'],
        locations: ['İstanbul', 'Bursa', 'Antalya', 'İzmir', 'Kocaeli', 'Ankara'],
        descriptions: [
            'Saha satış ekibimize deneyimli satış temsilcisi alınacaktır. Ehliyet şartı aranmaktadır.',
            'B2B satış deneyimine sahip, hedef odaklı satış uzmanı aranmaktadır.',
            'Mağaza satış danışmanı pozisyonu açıktır.',
        ],
    },
    {
        title: 'Muhasebe Uzmanı',
        companies: ['Finans A.Ş.', 'DenetimPro', 'Mali Müşavirlik Ofisi', 'HoldingX', 'AuditCo'],
        locations: ['İstanbul', 'Ankara', 'Bursa', 'İzmir'],
        descriptions: [
            'Ön muhasebe ve genel muhasebe işlemlerinde uzman arıyoruz. SMMM ruhsatı tercih sebebidir.',
            'Şirket muhasebesinin tüm süreçlerini yönetebilecek deneyimli muhasebeci aranmaktadır.',
        ],
    },
    {
        title: 'İnsan Kaynakları Uzmanı',
        companies: ['HR Solutions', 'İK Danışmanlık', 'Kurumsal Şirket A.Ş.', 'TalentHub'],
        locations: ['İstanbul', 'Ankara', 'İzmir'],
        descriptions: [
            'Bordro, özlük işleri ve işe alım süreçlerinde deneyimli İK uzmanı aranmaktadır.',
            'Yetenek yönetimi ve organizasyonel gelişim projeleri yürütecek HR Business Partner pozisyonu açıktır.',
        ],
    },
    {
        title: 'Grafik Tasarımcı',
        companies: ['Reklam Ajansı X', 'KreativMarket', 'Dijital Medya A.Ş.', 'DesignStudio'],
        locations: ['İstanbul', 'İzmir', 'Remote', 'Ankara'],
        descriptions: [
            'Sosyal medya ve dijital kampanyalar için deneyimli grafik tasarımcı alınacaktır.',
            'UI/UX tasarım deneyimine sahip, Adobe programlarına hakim tasarımcı aranmaktadır.',
        ],
    },
    {
        title: 'Proje Yöneticisi',
        companies: ['ProjeMax', 'Danışmanlık A.Ş.', 'YönetimPro', 'ConsultX'],
        locations: ['İstanbul', 'Ankara'],
        descriptions: [
            'IT projelerinde deneyimli, PMP sertifikalı proje yöneticisi aranmaktadır.',
            'Agile/Scrum metodolojileriyle çalışabilecek teknik proje yöneticisi pozisyonu açıktır.',
        ],
    },
    {
        title: 'Temizlik Personeli',
        companies: ['CleanCo', 'TemizlikPro', 'Facility Management A.Ş.', 'İş Merkezi Yönetimi', 'Plaza Hizmetleri'],
        locations: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Kocaeli'],
        descriptions: [
            'Ofis ve iş merkezlerinde çalışacak temizlik personeli alınacaktır.',
            'Günlük temizlik ve hijyen hizmetlerinde görev yapacak personel aranmaktadır.',
            'Otel ve restoranlarda çalışacak temizlik ekibi elemanları aranmaktadır.',
        ],
    },
    {
        title: 'Güvenlik Görevlisi',
        companies: ['GuardSecurity', 'SecureTR', 'Özel Güvenlik A.Ş.', 'SafeGuard', 'Elite Security'],
        locations: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Kocaeli'],
        descriptions: [
            'AVM, plaza ve iş merkezlerinde görev yapacak silahlı/silahsız güvenlik görevlisi alınacaktır.',
            'VIP koruma ve özel güvenlik hizmetlerinde çalışacak personel aranmaktadır.',
            'Fabrika ve sanayi tesislerinde güvenlik hizmeti verecek personel alınacaktır.',
        ],
    },
    {
        title: 'Depo Elemanı',
        companies: ['LojistikPro', 'Kargo A.Ş.', 'E-Ticaret Deposu', 'WarehouseX', 'StokYönetim'],
        locations: ['İstanbul', 'Kocaeli', 'Ankara', 'İzmir', 'Bursa'],
        descriptions: [
            'Depo düzenleme, stok sayımı ve sipariş hazırlama işlerinde çalışacak personel aranmaktadır.',
            'Forklift kullanabilen depo sorumlusu alınacaktır.',
            'E-ticaret deposunda paketleme ve sevkiyat işlerinde çalışacak elemanlar aranmaktadır.',
        ],
    },
    {
        title: 'Müşteri Hizmetleri Temsilcisi',
        companies: ['CallCenter A.Ş.', 'HizmetPro', 'Destek Merkezi', 'CustomerCare', 'SupportHub'],
        locations: ['İstanbul', 'Ankara', 'İzmir', 'Remote'],
        descriptions: [
            'Çağrı merkezimizde müşteri temsilcisi olarak çalışacak personel alınacaktır.',
            'Telefon ve canlı destek kanallarında müşteri hizmeti verecek temsilci aranmaktadır.',
            'Teknik destek hattında görev yapacak müşteri temsilcisi alınacaktır.',
        ],
    },
    {
        title: 'Garson / Servis Elemanı',
        companies: ['Restoran Grubu', 'Otel Zinciri', 'Cafe & Bistro', 'Fast Food A.Ş.', 'CateringPro'],
        locations: ['İstanbul', 'Ankara', 'Antalya', 'İzmir', 'Muğla', 'Bodrum'],
        descriptions: [
            'Restoran ve kafelerde servis hizmeti verecek garson alınacaktır.',
            'Otel restoranlarında çalışacak servis elemanı aranmaktadır.',
            'Catering firmasında etkinliklerde görev yapacak personel alınacaktır.',
        ],
    },
    {
        title: 'Kasiyer',
        companies: ['Süpermarket Zinciri', 'Perakende A.Ş.', 'MarketPlus', 'Mağaza Grubu'],
        locations: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Konya'],
        descriptions: [
            'Market ve mağazalarımızda kasiyer olarak çalışacak personel alınacaktır.',
            'POS cihazı kullanımı bilen kasiyer aranmaktadır.',
            'Hafta sonu çalışabilecek part-time kasiyer alınacaktır.',
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
    'Temizlik Personeli Alımı': [
        'En az ilkokul mezunu olmak',
        'Sağlık raporu almaya engel durumu bulunmamak',
        'Vardiyalı çalışmaya uygun olmak',
        '18-55 yaş aralığında olmak',
    ],
    'Temizlik Personeli': [
        'En az ilkokul mezunu',
        'Vardiyalı çalışabilme',
        'Takım çalışmasına yatkın',
        'Fiziksel olarak aktif çalışabilme',
    ],
    'Güvenlik Görevlisi Alımı': [
        'En az lise mezunu olmak',
        'Özel güvenlik temel eğitim sertifikası',
        'Erkeklerde askerlik hizmetini tamamlamış olmak',
        'Boy/kilo oranı uygun olmak',
    ],
    'Güvenlik Görevlisi': [
        'Özel güvenlik temel eğitim sertifikası',
        'En az lise mezunu',
        'Askerliğini yapmış olmak (erkekler için)',
        'Vardiyalı çalışabilme',
    ],
    'Şoför Alımı': [
        'B veya E sınıfı ehliyet',
        'En az 3 yıl aktif sürüş deneyimi',
        'SRC belgesi (yük taşıma için)',
        'Temiz sürücü belgesi',
    ],
    'Depo Elemanı': [
        'En az ilkokul/ortaokul mezunu',
        'Fiziksel olarak aktif çalışabilme',
        'Forklift ehliyeti tercih sebebi',
        'Vardiyalı çalışabilme',
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

export function generateSampleJobs(count: number = 50): ScrapedJob[] {
    const jobs: ScrapedJob[] = []

    // Yarısı kamu, yarısı özel sektör
    const publicCount = Math.ceil(count / 2)
    const privateCount = count - publicCount

    // Kamu için varsayılan kaynak
    const defaultPublicSource = 'https://kariyerkapisi.gov.tr/'

    // Özel sektör kaynakları - gerçek anasayfa ve ilan linkleri
    const privateSources = [
        { url: 'https://www.kariyer.net/', name: 'Kariyer.net' },
        { url: 'https://www.yenibiris.com/', name: 'Yenibiris' },
        { url: 'https://tr.indeed.com/', name: 'Indeed' },
        { url: 'https://www.linkedin.com/jobs/', name: 'LinkedIn' },
        { url: 'https://www.secretcv.com/', name: 'SecretCV' },
        { url: 'https://www.monster.com.tr/', name: 'Monster' },
    ]

    // Kamu ilanları
    for (let i = 0; i < publicCount; i++) {
        const template = getRandomElement(publicJobTemplates)

        // Son başvuru tarihi (7-60 gün arası rastgele)
        const deadline = new Date()
        deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 53) + 7)

        jobs.push({
            title: template.title,
            company: getRandomElement(template.companies),
            location: getRandomElement(template.locations),
            description: getRandomElement(template.descriptions),
            requirements: generateRequirements(template.title),
            type: 'PUBLIC',
            sourceUrl: defaultPublicSource,
            applicationUrl: defaultPublicSource,
            salary: undefined,
            deadline: deadline.toISOString().split('T')[0]
        })
    }

    // Özel sektör ilanları
    for (let i = 0; i < privateCount; i++) {
        const template = getRandomElement(privateJobTemplates)
        const source = privateSources[i % privateSources.length]

        // Son başvuru tarihi (7-45 gün arası rastgele)
        const deadline = new Date()
        deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 38) + 7)

        jobs.push({
            title: template.title,
            company: getRandomElement(template.companies),
            location: getRandomElement(template.locations),
            description: getRandomElement(template.descriptions),
            requirements: generateRequirements(template.title),
            type: 'PRIVATE',
            sourceUrl: source.url,
            applicationUrl: source.url,
            salary: undefined,
            deadline: deadline.toISOString().split('T')[0]
        })
    }

    // Shuffle the jobs array
    return jobs.sort(() => Math.random() - 0.5)
}

/**
 * Gerçek web scraping için örnek yapı (puppeteer kullanarak)
 * 
 * NOT: Bu fonksiyon şu an devre dışıdır, gerçek scraping için
 * puppeteer bağımlılığı eklenmeli ve uygun web sitesi hedefleri belirlemelidir.
 */
export async function scrapeJobsFromWeb(_url: string): Promise<ScrapedJob[]> {
    // Gerçek uygulamada burada puppeteer veya axios + cheerio kullanılabilir
    console.log('Web scraping şu an simüle ediliyor, örnek veriler döndürülüyor.')
    return generateSampleJobs(50)
}
