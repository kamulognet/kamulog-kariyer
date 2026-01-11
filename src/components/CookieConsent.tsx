'use client'

import { useState, useEffect } from 'react'
import { Cookie, X } from 'lucide-react'

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false)
    const [consentText, setConsentText] = useState('')

    useEffect(() => {
        // Check if user already made a choice
        const consent = localStorage.getItem('cookie-consent')
        if (!consent) {
            setIsVisible(true)
        }

        // Load custom consent text from admin settings
        loadConsentText()
    }, [])

    const loadConsentText = async () => {
        try {
            const res = await fetch('/api/settings/pages')
            const data = await res.json()
            if (data.cookieConsent) {
                setConsentText(data.cookieConsent)
            }
        } catch (error) {
            console.error('Error loading cookie consent text:', error)
        }
    }

    const handleAccept = async () => {
        try {
            // Veritabanına IP ile kaydet
            await fetch('/api/cookie-consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ consentType: 'all' })
            })
        } catch (error) {
            console.error('Cookie consent API error:', error)
        }

        // LocalStorage'a kaydet
        localStorage.setItem('cookie-consent', 'accepted')
        // Cookie yaz (30 gün)
        document.cookie = `cookie_consent=accepted; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`
        setIsVisible(false)
    }

    const handleReject = async () => {
        try {
            // Reddedenleri de kaydet
            await fetch('/api/cookie-consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ consentType: 'necessary' })
            })
        } catch (error) {
            console.error('Cookie consent API error:', error)
        }

        localStorage.setItem('cookie-consent', 'rejected')
        document.cookie = `cookie_consent=rejected; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`
        setIsVisible(false)
    }

    if (!isVisible) return null

    const defaultText = 'Bu web sitesi, deneyiminizi geliştirmek için çerezler kullanmaktadır. Sitemizi kullanmaya devam ederek çerez politikamızı kabul etmiş olursunuz.'

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
            <div className="max-w-4xl mx-auto bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex-shrink-0 p-3 bg-purple-500/20 rounded-xl">
                        <Cookie className="w-6 h-6 text-purple-400" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">Çerez Kullanımı</h3>
                        <p className="text-slate-400 text-sm">
                            {consentText || defaultText}
                        </p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={handleReject}
                            className="flex-1 md:flex-none px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition text-sm"
                        >
                            Reddet
                        </button>
                        <button
                            onClick={handleAccept}
                            className="flex-1 md:flex-none px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition text-sm font-medium"
                        >
                            Kabul Et
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
