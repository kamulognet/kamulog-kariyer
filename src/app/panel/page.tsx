'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import PanelHeader from '@/components/PanelHeader'
import {
    Plus,
    FileText,
    Sparkles,
    Briefcase,
    ChevronRight,
    UserCircle
} from 'lucide-react'

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
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
            const res = await fetch('/api/cv')
            if (res.ok) {
                const data = await res.json()
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
            <PanelHeader />

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
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Link
                        href="/panel/cv-olustur"
                        className="group bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 hover:from-blue-500 hover:to-blue-600 transition transform hover:scale-[1.02]"
                    >
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                            <Plus className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Yeni CV Oluştur</h3>
                        <p className="text-blue-200 text-sm">AI asistanı ile profesyonel CV'nizi oluşturun</p>
                    </Link>

                    <Link
                        href="/panel/ilanlar"
                        className="group bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition shadow-lg shadow-blue-500/5"
                    >
                        <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition">
                            <Briefcase className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">İş İlanları</h3>
                        <p className="text-slate-400 text-sm">Kamu ve Özel sektör ilanlarını AI ile analiz et</p>
                    </Link>

                    <Link
                        href="/panel/profil"
                        className="group bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition"
                    >
                        <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600/30 transition">
                            <UserCircle className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Profil Ayarları</h3>
                        <p className="text-slate-400 text-sm">Kişisel bilgiler ve fatura adresi düzenle</p>
                    </Link>

                    <Link
                        href="/panel/abonelik"
                        className="group bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition"
                    >
                        <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-600/30 transition">
                            <Sparkles className="w-6 h-6 text-orange-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Abonelik</h3>
                        <p className="text-slate-400 text-sm">Plan ve limitsiz kullanım avantajları</p>
                    </Link>
                </div>

                {/* Recent CVs */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-400" />
                            Son CV'ler
                        </h3>
                        <Link href="/panel/cvlerim" className="text-sm text-blue-400 hover:underline">Tümünü Gör</Link>
                    </div>

                    {cvs.length === 0 ? (
                        <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
                            <p className="text-slate-400 mb-4">Henüz CV oluşturmadınız</p>
                            <Link
                                href="/panel/cv-olustur"
                                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
                            >
                                <Plus className="w-4 h-4" />
                                İlk CV'nizi Oluşturun
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {cvs.slice(0, 6).map((cv) => (
                                <Link
                                    key={cv.id}
                                    href={`/panel/cv/${cv.id}`}
                                    className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-700/50 rounded-xl hover:bg-slate-700/50 hover:border-slate-600 transition group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-white group-hover:text-blue-400 transition">{cv.title}</h4>
                                            <p className="text-xs text-slate-500">
                                                {new Date(cv.createdAt).toLocaleDateString('tr-TR')}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
