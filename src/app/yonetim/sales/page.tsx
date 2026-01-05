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
    Trash2,
    RefreshCw,
    Calendar,
    User,
    CreditCard,
    CheckSquare,
    Square,
    AlertTriangle
} from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

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
    user: {
        id: string
        name: string | null
        email: string
        phoneNumber: string | null
        address: string | null
        city: string | null
        district: string | null
        taxNumber: string | null
        taxOffice: string | null
    }
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
    const { showSuccess, showError } = useToast()
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

    // Bulk selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [showBulkConfirm, setShowBulkConfirm] = useState(false)
    const [bulkAction, setBulkAction] = useState<'delete' | 'status' | null>(null)
    const [bulkStatus, setBulkStatus] = useState('COMPLETED')

    // Create form
    const [createForm, setCreateForm] = useState({
        userId: '',
        plan: 'BASIC',
        amount: 350, // Default Basic price
        paymentMethod: 'HAVALE',
        notes: '',
    })

    // Update amount when plan changes
    useEffect(() => {
        if (createForm.plan === 'BASIC') {
            setCreateForm(prev => ({ ...prev, amount: 350 }))
        } else if (createForm.plan === 'PREMIUM') {
            setCreateForm(prev => ({ ...prev, amount: 1000 }))
        }
    }, [createForm.plan])

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
        if (!selectedUser || (createForm.amount !== 0 && !createForm.amount)) {
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
                    amount: 350,
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

    const handleDeleteSale = async (id: string, orderNumber: string) => {
        if (!confirm(`${orderNumber} sipariş nolu kaydı silmek istediğinize emin misiniz?`)) {
            return
        }

        try {
            const res = await fetch(`/api/admin/sales?id=${id}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                showSuccess('Satış kaydı silindi')
                loadSales()
            } else {
                const data = await res.json()
                showError(data.error || 'Silme başarısız')
            }
        } catch (error) {
            console.error('Error deleting sale:', error)
            showError('Bir hata oluştu')
        }
    }

    // Bulk selection helpers
    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setSelectedIds(newSet)
    }

    const toggleSelectAll = () => {
        if (selectedIds.size === sales.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(sales.map(s => s.id)))
        }
    }

    const handleBulkAction = async () => {
        if (selectedIds.size === 0) return

        try {
            const ids = Array.from(selectedIds)

            if (bulkAction === 'delete') {
                const res = await fetch('/api/admin/sales', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'bulk_delete', ids })
                })
                if (res.ok) {
                    showSuccess(`${ids.length} kayıt silindi`)
                    setSelectedIds(new Set())
                    loadSales()
                } else {
                    showError('Toplu silme başarısız')
                }
            } else if (bulkAction === 'status') {
                const res = await fetch('/api/admin/sales', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'bulk_status', ids, status: bulkStatus })
                })
                if (res.ok) {
                    showSuccess(`${ids.length} kayıt güncellendi`)
                    if (bulkStatus === 'COMPLETED') {
                        showSuccess('Abonelikler aktifleştirildi!')
                    }
                    setSelectedIds(new Set())
                    loadSales()
                } else {
                    showError('Toplu güncelleme başarısız')
                }
            }
        } catch (error) {
            console.error('Bulk action error:', error)
            showError('Bir hata oluştu')
        } finally {
            setShowBulkConfirm(false)
            setBulkAction(null)
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

            {/* Bulk Action Bar */}
            {selectedIds.size > 0 && (
                <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CheckSquare className="w-5 h-5 text-purple-400" />
                        <span className="text-white font-medium">{selectedIds.size} kayıt seçildi</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={bulkStatus}
                            onChange={(e) => setBulkStatus(e.target.value)}
                            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                        >
                            <option value="COMPLETED">Tamamlandı</option>
                            <option value="PENDING">Bekliyor</option>
                            <option value="CANCELLED">İptal</option>
                        </select>
                        <button
                            onClick={() => { setBulkAction('status'); setShowBulkConfirm(true) }}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition"
                        >
                            Durum Güncelle
                        </button>
                        <button
                            onClick={() => { setBulkAction('delete'); setShowBulkConfirm(true) }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Toplu Sil
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Confirm Modal */}
            {showBulkConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Emin misiniz?</h3>
                        </div>
                        <p className="text-slate-400 mb-6">
                            {bulkAction === 'delete'
                                ? `${selectedIds.size} kayıt kalıcı olarak silinecek.`
                                : `${selectedIds.size} kaydın durumu "${bulkStatus}" olarak güncellenecek${bulkStatus === 'COMPLETED' ? ' ve abonelikler aktifleştirilecek' : ''}.`
                            }
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => { setShowBulkConfirm(false); setBulkAction(null) }}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleBulkAction}
                                className={`px-4 py-2 rounded-lg transition font-medium ${bulkAction === 'delete'
                                    ? 'bg-red-600 hover:bg-red-500 text-white'
                                    : 'bg-green-600 hover:bg-green-500 text-white'
                                    }`}
                            >
                                {bulkAction === 'delete' ? 'Sil' : 'Güncelle'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sales Table */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-4 text-left">
                                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white transition">
                                        {selectedIds.size === sales.length && sales.length > 0 ? (
                                            <CheckSquare className="w-5 h-5 text-purple-400" />
                                        ) : (
                                            <Square className="w-5 h-5" />
                                        )}
                                    </button>
                                </th>
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
                                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                                        Yükleniyor...
                                    </td>
                                </tr>
                            ) : sales.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                                        Satış kaydı bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                sales.map((sale) => (
                                    <tr key={sale.id} className={`hover:bg-slate-700/30 transition ${selectedIds.has(sale.id) ? 'bg-purple-900/20' : ''}`}>
                                        <td className="px-4 py-4">
                                            <button onClick={() => toggleSelect(sale.id)} className="text-slate-400 hover:text-white transition">
                                                {selectedIds.has(sale.id) ? (
                                                    <CheckSquare className="w-5 h-5 text-purple-400" />
                                                ) : (
                                                    <Square className="w-5 h-5" />
                                                )}
                                            </button>
                                        </td>
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
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedSale(sale)}
                                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                                                    title="Detay"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSale(sale.id, sale.orderNumber)}
                                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                                    title="Sil"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
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
                                        onChange={(e) => setCreateForm({ ...createForm, amount: Number(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                        placeholder="0"
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

                            {/* Fatura Bilgileri */}
                            <div className="pt-4 border-t border-slate-700">
                                <h3 className="text-sm font-semibold text-purple-400 mb-3">📋 Fatura Bilgileri</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <label className="text-slate-500">Telefon</label>
                                        <p className="text-white">{selectedSale.user.phoneNumber || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-slate-500">Şehir / İlçe</label>
                                        <p className="text-white">
                                            {selectedSale.user.city && selectedSale.user.district
                                                ? `${selectedSale.user.city} / ${selectedSale.user.district}`
                                                : selectedSale.user.city || '-'
                                            }
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-slate-500">Adres</label>
                                        <p className="text-white">{selectedSale.user.address || '-'}</p>
                                    </div>
                                    {(selectedSale.user.taxNumber || selectedSale.user.taxOffice) && (
                                        <>
                                            <div>
                                                <label className="text-slate-500">Vergi No</label>
                                                <p className="text-white">{selectedSale.user.taxNumber || '-'}</p>
                                            </div>
                                            <div>
                                                <label className="text-slate-500">Vergi Dairesi</label>
                                                <p className="text-white">{selectedSale.user.taxOffice || '-'}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
