'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'

interface Subscription {
    id: string
    plan: string
    status: string
    orderCode: string | null
    expiresAt: string | null
    createdAt: string
    user: { id: string; name: string | null; email: string }
}

function SubscriptionsContent() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState(searchParams.get('status') || '')
    const [orderCodeInput, setOrderCodeInput] = useState('')

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (session?.user?.role !== 'ADMIN') {
            router.push('/dashboard')
        }
    }, [status, session, router])

    useEffect(() => {
        if (session?.user?.role === 'ADMIN') {
            loadSubscriptions()
        }
    }, [session, filter])

    const loadSubscriptions = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filter) params.set('status', filter)

            const res = await fetch(`/api/admin/subscriptions?${params}`)
            const data = await res.json()
            setSubscriptions(data.subscriptions || [])
        } catch (error) {
            console.error('Error loading subscriptions:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (id: string, plan: string) => {
        try {
            await fetch('/api/admin/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscriptionId: id, action: 'approve', plan, months: 1 }),
            })
            loadSubscriptions()
        } catch (error) {
            console.error('Error approving:', error)
        }
    }

    const handleReject = async (id: string) => {
        try {
            await fetch('/api/admin/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscriptionId: id, action: 'reject' }),
            })
            loadSubscriptions()
        } catch (error) {
            console.error('Error rejecting:', error)
        }
    }

    const handleActivateByCode = async () => {
        if (!orderCodeInput) return
        try {
            const res = await fetch('/api/admin/subscriptions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderCode: orderCodeInput, plan: 'BASIC', months: 1 }),
            })
            const data = await res.json()
            if (res.ok) {
                alert('Abonelik aktifleştirildi!')
                setOrderCodeInput('')
                loadSubscriptions()
            } else {
                alert(data.error || 'Hata oluştu')
            }
        } catch (error) {
            console.error('Error activating:', error)
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
                        <div className="flex items-center gap-8">
                            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                            <nav className="flex gap-4">
                                <Link href="/admin" className="text-slate-400 hover:text-white transition">
                                    Anasayfa
                                </Link>
                                <Link href="/admin/users" className="text-slate-400 hover:text-white transition">
                                    Kullanıcılar
                                </Link>
                                <Link href="/admin/subscriptions" className="text-purple-400 font-medium">
                                    Abonelikler
                                </Link>
                            </nav>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Abonelikler</h2>
                    <div className="flex gap-4">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">Tümü</option>
                            <option value="PENDING">Bekleyen</option>
                            <option value="ACTIVE">Aktif</option>
                            <option value="EXPIRED">Süresi Dolmuş</option>
                        </select>
                    </div>
                </div>

                {/* Order Code Activation */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Sipariş Kodu ile Aktivasyon</h3>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={orderCodeInput}
                            onChange={(e) => setOrderCodeInput(e.target.value)}
                            placeholder="Sipariş kodunu girin..."
                            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                            onClick={handleActivateByCode}
                            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition"
                        >
                            Aktifleştir
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Kullanıcı</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Plan</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Durum</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Sipariş Kodu</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Bitiş</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        Yükleniyor...
                                    </td>
                                </tr>
                            ) : subscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        Abonelik bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                subscriptions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-slate-700/50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-white">{sub.user.name || '-'}</p>
                                                <p className="text-sm text-slate-400">{sub.user.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${sub.plan === 'PREMIUM' ? 'bg-purple-500/20 text-purple-400' :
                                                sub.plan === 'BASIC' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-slate-500/20 text-slate-400'
                                                }`}>
                                                {sub.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${sub.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                                                sub.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    sub.status === 'EXPIRED' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-slate-500/20 text-slate-400'
                                                }`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300 font-mono text-sm">
                                            {sub.orderCode || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm">
                                            {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString('tr-TR') : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {sub.status === 'PENDING' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApprove(sub.id, 'BASIC')}
                                                        className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-sm rounded transition"
                                                    >
                                                        Onayla
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(sub.id)}
                                                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded transition"
                                                    >
                                                        Reddet
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    )
}

export default function AdminSubscriptionsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        }>
            <SubscriptionsContent />
        </Suspense>
    )
}
