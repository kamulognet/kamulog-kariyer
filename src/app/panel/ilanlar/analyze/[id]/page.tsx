'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'
import InsufficientCreditsModal from '@/components/InsufficientCreditsModal'
import { ConsultantPromoCard } from '@/components/consultation/AskConsultantButton'

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
    sourceUrl?: string | null
    applicationUrl?: string | null
}

interface AnalysisResult {
    score: number
    feedback: string
}

interface InsufficientCreditsData {
    show: boolean
    required: number
    current: number
}

export default function JobAnalyzePage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const { id: jobId } = useParams()
    const { showTokenDeduction, showError } = useToast()

    const [cvs, setCvs] = useState<CV[]>([])
    const [job, setJob] = useState<JobListing | null>(null)
    const [selectedCvId, setSelectedCvId] = useState('')
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [loading, setLoading] = useState(true)
    const [notification, setNotification] = useState<{ show: boolean; type: 'info' | 'error' | 'success'; message: string }>({ show: false, type: 'info', message: '' })
    const [insufficientCredits, setInsufficientCredits] = useState<InsufficientCreditsData>({ show: false, required: 0, current: 0 })

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

            // Yetersiz jeton kontrolü
            if (res.status === 403 && data.required) {
                setInsufficientCredits({
                    show: true,
                    required: data.required,
                    current: data.credits || 0
                })
                return
            }

            if (!res.ok) {
                showError(data.error || 'Analiz yapılamadı')
                return
            }

            if (data.analysis) {
                setResult({
                    score: data.analysis.score,
                    feedback: data.analysis.feedback
                })
                // Jeton düşümünü anlık göster - sadece düşüm olduysa
                if (data.creditsUsed && data.creditsUsed > 0 && data.remainingCredits !== undefined) {
                    showTokenDeduction(data.creditsUsed, data.remainingCredits)
                }
            }
        } catch (error) {
            console.error('Analysis error:', error)
            showError('Bir hata oluştu')
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
                <Link href="/panel/ilanlar" className="text-blue-400">Geri Dön</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <Link
                    href="/panel/ilanlar"
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

                            {/* Kariyer Danışmanlığı Promo */}
                            <ConsultantPromoCard className="mt-4" />

                            {/* Başvuru Butonu - Her zaman göster */}
                            <div className="mt-6 pt-6 border-t border-slate-700 flex flex-col sm:flex-row gap-4 items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-slate-400 text-sm">
                                        {result.score >= 70
                                            ? "✅ CV'niz bu ilan için uygundur. Hemen başvuru yapabilirsiniz!"
                                            : "Analiz sonucuna rağmen yine de başvurmak ister misiniz?"}
                                    </p>
                                    {job.sourceUrl && (
                                        <a
                                            href={job.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 transition"
                                        >
                                            🔎 Kaynak Sitede İlan Detaylarını Gör
                                        </a>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    {job.applicationUrl ? (
                                        <a
                                            href={job.applicationUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`px-8 py-3 font-semibold rounded-xl transition flex items-center gap-2 ${result.score >= 70
                                                ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
                                                : 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/20'
                                                }`}
                                        >
                                            🚀 {result.score >= 70 ? 'Hemen Başvur' : 'Yine de Başvur'}
                                        </a>
                                    ) : (
                                        <button
                                            onClick={() => setNotification({ show: true, type: 'info', message: 'Bu ilan için direkt başvuru linki bulunamadı. Lütfen kaynak siteyi kontrol edin.' })}
                                            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-900/20"
                                        >
                                            📋 Başvuru Bilgisi Al
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notification Modal */}
                {notification.show && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                        <div className={`bg-slate-800 rounded-2xl p-6 max-w-md w-full border ${notification.type === 'error' ? 'border-red-500/50' :
                            notification.type === 'success' ? 'border-green-500/50' :
                                'border-blue-500/50'
                            }`}>
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${notification.type === 'error' ? 'bg-red-500/20' :
                                    notification.type === 'success' ? 'bg-green-500/20' :
                                        'bg-blue-500/20'
                                    }`}>
                                    {notification.type === 'error' ? (
                                        <AlertCircle className="w-6 h-6 text-red-400" />
                                    ) : notification.type === 'success' ? (
                                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                                    ) : (
                                        <AlertCircle className="w-6 h-6 text-blue-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-semibold mb-2 ${notification.type === 'error' ? 'text-red-400' :
                                        notification.type === 'success' ? 'text-green-400' :
                                            'text-blue-400'
                                        }`}>
                                        {notification.type === 'error' ? 'Hata' :
                                            notification.type === 'success' ? 'Başarılı' :
                                                'Bilgi'}
                                    </h3>
                                    <p className="text-slate-300 text-sm">
                                        {notification.message}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setNotification({ ...notification, show: false })}
                                className="mt-4 w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                            >
                                Tamam
                            </button>
                        </div>
                    </div>
                )}

                {/* Yetersiz Jeton Modal - Dinamik Abonelik Planları */}
                <InsufficientCreditsModal
                    show={insufficientCredits.show}
                    required={insufficientCredits.required}
                    current={insufficientCredits.current}
                    onClose={() => setInsufficientCredits({ show: false, required: 0, current: 0 })}
                />
            </div>
        </div>
    )
}
