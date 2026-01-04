'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, ArrowLeft, FileText, Cookie, Shield, ScrollText, Mail } from 'lucide-react'

interface PageContent {
    privacy: string
    terms: string
    cookieConsent: string
    about: string
    contact: string
    address: string
    phone: string
    email: string
    mapEmbed: string
}

export default function AdminContentPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [content, setContent] = useState<PageContent>({
        privacy: '',
        terms: '',
        cookieConsent: '',
        about: '',
        contact: '',
        address: '',
        phone: '',
        email: '',
        mapEmbed: ''
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [activeTab, setActiveTab] = useState('privacy')

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (session?.user?.role !== 'ADMIN') {
            router.push('/panel')
        }
    }, [status, session, router])

    useEffect(() => {
        if (session?.user?.role === 'ADMIN') {
            loadContent()
        }
    }, [session])

    const loadContent = async () => {
        try {
            const res = await fetch('/api/admin/settings?key=page_content')
            const data = await res.json()
            if (data.value) {
                setContent({ ...content, ...data.value })
            }
        } catch (error) {
            console.error('Error loading content:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        setMessage('')

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'page_content', value: content })
            })

            if (res.ok) {
                setMessage('İçerikler başarıyla kaydedildi!')
                setTimeout(() => setMessage(''), 3000)
            } else {
                setMessage('Kaydetme hatası!')
            }
        } catch (error) {
            console.error('Error saving content:', error)
            setMessage('Kaydetme hatası!')
        } finally {
            setSaving(false)
        }
    }

    const tabs = [
        { id: 'privacy', label: 'Gizlilik Politikası', icon: Shield },
        { id: 'terms', label: 'Kullanım Şartları', icon: ScrollText },
        { id: 'cookieConsent', label: 'Çerez Onay Metni', icon: Cookie },
        { id: 'about', label: 'Hakkımızda', icon: FileText },
        { id: 'contact', label: 'İletişim Bilgileri', icon: Mail },
    ]

    if (session?.user?.role !== 'ADMIN') {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/yonetim" className="text-slate-400 hover:text-white transition">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <h1 className="text-xl font-bold text-white">Sayfa İçerikleri</h1>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {message && (
                    <div className={`mb-6 px-4 py-3 rounded-lg ${message.includes('başarı') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {message}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                    </div>
                ) : (
                    <div className="flex gap-6">
                        {/* Tabs */}
                        <div className="w-64 flex-shrink-0">
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-4">
                                <nav className="space-y-2">
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === tab.id
                                                    ? 'bg-purple-600 text-white'
                                                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                                                }`}
                                        >
                                            <tab.icon className="w-5 h-5" />
                                            <span className="text-sm">{tab.label}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
                            {activeTab === 'privacy' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Gizlilik Politikası</h3>
                                    <textarea
                                        value={content.privacy}
                                        onChange={(e) => setContent({ ...content, privacy: e.target.value })}
                                        rows={20}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                        placeholder="Gizlilik politikası içeriğini buraya yazın..."
                                    />
                                </div>
                            )}

                            {activeTab === 'terms' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Kullanım Şartları</h3>
                                    <textarea
                                        value={content.terms}
                                        onChange={(e) => setContent({ ...content, terms: e.target.value })}
                                        rows={20}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                        placeholder="Kullanım şartları içeriğini buraya yazın..."
                                    />
                                </div>
                            )}

                            {activeTab === 'cookieConsent' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Çerez Onay Metni</h3>
                                    <p className="text-slate-400 text-sm mb-4">
                                        Bu metin, kullanıcılara çerez onay banner'ında gösterilecektir.
                                    </p>
                                    <textarea
                                        value={content.cookieConsent}
                                        onChange={(e) => setContent({ ...content, cookieConsent: e.target.value })}
                                        rows={6}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                        placeholder="Bu web sitesi, deneyiminizi geliştirmek için çerezler kullanmaktadır..."
                                    />
                                </div>
                            )}

                            {activeTab === 'about' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Hakkımızda</h3>
                                    <textarea
                                        value={content.about}
                                        onChange={(e) => setContent({ ...content, about: e.target.value })}
                                        rows={10}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                        placeholder="Şirket hakkında bilgi..."
                                    />
                                </div>
                            )}

                            {activeTab === 'contact' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">İletişim Bilgileri</h3>

                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Adres</label>
                                        <input
                                            type="text"
                                            value={content.address}
                                            onChange={(e) => setContent({ ...content, address: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="Şirket adresi..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Telefon</label>
                                        <input
                                            type="text"
                                            value={content.phone}
                                            onChange={(e) => setContent({ ...content, phone: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="+90 XXX XXX XX XX"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={content.email}
                                            onChange={(e) => setContent({ ...content, email: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="info@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Google Maps Embed URL</label>
                                        <input
                                            type="text"
                                            value={content.mapEmbed}
                                            onChange={(e) => setContent({ ...content, mapEmbed: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="https://www.google.com/maps/embed?..."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
