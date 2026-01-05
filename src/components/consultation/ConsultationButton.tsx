'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Phone, Lock, Crown, MessageCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

// Danışmanlık telefon numarası
const CONSULTATION_PHONE = '05016547534'

interface ConsultationButtonProps {
    className?: string
    size?: 'sm' | 'md' | 'lg'
    variant?: 'primary' | 'outline'
}

export default function ConsultationButton({
    className = '',
    size = 'md',
    variant = 'primary'
}: ConsultationButtonProps) {
    const { data: session } = useSession()
    const [isPremium, setIsPremium] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkPremium = async () => {
            if (!session?.user?.id) {
                setLoading(false)
                return
            }

            try {
                const res = await fetch('/api/user/subscription')
                if (res.ok) {
                    const data = await res.json()
                    setIsPremium(data.plan === 'PREMIUM' && data.status === 'ACTIVE')
                }
            } catch (e) {
                console.error('Error checking premium:', e)
            }
            setLoading(false)
        }

        checkPremium()
    }, [session])

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm gap-1.5',
        md: 'px-4 py-2 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2'
    }

    const baseClasses = sizeClasses[size]

    if (loading) {
        return (
            <div className={`flex items-center ${baseClasses} bg-slate-700 rounded-xl text-slate-400 animate-pulse ${className}`}>
                <Phone className="w-4 h-4" />
                Yükleniyor...
            </div>
        )
    }

    // Premium kullanıcı - telefon numarası görünür ve aranabilir
    if (isPremium) {
        return (
            <a
                href={`tel:${CONSULTATION_PHONE}`}
                className={`flex items-center ${baseClasses} bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-medium rounded-xl transition shadow-lg shadow-purple-500/30 ${className}`}
            >
                <Phone className="w-4 h-4" />
                <span>1+1 Danışmanlık: {CONSULTATION_PHONE.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')}</span>
            </a>
        )
    }

    // Premium olmayan kullanıcı - upgrade prompt
    return (
        <Link
            href="/panel/satin-al"
            className={`flex items-center ${baseClasses} ${variant === 'primary'
                    ? 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-slate-300'
                    : 'border border-slate-600 bg-slate-800/50 text-slate-400 hover:border-purple-500 hover:text-purple-400'
                } font-medium rounded-xl transition ${className}`}
        >
            <Lock className="w-4 h-4" />
            <span>1+1 Danışmanlık (Premium)</span>
            <Crown className="w-4 h-4 text-yellow-500" />
        </Link>
    )
}

// Danışmanlık kartı - daha detaylı gösterim
export function ConsultationCard() {
    const { data: session } = useSession()
    const [isPremium, setIsPremium] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkPremium = async () => {
            if (!session?.user?.id) {
                setLoading(false)
                return
            }

            try {
                const res = await fetch('/api/user/subscription')
                if (res.ok) {
                    const data = await res.json()
                    setIsPremium(data.plan === 'PREMIUM' && data.status === 'ACTIVE')
                }
            } catch (e) {
                console.error('Error checking premium:', e)
            }
            setLoading(false)
        }

        checkPremium()
    }, [session])

    if (loading) {
        return (
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-slate-700 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            </div>
        )
    }

    return (
        <div className={`rounded-2xl p-6 ${isPremium
                ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-500/30'
                : 'bg-slate-800/50 border border-slate-700'
            }`}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl ${isPremium ? 'bg-purple-500/20' : 'bg-slate-700'}`}>
                    <MessageCircle className={`w-6 h-6 ${isPremium ? 'text-purple-400' : 'text-slate-400'}`} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">1+1 Özel Danışmanlık</h3>
                    <p className="text-sm text-slate-400">Kariyer uzmanlarımızla birebir görüşme</p>
                </div>
            </div>

            {isPremium ? (
                <>
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span>Premium üyeliğinizle bu özellik aktif</span>
                        </div>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-4">
                        <p className="text-sm text-purple-300 mb-2">Danışmanlık Hattı</p>
                        <a
                            href={`tel:${CONSULTATION_PHONE}`}
                            className="text-2xl font-bold text-white hover:text-purple-300 transition"
                        >
                            {CONSULTATION_PHONE.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')}
                        </a>
                    </div>

                    <a
                        href={`tel:${CONSULTATION_PHONE}`}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-medium rounded-xl transition shadow-lg shadow-purple-500/30"
                    >
                        <Phone className="w-5 h-5" />
                        Şimdi Ara
                    </a>
                </>
            ) : (
                <>
                    <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <Lock className="w-4 h-4" />
                            <span className="text-sm">Bu özellik Premium üyelere özeldir</span>
                        </div>
                        <p className="text-xs text-slate-500">
                            Premium aboneliğe yükselterek özel kariyer danışmanlarımıza doğrudan ulaşabilirsiniz.
                        </p>
                    </div>

                    <Link
                        href="/panel/satin-al"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-medium rounded-xl transition shadow-lg shadow-yellow-500/30"
                    >
                        <Crown className="w-5 h-5" />
                        Premium'a Yükselt
                    </Link>
                </>
            )}
        </div>
    )
}
