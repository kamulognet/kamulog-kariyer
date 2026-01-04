'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Settings, Crown, FileText, Palette, ArrowRight } from 'lucide-react'

export default function AdminSettingsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (session?.user?.role !== 'ADMIN') {
            router.push('/panel')
        }
    }, [status, session, router])

    if (session?.user?.role !== 'ADMIN') {
        return null
    }

    const settingsLinks = [
        {
            href: '/yonetim/plans',
            icon: Crown,
            title: 'Abonelik Planları & Jetonlar',
            description: 'Plan isimleri, fiyatları, jeton miktarları ve özelliklerini düzenleyin',
            color: 'purple'
        },
        {
            href: '/yonetim/content',
            icon: FileText,
            title: 'Sayfa İçerikleri',
            description: 'Gizlilik, Kullanım Şartları, Çerez onay metni ve iletişim bilgilerini düzenleyin',
            color: 'blue'
        },
        {
            href: '/yonetim/payment-settings',
            icon: Palette,
            title: 'Ödeme Ayarları',
            description: 'Ödeme yöntemleri ve banka bilgilerini yapılandırın',
            color: 'green'
        },
    ]

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Ayarlar</h1>
                    <p className="text-slate-400">Site ayarlarını yönetin</p>
                </div>
            </div>

            {/* Settings Links */}
            <div className="grid gap-4">
                {settingsLinks.map((link) => {
                    const Icon = link.icon
                    const colorClasses = {
                        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:border-purple-500/50',
                        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:border-blue-500/50',
                        green: 'bg-green-500/10 text-green-400 border-green-500/30 hover:border-green-500/50',
                    }
                    const iconColorClasses = {
                        purple: 'bg-purple-500/20 text-purple-400',
                        blue: 'bg-blue-500/20 text-blue-400',
                        green: 'bg-green-500/20 text-green-400',
                    }

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center justify-between p-6 rounded-2xl border transition-all hover:transform hover:-translate-y-1 ${colorClasses[link.color as keyof typeof colorClasses]}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColorClasses[link.color as keyof typeof iconColorClasses]}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{link.title}</h3>
                                    <p className="text-slate-400 text-sm">{link.description}</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400" />
                        </Link>
                    )
                })}
            </div>

            {/* Info */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
                <h4 className="font-medium text-slate-300 mb-2">💡 Bilgi</h4>
                <p className="text-slate-400 text-sm">
                    Abonelik planları ve jetonlar artık tek bir yerden yönetiliyor.
                    <strong className="text-white"> Planlar & Jetonlar</strong> sayfasından tüm plan ayarlarını düzenleyebilirsiniz.
                </p>
            </div>
        </div>
    )
}
