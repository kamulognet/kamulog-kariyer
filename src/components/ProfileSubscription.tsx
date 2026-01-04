'use client'

import { useState, useEffect } from 'react'
import { Crown, Package, Clock, CheckCircle, XCircle, AlertCircle, Coins, Calendar } from 'lucide-react'

interface Subscription {
    id: string
    plan: string
    status: string
    orderCode: string | null
    expiresAt: string | null
    createdAt: string
}

interface Order {
    id: string
    orderNumber: string
    plan: string
    amount: number
    status: string
    createdAt: string
}

interface ProfileSubscriptionProps {
    userId?: string
}

const planNames: Record<string, string> = {
    FREE: 'Ücretsiz',
    BASIC: 'Plus',
    PREMIUM: 'Premium'
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    ACTIVE: { label: 'Aktif', color: 'green', icon: CheckCircle },
    PENDING: { label: 'Beklemede', color: 'yellow', icon: Clock },
    EXPIRED: { label: 'Süresi Doldu', color: 'red', icon: XCircle },
    CANCELLED: { label: 'İptal Edildi', color: 'slate', icon: XCircle },
    COMPLETED: { label: 'Tamamlandı', color: 'green', icon: CheckCircle },
    REFUNDED: { label: 'İade Edildi', color: 'orange', icon: AlertCircle },
}

export default function ProfileSubscription({ userId }: ProfileSubscriptionProps) {
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [credits, setCredits] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const res = await fetch('/api/user/subscription')
            const data = await res.json()
            setSubscription(data.subscription)
            setOrders(data.orders || [])
            setCredits(data.credits || 0)
        } catch (error) {
            console.error('Error loading subscription:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    const currentStatus = subscription ? statusConfig[subscription.status] || statusConfig.PENDING : null
    const StatusIcon = currentStatus?.icon || Clock

    return (
        <div className="space-y-8">
            {/* Current Subscription */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-purple-400" />
                    Mevcut Abonelik
                </h3>

                <div className={`p-6 rounded-xl border ${subscription?.status === 'ACTIVE'
                        ? 'bg-green-500/10 border-green-500/30'
                        : subscription?.status === 'PENDING'
                            ? 'bg-yellow-500/10 border-yellow-500/30'
                            : 'bg-slate-800/50 border-slate-700'
                    }`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${subscription?.plan === 'PREMIUM' ? 'bg-purple-500/20' :
                                    subscription?.plan === 'BASIC' ? 'bg-blue-500/20' : 'bg-slate-500/20'
                                }`}>
                                <Crown className={`w-6 h-6 ${subscription?.plan === 'PREMIUM' ? 'text-purple-400' :
                                        subscription?.plan === 'BASIC' ? 'text-blue-400' : 'text-slate-400'
                                    }`} />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-white">
                                    {planNames[subscription?.plan || 'FREE'] || subscription?.plan}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <StatusIcon className={`w-4 h-4 text-${currentStatus?.color}-400`} />
                                    <span className={`text-sm text-${currentStatus?.color}-400`}>
                                        {currentStatus?.label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            {/* Credits */}
                            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                                <Coins className="w-5 h-5 text-yellow-400" />
                                <span className="text-yellow-400 font-bold">{credits}</span>
                                <span className="text-yellow-400/70 text-sm">Jeton</span>
                            </div>

                            {/* Expiry */}
                            {subscription?.expiresAt && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-300 text-sm">
                                        Bitiş: {new Date(subscription.expiresAt).toLocaleDateString('tr-TR')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Bar */}
                    {subscription?.status === 'PENDING' && (
                        <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                            <div className="flex items-center gap-2 text-yellow-400 text-sm">
                                <Clock className="w-4 h-4" />
                                Ödemeniz onay bekliyor. Onaylandıktan sonra jetonlarınız hesabınıza yüklenecektir.
                            </div>
                        </div>
                    )}

                    {subscription?.orderCode && (
                        <div className="mt-4 text-sm text-slate-400">
                            Sipariş Kodu: <span className="font-mono text-white">{subscription.orderCode}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Order History */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-400" />
                    Sipariş Geçmişi
                </h3>

                {orders.length === 0 ? (
                    <div className="p-8 bg-slate-800/30 rounded-xl border border-slate-700 text-center">
                        <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">Henüz sipariş bulunmuyor</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map((order) => {
                            const orderStatus = statusConfig[order.status] || statusConfig.PENDING
                            const OrderIcon = orderStatus.icon

                            return (
                                <div key={order.id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${orderStatus.color}-500/20`}>
                                                <OrderIcon className={`w-5 h-5 text-${orderStatus.color}-400`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">
                                                    {planNames[order.plan] || order.plan} Paketi
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                                                        day: '2-digit',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className="font-mono text-sm text-slate-400">{order.orderNumber}</span>
                                            <span className="font-bold text-white">{order.amount.toLocaleString('tr-TR')} ₺</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${orderStatus.color}-500/20 text-${orderStatus.color}-400`}>
                                                {orderStatus.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar for Pending */}
                                    {order.status === 'PENDING' && (
                                        <div className="mt-4">
                                            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                                                <span>Sipariş Alındı</span>
                                                <span>Ödeme Bekleniyor</span>
                                                <span>Aktifleştirme</span>
                                            </div>
                                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full w-1/3 bg-yellow-500 rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
