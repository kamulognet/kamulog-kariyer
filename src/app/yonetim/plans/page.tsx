'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, Plus, Trash2, ArrowLeft, Coins } from 'lucide-react'

interface Plan {
    id: string
    name: string
    price: number
    tokens: number
    features: string[]
    popular: boolean
    tag: string | null
}

export default function AdminPlansPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (session?.user?.role !== 'ADMIN') {
            router.push('/panel')
        }
    }, [status, session, router])

    useEffect(() => {
        if (session?.user?.role === 'ADMIN') {
            loadPlans()
        }
    }, [session])

    const loadPlans = async () => {
        try {
            const res = await fetch('/api/admin/settings?key=subscription_plans')
            const data = await res.json()
            // Varsayılan tokens değeri ekle (eski planlar için)
            const plansWithTokens = (data.value || []).map((plan: Plan) => ({
                ...plan,
                tokens: plan.tokens || 0
            }))
            setPlans(plansWithTokens)
        } catch (error) {
            console.error('Error loading plans:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        setMessage('')

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'subscription_plans', value: plans })
            })

            if (res.ok) {
                setMessage('Planlar başarıyla kaydedildi!')
                setTimeout(() => setMessage(''), 3000)
            } else {
                setMessage('Kaydetme hatası!')
            }
        } catch (error) {
            console.error('Error saving plans:', error)
            setMessage('Kaydetme hatası!')
        } finally {
            setSaving(false)
        }
    }

    const updatePlan = (index: number, field: keyof Plan, value: any) => {
        const updated = [...plans]
        updated[index] = { ...updated[index], [field]: value }
        setPlans(updated)
    }

    const updateFeature = (planIndex: number, featureIndex: number, value: string) => {
        const updated = [...plans]
        updated[planIndex].features[featureIndex] = value
        setPlans(updated)
    }

    const addFeature = (planIndex: number) => {
        const updated = [...plans]
        updated[planIndex].features.push('Yeni özellik')
        setPlans(updated)
    }

    const removeFeature = (planIndex: number, featureIndex: number) => {
        const updated = [...plans]
        updated[planIndex].features.splice(featureIndex, 1)
        setPlans(updated)
    }

    const addPlan = () => {
        setPlans([...plans, {
            id: `PLAN_${Date.now()}`,
            name: 'Yeni Plan',
            price: 0,
            tokens: 0,
            features: ['Özellik 1'],
            popular: false,
            tag: null
        }])
    }

    const removePlan = (index: number) => {
        if (confirm('Bu planı silmek istediğinizden emin misiniz?')) {
            const updated = [...plans]
            updated.splice(index, 1)
            setPlans(updated)
        }
    }

    if (session?.user?.role !== 'ADMIN') {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/yonetim" className="text-slate-400 hover:text-white transition">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <h1 className="text-xl font-bold text-white">Abonelik Planları Yönetimi</h1>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {message && (
                    <div className={`mb-6 px-4 py-3 rounded-lg ${message.includes('başarı') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {message}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {plans.map((plan, planIndex) => (
                            <div key={plan.id} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-lg font-semibold text-white">Plan {planIndex + 1}</h3>
                                    <button
                                        onClick={() => removePlan(planIndex)}
                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Plan ID</label>
                                        <input
                                            type="text"
                                            value={plan.id}
                                            onChange={(e) => updatePlan(planIndex, 'id', e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Plan Adı</label>
                                        <input
                                            type="text"
                                            value={plan.name}
                                            onChange={(e) => updatePlan(planIndex, 'name', e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Fiyat (TL)</label>
                                        <input
                                            type="number"
                                            value={plan.price}
                                            onChange={(e) => updatePlan(planIndex, 'price', Number(e.target.value))}
                                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                                            <Coins className="w-4 h-4 text-yellow-400" />
                                            Jeton Sayısı
                                        </label>
                                        <input
                                            type="number"
                                            value={plan.tokens}
                                            onChange={(e) => updatePlan(planIndex, 'tokens', Number(e.target.value))}
                                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Etiket (Tag)</label>
                                        <input
                                            type="text"
                                            value={plan.tag || ''}
                                            onChange={(e) => updatePlan(planIndex, 'tag', e.target.value || null)}
                                            placeholder="örn: EN POPÜLER"
                                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 pt-6">
                                        <input
                                            type="checkbox"
                                            checked={plan.popular}
                                            onChange={(e) => updatePlan(planIndex, 'popular', e.target.checked)}
                                            className="w-5 h-5 accent-purple-500"
                                        />
                                        <label className="text-slate-300">Popüler (Öne Çıkar)</label>
                                    </div>
                                </div>

                                {/* Features */}
                                <div>
                                    <label className="block text-sm text-slate-400 mb-3">Özellikler</label>
                                    <div className="space-y-2">
                                        {plan.features.map((feature, featureIndex) => (
                                            <div key={featureIndex} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={feature}
                                                    onChange={(e) => updateFeature(planIndex, featureIndex, e.target.value)}
                                                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                                <button
                                                    onClick={() => removeFeature(planIndex, featureIndex)}
                                                    className="px-3 py-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => addFeature(planIndex)}
                                            className="flex items-center gap-2 px-4 py-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Özellik Ekle
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={addPlan}
                            className="w-full py-4 border-2 border-dashed border-slate-600 rounded-2xl text-slate-400 hover:text-white hover:border-purple-500 transition flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Yeni Plan Ekle
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}
