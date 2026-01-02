'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Search, Building2, MapPin, Briefcase } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface JobListing {
    id: string
    title: string
    company: string
    location: string | null
    type: string
    createdAt: string
}

export default function AdminJobsPage() {
    const router = useRouter()
    const [jobs, setJobs] = useState<JobListing[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)

    // New job form state
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        type: 'PRIVATE',
        description: '',
        requirements: '',
        sourceUrl: ''
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
                    sourceUrl: ''
                })
                loadJobs()
            } else {
                alert('İlan eklenemedi')
            }
        } catch (error) {
            console.error('Create error:', error)
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
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
                >
                    <Plus className="w-4 h-4" />
                    Yeni İlan Ekle
                </button>
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
                                        <button
                                            onClick={() => handleDelete(job.id)}
                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
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
        </div>
    )
}
