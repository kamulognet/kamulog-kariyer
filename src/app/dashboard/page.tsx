'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [stats, setStats] = useState<{
        cvCount: number
        usage: { cv: number; chat: number; pdf: number }
        limits: { cv: number; chat: number; pdf: number }
    } | null>(null)
    const [cvs, setCvs] = useState<any[]>([])

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    useEffect(() => {
        if (session?.user) {
            loadData()
        }
    }, [session])

    const loadData = async () => {
        try {
            const [cvsRes, usageRes] = await Promise.all([
                fetch('/api/cv'),
                fetch('/api/subscription/usage'),
            ])

            if (cvsRes.ok) {
                const data = await cvsRes.json()
                setCvs(data.cvs || [])
            }
        } catch (error) {
            console.error('Error loading data:', error)
        }
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="text-xl font-bold text-white">KARİYER KAMULOG</Link>
                            <nav className="flex gap-4">
                                <Link href="/dashboard" className="text-blue-400 font-medium">
                                    Anasayfa
                                </Link>
                                <Link href="/dashboard/cv-builder" className="text-slate-400 hover:text-white transition">
                                    CV Oluştur
                                </Link>
                                <Link href="/dashboard/my-cvs" className="text-slate-400 hover:text-white transition">
                                    CV&apos;lerim
                                </Link>
                                <Link href="/dashboard/jobs" className="text-slate-400 hover:text-white transition">
                                    İş İlanları
                                </Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Kredi Göstergesi */}
                            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full">
                                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                                <span className="font-bold text-yellow-500 text-sm">{session.user.credits || 0}</span>
                                <span className="text-xs text-yellow-500/70">Kredi</span>
                            </div>

                            <div className="h-6 w-px bg-slate-700"></div>

                            {/* Kullanıcı Bilgileri */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                                    <span className="text-blue-400 font-bold text-xs">
                                        {session.user.name?.charAt(0) || session.user.email?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <span className="text-slate-300 text-sm font-medium hidden sm:block">{session.user.name || session.user.email}</span>
                            </div>

                            {session.user.role === 'ADMIN' && (
                                <Link href="/yonetim" className="px-3 py-1 bg-purple-600/20 text-purple-400 text-sm font-medium rounded-lg border border-purple-500/30 hover:bg-purple-600/30 transition">
                                    Yönetim
                                </Link>
                            )}
                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                title="Çıkış Yap"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Hoş geldin, {session.user.name || 'Kullanıcı'}! 👋
                    </h2>
                    <p className="text-slate-400">
                        AI destekli CV oluşturucu ile profesyonel CV'nizi dakikalar içinde hazırlayın.
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Link
                        href="/dashboard/cv-builder"
                        className="group bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 hover:from-blue-500 hover:to-blue-600 transition transform hover:scale-[1.02]"
                    >
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Yeni CV Oluştur</h3>
                        <p className="text-blue-200 text-sm">AI asistanı ile profesyonel CV'nizi oluşturun</p>
                    </Link>

                    <Link
                        href="/dashboard/my-cvs"
                        className="group bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition"
                    >
                        <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-600 transition">
                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">CV'lerim</h3>
                        <p className="text-slate-400 text-sm">Kayıtlı CV'lerinizi görüntüleyin ve düzenleyin</p>
                    </Link>

                    <Link
                        href="/dashboard/subscription"
                        className="group bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition"
                    >
                        <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-600 transition">
                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Abonelik</h3>
                        <p className="text-slate-400 text-sm">Plan ve kullanım bilgileriniz</p>
                    </Link>

                    <Link
                        href="/dashboard/jobs"
                        className="group bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition shadow-lg shadow-blue-500/5"
                    >
                        <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">İş İlanları</h3>
                        <p className="text-slate-400 text-sm">Kamu ve Özel sektör ilanlarını AI ile analiz et</p>
                    </Link>
                </div>

                {/* Recent CVs */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Son CV'ler</h3>
                    {cvs.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-slate-400 mb-4">Henüz CV oluşturmadınız</p>
                            <Link
                                href="/dashboard/cv-builder"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                İlk CV'nizi Oluşturun
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cvs.slice(0, 5).map((cv) => (
                                <Link
                                    key={cv.id}
                                    href={`/dashboard/cv/${cv.id}`}
                                    className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition"
                                >
                                    <div>
                                        <h4 className="font-medium text-white">{cv.title}</h4>
                                        <p className="text-sm text-slate-400">
                                            {new Date(cv.createdAt).toLocaleDateString('tr-TR')}
                                        </p>
                                    </div>
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
