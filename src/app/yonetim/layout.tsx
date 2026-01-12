'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Briefcase,
    FileText,
    ShoppingCart,
    Home,
    Settings,
    Sparkles,
    Wallet,
    MessageCircle,
    Coins,
    Tag,
    Image,
    Menu,
    X,
    Smartphone
} from 'lucide-react'

const navItems = [
    { href: '/yonetim', label: 'Anasayfa', icon: LayoutDashboard, adminOnly: false },
    { href: '/yonetim/mesajlar', label: 'Mesajlarım', icon: MessageCircle, adminOnly: false, moderatorOnly: true },
    { href: '/yonetim/users', label: 'Kullanıcılar', icon: Users, adminOnly: false },
    { href: '/yonetim/subscriptions', label: 'Abonelikler', icon: CreditCard, adminOnly: false },
    { href: '/yonetim/plans', label: 'Planlar & Jetonlar', icon: Coins, adminOnly: false },
    { href: '/yonetim/jobs', label: 'İş İlanları', icon: Briefcase, adminOnly: false },
    { href: '/yonetim/danismanlar', label: 'Kariyer Danışmanlığı', icon: Users, adminOnly: false },
    { href: '/yonetim/danismanlar/mesajlar', label: '↳ Danışman Mesajları', icon: MessageCircle, adminOnly: true },
    { href: '/yonetim/sales', label: 'Satış Kayıtları', icon: ShoppingCart, adminOnly: false },
    { href: '/yonetim/campaigns', label: 'Kampanyalar', icon: Tag, adminOnly: false },
    { href: '/yonetim/payment-settings', label: 'Ödeme Ayarları', icon: Wallet, adminOnly: true },
    { href: '/yonetim/whatsapp', label: 'WhatsApp Butonu', icon: MessageCircle, adminOnly: true },
    { href: '/yonetim/whatsapp-bot', label: 'WhatsApp Bot', icon: Smartphone, adminOnly: true },
    { href: '/yonetim/medya', label: 'Medya', icon: Image, adminOnly: false },
    { href: '/yonetim/yasal-sayfalar', label: 'Yasal Sayfalar', icon: FileText, adminOnly: true },
    { href: '/yonetim/logs', label: 'Sistem Logları', icon: FileText, adminOnly: true },
]


export default function YonetimLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MODERATOR') {
            router.push('/panel')
        }
    }, [status, session, router])

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false)
    }, [pathname])

    // Fetch unread message count
    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const res = await fetch('/api/chat/unread')
                const data = await res.json()
                if (data.unreadCount !== undefined) {
                    setUnreadCount(data.unreadCount)
                }
            } catch (e) {
                console.error('Unread fetch error:', e)
            }
        }
        if (status === 'authenticated') {
            fetchUnread()
            const interval = setInterval(fetchUnread, 30000) // 30 saniyede bir
            return () => clearInterval(interval)
        }
    }, [status])

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    const isAdmin = session?.user?.role === 'ADMIN'
    const isModerator = session?.user?.role === 'MODERATOR'

    if (!isAdmin && !isModerator) {
        return null
    }

    // Filter nav items based on role
    const filteredNavItems = navItems.filter(item => {
        if (item.moderatorOnly && isAdmin) return false // Admin mesajlarım'ı görmez
        if (isAdmin) return true // ADMIN sees everything else
        return !item.adminOnly // MODERATOR sees only non-admin items
    })

    return (
        <div className="min-h-screen bg-[#0a0a1a]">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-blue-900/10 to-cyan-900/10"></div>
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[150px]"></div>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 h-full w-64 bg-slate-900/95 backdrop-blur-xl border-r border-white/5 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0`}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Yönetim</h1>
                            <p className="text-xs text-purple-400">KAMULOG</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
                    {filteredNavItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/yonetim' && pathname.startsWith(item.href))
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${isActive
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                <span className="font-medium truncate">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/5 bg-slate-900/95 backdrop-blur-xl space-y-1">
                    {isAdmin && (
                        <Link
                            href="/yonetim/settings"
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-sm ${pathname === '/yonetim/settings'
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Settings className="w-4 h-4" />
                            <span className="font-medium">Ayarlar</span>
                        </Link>
                    )}
                    <Link
                        href="/panel"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition text-sm"
                    >
                        <Home className="w-4 h-4" />
                        <span className="font-medium">Kullanıcı Paneli</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:ml-64 relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <header className="h-16 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-8">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition"
                    >
                        <Menu className="w-6 h-6 text-white" />
                    </button>

                    <div className="hidden lg:block">
                        <p className="text-gray-500 text-sm">Hoş geldiniz,</p>
                        <p className="text-white font-medium">{session.user.name || session.user.email}</p>
                    </div>

                    {/* Mobile: Show name + badge */}
                    <div className="lg:hidden flex items-center gap-2">
                        <span className="text-white font-medium text-sm truncate max-w-32">
                            {session.user.name?.split(' ')[0] || 'Admin'}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* MESAJLAŞMA Butonu - Her zaman görünür */}
                        <Link
                            href={isModerator ? '/yonetim/mesajlar' : '/yonetim/danismanlar/mesajlar'}
                            className="relative flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg transition"
                        >
                            <MessageCircle className="w-4 h-4 text-white" />
                            <span className="text-white text-sm font-medium hidden sm:inline">Mesajlaşma</span>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Link>
                        <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${isAdmin
                            ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border-purple-500/30'
                            : 'bg-gradient-to-r from-green-500/20 to-teal-500/20 text-green-400 border-green-500/30'
                            }`}>
                            {isAdmin ? 'ADMİN' : 'MODERATÖR'}
                        </span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <div className="max-h-[calc(100vh-6rem)] overflow-y-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
