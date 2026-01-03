import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import WhatsAppButton from "@/components/WhatsAppButton";

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
    "kariyer kamulog",
    "kamulog kariyer",
    "cv oluşturma",
    "özgeçmiş hazırlama",
    "kamu iş ilanları",
    "KPSS ilanları",
    "memur alımı",
    "kariyer",
    "yapay zeka cv",
    "ai cv oluşturucu",
    "iş başvurusu",
    "özel sektör ilanları",
    "profesyonel cv",
    "cv şablonları"
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
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
