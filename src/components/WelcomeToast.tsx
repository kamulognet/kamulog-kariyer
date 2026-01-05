'use client'

import { useState, useEffect } from 'react'
import { X, AlertTriangle, CheckCircle } from 'lucide-react'

const COOKIE_NAME = 'kamulog_welcome_acknowledged'

export default function WelcomeToast() {
    const [show, setShow] = useState(false)

    useEffect(() => {
        // Cookie kontrolü
        const acknowledged = document.cookie
            .split('; ')
            .find(row => row.startsWith(COOKIE_NAME + '='))

        if (!acknowledged) {
            // Biraz gecikme ile göster
            const timer = setTimeout(() => setShow(true), 1000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAcknowledge = () => {
        // 1 yıl geçerli cookie kaydet
        const expires = new Date()
        expires.setFullYear(expires.getFullYear() + 1)
        document.cookie = `${COOKIE_NAME}=true; expires=${expires.toUTCString()}; path=/`
        setShow(false)
    }

    if (!show) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Kariyer Kamulog'a Hoş Geldiniz!</h2>
                            <p className="text-slate-400 text-sm">Lütfen aşağıdaki bilgiyi okuyun</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5 space-y-4">
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                        <h3 className="font-semibold text-amber-400 mb-2">Önemli Bilgilendirme</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Kariyer Kamulog, iş arayışınızda size yardımcı olmak için tasarlanmış bir platformdur.
                        </p>
                    </div>

                    <ul className="space-y-3 text-sm text-slate-300">
                        <li className="flex items-start gap-2">
                            <span className="text-amber-400 mt-1">•</span>
                            <span>Bu platform <strong className="text-white">herhangi bir işe yerleştirme garantisi sunmamaktadır.</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-400 mt-1">•</span>
                            <span>CV hazırlama, iş eşleştirme ve kariyer danışmanlığı hizmetlerimiz <strong className="text-white">yalnızca bilgilendirme amaçlıdır.</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-400 mt-1">•</span>
                            <span>İşe başvuru ve mülakat süreçleri tamamen sizin ve işverenlerin sorumluluğundadır.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-400 mt-1">•</span>
                            <span>"Bana Uygun İşler" ve "AI Analiz" özellikleri yapay zeka desteklidir ve kesin sonuçlar içermez.</span>
                        </li>
                    </ul>

                    <div className="bg-slate-700/50 rounded-xl p-3 text-xs text-slate-400">
                        <strong className="text-slate-300">Veri Sorumlusu:</strong> Suat Hayri Şahin – Kamulog.net<br />
                        <strong className="text-slate-300">İletişim:</strong> destek@kamulogkariyer.com
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                    <button
                        onClick={handleAcknowledge}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold rounded-xl transition shadow-lg shadow-purple-500/30"
                    >
                        <CheckCircle className="w-5 h-5" />
                        Anladım, Devam Et
                    </button>
                </div>
            </div>
        </div>
    )
}
