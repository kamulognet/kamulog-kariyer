'use client'

import { ReactNode } from 'react'
import Footer from '@/components/Footer'

interface PanelLayoutProps {
    children: ReactNode
}

export default function PanelLayout({ children }: PanelLayoutProps) {
    // Session kontrolü kaldırıldı - bu kontrol logout sorununa neden oluyordu
    // Her sayfa kendi session kontrolünü yapıyor

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    )
}
