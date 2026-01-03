'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Search, Building2, MapPin, Briefcase, RefreshCw, Download, Edit, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface JobListing {
    id: string
    title: string
    company: string
    location: string | null
    type: string
    description: string
    requirements: string | null
    sourceUrl: string | null
    applicationUrl: string | null
    deadline: string | null
    createdAt: string
}

export default function AdminJobsPage() {
    const router = useRouter()
    const [jobs, setJobs] = useState<JobListing[]>([])
    const [loading, setLoading] = useState(true)
    const [fetchLoading, setFetchLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingJob, setEditingJob] = useState<JobListing | null>(null)

    // New job form state
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        type: 'PRIVATE',
        description: '',
        requirements: '',
        sourceUrl: '',
        applicationUrl: '',
        salary: '',
        deadline: ''
    })

    useEffect(() => {
        loadJobs()
    }, [])

    const loadJobs = async () => {
        try {
            const res = await fetch('/api/jobs?type=ALL') // Admin API'si olmadığı için public API'den çekiyoruz, ilerde admin specific endpoint eklenebilir
            const data = await res.json()
            setJobs(data.jobs || [])
        } catch (error) {
            console.error('Error loading jobs:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bu ilanı silmek istediğinize emin misiniz?')) return

        try {
            const res = await fetch(`/api/jobs/${id}`, { // DELETE methodu api/jobs/[id] de olmalı
                method: 'DELETE',
            })

            if (res.ok) {
                setJobs(jobs.filter(j => j.id !== id))
            } else {
                alert('Silme işlemi başarısız')
            }
        } catch (error) {
            console.error('Delete error:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setShowModal(false)
                setFormData({
                    title: '',
                    company: '',
                    location: '',
                    type: 'PRIVATE',
                    description: '',
                    requirements: '',
                    sourceUrl: '',
                    applicationUrl: '',
                    salary: '',
                    deadline: ''
                })
                loadJobs()
            } else {
                alert('İlan eklenemedi')
            }
        } catch (error) {
            console.error('Create error:', error)
        }
    }

    const handleEdit = (job: JobListing) => {
        setEditingJob(job)
        setShowEditModal(true)
    }

    const handleUpdate = async () => {
        if (!editingJob) return

        try {
            const res = await fetch(`/api/jobs/${editingJob.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingJob)
            })

            if (res.ok) {
                setShowEditModal(false)
                setEditingJob(null)
                loadJobs()
            } else {
                alert('Güncelleme başarısız')
            }
        } catch (error) {
            console.error('Update error:', error)
        }
    }

    const handleFetchJobs = async () => {
        if (!confirm('İŞKUR\'dan örnek ilanlar çekilecek. Devam etmek istiyor musunuz?')) return

        setFetchLoading(true)
        try {
            const res = await fetch('/api/admin/jobs/fetch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: 50, source: 'iskur' })
            })
            const data = await res.json()
            if (res.ok) {
                alert(`✅ ${data.created} yeni ilan eklendi!`)
                loadJobs()
            } else {
                alert('İlanlar çekilemedi: ' + data.error)
            }
        } catch (error) {
            console.error('Fetch error:', error)
            alert('Bağlantı hatası')
        } finally {
            setFetchLoading(false)
        }
    }

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">İş İlanları Yönetimi</h1>
                    <p className="text-slate-400">Toplam {jobs.length} ilan listeleniyor</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleFetchJobs}
                        disabled={fetchLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg transition"
                    >
                        {fetchLoading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        İŞKUR'dan İlan Çek
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni İlan Ekle
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5">
                    <div className="text-blue-200 text-sm">Toplam İlan</div>
                    <div className="text-3xl font-bold text-white mt-1">{jobs.length}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-5">
                    <div className="text-orange-200 text-sm">Kamu İlanları</div>
                    <div className="text-3xl font-bold text-white mt-1">{jobs.filter(j => j.type === 'PUBLIC').length}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-5">
                    <div className="text-purple-200 text-sm">Özel Sektör</div>
                    <div className="text-3xl font-bold text-white mt-1">{jobs.filter(j => j.type === 'PRIVATE').length}</div>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-5">
                    <div className="text-green-200 text-sm">Bu Ay Eklenen</div>
                    <div className="text-3xl font-bold text-white mt-1">
                        {jobs.filter(j => new Date(j.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                    type="text"
                    placeholder="İlan başlığı veya şirket ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Table */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-slate-300">
                        <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Başlık / Şirket</th>
                                <th className="px-6 py-4">Konum</th>
                                <th className="px-6 py-4">Tür</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredJobs.map((job) => (
                                <tr key={job.id} className="hover:bg-slate-700/30 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-white">{job.title}</div>
                                        <div className="text-sm text-slate-400 flex items-center gap-1">
                                            <Building2 className="w-3 h-3" />
                                            {job.company}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-sm">
                                            <MapPin className="w-3 h-3" />
                                            {job.location || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded ${job.type === 'PUBLIC'
                                            ? 'bg-orange-500/20 text-orange-400'
                                            : 'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {job.type === 'PUBLIC' ? 'Kamu' : 'Özel'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex gap-1 justify-end">
                                            <button
                                                onClick={() => handleEdit(job)}
                                                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                                                title="Düzenle"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(job.id)}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                                title="Sil"
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

            {/* Add Job Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-700">
                            <h2 className="text-xl font-bold text-white">Yeni İlan Ekle</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Başlık</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Şirket/Kurum</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.company}
                                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Konum</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Tür</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                    >
                                        <option value="PRIVATE">Özel Sektör</option>
                                        <option value="PUBLIC">Kamu</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Açıklama</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Gereksinimler</label>
                                <textarea
                                    rows={3}
                                    value={formData.requirements}
                                    onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Başvuru Linki (Resmi Site)</label>
                                <input
                                    type="url"
                                    placeholder="https://kariyer.gov.tr/ilan/..."
                                    value={formData.applicationUrl}
                                    onChange={e => setFormData({ ...formData, applicationUrl: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                />
                                <p className="text-xs text-slate-500 mt-1">Kullanıcılar bu linke yönlendirilecek</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Son Başvuru Tarihi</label>
                                    <input
                                        type="date"
                                        value={formData.deadline}
                                        onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                    />
                                </div>
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
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition"
                                >
                                    Oluştur
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Job Modal */}
            {showEditModal && editingJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">İlanı Düzenle</h2>
                            <button
                                onClick={() => { setShowEditModal(false); setEditingJob(null) }}
                                className="p-2 hover:bg-slate-700 rounded-lg transition"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Başlık</label>
                                    <input
                                        type="text"
                                        value={editingJob.title}
                                        onChange={e => setEditingJob({ ...editingJob, title: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Şirket</label>
                                    <input
                                        type="text"
                                        value={editingJob.company}
                                        onChange={e => setEditingJob({ ...editingJob, company: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Konum</label>
                                    <input
                                        type="text"
                                        value={editingJob.location || ''}
                                        onChange={e => setEditingJob({ ...editingJob, location: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Tür</label>
                                    <select
                                        value={editingJob.type}
                                        onChange={e => setEditingJob({ ...editingJob, type: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                    >
                                        <option value="PRIVATE">Özel Sektör</option>
                                        <option value="PUBLIC">Kamu</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">İş Tanımı</label>
                                <textarea
                                    rows={3}
                                    value={editingJob.description || ''}
                                    onChange={e => setEditingJob({ ...editingJob, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Gereksinimler</label>
                                <textarea
                                    rows={3}
                                    value={editingJob.requirements || ''}
                                    onChange={e => setEditingJob({ ...editingJob, requirements: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Kaynak URL</label>
                                    <input
                                        type="url"
                                        value={editingJob.sourceUrl || ''}
                                        onChange={e => setEditingJob({ ...editingJob, sourceUrl: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-green-400 mb-1">🔗 Başvuru Linki</label>
                                    <input
                                        type="url"
                                        value={editingJob.applicationUrl || ''}
                                        onChange={e => setEditingJob({ ...editingJob, applicationUrl: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-900 border border-green-700 rounded-lg text-white"
                                        placeholder="https://basvuru.example.com"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">⏰ Son Başvuru Tarihi</label>
                                    <input
                                        type="date"
                                        value={editingJob.deadline ? editingJob.deadline.split('T')[0] : ''}
                                        onChange={e => setEditingJob({ ...editingJob, deadline: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-700">
                                <button
                                    onClick={() => { setShowEditModal(false); setEditingJob(null) }}
                                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition font-medium"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
