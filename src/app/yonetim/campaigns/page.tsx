'use client'

import { useState, useEffect } from 'react'
import {
    Tag,
    Plus,
    Edit2,
    Trash2,
    Calendar,
    Percent,
    Gift,
    Search,
    Check,
    X,
    RefreshCw,
    Users
} from 'lucide-react'

interface Coupon {
    id: string
    code: string
    name: string | null
    discountType: string
    discountValue: number
    validFrom: string
    validUntil: string | null
    maxUsage: number | null
    usageCount: number
    planRestriction: string | null
    isActive: boolean
    createdAt: string
}

interface Stats {
    total: number
    active: number
    totalUsage: number
}

export default function AdminCampaignsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        discountType: 'PERCENT',
        discountValue: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        maxUsage: '',
        planRestriction: '',
        isActive: true
    })

    useEffect(() => {
        loadCoupons()
    }, [])

    const loadCoupons = async () => {
        try {
            const res = await fetch('/api/admin/campaigns')
            const data = await res.json()
            setCoupons(data.coupons || [])
            setStats(data.stats || null)
        } catch (error) {
            console.error('Load coupons error:', error)
        } finally {
            setLoading(false)
        }
    }

    const openNewModal = () => {
        setEditingCoupon(null)
        setFormData({
            code: '',
            name: '',
            discountType: 'PERCENT',
            discountValue: '',
            validFrom: new Date().toISOString().split('T')[0],
            validUntil: '',
            maxUsage: '',
            planRestriction: '',
            isActive: true
        })
        setShowModal(true)
        setError('')
    }

    const openEditModal = (coupon: Coupon) => {
        setEditingCoupon(coupon)
        setFormData({
            code: coupon.code,
            name: coupon.name || '',
            discountType: coupon.discountType,
            discountValue: coupon.discountValue.toString(),
            validFrom: coupon.validFrom.split('T')[0],
            validUntil: coupon.validUntil?.split('T')[0] || '',
            maxUsage: coupon.maxUsage?.toString() || '',
            planRestriction: coupon.planRestriction || '',
            isActive: coupon.isActive
        })
        setShowModal(true)
        setError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError('')

        try {
            const url = '/api/admin/campaigns'
            const method = editingCoupon ? 'PUT' : 'POST'
            const body = editingCoupon ? { id: editingCoupon.id, ...formData } : formData

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Bir hata oluştu')
                return
            }

            setSuccess(data.message)
            setShowModal(false)
            loadCoupons()
            setTimeout(() => setSuccess(''), 3000)
        } catch (error) {
            setError('Bir hata oluştu')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bu kuponu silmek istediğinize emin misiniz?')) return

        try {
            const res = await fetch(`/api/admin/campaigns?id=${id}`, { method: 'DELETE' })
            if (res.ok) {
                loadCoupons()
                setSuccess('Kupon silindi')
                setTimeout(() => setSuccess(''), 3000)
            }
        } catch (error) {
            setError('Silme işlemi başarısız')
        }
    }

    const toggleStatus = async (coupon: Coupon) => {
        try {
            await fetch('/api/admin/campaigns', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: coupon.id, isActive: !coupon.isActive })
            })
            loadCoupons()
        } catch (error) {
            console.error('Toggle status error:', error)
        }
    }

    const filteredCoupons = coupons.filter(c =>
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        (c.name && c.name.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Tag className="w-7 h-7 text-pink-500" />
                        Kampanyalar
                    </h1>
                    <p className="text-slate-400 mt-1">İndirim kuponları ve kampanyaları yönetin</p>
                </div>
                <button
                    onClick={openNewModal}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Yeni Kupon
                </button>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg">
                    {success}
                </div>
            )}

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                                <Tag className="w-5 h-5 text-pink-500" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Toplam Kupon</p>
                                <p className="text-2xl font-bold text-white">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <Check className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Aktif Kupon</p>
                                <p className="text-2xl font-bold text-white">{stats.active}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Toplam Kullanım</p>
                                <p className="text-2xl font-bold text-white">{stats.totalUsage}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Kupon kodu veya adı ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
            </div>

            {/* Coupons Table */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-800/80">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Kupon</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">İndirim</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Geçerlilik</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Kullanım</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Durum</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center">
                                        <RefreshCw className="w-6 h-6 text-slate-400 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredCoupons.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                        Kupon bulunamadı
                                    </td>
                                </tr>
                            ) : filteredCoupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-slate-700/30 transition">
                                    <td className="px-4 py-4">
                                        <div>
                                            <p className="font-mono font-bold text-pink-400">{coupon.code}</p>
                                            {coupon.name && <p className="text-sm text-slate-400">{coupon.name}</p>}
                                            {coupon.planRestriction && (
                                                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">
                                                    {coupon.planRestriction} için
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-lg font-bold text-white">
                                            {coupon.discountType === 'PERCENT' ? (
                                                <>%{coupon.discountValue}</>
                                            ) : (
                                                <>₺{coupon.discountValue}</>
                                            )}
                                        </span>
                                        {coupon.discountValue === 100 && coupon.discountType === 'PERCENT' && (
                                            <span className="ml-2 text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                                                Ücretsiz
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-sm">
                                        <div className="flex items-center gap-1 text-slate-400">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(coupon.validFrom).toLocaleDateString('tr-TR')}
                                        </div>
                                        {coupon.validUntil && (
                                            <div className="text-xs text-slate-500">
                                                → {new Date(coupon.validUntil).toLocaleDateString('tr-TR')}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-white font-medium">{coupon.usageCount}</span>
                                        {coupon.maxUsage && (
                                            <span className="text-slate-400"> / {coupon.maxUsage}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <button
                                            onClick={() => toggleStatus(coupon)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium transition ${coupon.isActive
                                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                }`}
                                        >
                                            {coupon.isActive ? 'Aktif' : 'Pasif'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(coupon)}
                                                className="p-2 text-slate-400 hover:text-blue-400 transition"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon.id)}
                                                className="p-2 text-slate-400 hover:text-red-400 transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {editingCoupon ? 'Kuponu Düzenle' : 'Yeni Kupon'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Kupon Kodu *</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="YILBASI2026"
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-mono"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Ad (Opsiyonel)</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Yılbaşı Kampanyası"
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">İndirim Tipi</label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
                                    >
                                        <option value="PERCENT">Yüzde (%)</option>
                                        <option value="FIXED">Sabit (₺)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">
                                        İndirim Değeri * {formData.discountType === 'PERCENT' ? '(%)' : '(₺)'}
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                        placeholder={formData.discountType === 'PERCENT' ? '50' : '100'}
                                        min="0"
                                        max={formData.discountType === 'PERCENT' ? '100' : undefined}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Başlangıç Tarihi</label>
                                    <input
                                        type="date"
                                        value={formData.validFrom}
                                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Bitiş Tarihi</label>
                                    <input
                                        type="date"
                                        value={formData.validUntil}
                                        onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Maks. Kullanım</label>
                                    <input
                                        type="number"
                                        value={formData.maxUsage}
                                        onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
                                        placeholder="Sınırsız"
                                        min="1"
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Plan Kısıtı</label>
                                    <select
                                        value={formData.planRestriction}
                                        onChange={(e) => setFormData({ ...formData, planRestriction: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
                                    >
                                        <option value="">Tüm Planlar</option>
                                        <option value="BASIC">Sadece Basic</option>
                                        <option value="PREMIUM">Sadece Premium</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-pink-500 focus:ring-pink-500"
                                />
                                <label htmlFor="isActive" className="text-sm text-slate-300">
                                    Kupon aktif
                                </label>
                            </div>

                            {formData.discountType === 'PERCENT' && parseFloat(formData.discountValue) === 100 && (
                                <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg text-sm">
                                    💡 %100 indirimli kuponlar otomatik olarak aboneliği aktifleştirir.
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition disabled:opacity-50"
                                >
                                    {saving ? 'Kaydediliyor...' : (editingCoupon ? 'Güncelle' : 'Oluştur')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
