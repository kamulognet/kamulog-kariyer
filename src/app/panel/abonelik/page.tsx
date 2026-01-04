'use client'

import { useState, useEffect } from 'react'
import { Check, Zap, Star, Crown, Shield, Coins } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PanelHeader from '@/components/PanelHeader'
import Link from 'next/link'

interface Plan {
    id: string
    name: string
    price: number
    tokens: number
    features: string[]
    popular: boolean
    tag: string | null
}

interface UserSubscription {
    plan: string
    status: string
}

const iconMap: Record<string, any> = {
    FREE: Zap,
    BASIC: Star,
    PREMIUM: Crown
}

const colorMap: Record<string, { bg: string; text: string; border: string; button: string }> = {
    FREE: {
        bg: 'bg-slate-500/10',
        text: 'text-slate-400',
        border: 'border-slate-500/30',
        button: 'bg-slate-600 hover:bg-slate-500'
    },
    BASIC: {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
        button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
    },
    PREMIUM: {
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
        button: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400'
    }
}

export default function SubscriptionPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const [plans, setPlans] = useState<Plan[]>([])
    const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            // Fetch plans from public API (same as homepage)
            const plansRes = await fetch('/api/public/plans')
            const plansData = await plansRes.json()
            if (plansData.plans && Array.isArray(plansData.plans)) {
                setPlans(plansData.plans)
            }

            // Fetch user subscription
            const subRes = await fetch('/api/user/subscription')
            const subData = await subRes.json()
            if (subData.subscription) {
                setUserSubscription(subData.subscription)
            }
        } catch (error) {
            console.error('Error loading data:', error)
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

    const currentPlan = userSubscription?.plan || 'FREE'

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <PanelHeader />

            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Size Uygun <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Planı Seçin</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Kariyer hedeflerinize ulaşmak için ihtiyacınız olan tüm araçlar
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => {
                        const Icon = iconMap[plan.id] || Zap
                        const colors = colorMap[plan.id] || colorMap.FREE
                        const priceDisplay = plan.price === 0 ? 'Ücretsiz' : `${plan.price} ₺`
                        const isCurrentPlan = currentPlan === plan.id

                        return (
                            <div
                                key={plan.id}
                                className={`relative bg-gradient-to-br ${colors.bg} to-transparent backdrop-blur-xl rounded-3xl p-8 border transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl ${plan.popular
                                        ? 'border-purple-500/50 shadow-purple-500/20 scale-105 z-10 ring-2 ring-purple-500/50'
                                        : isCurrentPlan
                                            ? 'border-green-500/50 ring-2 ring-green-500/50'
                                            : `${colors.border} hover:border-purple-500/30`
                                    }`}
                            >
                                {plan.popular && plan.tag && (
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                                            {plan.tag}
                                        </span>
                                    </div>
                                )}

                                {isCurrentPlan && (
                                    <div className="absolute top-4 right-4">
                                        <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/30">
                                            Mevcut
                                        </span>
                                    </div>
                                )}

                                <div className={`inline-flex p-3 rounded-xl mb-6 ${colors.bg} ${colors.text}`}>
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
                                    {plan.price > 0 && <span className="text-slate-400 text-sm">/ay</span>}
                                </div>

                                {isCurrentPlan ? (
                                    <button
                                        disabled
                                        className="w-full py-3 px-6 rounded-xl font-bold bg-green-500/20 text-green-400 cursor-not-allowed border border-green-500/30"
                                    >
                                        ✓ Mevcut Plan
                                    </button>
                                ) : plan.price === 0 ? (
                                    <button
                                        disabled
                                        className="w-full py-3 px-6 rounded-xl font-bold bg-slate-700 text-slate-400 cursor-not-allowed"
                                    >
                                        Ücretsiz Plan
                                    </button>
                                ) : (
                                    <Link
                                        href={`/panel/satin-al?plan=${plan.id}`}
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
                                Güvenli Ödeme
                            </h3>
                            <p className="text-slate-400 text-sm">
                                Ödemeleriniz 256-bit SSL sertifikası ile korunmaktadır.
                            </p>
                        </div>
                        <div className="flex gap-4 items-center text-slate-500 text-sm">
                            <span>💳 Havale/EFT ile ödeme yapabilirsiniz</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
