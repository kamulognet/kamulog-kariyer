'use client'

import { useState, useEffect } from 'react'
import {
    Save,
    FileText,
    AlertCircle,
    CheckCircle2,
    Globe,
    Info,
    Phone,
    Shield,
    BookOpen
} from 'lucide-react'

interface PageContent {
    about: string
    contact: string
    privacy: string
    terms: string
}

const defaultContent = {
    about: 'Kariyer Kamulog, yapay zeka destekli CV oluşturma ve iş eşleştirme platformudur.',
    contact: 'E-posta: info@kariyerkamulog.com\nTelefon: +90 555 123 4567',
    privacy: 'Gizlilik politikamız hakkında bilgi.',
    terms: 'Kullanım şartları ve koşulları.'
}

export default function PagesAdminPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('about')
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [content, setContent] = useState<PageContent>(defaultContent)

    useEffect(() => {
        loadContent()
    }, [])

    const loadContent = async () => {
        try {
            const res = await fetch('/api/settings/pages')
            const data = await res.json()
            if (data && typeof data === 'object') {
                setContent({ ...defaultContent, ...data })
            }
        } catch (error) {
            console.error('Error loading content:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        setMessage(null)

        try {
            const res = await fetch('/api/settings/pages', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content)
            })

            if (res.ok) {
                setMessage({ type: 'success', text: 'Sayfa içerikleri başarıyla kaydedildi' })
            } else {
                setMessage({ type: 'error', text: 'Kaydetme başarısız' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Bir hata oluştu' })
        } finally {
            setSaving(false)
        }
    }

    const tabs = [
        { id: 'about', label: 'Hakkımızda', icon: Info },
        { id: 'contact', label: 'İletişim', icon: Phone },
        { id: 'privacy', label: 'Gizlilik Politikası', icon: Shield },
        { id: 'terms', label: 'Kullanım Şartları', icon: BookOpen },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Sayfa İçerikleri</h1>
                    <p className="text-slate-400">Alt sayfa içeriklerini düzenleyin</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-xl transition disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${activeTab === tab.id
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Content Editor */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-400" />
                    {tabs.find(t => t.id === activeTab)?.label}
                </h2>

                <textarea
                    value={content[activeTab as keyof PageContent]}
                    onChange={(e) => setContent({ ...content, [activeTab]: e.target.value })}
                    rows={15}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none font-mono text-sm"
                    placeholder={`${tabs.find(t => t.id === activeTab)?.label} içeriğini buraya yazın...`}
                />

                <p className="mt-3 text-sm text-slate-500">
                    Not: HTML kullanabilirsiniz. Satır sonları için yeni satır ekleyin.
                </p>
            </div>
        </div>
    )
}
