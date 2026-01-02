'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface CV {
    id: string
    title: string
}

interface JobListing {
    id: string
    title: string
    company: string
    description: string
    requirements: string | null
}

interface AnalysisResult {
    score: number
    feedback: string
}

export default function JobAnalyzePage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const { id: jobId } = useParams()

    const [cvs, setCvs] = useState<CV[]>([])
    const [job, setJob] = useState<JobListing | null>(null)
    const [selectedCvId, setSelectedCvId] = useState('')
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    useEffect(() => {
        loadInitialData()
    }, [])

    const loadInitialData = async () => {
        try {
            const [cvsRes, jobsRes] = await Promise.all([
                fetch('/api/cv'),
                fetch('/api/jobs') // Tümünü çekip filterlayalım veya yeni endpoint
            ])
            const [cvsData, jobsData] = await Promise.all([cvsRes.json(), jobsRes.json()])

            setCvs(cvsData.cvs || [])
            setJob(jobsData.jobs?.find((j: any) => j.id === jobId) || null)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAnalyze = async () => {
        if (!selectedCvId) return
        setAnalyzing(true)
        setResult(null)
        try {
            const res = await fetch('/api/jobs/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cvId: selectedCvId, jobId }),
            })
            const data = await res.json()
            if (data.analysis) {
                setResult({
                    score: data.analysis.score,
                    feedback: data.analysis.feedback
                })
            }
        } catch (error) {
            console.error('Analysis error:', error)
        } finally {
            setAnalyzing(false)
        }
    }

    if (loading || status === 'loading') {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        )
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white p-8">
                <p>İlan bulunamadı.</p>
                <Link href="/dashboard/jobs" className="text-blue-400">Geri Dön</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <Link
                    href="/dashboard/jobs"
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    İlanlara Dön
                </Link>

                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">{job.title}</h1>
                    <p className="text-blue-400 font-medium mb-6">{job.company}</p>

                    <div className="space-y-4 text-slate-300 mb-8 pb-8 border-b border-slate-700">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">İş Tanımı</h3>
                            <p>{job.description}</p>
                        </div>
                        {job.requirements && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Aranan Özellikler</h3>
                                <p>{job.requirements}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Uyumluluk Analizi Başlat</h3>
                        <p className="text-sm text-slate-400 mb-4">
                            Bu ilan için hangi CV'nizi test etmek istersiniz?
                        </p>

                        <div className="flex flex-col md:flex-row gap-4">
                            <select
                                value={selectedCvId}
                                onChange={(e) => setSelectedCvId(e.target.value)}
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">CV Seçin...</option>
                                {cvs.map((cv) => (
                                    <option key={cv.id} value={cv.id}>{cv.title}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleAnalyze}
                                disabled={!selectedCvId || analyzing}
                                className="px-8 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition flex items-center gap-2 justify-center"
                            >
                                {analyzing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Analiz Ediliyor...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Analizi Başlat
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {result && (
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white">Analiz Sonucu</h2>
                            <div className="bg-blue-600/20 px-4 py-2 rounded-full border border-blue-500/30">
                                <span className="text-3xl font-bold text-blue-400">{result.score}</span>
                                <span className="text-blue-500 text-lg">/100</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="text-white font-semibold mb-2">Yapay Zeka Değerlendirmesi</h4>
                                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {result.feedback}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                                    <div className="flex items-center gap-2 text-green-400 font-semibold mb-2">
                                        <CheckCircle2 className="w-5 h-5" />
                                        Durum
                                    </div>
                                    <p className="text-slate-300 text-sm">
                                        {result.score >= 70
                                            ? "Bu ilan için oldukça güçlü bir adaysınız. Başvuru yapmanızı öneririz."
                                            : result.score >= 40
                                                ? "Orta düzeyde bir uyumluluk var. Geri bildirimlere göre CV'nizi güncellenebilir."
                                                : "Bu ilan gereksinimleri ile CV'niz arasında belirgin farklar var."}
                                    </p>
                                </div>
                                <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                                    <div className="flex items-center gap-2 text-purple-400 font-semibold mb-2">
                                        <Sparkles className="w-5 h-5" />
                                        İpucu
                                    </div>
                                    <p className="text-slate-300 text-sm">
                                        CV'nizdeki eksik becerileri tamamlamak için eğitim modüllerimize göz atabilirsiniz.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
