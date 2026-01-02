'use client'

import { useState, useEffect } from 'react'
import {
    Search,
    Filter,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    Plus,
    Eye,
    Edit2,
    RefreshCw,
    Calendar,
    User,
    CreditCard
} from 'lucide-react'

interface SalesRecord {
    id: string
    orderNumber: string
    userId: string
    subscriptionId: string | null
    plan: string
    amount: number
    currency: string
    paymentMethod: string | null
    status: string
    notes: string | null
    createdAt: string
    user: { id: string; name: string | null; email: string; phoneNumber: string | null }
}

interface Pagination {
    page: number
    limit: number
    total: number
    pages: number
}

interface Stats {
    totalRevenue: number
    totalSales: number
    byPlan: Record<string, { revenue: number; count: number }>
}

const statusColors: Record<string, string> = {
    COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
    PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
    REFUNDED: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

const planColors: Record<string, string> = {
    BASIC: 'bg-blue-500/20 text-blue-400',
    PREMIUM: 'bg-purple-500/20 text-purple-400',
}

export default function AdminSalesPage() {
    const [sales, setSales] = useState<SalesRecord[]>([])
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)

    // Filters
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [planFilter, setPlanFilter] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedSale, setSelectedSale] = useState<SalesRecord | null>(null)

    // Create form
    const [createForm, setCreateForm] = useState({
        userId: '',
        plan: 'BASIC',
        amount: '',
        paymentMethod: 'HAVALE',
        notes: '',
    })

    // User search for create modal
    const [userSearch, setUserSearch] = useState('')
    const [userSearchResults, setUserSearchResults] = useState<any[]>([])
    const [selectedUser, setSelectedUser] = useState<any>(null)

    useEffect(() => {
        loadSales()
    }, [page, statusFilter, planFilter, startDate, endDate])

    const loadSales = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: '25',
            })
            if (search) params.set('search', search)
            if (statusFilter) params.set('status', statusFilter)
            if (planFilter) params.set('plan', planFilter)
            if (startDate) params.set('startDate', startDate)
            if (endDate) params.set('endDate', endDate)

            const res = await fetch(`/api/admin/sales?${params}`)
            const data = await res.json()
            setSales(data.sales || [])
            setPagination(data.pagination)
            setStats(data.stats)
        } catch (error) {
            console.error('Error loading sales:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = () => {
        setPage(1)
        loadSales()
    }

    const searchUsers = async (query: string) => {
        if (query.length < 2) {
            setUserSearchResults([])
            return
        }
        try {
            const res = await fetch(`/api/admin/users?search=${query}&limit=5`)
            const data = await res.json()
            setUserSearchResults(data.users || [])
        } catch (error) {
            console.error('Error searching users:', error)
        }
    }

    const handleCreateSale = async () => {
        if (!selectedUser || !createForm.amount) {
            alert('Kullanıcı ve tutar zorunludur')
            return
        }

        try {
            const res = await fetch('/api/admin/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    plan: createForm.plan,
                    amount: createForm.amount,
                    paymentMethod: createForm.paymentMethod,
                    notes: createForm.notes,
                }),
            })

            if (res.ok) {
                setShowCreateModal(false)
                setSelectedUser(null)
                setCreateForm({
                    userId: '',
                    plan: 'BASIC',
                    amount: '',
                    paymentMethod: 'HAVALE',
                    notes: '',
                })
                loadSales()
            } else {
                const data = await res.json()
                alert(data.error || 'Hata oluştu')
            }
        } catch (error) {
            console.error('Error creating sale:', error)
        }
    }

    const updateSaleStatus = async (id: string, status: string) => {
        try {
            await fetch('/api/admin/sales', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status }),
            })
            loadSales()
        } catch (error) {
            console.error('Error updating sale:', error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Satış Kayıtları</h1>
                    <p className="text-slate-400">Abonelik satışlarını görüntüleyin ve yönetin</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition"
                >
                    <Plus className="w-4 h-4" />
                    Manuel Satış Ekle
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-200 text-sm">Toplam Gelir</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    ₺{stats.totalRevenue.toLocaleString('tr-TR')}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-sm">Toplam Satış</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.totalSales}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">BASIC Satışlar</p>
                                <p className="text-2xl font-bold text-white mt-1">
                                    {stats.byPlan?.BASIC?.count || 0}
                                </p>
                                <p className="text-blue-400 text-sm">
                                    ₺{(stats.byPlan?.BASIC?.revenue || 0).toLocaleString('tr-TR')}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">PREMIUM Satışlar</p>
                                <p className="text-2xl font-bold text-white mt-1">
                                    {stats.byPlan?.PREMIUM?.count || 0}
                                </p>
                                <p className="text-purple-400 text-sm">
                                    ₺{(stats.byPlan?.PREMIUM?.revenue || 0).toLocaleString('tr-TR')}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-400" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <span className="text-white font-medium">Filtreler ve Arama</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Sipariş no, email, isim veya telefon..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                        className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="">Tüm Durumlar</option>
                        <option value="COMPLETED">Tamamlandı</option>
                        <option value="PENDING">Bekliyor</option>
                        <option value="CANCELLED">İptal</option>
                        <option value="REFUNDED">İade</option>
                    </select>
                    <select
                        value={planFilter}
                        onChange={(e) => { setPlanFilter(e.target.value); setPage(1) }}
                        className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="">Tüm Planlar</option>
                        <option value="BASIC">BASIC</option>
                        <option value="PREMIUM">PREMIUM</option>
                    </select>
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition"
                    >
                        Ara
                    </button>
                </div>
            </div>

            {/* Sales Table */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Sipariş No</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Kullanıcı</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Plan</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Tutar</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Ödeme</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Durum</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Tarih</th>
                                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                                        Yükleniyor...
                                    </td>
                                </tr>
                            ) : sales.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                                        Satış kaydı bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                sales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-slate-700/30 transition">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-purple-400">
                                                {sale.orderNumber}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-white text-sm">{sale.user.name || '-'}</p>
                                            <p className="text-slate-400 text-xs">{sale.user.email}</p>
                                            {sale.user.phoneNumber && (
                                                <p className="text-slate-500 text-xs">{sale.user.phoneNumber}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${planColors[sale.plan] || 'bg-slate-500/20 text-slate-400'}`}>
                                                {sale.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white font-medium">
                                                ₺{sale.amount.toLocaleString('tr-TR')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300 text-sm">
                                            {sale.paymentMethod || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={sale.status}
                                                onChange={(e) => updateSaleStatus(sale.id, e.target.value)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-medium border bg-transparent cursor-pointer ${statusColors[sale.status] || 'bg-slate-500/20 text-slate-400 border-slate-600'}`}
                                            >
                                                <option value="COMPLETED">Tamamlandı</option>
                                                <option value="PENDING">Bekliyor</option>
                                                <option value="CANCELLED">İptal</option>
                                                <option value="REFUNDED">İade</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm">
                                            {new Date(sale.createdAt).toLocaleDateString('tr-TR')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedSale(sale)}
                                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700 flex items-center justify-between">
                        <p className="text-sm text-slate-400">
                            {pagination.total} kayıttan {(page - 1) * pagination.limit + 1} - {Math.min(page * pagination.limit, pagination.total)} gösteriliyor
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="px-3 py-1 bg-slate-700 text-white rounded disabled:opacity-50"
                            >
                                ←
                            </button>
                            <span className="px-3 py-1 text-white">{page} / {pagination.pages}</span>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page === pagination.pages}
                                className="px-3 py-1 bg-slate-700 text-white rounded disabled:opacity-50"
                            >
                                →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Sale Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700">
                        <div className="p-6 border-b border-slate-700">
                            <h2 className="text-xl font-bold text-white">Manuel Satış Kaydı Oluştur</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* User Search */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Kullanıcı</label>
                                {selectedUser ? (
                                    <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700">
                                        <div>
                                            <p className="text-white">{selectedUser.name || selectedUser.email}</p>
                                            <p className="text-slate-400 text-sm">{selectedUser.email}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedUser(null)}
                                            className="text-slate-400 hover:text-white"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Email veya isim ile ara..."
                                            value={userSearch}
                                            onChange={(e) => {
                                                setUserSearch(e.target.value)
                                                searchUsers(e.target.value)
                                            }}
                                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                        />
                                        {userSearchResults.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg max-h-40 overflow-auto z-10">
                                                {userSearchResults.map((user) => (
                                                    <button
                                                        key={user.id}
                                                        onClick={() => {
                                                            setSelectedUser(user)
                                                            setUserSearch('')
                                                            setUserSearchResults([])
                                                        }}
                                                        className="w-full px-4 py-2 text-left hover:bg-slate-800"
                                                    >
                                                        <p className="text-white">{user.name || user.email}</p>
                                                        <p className="text-slate-400 text-xs">{user.email}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Plan</label>
                                    <select
                                        value={createForm.plan}
                                        onChange={(e) => setCreateForm({ ...createForm, plan: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                    >
                                        <option value="BASIC">BASIC</option>
                                        <option value="PREMIUM">PREMIUM</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Tutar (₺)</label>
                                    <input
                                        type="number"
                                        value={createForm.amount}
                                        onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Ödeme Yöntemi</label>
                                <select
                                    value={createForm.paymentMethod}
                                    onChange={(e) => setCreateForm({ ...createForm, paymentMethod: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                >
                                    <option value="HAVALE">Havale/EFT</option>
                                    <option value="KREDI_KARTI">Kredi Kartı</option>
                                    <option value="DIGER">Diğer</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Notlar</label>
                                <textarea
                                    value={createForm.notes}
                                    onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white resize-none"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false)
                                    setSelectedUser(null)
                                }}
                                className="px-4 py-2 text-slate-400 hover:text-white transition"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleCreateSale}
                                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition"
                            >
                                Oluştur
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sale Detail Modal */}
            {selectedSale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700">
                        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Satış Detayı</h2>
                            <button onClick={() => setSelectedSale(null)} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="text-center mb-6">
                                <p className="text-slate-400 text-sm">Sipariş Numarası</p>
                                <p className="text-3xl font-mono font-bold text-purple-400">{selectedSale.orderNumber}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-slate-400">Kullanıcı</label>
                                    <p className="text-white">{selectedSale.user.name || '-'}</p>
                                    <p className="text-slate-400 text-sm">{selectedSale.user.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400">Plan</label>
                                    <p className="text-white">{selectedSale.plan}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400">Tutar</label>
                                    <p className="text-white text-xl font-bold">₺{selectedSale.amount.toLocaleString('tr-TR')}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400">Durum</label>
                                    <p className={`inline-block px-2 py-1 rounded-lg text-sm ${statusColors[selectedSale.status]}`}>
                                        {selectedSale.status}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400">Ödeme Yöntemi</label>
                                    <p className="text-white">{selectedSale.paymentMethod || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400">Tarih</label>
                                    <p className="text-white">{new Date(selectedSale.createdAt).toLocaleString('tr-TR')}</p>
                                </div>
                            </div>
                            {selectedSale.notes && (
                                <div>
                                    <label className="text-sm text-slate-400">Notlar</label>
                                    <p className="text-slate-300 mt-1">{selectedSale.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
