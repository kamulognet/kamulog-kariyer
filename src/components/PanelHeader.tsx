'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { User, LogOut, Shield, LayoutDashboard, FileText, Briefcase, Coins, Sparkles, Phone } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

export default function PanelHeader() {
    const { data: session } = useSession()
    const { credits } = useToast()

    if (!session) return null

    // Context'ten kredi alınamıyorsa session'dan al
    const displayCredits = credits || session.user.credits || 0

    return (
        <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-6">
                        <Link href="/panel" className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            <span className="text-blue-500">KARİYER</span> KAMULOG
                        </Link>
                        <nav className="hidden lg:flex gap-6">
                            <Link href="/panel" className="text-slate-400 hover:text-white transition text-sm font-medium flex items-center gap-1.5">
                                <LayoutDashboard className="w-4 h-4" />
                                Anasayfa
                            </Link>
                            <Link href="/panel/cv-olustur" className="text-slate-400 hover:text-white transition text-sm font-medium flex items-center gap-1.5">
                                <FileText className="w-4 h-4" />
                                CV Oluştur
                            </Link>
                            <Link href="/panel/cvlerim" className="text-slate-400 hover:text-white transition text-sm font-medium flex items-center gap-1.5">
                                <FileText className="w-4 h-4" />
                                CV'lerim
                            </Link>
                            <Link href="/panel/ilanlar" className="text-slate-400 hover:text-white transition text-sm font-medium flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4" />
                                İş İlanları
                            </Link>
                            <Link href="/panel/danismanlik" className="text-purple-400 hover:text-purple-300 transition text-sm font-medium flex items-center gap-1.5 bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/30">
                                <Phone className="w-4 h-4" />
                                Kariyer Danışmanlığı
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">
                        {/* Credits & Subscription Status */}
                        <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-slate-700 h-8">
                            {/* Credits */}
                            <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-full">
                                <Coins className="w-3.5 h-3.5 text-yellow-500" />
                                <span className="text-sm font-bold text-yellow-500 transition-all duration-300">{displayCredits}</span>
                            </div>

                            {/* Sub Status */}
                            {session.user.subscription?.status === 'ACTIVE' && (
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${session.user.subscription.plan === 'PREMIUM'
                                    ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                    }`}>
                                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                    <span className="text-[10px] font-bold tracking-wider uppercase">
                                        {session.user.subscription.plan}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* User & Settings */}
                        <div className="flex items-center gap-2">
                            <Link
                                href="/panel/profil"
                                className="flex items-center gap-2 p-1 rounded-full bg-slate-700/30 border border-slate-600/50 hover:bg-slate-700/50 transition pr-3"
                            >
                                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-slate-200 leading-none truncate max-w-[80px] hidden md:block">
                                        {session.user.name || session.user.email?.split('@')[0]}
                                    </span>
                                </div>
                            </Link>

                            {session.user.role === 'ADMIN' && (
                                <Link
                                    href="/yonetim"
                                    className="p-1.5 text-purple-400 hover:bg-purple-500/10 rounded-lg transition"
                                    title="Yönetim Paneli"
                                >
                                    <Shield className="w-5 h-5" />
                                </Link>
                            )}

                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="p-1.5 text-slate-400 hover:text-red-400 transition"
                                title="Çıkış Yap"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
