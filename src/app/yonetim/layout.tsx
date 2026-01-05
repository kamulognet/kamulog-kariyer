'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
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
    Globe,
    MessageCircle,
    Coins,
    Tag
} from 'lucide-react'

const navItems = [
    { href: '/yonetim', label: 'Anasayfa', icon: LayoutDashboard },
    { href: '/yonetim/users', label: 'Kullanıcılar', icon: Users },
    { href: '/yonetim/subscriptions', label: 'Abonelikler', icon: CreditCard },
    { href: '/yonetim/plans', label: 'Planlar & Jetonlar', icon: Coins },
    { href: '/yonetim/jobs', label: 'İş İlanları', icon: Briefcase },
    { href: '/yonetim/danismanlar', label: 'Kariyer Danışmanlığı', icon: Users },
    { href: '/yonetim/sales', label: 'Satış Kayıtları', icon: ShoppingCart },
    { href: '/yonetim/campaigns', label: 'Kampanyalar', icon: Tag },
    { href: '/yonetim/payment-settings', label: 'Ödeme Ayarları', icon: Wallet },
    { href: '/yonetim/whatsapp', label: 'WhatsApp Butonu', icon: MessageCircle },
    { href: '/yonetim/content', label: 'Sayfa İçerikleri', icon: Globe },
    { href: '/yonetim/logs', label: 'Sistem Logları', icon: FileText },
]


export default function YonetimLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
            router.push('/panel')
        }
    }, [status, session, router])

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

            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900/80 backdrop-blur-xl border-r border-white/5 z-50">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Yönetim Paneli</h1>
                            <p className="text-xs text-purple-400">KARİYER KAMULOG</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/yonetim' && pathname.startsWith(item.href))
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom Actions - Settings & Panel butonları */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-slate-900/80 backdrop-blur-xl space-y-2">
                    <Link
                        href="/yonetim/settings"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === '/yonetim/settings'
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Ayarlar</span>
                    </Link>
                    <Link
                        href="/panel"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
                    >
                        <Home className="w-5 h-5" />
                        <span className="font-medium">Kullanıcı Paneli</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="ml-64 relative z-10">
                {/* Header */}
                <header className="h-16 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8">
                    <div>
                        <p className="text-gray-500 text-sm">Hoş geldiniz,</p>
                        <p className="text-white font-medium">{session.user.name || session.user.email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 text-sm font-medium rounded-lg border border-purple-500/30">
                            ADMİN
                        </span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
