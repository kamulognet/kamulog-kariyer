'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Sparkles,
    FileText,
    Building2,
    MapPin,
    ChevronRight,
    Loader2,
    ArrowLeft,
    Filter,
    Star,
    TrendingUp,
    Briefcase,
    AlertCircle,
    CheckCircle,
    Coins
} from 'lucide-react'

interface CV {
    id: string
    title: string
    createdAt: string
}

interface JobMatch {
    jobId: string
    title: string
    company: string
    type: string
    score: number
    matchReasons: string[]
    feedback: string
}

interface AnalysisResult {
    score: number
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    feedback: string
}

export default function JobMatchPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    // State
    const [cvs, setCvs] = useState<CV[]>([])
    const [selectedCvId, setSelectedCvId] = useState<string>('')
    const [jobType, setJobType] = useState<'ALL' | 'PUBLIC' | 'PRIVATE'>('ALL')
    const [matches, setMatches] = useState<JobMatch[]>([])
    const [loading, setLoading] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [selectedMatch, setSelectedMatch] = useState<JobMatch | null>(null)
    const [detailAnalysis, setDetailAnalysis] = useState<AnalysisResult | null>(null)
    const [credits, setCredits] = useState<number>(0)
    const [error, setError] = useState<string>('')

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    useEffect(() => {
        if (session?.user) {
            loadCVs()
            loadCredits()
        }
    }, [session])

    const loadCVs = async () => {
        try {
            const res = await fetch('/api/cv')
            const data = await res.json()
            setCvs(data.cvs || [])
            if (data.cvs?.length > 0) {
                setSelectedCvId(data.cvs[0].id)
            }
        } catch (error) {
            console.error('Error loading CVs:', error)
        }
    }

    const loadCredits = async () => {
        try {
            const res = await fetch('/api/subscription/usage')
            const data = await res.json()
            setCredits(data.credits || 0)
        } catch (error) {
            console.error('Error loading credits:', error)
        }
    }

    const handleMatch = async () => {
        if (!selectedCvId) {
            setError('Lütfen bir CV seçin')
            return
        }

        setLoading(true)
        setError('')
        setMatches([])

        try {
            const res = await fetch('/api/jobs/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cvId: selectedCvId,
                    type: jobType,
                    action: 'match',
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Eşleştirme başarısız')
                return
            }

            setMatches(data.matches || [])
            if (data.remainingCredits !== undefined && data.remainingCredits >= 0) {
                setCredits(data.remainingCredits)
            }
        } catch (error) {
            console.error('Error matching:', error)
            setError('Bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const handleDetailAnalysis = async (match: JobMatch) => {
        setSelectedMatch(match)
        setAnalyzing(true)
        setDetailAnalysis(null)

        try {
            const res = await fetch('/api/jobs/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cvId: selectedCvId,
                    jobId: match.jobId,
                    action: 'analyze',
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Analiz başarısız')
                return
            }

            setDetailAnalysis(data.analysis)
            if (data.remainingCredits !== undefined && data.remainingCredits >= 0) {
                setCredits(data.remainingCredits)
            }
        } catch (error) {
            console.error('Error analyzing:', error)
            setError('Analiz sırasında hata oluştu')
        } finally {
            setAnalyzing(false)
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400'
        if (score >= 60) return 'text-blue-400'
        if (score >= 40) return 'text-yellow-400'
        return 'text-red-400'
    }

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-green-500/20 border-green-500/30'
        if (score >= 60) return 'bg-blue-500/20 border-blue-500/30'
        if (score >= 40) return 'bg-yellow-500/20 border-yellow-500/30'
        return 'bg-red-500/20 border-red-500/30'
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
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
                            <Link href="/dashboard/jobs" className="text-slate-400 hover:text-white transition">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-white">AI İş Eşleştirme</h1>
                                    <p className="text-xs text-slate-400">CV'inizi ilanlarla eşleştirin</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <Coins className="w-4 h-4 text-yellow-400" />
                                <span className="text-yellow-400 font-medium">{credits} Kredi</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Selection Panel */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 mb-8">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Filter className="w-5 h-5 text-purple-400" />
                        Eşleştirme Ayarları
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* CV Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">CV Seçin</label>
                            {cvs.length === 0 ? (
                                <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 text-center">
                                    <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                                    <p className="text-slate-400 text-sm">Henüz CV'niz yok</p>
                                    <Link href="/dashboard/cv-builder" className="text-purple-400 text-sm hover:underline">
                                        CV Oluştur →
                                    </Link>
                                </div>
                            ) : (
                                <select
                                    value={selectedCvId}
                                    onChange={(e) => setSelectedCvId(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    {cvs.map(cv => (
                                        <option key={cv.id} value={cv.id}>{cv.title}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Job Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">İlan Türü</label>
                            <div className="flex gap-2">
                                {[
                                    { value: 'ALL', label: 'Tümü' },
                                    { value: 'PUBLIC', label: 'Kamu' },
                                    { value: 'PRIVATE', label: 'Özel' },
                                ].map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => setJobType(option.value as any)}
                                        className={`flex-1 px-4 py-3 rounded-xl font-medium transition ${jobType === option.value
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-slate-900 text-slate-400 hover:bg-slate-700 border border-slate-700'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Match Button */}
                        <div className="flex items-end">
                            <button
                                onClick={handleMatch}
                                disabled={loading || !selectedCvId}
                                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Analiz Ediliyor...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        AI ile Eşleştir
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <span className="text-red-400">{error}</span>
                        </div>
                    )}
                </div>

                {/* Results */}
                {matches.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                                Eşleşme Sonuçları
                            </h2>
                            <span className="text-slate-400">{matches.length} ilan bulundu</span>
                        </div>

                        <div className="grid gap-4">
                            {matches.map((match, index) => (
                                <div
                                    key={match.jobId}
                                    className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="text-slate-500 text-sm">#{index + 1}</span>
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${match.type === 'PUBLIC'
                                                        ? 'bg-orange-500/20 text-orange-400'
                                                        : 'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                    {match.type === 'PUBLIC' ? 'Kamu' : 'Özel'}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-white mb-1">{match.title}</h3>
                                            <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                                                <Building2 className="w-4 h-4" />
                                                {match.company}
                                            </div>

                                            {/* Match Reasons */}
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {match.matchReasons.map((reason, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300"
                                                    >
                                                        <CheckCircle className="w-3 h-3 text-green-400" />
                                                        {reason}
                                                    </span>
                                                ))}
                                            </div>

                                            <p className="text-slate-400 text-sm">{match.feedback}</p>
                                        </div>

                                        {/* Score */}
                                        <div className="flex flex-col items-center gap-3 ml-6">
                                            <div className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center ${getScoreBg(match.score)}`}>
                                                <span className={`text-2xl font-bold ${getScoreColor(match.score)}`}>
                                                    {match.score}
                                                </span>
                                                <span className="text-xs text-slate-400">puan</span>
                                            </div>
                                            <button
                                                onClick={() => handleDetailAnalysis(match)}
                                                className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 text-sm font-medium rounded-lg border border-purple-500/30 transition flex items-center gap-1"
                                            >
                                                Detaylı Analiz
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && matches.length === 0 && !error && (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6">
                            <Briefcase className="w-10 h-10 text-slate-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Henüz Eşleştirme Yapılmadı</h3>
                        <p className="text-slate-400 max-w-md mx-auto">
                            CV'nizi seçin ve "AI ile Eşleştir" butonuna tıklayarak size en uygun iş ilanlarını bulun.
                        </p>
                    </div>
                )}
            </main>

            {/* Detail Analysis Modal */}
            {selectedMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-700 max-h-[85vh] overflow-auto">
                        <div className="p-6 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800 z-10">
                            <div>
                                <h2 className="text-xl font-bold text-white">{selectedMatch.title}</h2>
                                <p className="text-slate-400 text-sm">{selectedMatch.company}</p>
                            </div>
                            <button
                                onClick={() => { setSelectedMatch(null); setDetailAnalysis(null) }}
                                className="text-slate-400 hover:text-white p-2"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6">
                            {analyzing ? (
                                <div className="text-center py-12">
                                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                                    <p className="text-slate-400">Detaylı analiz yapılıyor...</p>
                                </div>
                            ) : detailAnalysis ? (
                                <div className="space-y-6">
                                    {/* Score */}
                                    <div className="text-center">
                                        <div className={`inline-flex flex-col items-center p-6 rounded-2xl border-2 ${getScoreBg(detailAnalysis.score)}`}>
                                            <span className={`text-5xl font-bold ${getScoreColor(detailAnalysis.score)}`}>
                                                {detailAnalysis.score}
                                            </span>
                                            <span className="text-slate-400 mt-1">Uyumluluk Puanı</span>
                                        </div>
                                    </div>

                                    {/* Feedback */}
                                    <div className="p-4 bg-slate-900 rounded-xl">
                                        <p className="text-slate-300">{detailAnalysis.feedback}</p>
                                    </div>

                                    {/* Strengths */}
                                    <div>
                                        <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            Güçlü Yönleriniz
                                        </h4>
                                        <ul className="space-y-2">
                                            {detailAnalysis.strengths.map((s, i) => (
                                                <li key={i} className="flex items-start gap-2 text-slate-300">
                                                    <span className="text-green-400 mt-1">✓</span>
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Weaknesses */}
                                    {detailAnalysis.weaknesses.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                                                <AlertCircle className="w-5 h-5" />
                                                Geliştirilebilir Alanlar
                                            </h4>
                                            <ul className="space-y-2">
                                                {detailAnalysis.weaknesses.map((w, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-slate-300">
                                                        <span className="text-yellow-400 mt-1">•</span>
                                                        {w}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Recommendations */}
                                    {detailAnalysis.recommendations.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                                                <Star className="w-5 h-5" />
                                                Öneriler
                                            </h4>
                                            <ul className="space-y-2">
                                                {detailAnalysis.recommendations.map((r, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-slate-300">
                                                        <span className="text-blue-400 mt-1">→</span>
                                                        {r}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
