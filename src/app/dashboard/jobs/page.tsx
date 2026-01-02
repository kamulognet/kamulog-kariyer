'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Briefcase, MapPin, Building2, Search, Sparkles, Wand2, X, AlertCircle } from 'lucide-react'

interface JobListing {
    id: string
    title: string
    company: string
    location: string | null
    type: string
    description: string
}

interface MatchedJob extends JobListing {
    matchScore: number
    matchReason: string
    suggestionReason?: string
}

interface CV {
    id: string
    title: string
}

export default function JobsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [jobs, setJobs] = useState<JobListing[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('ALL')
    const [search, setSearch] = useState('')
    const [showMatchModal, setShowMatchModal] = useState(false)
    const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([])
    const [matchLoading, setMatchLoading] = useState(false)
    const [matchError, setMatchError] = useState('')
    const [userCVs, setUserCVs] = useState<CV[]>([])
    const [selectedCV, setSelectedCV] = useState<string>('')

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    useEffect(() => {
        loadJobs()
        loadUserCVs()
    }, [filter])

    const loadJobs = async () => {
        setLoading(true)
        try {
            const url = filter === 'ALL' ? '/api/jobs' : `/api/jobs?type=${filter}`
            const res = await fetch(url)
            const data = await res.json()
            setJobs(data.jobs || [])
        } catch (error) {
            console.error('Error loading jobs:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadUserCVs = async () => {
        try {
            const res = await fetch('/api/cv')
            const data = await res.json()
            setUserCVs(data.cvs || [])
            if (data.cvs && data.cvs.length > 0) {
                setSelectedCV(data.cvs[0].id)
            }
        } catch (error) {
            console.error('Error loading CVs:', error)
        }
    }

    const handleFindMatchingJobs = async () => {
        if (!selectedCV) {
            setMatchError('Lütfen önce bir CV oluşturun veya yükleyin')
            return
        }

        setShowMatchModal(true)
        setMatchLoading(true)
        setMatchError('')
        setMatchedJobs([])

        try {
            const res = await fetch('/api/jobs/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cvId: selectedCV,
                    action: 'suggest',
                    type: filter === 'ALL' ? undefined : filter,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setMatchError(data.error || 'Eşleştirme yapılamadı')
                return
            }

            setMatchedJobs(data.suggestions || [])
        } catch (error) {
            setMatchError('Bir hata oluştu')
        } finally {
            setMatchLoading(false)
        }
    }

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase())
    )

    if (status === 'loading') return null

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">İş İlanları</h1>
                        <p className="text-slate-400">Kamu ve özel sektördeki en güncel iş ilanlarını keşfedin.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleFindMatchingJobs}
                            disabled={userCVs.length === 0}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-xl transition shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Wand2 className="w-5 h-5" />
                            Bana Uygun İşler
                        </button>
                        <Link
                            href="/dashboard/jobs/analyses"
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition"
                        >
                            <Sparkles className="w-4 h-4" />
                            Geçmiş Analizlerim
                        </Link>
                    </div>
                </div>

                {/* CV Selection for Matching */}
                {userCVs.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-4 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium">AI Eşleştirme için CV Seçin</p>
                                <p className="text-slate-400 text-sm">Yapay zeka seçili CV&apos;nizi analiz edecek</p>
                            </div>
                        </div>
                        <select
                            value={selectedCV}
                            onChange={(e) => setSelectedCV(e.target.value)}
                            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {userCVs.map((cv) => (
                                <option key={cv.id} value={cv.id}>{cv.title}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* No CV Warning */}
                {userCVs.length === 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-yellow-200">AI iş eşleştirmesi için önce bir CV oluşturmanız gerekiyor.</p>
                        </div>
                        <Link
                            href="/dashboard/cv-builder"
                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-medium rounded-lg transition text-sm"
                        >
                            CV Oluştur
                        </Link>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700 mb-8 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Pozisyon veya şirket ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['ALL', 'PUBLIC', 'PRIVATE'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`px-4 py-2 rounded-xl border transition ${filter === t
                                    ? 'bg-blue-600 border-blue-500 text-white'
                                    : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                                    }`}
                            >
                                {t === 'ALL' ? 'Tümü' : t === 'PUBLIC' ? 'Kamu' : 'Özel'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Job List */}
                <div className="grid gap-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-slate-400">İlanlar yükleniyor...</p>
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-700">
                            <p className="text-slate-400">Uygun ilan bulunamadı.</p>
                        </div>
                    ) : (
                        filteredJobs.map((job) => (
                            <div key={job.id} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 hover:border-blue-500/50 transition group">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">{job.title}</h3>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${job.type === 'PUBLIC' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {job.type === 'PUBLIC' ? 'Kamu' : 'Özel'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-slate-400 text-sm mb-4">
                                            <div className="flex items-center gap-1">
                                                <Building2 className="w-4 h-4" />
                                                {job.company}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {job.location}
                                            </div>
                                        </div>
                                        <p className="text-slate-300 line-clamp-2 text-sm">
                                            {job.description}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 justify-center">
                                        <Link
                                            href={`/dashboard/jobs/analyze/${job.id}`}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition text-center flex items-center gap-2 justify-center"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            Yapay Zeka Analizi
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* AI Matching Modal */}
                {showMatchModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                        <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-3xl w-full max-h-[80vh] overflow-hidden">
                            <div className="flex items-center justify-between p-6 border-b border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                                        <Wand2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Bana Uygun İşler</h3>
                                        <p className="text-slate-400 text-sm">AI CV&apos;nizi analiz etti</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowMatchModal(false)}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[60vh]">
                                {matchLoading ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                                        <p className="text-white font-medium">AI CV&apos;nizi analiz ediyor...</p>
                                        <p className="text-slate-400 text-sm mt-1">Bu işlem birkaç saniye sürebilir</p>
                                    </div>
                                ) : matchError ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <X className="w-8 h-8 text-red-400" />
                                        </div>
                                        <p className="text-red-400">{matchError}</p>
                                    </div>
                                ) : matchedJobs.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Briefcase className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <p className="text-slate-400">Uygun iş bulunamadı</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {matchedJobs.map((job, index) => (
                                            <div key={job.id} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                                {index + 1}
                                                            </span>
                                                            <h4 className="text-lg font-semibold text-white">{job.title}</h4>
                                                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${job.type === 'PUBLIC' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                                                                }`}>
                                                                {job.type === 'PUBLIC' ? 'Kamu' : 'Özel'}
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-400 text-sm mb-2">{job.company} • {job.location}</p>
                                                        {job.suggestionReason && (
                                                            <p className="text-green-400 text-sm flex items-start gap-2">
                                                                <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                                {job.suggestionReason}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Link
                                                        href={`/dashboard/jobs/analyze/${job.id}`}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition flex-shrink-0"
                                                    >
                                                        Detaylı Analiz
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                                <p className="text-slate-400 text-xs text-center">
                                    AI önerileri CV&apos;nizdeki bilgilere göre hesaplanmıştır. Detaylı analiz için ilana tıklayın.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
