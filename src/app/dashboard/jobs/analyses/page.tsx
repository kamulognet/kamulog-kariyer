'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowLeft, Loader2, Calendar, Briefcase, FileText } from 'lucide-react'

interface Analysis {
    id: string
    score: number
    feedback: string
    createdAt: string
    job: { title: string; company: string }
    cv: { title: string }
}

export default function AnalysesHistoryPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [analyses, setAnalyses] = useState<Analysis[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    useEffect(() => {
        loadAnalyses()
    }, [])

    const loadAnalyses = async () => {
        try {
            const res = await fetch('/api/jobs/analyze')
            const data = await res.json()
            setAnalyses(data.analyses || [])
        } catch (error) {
            console.error('Error loading analyses:', error)
        } finally {
            setLoading(false)
        }
    }

    if (status === 'loading') return null

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 py-8">
            <main className="max-w-5xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link
                            href="/dashboard/jobs"
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            İlanlara Dön
                        </Link>
                        <h1 className="text-3xl font-bold text-white">Geçmiş Analizlerim</h1>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                        <p className="text-slate-400">Yükleniyor...</p>
                    </div>
                ) : analyses.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-slate-700">
                        <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Henüz analiz bulunmuyor</h3>
                        <p className="text-slate-400 mb-6">İş ilanlarını inceleyerek CV'niz ile ne kadar uyumlu olduğunu test edebilirsiniz.</p>
                        <Link
                            href="/dashboard/jobs"
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition"
                        >
                            İlanları Keşfet
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {analyses.map((analysis) => (
                            <div key={analysis.id} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-white">{analysis.job.title}</h3>
                                            <div className="flex items-center gap-1 bg-blue-600/20 px-2 py-0.5 rounded border border-blue-500/30">
                                                <span className="text-blue-400 font-bold">{analysis.score}</span>
                                                <span className="text-blue-500 text-xs">/100</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-slate-400 text-sm mb-4">
                                            <div className="flex items-center gap-1">
                                                <Briefcase className="w-4 h-4" />
                                                {analysis.job.company}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FileText className="w-4 h-4" />
                                                CV: {analysis.cv.title}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(analysis.createdAt).toLocaleDateString('tr-TR')}
                                            </div>
                                        </div>

                                        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                                            <p className="text-slate-300 text-sm line-clamp-3">
                                                {analysis.feedback}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <button
                                            onClick={() => alert('Detaylı rapor yakında!')}
                                            className="w-full md:w-auto px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition"
                                        >
                                            Raporu Gör
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
