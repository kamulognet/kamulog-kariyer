'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { User, LogOut, Shield, LayoutDashboard, FileText, Briefcase, Coins, Sparkles, Phone, Menu, X, Home, Crown } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

export default function PanelHeader() {
    const { data: session } = useSession()
    const { credits } = useToast()
    const [menuOpen, setMenuOpen] = useState(false)
    const [isUnlimited, setIsUnlimited] = useState(false)

    useEffect(() => {
        // Sınırsız plan kontrolü
        const checkUnlimited = async () => {
            try {
                const res = await fetch('/api/settings/chat-limits')
                if (res.ok) {
                    const data = await res.json()
                    if (data.isUnlimited !== undefined) {
                        setIsUnlimited(data.isUnlimited)
                    }
                }
            } catch (e) {
                console.error('Failed to check unlimited status')
            }
        }
        if (session) {
            checkUnlimited()
        }
    }, [session])

    if (!session) return null

    // Context'ten kredi alınamıyorsa session'dan al
    const displayCredits = credits || session.user.credits || 0

    const navItems = [
        { href: '/panel', label: 'Anasayfa', icon: LayoutDashboard },
        { href: '/panel/cv-olustur', label: 'CV Oluştur', icon: FileText },
        { href: '/panel/cvlerim', label: 'CV\'lerim', icon: FileText },
        { href: '/panel/ilanlar', label: 'İş İlanları', icon: Briefcase },
        { href: '/panel/danismanlik', label: 'Kariyer Danışmanlığı', icon: Phone, isPremium: true },
        { href: '/panel/abonelik', label: 'Abonelik', icon: Crown },
        { href: '/panel/profil', label: 'Profil', icon: User },
    ]

    return (
        <>
            <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-14 lg:h-16">
                        {/* Left: Logo + Mobile Menu */}
                        <div className="flex items-center gap-3">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMenuOpen(true)}
                                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition -ml-2"
                            >
                                <Menu className="w-5 h-5 text-white" />
                            </button>

                            <Link href="/panel" className="text-lg lg:text-xl font-bold text-white tracking-tight flex items-center gap-1">
                                <span className="text-blue-500">K</span>AMULOG
                            </Link>

                            {/* Desktop Nav */}
                            <nav className="hidden lg:flex gap-4 ml-6">
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
                                    Danışmanlık
                                </Link>
                            </nav>
                        </div>

                        {/* Right: Credits + User */}
                        <div className="flex items-center gap-2 lg:gap-4">
                            {/* Credits Badge - Always visible */}
                            {isUnlimited ? (
                                <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-full">
                                    <span className="text-sm">♾️</span>
                                    <span className="text-sm font-bold text-purple-400">Sınırsız</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-full">
                                    <Coins className="w-3.5 h-3.5 text-yellow-500" />
                                    <span className="text-sm font-bold text-yellow-500">{displayCredits}</span>
                                </div>
                            )}

                            {/* Sub Status - Hidden on mobile */}
                            {session.user.subscription?.status === 'ACTIVE' && (
                                <div className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full border ${session.user.subscription.plan === 'PREMIUM'
                                    ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                    }`}>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold tracking-wider uppercase">
                                        {session.user.subscription.plan}
                                    </span>
                                </div>
                            )}

                            {/* User Avatar/Profile */}
                            <Link
                                href="/panel/profil"
                                className="p-1.5 rounded-full bg-slate-700/30 border border-slate-600/50 hover:bg-slate-700/50 transition"
                            >
                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                                    <User className="w-3.5 h-3.5 text-white" />
                                </div>
                            </Link>

                            {/* Admin Badge */}
                            {session.user.role === 'ADMIN' && (
                                <Link
                                    href="/yonetim"
                                    className="p-1.5 text-purple-400 hover:bg-purple-500/10 rounded-lg transition"
                                    title="Yönetim Paneli"
                                >
                                    <Shield className="w-5 h-5" />
                                </Link>
                            )}

                            {/* Logout - Hidden on small mobile */}
                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="hidden sm:block p-1.5 text-slate-400 hover:text-red-400 transition"
                                title="Çıkış Yap"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {menuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-50 lg:hidden"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            {/* Mobile Slide Menu */}
            <div className={`fixed top-0 left-0 h-full w-72 bg-slate-900/95 backdrop-blur-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${menuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <span className="text-xl font-bold text-white">
                        <span className="text-blue-500">KARİYER</span> KAMULOG
                    </span>
                    <button
                        onClick={() => setMenuOpen(false)}
                        className="p-2 hover:bg-white/10 rounded-lg transition"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-white font-medium">{session.user.name || 'Kullanıcı'}</p>
                            <p className="text-slate-400 text-sm truncate max-w-40">{session.user.email}</p>
                        </div>
                    </div>
                    {/* Mobile Credits & Plan */}
                    <div className="flex items-center gap-2 mt-3">
                        {isUnlimited ? (
                            <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-full">
                                <span className="text-sm">♾️</span>
                                <span className="text-sm font-bold text-purple-400">Sınırsız</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-full">
                                <Coins className="w-3.5 h-3.5 text-yellow-500" />
                                <span className="text-sm font-bold text-yellow-500">{displayCredits} Kredi</span>
                            </div>
                        )}
                        {session.user.subscription?.status === 'ACTIVE' && (
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${session.user.subscription.plan === 'PREMIUM'
                                ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                }`}>
                                <Sparkles className="w-3 h-3" />
                                <span className="text-xs font-bold uppercase">
                                    {session.user.subscription.plan}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${item.isPremium
                                    ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20'
                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Admin Link */}
                {session.user.role === 'ADMIN' && (
                    <div className="px-4 pb-2">
                        <Link
                            href="/yonetim"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-purple-400 hover:from-purple-600/30 hover:to-blue-600/30 transition"
                        >
                            <Shield className="w-5 h-5" />
                            <span className="font-medium">Yönetim Paneli</span>
                        </Link>
                    </div>
                )}

                {/* Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Çıkış Yap</span>
                    </button>
                </div>
            </div>
        </>
    )
}
