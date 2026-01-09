import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import WhatsAppButton from "@/components/WhatsAppButton";
import { ToastProvider } from "@/components/ToastProvider";
import CookieConsent from "@/components/CookieConsent";
import WelcomeToast from "@/components/WelcomeToast";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kariyerkamulog.com'),
  title: {
    default: "Kariyer Kamulog | AI CV Oluşturucu ve İş Eşleştirme Platformu",
    template: "%s | Kariyer Kamulog"
  },
  description: "Kariyer Kamulog - Yapay zeka destekli CV oluşturma ve iş eşleştirme platformu. Kamu personeli alımları, KPSS ilanları, özel sektör iş fırsatları. Kamulog Kariyer ile hayalinizdeki işe ulaşın!",
  keywords: [
    // Ana anahtar kelimeler
    "kariyer kamulog",
    "kamulog kariyer",
    "kariyerkamulog",
    "kamulog",
    "kariyer kamulog giriş",
    "kariyer kamulog kayıt",
    "kamulog kariyer giriş",
    "kamulog kariyer kayıt",

    // Yapay zeka ve CV
    "yapay zekayla iş arama kamulog",
    "yapay zeka cv",
    "yapay zeka ile cv hazırlama",
    "ai cv oluşturucu",
    "ai ile cv yazımı",
    "ai cv maker türkçe",
    "yapay zeka özgeçmiş",
    "chatgpt cv hazırlama",
    "akıllı cv oluşturucu",

    // CV oluşturma
    "cv oluşturma",
    "cv oluştur",
    "cv hazırlama",
    "cv yazma",
    "özgeçmiş hazırlama",
    "özgeçmiş oluşturma",
    "online cv oluşturma",
    "ücretsiz cv hazırlama",
    "ücretsiz cv oluşturma",
    "profesyonel cv hazırlama",
    "profesyonel cv",
    "cv şablonları",
    "cv örneği",
    "cv formatı",
    "cv analizi",
    "cv düzenleme",
    "cv indir",
    "pdf cv oluşturma",

    // Kamu sektörü
    "kamu iş ilanları",
    "kamu iş ilanları 2026",
    "kamu personel alımı",
    "kamu personel alımı 2026",
    "devlet memurluğu ilanları",
    "devlet memuru alımı",
    "memur alımı",
    "memur alımı 2026",
    "kamu kurumları iş ilanları",
    "devlet iş ilanları",

    // KPSS
    "KPSS ilanları",
    "kpss başvuru",
    "kpss iş ilanları",
    "kpss personel alımı",
    "kpss 2026",
    "kpss başvuru tarihleri",

    // İş arama genel
    "iş ilanları türkiye",
    "iş ilanları",
    "iş arama",
    "iş bul",
    "iş başvurusu",
    "özel sektör ilanları",
    "iş eşleştirme",
    "kariyer",
    "kariyer fırsatları",
    "kariyer danışmanlığı",
    "iş bulma platformu",

    // Giriş/Kayıt
    "giriş",
    "üye girişi",
    "kayıt",
    "üye ol",
    "hesap oluştur"
  ],
  authors: [{ name: "Kariyer Kamulog", url: "https://kariyerkamulog.com" }],
  creator: "Kariyer Kamulog",
  publisher: "Kariyer Kamulog",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://kariyerkamulog.com",
    siteName: "Kariyer Kamulog",
    title: "Kariyer Kamulog | AI CV Oluşturucu ve İş Eşleştirme",
    description: "Yapay zeka destekli CV oluşturma ve iş eşleştirme platformu. Kamu ve özel sektör iş ilanları, AI ile CV analizi ve kariyer koçluğu.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kariyer Kamulog - AI CV Oluşturucu",
        type: "image/png",
      },
      {
        url: "/logo.png",
        width: 500,
        height: 500,
        alt: "Kariyer Kamulog Logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kariyer Kamulog | AI CV Oluşturucu",
    description: "Yapay zeka destekli profesyonel CV oluşturma ve iş eşleştirme platformu. Kamu ve özel sektör iş fırsatları.",
    images: ["/og-image.png"],
    creator: "@kariyerkamulog",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://kariyerkamulog.com",
    languages: {
      'tr-TR': 'https://kariyerkamulog.com',
    },
  },
  category: "technology",
  other: {
    "google-site-verification": "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/logo.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="msapplication-TileColor" content="#7c3aed" />
        <meta name="msapplication-TileImage" content="/logo.jpg" />

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Kariyer Kamulog",
              "alternateName": ["Kamulog Kariyer", "KariyerKamulog"],
              "url": "https://kariyerkamulog.com",
              "logo": "https://kariyerkamulog.com/logo.png",
              "description": "Yapay zeka destekli CV oluşturma ve iş eşleştirme platformu. Kamu ve özel sektör iş ilanları.",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "TRY"
              },
              "author": {
                "@type": "Organization",
                "name": "Kariyer Kamulog"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Kariyer Kamulog",
              "alternateName": "Kamulog Kariyer",
              "url": "https://kariyerkamulog.com",
              "logo": "https://kariyerkamulog.com/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "destek@kamulogkariyer.com",
                "contactType": "customer service",
                "availableLanguage": "Turkish"
              },
              "sameAs": []
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Kariyer Kamulog nedir?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Kariyer Kamulog, yapay zeka destekli CV oluşturma ve iş eşleştirme platformudur. Kamu ve özel sektör iş ilanlarını takip edebilir, AI ile profesyonel CV oluşturabilirsiniz."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Kariyer Kamulog ücretsiz mi?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Evet, ücretsiz kayıt olabilirsiniz. Ücretsiz planda ayda 1 CV ve 20 chat mesaj hakkınız bulunur. Premium planlarla daha fazla özelliğe erişebilirsiniz."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Yapay zeka ile CV nasıl oluşturulur?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Kariyer Kamulog'a kayıt olduktan sonra AI asistanımızla sohbet ederek veya mevcut CV'nizi yükleyerek profesyonel CV oluşturabilirsiniz. AI, CV'nizi kamu veya özel sektöre göre optimize eder."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Kamu iş ilanları nereden takip edilir?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Kariyer Kamulog platformunda güncel kamu personel alımları, KPSS ilanları, memur alımları ve devlet kurumu iş ilanlarını tek yerden takip edebilirsiniz."
                  }
                },
                {
                  "@type": "Question",
                  "name": "KPSS ile iş başvurusu nasıl yapılır?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Kariyer Kamulog'da KPSS puanınıza uygun ilanları filtreleyebilir, CV'nizi ilan gereksinimlerine göre AI ile optimize edebilir ve başvuru sürecinizi takip edebilirsiniz."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Kamulog Kariyer giriş nasıl yapılır?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "kariyerkamulog.com adresinden 'Giriş Yap' butonuna tıklayarak email ve şifrenizle giriş yapabilirsiniz. Şifrenizi unuttuysanız 'Şifremi Unuttum' ile sıfırlayabilirsiniz."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Kariyer Kamulog'a kayıt olmak için ne gerekir?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Kayıt olmak için email adresi, telefon numarası ve şifre belirlemeniz yeterlidir. Kayıt ücretsizdir ve hemen AI CV oluşturucu kullanmaya başlayabilirsiniz."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Gizlilik sözleşmesi ve KVKK hakkında bilgi alabilir miyim?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Kariyer Kamulog, KVKK'ya tam uyumlu çalışmaktadır. Gizlilik Politikası ve KVKK Aydınlatma Metni sayfalarımızdan kişisel verilerinizin nasıl korunduğunu detaylı öğrenebilirsiniz."
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <ToastProvider>
            {children}
          </ToastProvider>
          <WhatsAppButton />
          <CookieConsent />
          <WelcomeToast />
        </Providers>
      </body>
    </html>
  );
}
