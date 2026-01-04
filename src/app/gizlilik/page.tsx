'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPage() {
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadContent()
    }, [])

    const loadContent = async () => {
        try {
            const res = await fetch('/api/settings/pages')
            const data = await res.json()
            setContent(data.privacy || defaultContent)
        } catch (error) {
            console.error('Error loading privacy content:', error)
            setContent(defaultContent)
        } finally {
            setLoading(false)
        }
    }

    const defaultContent = `
# Gizlilik Politikası

Bu gizlilik politikası, Kariyer Kamulog web sitesinin kullanıcı verilerini nasıl topladığını, kullandığını ve koruduğunu açıklamaktadır.

## Toplanan Bilgiler

- Ad ve e-posta adresi
- Telefon numarası
- CV ve kariyer bilgileri
- Site kullanım verileri

## Bilgilerin Kullanımı

Topladığımız bilgiler şu amaçlarla kullanılmaktadır:
- Hesap oluşturma ve yönetimi
- CV oluşturma hizmetleri sunma
- İş eşleştirme ve kariyer danışmanlığı
- Hizmet geliştirme

## Veri Güvenliği

Verileriniz SSL şifreleme ile korunmaktadır. Üçüncü taraflarla izniniz olmadan paylaşılmamaktadır.

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
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                        <Shield className="w-8 h-8 text-purple-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Gizlilik Politikası</h1>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
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
