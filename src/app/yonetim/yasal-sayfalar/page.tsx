'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, Save, Loader2, Eye, RefreshCw } from 'lucide-react'

interface LegalPage {
    key: string
    title: string
    hasCustomContent: boolean
}

export default function LegalPagesPage() {
    const [pages, setPages] = useState<LegalPage[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPage, setSelectedPage] = useState<string | null>(null)
    const [content, setContent] = useState('')
    const [saving, setSaving] = useState(false)
    const [loadingContent, setLoadingContent] = useState(false)

    const loadPages = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/legal')
            const data = await res.json()
            setPages(data.pages || [])
        } catch (error) {
            console.error('Load error:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadPages()
    }, [loadPages])

    const loadPageContent = async (page: string) => {
        setLoadingContent(true)
        setSelectedPage(page)
        try {
            const res = await fetch(`/api/admin/legal?page=${page}`)
            const data = await res.json()
            setContent(data.content || '')
        } catch (error) {
            console.error('Load content error:', error)
        } finally {
            setLoadingContent(false)
        }
    }

    const saveContent = async () => {
        if (!selectedPage) return
        setSaving(true)
        try {
            const res = await fetch('/api/admin/legal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ page: selectedPage, content })
            })
            if (res.ok) {
                loadPages()
            }
        } catch (error) {
            console.error('Save error:', error)
        } finally {
            setSaving(false)
        }
    }

    const getPreviewUrl = (page: string) => {
        switch (page) {
            case 'kvkk': return '/kvkk'
            case 'gizlilik': return '/gizlilik'
            case 'kullanim-kosullari': return '/kullanim-kosullari'
            default: return '/'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Yasal Sayfalar</h1>
                <p className="text-slate-400">KVKK, Gizlilik ve Kullanım Koşulları sayfalarını düzenleyin</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Page List */}
                <div className="space-y-3">
                    {pages.map(page => (
                        <button
                            key={page.key}
                            onClick={() => loadPageContent(page.key)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition ${selectedPage === page.key
                                    ? 'bg-purple-600/20 border-purple-500'
                                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <FileText className={`w-5 h-5 ${selectedPage === page.key ? 'text-purple-400' : 'text-slate-500'}`} />
                                <div className="text-left">
                                    <p className="text-white font-medium">{page.title}</p>
                                    <p className="text-xs text-slate-500">
                                        {page.hasCustomContent ? 'Özelleştirilmiş' : 'Varsayılan'}
                                    </p>
                                </div>
                            </div>
                            <a
                                href={getPreviewUrl(page.key)}
                                target="_blank"
                                onClick={e => e.stopPropagation()}
                                className="p-2 hover:bg-slate-700 rounded-lg transition"
                            >
                                <Eye className="w-4 h-4 text-slate-400" />
                            </a>
                        </button>
                    ))}
                </div>

                {/* Editor */}
                <div className="lg:col-span-2">
                    {!selectedPage ? (
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8 text-center">
                            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">Düzenlemek için bir sayfa seçin</p>
                        </div>
                    ) : loadingContent ? (
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                                <h2 className="text-white font-semibold">
                                    {pages.find(p => p.key === selectedPage)?.title}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => loadPageContent(selectedPage)}
                                        className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-400"
                                        title="Yenile"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={saveContent}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        Kaydet
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-slate-500 mb-3">
                                    Markdown formatında yazabilirsiniz. # başlık, ## alt başlık, **kalın**, - liste
                                </p>
                                <textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    className="w-full h-96 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Sayfa içeriğini buraya yazın..."
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-sm text-blue-300">
                <strong>Bilgi:</strong> Yasal sayfalardaki değişiklikler hemen canlıya yansır.
                Varsayılan içerik kullanılıyorsa, sayfa düzenlenene kadar kod içindeki metin gösterilir.
            </div>
        </div>
    )
}
