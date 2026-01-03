'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import PanelHeader from '@/components/PanelHeader'
import { FileText, Plus, Trash2, Eye } from 'lucide-react'

interface CV {
    id: string
    title: string
    template: string
    createdAt: string
    updatedAt: string
}

export default function MyCVsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [cvs, setCvs] = useState<CV[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    useEffect(() => {
        if (session?.user) {
            loadCVs()
        }
    }, [session])

    const loadCVs = async () => {
        try {
            const res = await fetch('/api/cv')
            const data = await res.json()
            setCvs(data.cvs || [])
        } catch (error) {
            console.error('Error loading CVs:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bu CV\'yi silmek istediğinize emin misiniz?')) return

        try {
            await fetch(`/api/cv/${id}`, { method: 'DELETE' })
            setCvs(cvs.filter(cv => cv.id !== id))
        } catch (error) {
            console.error('Delete error:', error)
        }
    }

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <PanelHeader />

            {/* Main */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <FileText className="w-6 h-6 text-blue-400" />
                            CV'lerim
                        </h1>
                        <p className="text-slate-400">Oluşturduğunuz tüm profesyonel CV'ler</p>
                    </div>
                    <Link
                        href="/panel/cv-olustur"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni CV
                    </Link>
                </div>

                {cvs.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700">
                        <div className="w-20 h-20 mx-auto mb-6 bg-slate-800 rounded-full flex items-center justify-center">
                            <FileText className="w-10 h-10 text-slate-600" />
                        </div>
                        <h2 className="text-2xl font-semibold text-white mb-2">Henüz CV'niz yok</h2>
                        <p className="text-slate-400 mb-8">AI asistanı ile ilk profesyonel CV'nizi oluşturun</p>
                        <Link
                            href="/panel/cv-olustur"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg shadow-blue-500/20"
                        >
                            <Plus className="w-5 h-5" />
                            CV Oluşturmaya Başla
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cvs.map((cv) => (
                            <div
                                key={cv.id}
                                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden hover:border-slate-500 transition group"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <span className="px-2.5 py-1 bg-slate-700 text-slate-300 text-xs font-bold rounded-lg uppercase tracking-wider">
                                            {cv.template}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition">{cv.title}</h3>
                                    <p className="text-sm text-slate-400 mb-6">
                                        Oluşturma: {new Date(cv.createdAt).toLocaleDateString('tr-TR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>

                                    <div className="flex gap-3">
                                        <Link
                                            href={`/panel/cv/${cv.id}`}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Görüntüle
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(cv.id)}
                                            className="px-4 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl transition"
                                            title="Sil"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
