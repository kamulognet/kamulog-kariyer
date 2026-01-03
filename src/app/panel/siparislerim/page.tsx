'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import PanelHeader from '@/components/PanelHeader'
import {
    Package,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
    CreditCard,
    Sparkles
} from 'lucide-react'
import Link from 'next/link'

interface Order {
    id: string
    plan: string
    amount: number
    status: string
    createdAt: string
    expiresAt?: string
}

export default function OrdersPage() {
    const { data: session } = useSession()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (session?.user?.id) {
            loadOrders()
        }
    }, [session])

    const loadOrders = async () => {
        try {
            const res = await fetch('/api/user/orders')
            const data = await res.json()
            if (Array.isArray(data)) {
                setOrders(data)
            }
        } catch (error) {
            console.error('Error loading orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Aktif
                    </span>
                )
            case 'PENDING':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-medium rounded-full">
                        <Clock className="w-3 h-3" />
                        Bekliyor
                    </span>
                )
            case 'EXPIRED':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-slate-500/10 text-slate-400 text-xs font-medium rounded-full">
                        <XCircle className="w-3 h-3" />
                        Sona Erdi
                    </span>
                )
            default:
                return (
                    <span className="px-2 py-1 bg-slate-500/10 text-slate-400 text-xs font-medium rounded-full">
                        {status}
                    </span>
                )
        }
    }

    const getPlanName = (plan: string) => {
        switch (plan) {
            case 'BASIC': return 'Profesyonel Yükseliş'
            case 'PREMIUM': return 'Kamu Lideri'
            default: return plan
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

            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Siparişlerim</h1>
                        <p className="text-slate-400">Geçmiş ve aktif abonelikleriniz</p>
                    </div>
                    <Link
                        href="/panel/satin-al"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:from-purple-500 hover:to-blue-500 transition"
                    >
                        <Sparkles className="w-4 h-4" />
                        Yeni Plan Al
                    </Link>
                </div>

                {/* Current Subscription */}
                {session?.user?.subscription?.status === 'ACTIVE' && (
                    <div className="mb-8 p-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                    <CreditCard className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Mevcut Planınız</p>
                                    <p className="text-xl font-bold text-white">{getPlanName(session.user.subscription.plan)}</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-green-500/10 text-green-400 text-sm font-medium rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Aktif
                            </span>
                        </div>
                    </div>
                )}

                {/* Orders List */}
                {orders.length === 0 ? (
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-12 text-center">
                        <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Henüz sipariş yok</h3>
                        <p className="text-slate-400 mb-6">Kariyer hedeflerinize ulaşmak için bir plan satın alın.</p>
                        <Link
                            href="/panel/satin-al"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-500 transition"
                        >
                            <Sparkles className="w-4 h-4" />
                            Planları İncele
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center">
                                            <Package className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{getPlanName(order.plan)}</h3>
                                            <p className="text-sm text-slate-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-white">{order.amount} TL</p>
                                        {getStatusBadge(order.status)}
                                    </div>
                                </div>
                                {order.expiresAt && (
                                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                                        <p className="text-sm text-slate-400">
                                            Bitiş Tarihi: <span className="text-white">{new Date(order.expiresAt).toLocaleDateString('tr-TR')}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
