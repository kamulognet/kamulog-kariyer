'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Users, Target, Award, Sparkles, Shield, Heart } from 'lucide-react'

interface AboutContent {
    title: string
    description: string
    mission: string
    vision: string
    values: string[]
}

export default function HakkimizdaPage() {
    const [content, setContent] = useState<AboutContent | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/settings/about')
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    // Default içerik
                    setContent({
                        title: 'Kariyer Kamulog Hakkında',
                        description: 'Kariyer Kamulog, yapay zeka destekli profesyonel CV oluşturma ve iş eşleştirme platformudur. 2024 yılında kurulan platformumuz, iş arayanların kariyer hedeflerine ulaşmalarına yardımcı olmak için en son teknolojiyi kullanmaktadır.',
                        mission: 'İş arayanların en doğru kariyer kararlarını vermelerine yardımcı olmak, yapay zeka destekli araçlarla CV hazırlama sürecini kolaylaştırmak ve doğru iş-aday eşleştirmesi sağlamak.',
                        vision: 'Türkiye\'nin en güvenilir ve yenilikçi kariyer platformu olmak, her bireyin potansiyelini en iyi şekilde yansıtan CV\'ler oluşturmasına ve hayalindeki işe ulaşmasına öncülük etmek.',
                        values: [
                            'Güvenilirlik - Kullanıcı verilerinin güvenliği önceliğimizdir',
                            'Yenilikçilik - En son yapay zeka teknolojilerini kullanıyoruz',
                            'Kullanıcı Odaklılık - Her kararımızı kullanıcı deneyimini iyileştirmek için alıyoruz',
                            'Şeffaflık - Tüm süreçlerimizde açık ve dürüst iletişim kuruyoruz',
                            'Sürekli Gelişim - Platformumuzu sürekli geliştiriyoruz'
                        ]
                    })
                } else {
                    setContent(data)
                }
            })
            .catch(() => {
                // Default içerik
                setContent({
                    title: 'Kariyer Kamulog Hakkında',
                    description: 'Kariyer Kamulog, yapay zeka destekli profesyonel CV oluşturma ve iş eşleştirme platformudur. 2024 yılında kurulan platformumuz, iş arayanların kariyer hedeflerine ulaşmalarına yardımcı olmak için en son teknolojiyi kullanmaktadır.',
                    mission: 'İş arayanların en doğru kariyer kararlarını vermelerine yardımcı olmak, yapay zeka destekli araçlarla CV hazırlama sürecini kolaylaştırmak ve doğru iş-aday eşleştirmesi sağlamak.',
                    vision: 'Türkiye\'nin en güvenilir ve yenilikçi kariyer platformu olmak, her bireyin potansiyelini en iyi şekilde yansıtan CV\'ler oluşturmasına ve hayalindeki işe ulaşmasına öncülük etmek.',
                    values: [
                        'Güvenilirlik - Kullanıcı verilerinin güvenliği önceliğimizdir',
                        'Yenilikçilik - En son yapay zeka teknolojilerini kullanıyoruz',
                        'Kullanıcı Odaklılık - Her kararımızı kullanıcı deneyimini iyileştirmek için alıyoruz',
                        'Şeffaflık - Tüm süreçlerimizde açık ve dürüst iletişim kuruyoruz',
                        'Sürekli Gelişim - Platformumuzu sürekli geliştiriyoruz'
                    ]
                })
            })
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/favicon.jpg"
                            alt="Kariyer Kamulog"
                            width={40}
                            height={40}
                            className="rounded-lg"
                        />
                        <span className="text-xl font-bold text-white">KARİYER KAMULOG</span>
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Geri Dön</span>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-6xl mx-auto px-4 py-12">
                {/* Title */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {content?.title || 'Hakkımızda'}
                    </h1>
                    <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                        {content?.description}
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
                        <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                            <Sparkles className="w-7 h-7 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Yapay Zeka Destekli</h3>
                        <p className="text-slate-400">
                            En son AI teknolojileriyle profesyonel CV'ler oluşturun ve iş ilanlarıyla eşleştirin.
                        </p>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
                        <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                            <Shield className="w-7 h-7 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Güvenli Platform</h3>
                        <p className="text-slate-400">
                            KVKK uyumlu, verileriniz güvende. SSL korumalı altyapımızla bilgilerinizi koruyoruz.
                        </p>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
                        <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                            <Users className="w-7 h-7 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Kariyer Danışmanlığı</h3>
                        <p className="text-slate-400">
                            Premium kullanıcılarımıza özel kariyer danışmanlığı hizmeti sunuyoruz.
                        </p>
                    </div>
                </div>

                {/* Mission & Vision */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl p-8 border border-purple-500/20">
                        <div className="flex items-center gap-3 mb-4">
                            <Target className="w-6 h-6 text-purple-400" />
                            <h2 className="text-2xl font-bold text-white">Misyonumuz</h2>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                            {content?.mission}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-8 border border-blue-500/20">
                        <div className="flex items-center gap-3 mb-4">
                            <Award className="w-6 h-6 text-blue-400" />
                            <h2 className="text-2xl font-bold text-white">Vizyonumuz</h2>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                            {content?.vision}
                        </p>
                    </div>
                </div>

                {/* Values */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
                    <div className="flex items-center gap-3 mb-6">
                        <Heart className="w-6 h-6 text-red-400" />
                        <h2 className="text-2xl font-bold text-white">Değerlerimiz</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {content?.values?.map((value, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-slate-300">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>


            </main>
        </div>
    )
}
