'use client'

import Link from 'next/link'
import Image from 'next/image'
import { X, Home } from 'lucide-react'

export default function LegalLayout({ children }: { children: React.ReactNode }) {

    const handleClose = () => {
        // Yeni sekmede açıldıysa kapat, değilse ana sayfaya git
        if (window.opener || window.history.length <= 1) {
            window.close()
        } else {
            window.location.href = '/'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={handleClose}
                        className="flex items-center gap-2 text-white hover:text-purple-400 transition"
                    >
                        <X className="w-5 h-5" />
                        <span>Kapat</span>
                    </button>
                    <Link href="/" target="_blank" rel="noopener" className="flex items-center gap-2">
                        <Image src="/logo.jpg" alt="Kariyer Kamulog" width={32} height={32} className="rounded-lg" />
                        <span className="text-lg font-bold text-white">Kariyer Kamulog</span>
                    </Link>
                </div>
            </header>
            <main className="pt-24 pb-16 px-4">
                <div className="container mx-auto max-w-4xl">
                    {children}
                </div>
            </main>
            <footer className="py-8 border-t border-slate-800">
                <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
                    <p className="mb-2">© {new Date().getFullYear()} Kariyer Kamulog. Tüm hakları saklıdır.</p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Link href="/kvkk" className="hover:text-purple-400 transition">KVKK</Link>
                        <Link href="/gizlilik" className="hover:text-purple-400 transition">Gizlilik Politikası</Link>
                        <Link href="/kullanim-kosullari" className="hover:text-purple-400 transition">Kullanım Koşulları</Link>
                        <Link href="/cerez-politikasi" className="hover:text-purple-400 transition">Çerez Politikası</Link>
                    </div>
                    <p className="mt-4 text-xs">
                        Veri Sorumlusu: Suat Hayri Şahin – Kamulog.net<br />
                        destek@kamulogkariyer.com
                    </p>
                </div>
            </footer>
        </div>
    )
}
