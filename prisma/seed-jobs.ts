
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding jobs...')

    const jobs = [
        // KAMU İLANLARI
        {
            title: 'Yazılım Mühendisi Alımı',
            company: 'T.C. Ulaştırma ve Altyapı Bakanlığı',
            location: 'Ankara',
            type: 'PUBLIC',
            description: 'Bakanlığımız Bilgi İşlem Dairesi Başkanlığı bünyesinde istihdam edilmek üzere; Java, Spring Boot ve React teknolojilerine hakim, en az 3 yıl deneyimli Yazılım Mühendisi alınacaktır.',
            requirements: 'T.C. vatandaşı olmak, YDS en az C seviyesi, Java ve Spring Boot tecrübesi.',
            sourceUrl: 'https://ilan.gov.tr'
        },
        {
            title: 'Uzman Yardımcısı',
            company: 'Bankacılık Düzenleme ve Denetleme Kurumu',
            location: 'İstanbul',
            type: 'PUBLIC',
            description: 'Kurumumuz ana hizmet birimlerinde görevlendirilmek üzere, İktisadi ve İdari Bilimler Fakültesi mezunu, analitik düşünme yeteneğine sahip Uzman Yardımcıları aranmaktadır.',
            requirements: 'KPSS P3 puan türünden en az 80 puan almış olmak, 35 yaşını doldurmamış olmak.',
            sourceUrl: 'https://ilan.gov.tr'
        },
        {
            title: 'Siber Güvenlik Uzmanı',
            company: 'TÜBİTAK BİLGEM',
            location: 'Kocaeli',
            type: 'PUBLIC',
            description: 'Ulusal güvenliği ilgilendiren projelerde görev almak üzere, ağ güvenliği ve kriptoloji konularında yetkin Siber Güvenlik Uzmanları alınacaktır.',
            requirements: 'Bilgisayar veya Elektronik Mühendisliği mezunu, siber güvenlik sertifikalarına sahip.',
            sourceUrl: 'https://tubitak.gov.tr'
        },
        {
            title: 'Veri Analisti',
            company: 'Türkiye İstatistik Kurumu',
            location: 'Ankara',
            type: 'PUBLIC',
            description: 'Büyük veri projelerinde çalışacak, Python ve SQL bilen, istatistiksel analiz yapabilen Veri Analistleri aranıyor.',
            requirements: 'İstatistik veya Matematik mezunu, veri madenciliği konusunda deneyimli.',
            sourceUrl: 'https://tuik.gov.tr'
        },
        {
            title: 'Proje Yöneticisi',
            company: 'Savunma Sanazii Başkanlığı',
            location: 'Ankara',
            type: 'PUBLIC',
            description: 'Savunma sanayi projelerinin koordinasyonunu sağlayacak, PMP sertifikasına sahip Proje Yöneticileri alınacaktır.',
            requirements: 'Mühendislik mezunu, iyi derecede İngilizce bilen, savunma sektöründe tecrübeli.',
            sourceUrl: 'https://ssb.gov.tr'
        },

        // ÖZEL SEKTÖR İLANLARI
        {
            title: 'Senior Frontend Developer',
            company: 'Trendyol Group',
            location: 'İstanbul (Remote)',
            type: 'PRIVATE',
            description: 'E-ticaret platformumuzun arayüzlerini geliştirmek üzere, React ve Next.js konularında uzman, performans odaklı düşünen Senior Frontend Developer arıyoruz.',
            requirements: 'En az 5 yıl deneyim, TypeScript, React, Next.js, Unit Test deneyimi.',
            sourceUrl: 'https://trendyol.com/kariyer'
        },
        {
            title: 'Backend Developer (Go)',
            company: 'Getir',
            location: 'İstanbul',
            type: 'PRIVATE',
            description: 'Hızlı büyüyen ekibimize katılacak, yüksek trafikli mikroservis mimarisinde çalışacak, Go diline hakim Backend Developer arıyoruz.',
            requirements: 'Go, PostgreSQL, Redis, Docker, Kubernetes.',
            sourceUrl: 'https://kariyer.getir.com'
        },
        {
            title: 'Mobile Developer (Flutter)',
            company: 'Papara',
            location: 'İstanbul',
            type: 'PRIVATE',
            description: 'Finansal teknolojiler alanında kullanıcı deneyimini en üst seviyeye taşıyacak, Flutter ile cross-platform uygulama geliştirebilecek mobil geliştiriciler arıyoruz.',
            requirements: 'Flutter, Dart, State Management (Bloc/Provider), REST API.',
            sourceUrl: 'https://papara.com/kariyer'
        },
        {
            title: 'DevOps Engineer',
            company: 'Hepsiburada',
            location: 'İstanbul',
            type: 'PRIVATE',
            description: 'Cloud altyapımızı yönetecek, CI/CD süreçlerini otomatize edecek, AWS ve Kubernetes tecrübesi olan DevOps Mühendisi.',
            requirements: 'AWS, Kubernetes, Terraform, Jenkins, Linux.',
            sourceUrl: 'https://hepsiburada.com/kariyer'
        },
        {
            title: 'Full Stack Developer',
            company: 'Insider',
            location: 'İstanbul',
            type: 'PRIVATE',
            description: 'Global SaaS ürünümüzü geliştirecek, hem frontend (Vue.js) hem backend (Node.js/PHP) tarafında sorumluluk alacak takım arkadaşı.',
            requirements: 'Vue.js, Node.js veya PHP, AWS deneyimi, İyi seviyede İngilizce.',
            sourceUrl: 'https://useinsider.com/careers'
        },
        {
            title: 'Yapay Zeka Mühendisi',
            company: 'Baykar Teknoloji',
            location: 'İstanbul',
            type: 'PRIVATE',
            description: 'İnsansız hava araçları için görüntü işleme ve otonom sistemler üzerine çalışacak Yapay Zeka Mühendisi.',
            requirements: 'Python, PyTorch/TensorFlow, Computer Vision, C++.',
            sourceUrl: 'https://baykartech.com/kariyer'
        },
        {
            title: 'Ürün Yöneticisi',
            company: 'Yemeksepeti',
            location: 'İstanbul',
            type: 'PRIVATE',
            description: 'Yeni ürün özelliklerini planlayacak, pazar analizi yapacak ve geliştirme ekibiyle koordineli çalışacak Product Manager.',
            requirements: 'Analitik düşünme, Agile metodolojileri, UX deneyimi.',
            sourceUrl: 'https://yemeksepeti.com/kariyer'
        }
    ]

    for (const job of jobs) {
        await prisma.jobListing.create({
            data: job
        })
    }

    console.log(`Seeding completed. ${jobs.length} jobs created.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
