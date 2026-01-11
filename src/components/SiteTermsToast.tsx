'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'

interface SiteTermsToastProps {
    onAccept: () => void
    isAccepted: boolean
}

export default function SiteTermsToast({ onAccept, isAccepted }: SiteTermsToastProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Check if already accepted in this session
        const sessionAccepted = sessionStorage.getItem('site_terms_accepted')
        if (!sessionAccepted && !isAccepted) {
            // Show with animation
            const timer = setTimeout(() => setIsVisible(true), 300)
            return () => clearTimeout(timer)
        }
    }, [isAccepted])

    const handleAccept = () => {
        sessionStorage.setItem('site_terms_accepted', 'true')
        setIsVisible(false)
        onAccept()
    }

    // If already accepted in session or via prop, don't show
    if (isAccepted) return null

    // Check session storage
    if (typeof window !== 'undefined' && sessionStorage.getItem('site_terms_accepted')) {
        return null
    }

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isVisible
                    ? 'bg-black/70 backdrop-blur-sm opacity-100'
                    : 'bg-black/0 opacity-0 pointer-events-none'
                }`}
        >
            <div
                className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
                    }`}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-500/20 rounded-xl">
                            <AlertTriangle className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Önemli Bilgilendirme</h2>
                            <p className="text-slate-400 text-sm">Devam etmeden önce lütfen okuyunuz</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                            📋 Hizmet Kapsamı
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Kariyer Kamulog, <strong className="text-white">kariyer danışmanlığı ve CV hazırlama</strong>
                            {' '}hizmeti sunan bir platformdur.
                        </p>
                    </div>

                    <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
                        <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                            ⚠️ Önemli Uyarılar
                        </h3>
                        <ul className="text-slate-300 text-sm space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 font-bold">•</span>
                                <span>Platformumuzun <strong className="text-white">herhangi bir kamu kurumu ile bağlantısı yoktur.</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 font-bold">•</span>
                                <span><strong className="text-white">Torpil, referans veya iş garantisi sunulmamaktadır.</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 font-bold">•</span>
                                <span>İşe yerleştirme veya alım garantisi <strong className="text-white">kesinlikle verilmemektedir.</strong></span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
                        <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                            ℹ️ Sunulan Hizmetler
                        </h3>
                        <ul className="text-slate-300 text-sm space-y-1">
                            <li>✓ Profesyonel CV hazırlama ve düzenleme</li>
                            <li>✓ AI destekli kariyer danışmanlığı</li>
                            <li>✓ İş ilanları listeleme ve bilgilendirme</li>
                            <li>✓ Kariyer planlama rehberliği</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 bg-slate-800/30">
                    <button
                        onClick={handleAccept}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-semibold transition shadow-lg"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        Okudum ve Kabul Ediyorum
                    </button>
                    <p className="text-center text-slate-500 text-xs mt-3">
                        Bu bildirimi kabul etmeden devam edemezsiniz.
                    </p>
                </div>
            </div>
        </div>
    )
}
