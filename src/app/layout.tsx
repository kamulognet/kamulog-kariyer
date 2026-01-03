import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import WhatsAppButton from "@/components/WhatsAppButton";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "KARİYER KAMULOG - AI CV Oluşturucu",
    template: "%s | KARİYER KAMULOG"
  },
  description: "Yapay zeka destekli profesyonel CV oluşturma ve iş eşleştirme platformu. Kamu ve özel sektör iş ilanları, AI ile CV analizi ve kariyer koçluğu.",
  keywords: ["cv", "özgeçmiş", "kamu iş ilanı", "kariyer", "yapay zeka", "ai cv", "iş başvurusu", "KPSS", "memur alımı", "özgeçmiş hazırlama"],
  authors: [{ name: "Kariyer Kamulog" }],
  creator: "Kariyer Kamulog",
  publisher: "Kariyer Kamulog",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://kariyerkamulog.com",
    siteName: "KARİYER KAMULOG",
    title: "KARİYER KAMULOG - AI CV Oluşturucu",
    description: "Yapay zeka destekli profesyonel CV oluşturma ve iş eşleştirme platformu. Kamu ve özel sektör iş ilanları, AI ile CV analizi.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kariyer Kamulog - AI CV Oluşturucu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KARİYER KAMULOG - AI CV Oluşturucu",
    description: "Yapay zeka destekli profesyonel CV oluşturma ve iş eşleştirme platformu.",
    images: ["/og-image.png"],
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://kariyerkamulog.com",
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#7c3aed" />
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
