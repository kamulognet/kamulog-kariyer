'use client'

import { useState, useEffect } from 'react'
import { Check, Zap, Star, Crown, Shield } from 'lucide-react'
import { useSession } from 'next-auth/react'
import PanelHeader from '@/components/PanelHeader'

interface Plan {
    id: string
    name: string
    price: number
    features: string[]
    popular: boolean
    tag: string | null
}

const iconMap: Record<string, any> = {
    FREE: Zap,
    BASIC: Star,
    PREMIUM: Crown
}

const colorMap: Record<string, string> = {
    FREE: 'blue',
    BASIC: 'purple',
    PREMIUM: 'orange'
}

export default function SubscriptionPage() {
    const { data: session } = useSession()
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPlans()
    }, [])

    const loadPlans = async () => {
        try {
            const res = await fetch('/api/admin/settings?key=subscription_plans')
            const data = await res.json()
            if (data.value && Array.isArray(data.value)) {
                setPlans(data.value)
            } else {
                setPlans([
                    { id: 'FREE', name: 'Kariyer Yolcusu', price: 0, features: ['Ayda 1 CV', '20 AI Mesaj'], popular: false, tag: null },
                    { id: 'BASIC', name: 'Profesyonel Yükseliş', price: 199, features: ['Ayda 5 CV', '100 AI Mesaj', '20 AI Analiz'], popular: true, tag: 'EN POPÜLER' },
                    { id: 'PREMIUM', name: 'Kamu Lideri', price: 399, features: ['Sınırsız CV', 'Sınırsız AI', 'Öncelikli Destek'], popular: false, tag: null }
                ])
            }
        } catch (error) {
            console.error('Error loading plans:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <PanelHeader />

            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Kariyerinizin Kilidini <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Açın</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Devlet memurluğu veya özel sektör fark etmez. Sizin için en uygun planı seçin ve hayalinizdeki işe bir adım daha yaklaşın.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => {
                        const Icon = iconMap[plan.id] || Zap
                        const color = colorMap[plan.id] || 'blue'
                        const priceDisplay = plan.price === 0 ? 'Ücretsiz' : `${plan.price} TL/Ay`

                        return (
                            <div
                                key={plan.id}
                                className={`relative bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl ${plan.popular
                                    ? 'border-purple-500/50 shadow-purple-500/10 scale-105 z-10'
                                    : 'border-slate-700 hover:border-blue-500/30'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                                            {plan.tag || 'EN POPÜLER'}
                                        </span>
                                    </div>
                                )}

                                <div className={`inline-flex p-3 rounded-xl mb-6 ${color === 'blue' ? 'bg-blue-500/10 text-blue-400' :
                                    color === 'purple' ? 'bg-purple-500/10 text-purple-400' :
                                        'bg-orange-500/10 text-orange-400'
                                    }`}>
                                    <Icon className="w-8 h-8" />
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                <p className="text-slate-400 text-sm mb-6 h-10">Hayalinizdeki işe bir adım daha yaklaşın.</p>

                                <div className="mb-8">
                                    <span className="text-4xl font-bold text-white">{priceDisplay}</span>
                                </div>

                                <button
                                    onClick={() => setSelectedPlan(plan.id)}
                                    className={`w-full py-3 px-6 rounded-xl font-bold transition-all ${plan.id === 'FREE'
                                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                                        : color === 'purple'
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-900/20'
                                            : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white shadow-lg shadow-orange-900/20'
                                        }`}
                                >
                                    {plan.id === 'FREE' ? 'Mevcut Plan' : 'Yükselt'}
                                </button>

                                <div className="mt-8 space-y-4">
                                    {plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <div className="mt-1">
                                                <Check className={`w-4 h-4 ${color === 'blue' ? 'text-blue-400' :
                                                    color === 'purple' ? 'text-purple-400' :
                                                        'text-orange-400'
                                                    }`} />
                                            </div>
                                            <span className="text-slate-300 text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-16 bg-slate-800/30 rounded-3xl p-8 border border-slate-700/50">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Shield className="w-6 h-6 text-green-400" />
                                Kurumsal Güvence
                            </h3>
                            <p className="text-slate-400 text-sm">
                                Ödemeleriniz 256-bit SSL sertifikası ile korunmaktadır. Memnun kalmazsanız 14 gün içinde değişim hakkı.
                            </p>
                        </div>
                        <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="h-8 w-12 bg-white/10 rounded"></div>
                            <div className="h-8 w-12 bg-white/10 rounded"></div>
                            <div className="h-8 w-12 bg-white/10 rounded"></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
