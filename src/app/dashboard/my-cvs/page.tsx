'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

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
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="text-slate-400 hover:text-white transition">
                                ← Anasayfa
                            </Link>
                            <h1 className="text-xl font-bold text-white">CV'lerim</h1>
                        </div>
                        <Link
                            href="/dashboard/cv-builder"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition"
                        >
                            + Yeni CV
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {cvs.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-6 bg-slate-800 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-white mb-2">Henüz CV'niz yok</h2>
                        <p className="text-slate-400 mb-6">AI asistanı ile ilk profesyonel CV'nizi oluşturun</p>
                        <Link
                            href="/dashboard/cv-builder"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            CV Oluştur
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cvs.map((cv) => (
                            <div
                                key={cv.id}
                                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden hover:border-slate-600 transition"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">{cv.title}</h3>
                                            <p className="text-sm text-slate-400">
                                                {new Date(cv.createdAt).toLocaleDateString('tr-TR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs font-medium rounded">
                                            {cv.template}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/dashboard/cv/${cv.id}`}
                                            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-center rounded-lg transition"
                                        >
                                            Görüntüle
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(cv.id)}
                                            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
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
