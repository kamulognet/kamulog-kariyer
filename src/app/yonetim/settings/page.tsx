'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Settings, Save, Plus, Trash2, GripVertical } from 'lucide-react'

interface SubscriptionPlan {
    id: string
    name: string
    price: number
    features: string[]
    popular: boolean
    tag: string | null
}

export default function AdminSettingsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [plans, setPlans] = useState<SubscriptionPlan[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (session?.user?.role !== 'ADMIN') {
            router.push('/dashboard')
        }
    }, [status, session, router])

    useEffect(() => {
        if (session?.user?.role === 'ADMIN') {
            loadSettings()
        }
    }, [session])

    const loadSettings = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/settings?key=subscription_plans')
            const data = await res.json()
            setPlans(data.value || [])
        } catch (error) {
            console.error('Error loading settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        setMessage(null)

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'subscription_plans',
                    value: plans,
                }),
            })

            if (res.ok) {
                setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi!' })
            } else {
                const data = await res.json()
                setMessage({ type: 'error', text: data.error || 'Kaydetme başarısız' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Bir hata oluştu' })
        } finally {
            setSaving(false)
        }
    }

    const updatePlan = (index: number, field: keyof SubscriptionPlan, value: unknown) => {
        const newPlans = [...plans]
        newPlans[index] = { ...newPlans[index], [field]: value }
        setPlans(newPlans)
    }

    const updateFeature = (planIndex: number, featureIndex: number, value: string) => {
        const newPlans = [...plans]
        newPlans[planIndex].features[featureIndex] = value
        setPlans(newPlans)
    }

    const addFeature = (planIndex: number) => {
        const newPlans = [...plans]
        newPlans[planIndex].features.push('')
        setPlans(newPlans)
    }

    const removeFeature = (planIndex: number, featureIndex: number) => {
        const newPlans = [...plans]
        newPlans[planIndex].features.splice(featureIndex, 1)
        setPlans(newPlans)
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
                        <div className="flex items-center gap-8">
                            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                            <nav className="flex gap-4">
                                <Link href="/admin" className="text-slate-400 hover:text-white transition">
                                    Anasayfa
                                </Link>
                                <Link href="/admin/users" className="text-slate-400 hover:text-white transition">
                                    Kullanıcılar
                                </Link>
                                <Link href="/admin/subscriptions" className="text-slate-400 hover:text-white transition">
                                    Abonelikler
                                </Link>
                                <Link href="/admin/settings" className="text-purple-400 font-medium">
                                    Ayarlar
                                </Link>
                            </nav>
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
                    <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                        ? 'bg-green-500/20 border border-green-500/50 text-green-200'
                        : 'bg-red-500/20 border border-red-500/50 text-red-200'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                        <Settings className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Abonelik Planları</h2>
                        <p className="text-slate-400">Anasayfada gösterilen abonelik planlarını düzenleyin</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {plans.map((plan, planIndex) => (
                            <div
                                key={plan.id}
                                className={`bg-slate-800/50 backdrop-blur-xl rounded-2xl border ${plan.popular ? 'border-blue-500' : 'border-slate-700'
                                    } p-6`}
                            >
                                {/* Plan Header */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <GripVertical className="w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            value={plan.name}
                                            onChange={(e) => updatePlan(planIndex, 'name', e.target.value)}
                                            className="flex-1 bg-transparent text-xl font-bold text-white border-b border-transparent hover:border-slate-600 focus:border-blue-500 focus:outline-none transition"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-slate-400">₺</span>
                                        <input
                                            type="number"
                                            value={plan.price}
                                            onChange={(e) => updatePlan(planIndex, 'price', Number(e.target.value))}
                                            className="w-24 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-slate-400">/ay</span>
                                    </div>

                                    <div className="flex items-center gap-4 mb-4">
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={plan.popular}
                                                onChange={(e) => updatePlan(planIndex, 'popular', e.target.checked)}
                                                className="rounded"
                                            />
                                            <span className="text-slate-300">Popüler</span>
                                        </label>
                                    </div>

                                    <input
                                        type="text"
                                        value={plan.tag || ''}
                                        onChange={(e) => updatePlan(planIndex, 'tag', e.target.value || null)}
                                        placeholder="Etiket (ör: EN POPÜLER)"
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Features */}
                                <div className="space-y-2 mb-4">
                                    <h4 className="text-sm font-medium text-slate-400 mb-2">Özellikler</h4>
                                    {plan.features.map((feature, featureIndex) => (
                                        <div key={featureIndex} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={feature}
                                                onChange={(e) => updateFeature(planIndex, featureIndex, e.target.value)}
                                                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                onClick={() => removeFeature(planIndex, featureIndex)}
                                                className="p-2 text-red-400 hover:bg-red-500/20 rounded transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addFeature(planIndex)}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-blue-500/20 rounded-lg transition w-full"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Özellik Ekle
                                    </button>
                                </div>

                                {/* Plan ID (readonly) */}
                                <div className="pt-4 border-t border-slate-700">
                                    <p className="text-xs text-slate-500">
                                        Plan ID: <code className="text-slate-400">{plan.id}</code>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Info */}
                <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <h4 className="font-medium text-blue-300 mb-2">Bilgi</h4>
                    <p className="text-slate-400 text-sm">
                        Burada yaptığınız değişiklikler anasayfadaki fiyatlandırma bölümünü güncelleyecektir.
                        Plan ID&apos;leri sistem tarafından kullanıldığından değiştirilemez.
                    </p>
                </div>
            </main>
        </div>
    )
}
