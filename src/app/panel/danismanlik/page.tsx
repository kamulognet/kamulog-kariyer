'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ConsultationCard } from '@/components/consultation/ConsultationButton'
import { ArrowLeft, Crown, Phone, Clock, CheckCircle, Users } from 'lucide-react'
import Link from 'next/link'

export default function ConsultationPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link
                        href="/panel"
                        className="p-2 hover:bg-slate-800 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-white">1+1 Özel Danışmanlık</h1>
                        <p className="text-sm text-slate-400">Premium üyelere özel kariyer desteği</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-purple-900/50 to-slate-800/50 border border-purple-500/30 rounded-3xl p-8 mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-purple-500/20 rounded-2xl">
                            <Phone className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Kariyer Uzmanlarımızla Birebir Görüşme</h2>
                            <p className="text-purple-300">Profesyonel kariyer danışmanlığı hizmeti</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-900/50 rounded-xl p-4">
                            <Users className="w-6 h-6 text-blue-400 mb-2" />
                            <h3 className="font-medium text-white mb-1">Birebir Görüşme</h3>
                            <p className="text-sm text-slate-400">Kişiselleştirilmiş kariyer planlaması</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4">
                            <Clock className="w-6 h-6 text-green-400 mb-2" />
                            <h3 className="font-medium text-white mb-1">Hızlı Destek</h3>
                            <p className="text-sm text-slate-400">Mesai saatlerinde anında cevap</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4">
                            <Crown className="w-6 h-6 text-yellow-400 mb-2" />
                            <h3 className="font-medium text-white mb-1">Premium Ayrıcalık</h3>
                            <p className="text-sm text-slate-400">Sadece Premium üyelere özel</p>
                        </div>
                    </div>
                </div>

                {/* Consultation Card */}
                <div className="mb-8">
                    <ConsultationCard />
                </div>

                {/* What We Offer */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Danışmanlık Kapsamı</h3>
                    <div className="space-y-3">
                        {[
                            'CV ve özgeçmiş değerlendirmesi',
                            'Kariyer yol haritası oluşturma',
                            'Mülakat hazırlığı ve teknikleri',
                            'Sektör ve pozisyon tavsiyesi',
                            'Maaş müzakeresi stratejileri',
                            'Kamu sektörü başvuru rehberliği'
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                <span className="text-slate-300">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA for non-premium */}
                <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-2xl p-6 text-center">
                    <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Premium Üye Ol</h3>
                    <p className="text-slate-300 mb-4">
                        1+1 özel danışmanlık ve tüm premium özelliklerden yararlanmak için hemen yükseltin.
                    </p>
                    <Link
                        href="/panel/satin-al"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-medium rounded-xl transition shadow-lg shadow-yellow-500/30"
                    >
                        <Crown className="w-5 h-5" />
                        Premium'a Yükselt
                    </Link>
                </div>
            </div>
        </div>
    )
}
