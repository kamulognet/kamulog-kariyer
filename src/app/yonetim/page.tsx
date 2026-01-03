'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Users,
    FileText,
    CreditCard,
    Briefcase,
    ShoppingCart,
    TrendingUp,
    Clock,
    AlertCircle,
    CheckCircle,
    Activity
} from 'lucide-react'

interface Stats {
    users: { total: number; today: number; weekly: number; monthly: number }
    cvs: { total: number }
    subscriptions: { total: number; active: number; pending: number; byPlan: Record<string, number> }
    jobs?: { total: number; public: number; private: number }
    sales?: { total: number; revenue: number }
    logs?: { today: number }
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        try {
            const res = await fetch('/api/admin/stats')
            const data = await res.json()
            setStats(data)
        } catch (error) {
            console.error('Error loading stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Anasayfa</h1>
                <p className="text-slate-400">Genel bakış ve istatistikler</p>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-200 text-sm">Toplam Kullanıcı</p>
                            <p className="text-3xl font-bold text-white mt-1">{stats?.users.total || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <p className="text-blue-200 text-sm mt-3">
                        Bugün: <span className="text-white font-medium">+{stats?.users.today || 0}</span>
                    </p>
                </div>

                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-200 text-sm">Aktif Abonelik</p>
                            <p className="text-3xl font-bold text-white mt-1">{stats?.subscriptions.active || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <p className="text-green-200 text-sm mt-3">
                        Toplam: {stats?.subscriptions.total || 0}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-200 text-sm">Bekleyen Onay</p>
                            <p className="text-3xl font-bold text-white mt-1">{stats?.subscriptions.pending || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <Link href="/admin/subscriptions?status=PENDING" className="text-yellow-200 text-sm mt-3 block hover:underline">
                        Görüntüle →
                    </Link>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-200 text-sm">Toplam CV</p>
                            <p className="text-3xl font-bold text-white mt-1">{stats?.cvs.total || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Plan Dağılımı */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-purple-400" />
                        Plan Dağılımı
                    </h3>
                    <div className="space-y-4">
                        {['FREE', 'BASIC', 'PREMIUM'].map((plan) => {
                            const count = stats?.subscriptions.byPlan?.[plan] || 0
                            const total = stats?.users.total || 1
                            const percentage = Math.round((count / total) * 100)
                            const colors = {
                                FREE: 'bg-slate-500',
                                BASIC: 'bg-blue-500',
                                PREMIUM: 'bg-purple-500',
                            }
                            return (
                                <div key={plan}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-400">{plan}</span>
                                        <span className="text-white font-medium">{count}</span>
                                    </div>
                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${colors[plan as keyof typeof colors]} transition-all duration-500`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Hızlı İşlemler */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-400" />
                        Hızlı İşlemler
                    </h3>
                    <div className="space-y-3">
                        <Link
                            href="/admin/subscriptions?status=PENDING"
                            className="block p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl hover:bg-yellow-500/20 transition"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-yellow-400">Bekleyen Onaylar</span>
                                <span className="bg-yellow-500 text-white text-sm px-2 py-1 rounded font-medium">
                                    {stats?.subscriptions.pending || 0}
                                </span>
                            </div>
                        </Link>
                        <Link
                            href="/admin/jobs"
                            className="block p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-blue-400">İş İlanları</span>
                                <span className="text-slate-400 text-sm">
                                    Yönet →
                                </span>
                            </div>
                        </Link>
                        <Link
                            href="/admin/logs"
                            className="block p-4 bg-slate-700/50 border border-slate-600 rounded-xl hover:bg-slate-700 transition"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-slate-300">Sistem Logları</span>
                                <span className="text-slate-400 text-sm">
                                    Görüntüle →
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Son Aktiviteler */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        Özet
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Briefcase className="w-5 h-5 text-orange-400" />
                                <span className="text-slate-300">İş İlanları</span>
                            </div>
                            <span className="text-white font-medium">{stats?.jobs?.total || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <ShoppingCart className="w-5 h-5 text-green-400" />
                                <span className="text-slate-300">Toplam Satış</span>
                            </div>
                            <span className="text-white font-medium">{stats?.sales?.total || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-blue-400" />
                                <span className="text-slate-300">Bu Hafta</span>
                            </div>
                            <span className="text-white font-medium">+{stats?.users.weekly || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-1">OpenAI Entegrasyonu</h4>
                            <p className="text-slate-400 text-sm">
                                Yapay zeka fonksiyonları <code className="text-purple-400 bg-purple-500/10 px-1 rounded">src/lib/openai.ts</code> dosyasında tanımlıdır.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-1">İş İlanları</h4>
                            <p className="text-slate-400 text-sm">
                                Kamu: {stats?.jobs?.public || 0} | Özel: {stats?.jobs?.private || 0}
                            </p>
                            <Link href="/admin/jobs" className="text-blue-400 text-sm hover:underline mt-1 inline-block">
                                İlanları Yönet →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
