'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, Zap, Star, Crown, Coins } from 'lucide-react'

interface Plan {
    id: string
    name: string
    price: number
    tokens: number
    features: string[]
    popular: boolean
    tag: string | null
}

const iconMap: Record<string, any> = {
    FREE: Zap,
    BASIC: Star,
    PREMIUM: Crown
}

const colorMap: Record<string, { bg: string; text: string; border: string; button: string }> = {
    FREE: {
        bg: 'from-slate-500/10',
        text: 'text-slate-400',
        border: 'border-slate-500/20',
        button: 'bg-slate-600 hover:bg-slate-500'
    },
    BASIC: {
        bg: 'from-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
        button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
    },
    PREMIUM: {
        bg: 'from-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
        button: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400'
    }
}

export default function HomePlans() {
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPlans()
    }, [])

    const loadPlans = async () => {
        try {
            const res = await fetch('/api/public/plans')
            const data = await res.json()
            if (data.plans && Array.isArray(data.plans)) {
                setPlans(data.plans)
            }
        } catch (error) {
            console.error('Error loading plans:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="py-24">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                </div>
            </div>
        )
    }

    if (plans.length === 0) return null

    return (
        <section className="relative z-10 py-24 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Size Uygun <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Planı Seçin</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Kariyer hedeflerinize ulaşmak için ihtiyacınız olan tüm araçlar
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => {
                        const Icon = iconMap[plan.id] || Zap
                        const colors = colorMap[plan.id] || colorMap.FREE
                        const priceDisplay = plan.price === 0 ? 'Ücretsiz' : `${plan.price} ₺`

                        return (
                            <div
                                key={plan.id}
                                className={`relative bg-gradient-to-br ${colors.bg} to-transparent border ${colors.border} rounded-3xl p-8 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl backdrop-blur-sm ${plan.popular ? 'scale-105 z-10 ring-2 ring-purple-500/50' : ''
                                    }`}
                            >
                                {plan.popular && plan.tag && (
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                                            {plan.tag}
                                        </span>
                                    </div>
                                )}

                                <div className={`inline-flex p-3 rounded-xl mb-6 bg-white/5 ${colors.text}`}>
                                    <Icon className="w-8 h-8" />
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>

                                {plan.tokens > 0 && (
                                    <div className="flex items-center gap-2 mb-4">
                                        <Coins className="w-4 h-4 text-yellow-400" />
                                        <span className="text-yellow-400 text-sm font-medium">{plan.tokens} Jeton</span>
                                    </div>
                                )}

                                <div className="mb-8">
                                    <span className="text-4xl font-bold text-white">{priceDisplay}</span>
                                    {plan.price > 0 && <span className="text-gray-400 text-sm">/ay</span>}
                                </div>

                                {plan.price === 0 ? (
                                    <Link
                                        href="/register"
                                        className="w-full py-3 px-6 rounded-xl font-bold transition-all block text-center bg-white/10 hover:bg-white/20 text-white border border-white/20"
                                    >
                                        Ücretsiz Başla
                                    </Link>
                                ) : (
                                    <Link
                                        href="/register"
                                        className={`w-full py-3 px-6 rounded-xl font-bold transition-all block text-center text-white shadow-lg ${colors.button}`}
                                    >
                                        Hemen Başla
                                    </Link>
                                )}

                                <div className="mt-8 space-y-4">
                                    {plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <div className="mt-1">
                                                <Check className={`w-4 h-4 ${colors.text}`} />
                                            </div>
                                            <span className="text-gray-300 text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-400 text-sm">
                        💡 Plan satın almak için önce <Link href="/register" className="text-purple-400 hover:underline">kayıt olmanız</Link> gerekmektedir.
                    </p>
                </div>
            </div>
        </section>
    )
}
