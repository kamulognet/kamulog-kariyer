'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'

interface Plan {
    id: string
    name: string
    price: number
    tokens: number
    features: string[]
    popular?: boolean
}

interface InsufficientCreditsModalProps {
    show: boolean
    required: number
    current: number
    onClose: () => void
}

export default function InsufficientCreditsModal({ show, required, current, onClose }: InsufficientCreditsModalProps) {
    const router = useRouter()
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (show) {
            loadPlans()
        }
    }, [show])

    const loadPlans = async () => {
        try {
            const res = await fetch('/api/public/plans')
            const data = await res.json()
            if (data.plans) {
                // FREE planı hariç tut
                const paidPlans = data.plans.filter((p: Plan) => p.id !== 'FREE')
                setPlans(paidPlans)
            }
        } catch (error) {
            console.error('Load plans error:', error)
        } finally {
            setLoading(false)
        }
    }

    const getPlanColor = (planId: string) => {
        const colors: Record<string, { bg: string; border: string; text: string }> = {
            BASIC: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
            PREMIUM: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
        }
        return colors[planId] || { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' }
    }

    const getPlanEmoji = (planId: string) => {
        const emojis: Record<string, string> = {
            BASIC: '🚀',
            PREMIUM: '👑',
        }
        return emojis[planId] || '⭐'
    }

    if (!show) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full border border-yellow-500/30 animate-in fade-in zoom-in duration-300">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-xl text-white mb-2">Yetersiz Jeton</h3>
                        <p className="text-slate-300 text-sm">
                            Bu özellik için <strong className="text-yellow-400">{required} jeton</strong> gerekiyor.
                            Mevcut bakiyeniz: <strong className="text-red-400">{current} jeton</strong>
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-slate-400 text-sm mb-4">Jeton satın almak için bir plan seçin:</p>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {plans.map((plan) => {
                                const colors = getPlanColor(plan.id)
                                return (
                                    <div
                                        key={plan.id}
                                        onClick={() => router.push(`/panel/satin-al?plan=${plan.id}`)}
                                        className={`p-4 ${colors.bg} border ${colors.border} rounded-xl cursor-pointer hover:opacity-80 transition relative`}
                                    >
                                        {plan.popular && (
                                            <div className="absolute -top-2 right-4 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                                                En Popüler
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className={`${colors.text} font-semibold`}>
                                                    {getPlanEmoji(plan.id)} {plan.name}
                                                </h4>
                                                <p className="text-slate-400 text-sm">{plan.tokens} jeton dahil</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-bold text-white">₺{plan.price}</span>
                                                <p className="text-xs text-slate-500">/ay</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                >
                    Vazgeç
                </button>
            </div>
        </div>
    )
}
