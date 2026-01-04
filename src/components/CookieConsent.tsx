'use client'

import { useState, useEffect } from 'react'

export default function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false)

    useEffect(() => {
        // LocalStorage'dan cookie onayını kontrol et
        const consent = localStorage.getItem('cookie-consent')
        if (!consent) {
            setShowBanner(true)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted')
        setShowBanner(false)
    }

    const handleReject = () => {
        localStorage.setItem('cookie-consent', 'rejected')
        setShowBanner(false)
    }

    if (!showBanner) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-slate-900/95 backdrop-blur-lg border-t border-white/10 shadow-2xl">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                    <p className="text-white text-sm">
                        🍪 Bu site çerezleri kullanmaktadır. Siteyi kullanarak{' '}
                        <a href="/gizlilik" className="text-blue-400 hover:underline">
                            gizlilik politikamızı
                        </a>{' '}
                        kabul etmiş olursunuz.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleReject}
                        className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg transition"
                    >
                        Reddet
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg shadow-lg transition"
                    >
                        Kabul Et
                    </button>
                </div>
            </div>
        </div>
    )
}
