import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KARİYER KAMULOG - AI CV Oluşturucu",
  description: "Yapay zeka destekli profesyonel CV oluşturma platformu. Kamu personeli için özelleştirilmiş CV'ler.",
  keywords: "cv, özgeçmiş, kamu, kariyer, yapay zeka, ai",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

