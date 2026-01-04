'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ScrollText } from 'lucide-react'

export default function TermsPage() {
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadContent()
    }, [])

    const loadContent = async () => {
        try {
            const res = await fetch('/api/settings/pages')
            const data = await res.json()
            setContent(data.terms || defaultContent)
        } catch (error) {
            console.error('Error loading terms content:', error)
            setContent(defaultContent)
        } finally {
            setLoading(false)
        }
    }

    const defaultContent = `
# Kullanım Şartları

Bu kullanım şartları, Kariyer Kamulog web sitesini kullanırken uymanız gereken kuralları belirler.

## Genel Şartlar

1. Siteye kaydolarak bu şartları kabul etmiş sayılırsınız.
2. Hesabınızın güvenliğinden siz sorumlusunuz.
3. Yanıltıcı veya sahte bilgi paylaşmak yasaktır.

## Hizmet Kullanımı

- CV oluşturma hizmetleri kişisel kullanım içindir.
- AI destekli özellikler jeton bazında çalışmaktadır.
- Ticari kullanım için önceden izin gereklidir.

## Abonelik ve Ödemeler

- Abonelik ücretleri belirlenen dönem için geçerlidir.
- İptal işlemleri dönem sonunda etkili olur.
- İade politikası satın alma tarihinden itibaren 7 gün geçerlidir.

## Sorumluluk Reddi

Kariyer Kamulog, CV'nizin iş bulmanızı garanti etmez. Hizmetlerimiz sadece yardımcı araçlardır.

## İletişim

Sorularınız için: info@kamulogkariyer.com
`

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Ana Sayfa</span>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                        <ScrollText className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Kullanım Şartları</h1>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                ) : (
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8">
                        <div className="prose prose-invert max-w-none">
                            <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {content}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
