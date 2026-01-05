'use client'

import { useState, useEffect } from 'react'
import { Phone, MessageCircle, Plus, Save, Trash2, Edit2, User, Clock, Crown, X } from 'lucide-react'

interface Consultant {
    id: string
    name: string
    phone: string
    title: string
    description: string
    isActive: boolean
    createdAt: string
}

export default function AdminConsultantsPage() {
    const [consultants, setConsultants] = useState<Consultant[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState({
        name: '',
        phone: '',
        title: '',
        description: '',
        isActive: true
    })

    useEffect(() => {
        loadConsultants()
    }, [])

    const loadConsultants = async () => {
        try {
            const res = await fetch('/api/admin/consultants')
            if (res.ok) {
                const data = await res.json()
                setConsultants(data.consultants || [])
            }
        } catch (e) {
            console.error('Error loading consultants:', e)
        }
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const url = editingId ? `/api/admin/consultants/${editingId}` : '/api/admin/consultants'
            const method = editingId ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })

            if (res.ok) {
                loadConsultants()
                setShowModal(false)
                resetForm()
            }
        } catch (e) {
            console.error('Error saving consultant:', e)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bu danışmanı silmek istediğinize emin misiniz?')) return

        try {
            const res = await fetch(`/api/admin/consultants/${id}`, { method: 'DELETE' })
            if (res.ok) {
                loadConsultants()
            }
        } catch (e) {
            console.error('Error deleting consultant:', e)
        }
    }

    const openEdit = (consultant: Consultant) => {
        setForm({
            name: consultant.name,
            phone: consultant.phone,
            title: consultant.title,
            description: consultant.description,
            isActive: consultant.isActive
        })
        setEditingId(consultant.id)
        setShowModal(true)
    }

    const resetForm = () => {
        setForm({ name: '', phone: '', title: '', description: '', isActive: true })
        setEditingId(null)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">İş Danışmanları Yönetimi</h1>
                    <p className="text-slate-400">Premium aboneler için kariyer danışmanlarını yönetin</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true) }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
                >
                    <Plus className="w-4 h-4" />
                    Yeni Danışman Ekle
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="text-slate-400 text-sm">Toplam Danışman</div>
                    <div className="text-2xl font-bold text-white">{consultants.length}</div>
                </div>
                <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-4">
                    <div className="text-green-400 text-sm">Aktif</div>
                    <div className="text-2xl font-bold text-green-400">{consultants.filter(c => c.isActive).length}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="text-slate-400 text-sm">Pasif</div>
                    <div className="text-2xl font-bold text-slate-400">{consultants.filter(c => !c.isActive).length}</div>
                </div>
            </div>

            {/* Consultants List */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-900/50">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Danışman</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Telefon</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Unvan</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Durum</th>
                            <th className="text-right px-4 py-3 text-sm font-medium text-slate-400">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {consultants.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                                    Henüz danışman eklenmemiş
                                </td>
                            </tr>
                        ) : consultants.map(consultant => (
                            <tr key={consultant.id} className="hover:bg-slate-700/30">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                                            <User className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{consultant.name}</div>
                                            <div className="text-xs text-slate-500">{consultant.description?.slice(0, 50)}...</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <Phone className="w-4 h-4 text-purple-400" />
                                        {consultant.phone}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-300">{consultant.title}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${consultant.isActive
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-slate-500/20 text-slate-400'
                                        }`}>
                                        {consultant.isActive ? 'Aktif' : 'Pasif'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => openEdit(consultant)}
                                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(consultant.id)}
                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
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

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <h3 className="text-lg font-semibold text-white">
                                {editingId ? 'Danışman Düzenle' : 'Yeni Danışman Ekle'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Ad Soyad *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Telefon *</label>
                                <div className="flex">
                                    <span className="px-3 py-2 bg-slate-700 border border-r-0 border-slate-600 rounded-l-lg text-slate-300 text-sm">+90</span>
                                    <input
                                        type="tel"
                                        value={form.phone.replace(/^\+90/, '')}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                                            setForm({ ...form, phone: val ? `+90${val}` : '' })
                                        }}
                                        maxLength={10}
                                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-r-lg text-white"
                                        placeholder="5XX XXX XX XX"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Unvan *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                    placeholder="Örn: Kıdemli Kariyer Danışmanı"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Açıklama</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white min-h-[80px]"
                                    placeholder="Danışman hakkında kısa bilgi..."
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={form.isActive}
                                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-900"
                                />
                                <label htmlFor="isActive" className="text-sm text-slate-300">Aktif</label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-400 hover:text-white transition"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
                                >
                                    <Save className="w-4 h-4" />
                                    {editingId ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
