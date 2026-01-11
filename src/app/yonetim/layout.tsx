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
    { href: '/yonetim', label: 'Anasayfa', icon: LayoutDashboard },
    { href: '/yonetim/users', label: 'Kullanıcılar', icon: Users },
    { href: '/yonetim/subscriptions', label: 'Abonelikler', icon: CreditCard },
    { href: '/yonetim/plans', label: 'Planlar & Jetonlar', icon: Coins },
    { href: '/yonetim/jobs', label: 'İş İlanları', icon: Briefcase },
    { href: '/yonetim/danismanlar', label: 'Kariyer Danışmanlığı', icon: Users },
    { href: '/yonetim/danismanlar/mesajlar', label: '↳ Danışman Mesajları', icon: MessageCircle },
    { href: '/yonetim/sales', label: 'Satış Kayıtları', icon: ShoppingCart },
    { href: '/yonetim/campaigns', label: 'Kampanyalar', icon: Tag },
    { href: '/yonetim/payment-settings', label: 'Ödeme Ayarları', icon: Wallet },
    { href: '/yonetim/whatsapp', label: 'WhatsApp Butonu', icon: MessageCircle },
    { href: '/yonetim/whatsapp-bot', label: 'WhatsApp Bot', icon: Smartphone },
    { href: '/yonetim/medya', label: 'Medya', icon: Image },
    { href: '/yonetim/yasal-sayfalar', label: 'Yasal Sayfalar', icon: FileText },
    { href: '/yonetim/logs', label: 'Sistem Logları', icon: FileText },
]


export default function YonetimLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
            router.push('/panel')
        }
    }, [status, session, router])

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false)
    }, [pathname])

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    if (session?.user?.role !== 'ADMIN') {
        return null
    }

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
                    {navItems.map((item) => {
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
            <div className="lg:ml-64 relative z-10">
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

                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 text-xs font-medium rounded-lg border border-purple-500/30">
                            ADMİN
                        </span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
