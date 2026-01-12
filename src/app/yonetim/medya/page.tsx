'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Image as ImageIcon,
    FolderPlus,
    Upload,
    Trash2,
    Loader2,
    X,
    Copy,
    Check,
    Link as LinkIcon,
    Edit3,
    Eye,
    EyeOff
} from 'lucide-react'

interface MediaCategory {
    id: string
    name: string
    slug: string
    _count: { media: number }
}

interface Media {
    id: string
    filename: string
    url: string
    mimeType: string | null
    size: number | null
    link?: string | null
    isActive?: boolean
    createdAt: string
    category: { name: string } | null
}

export default function MediaPage() {
    const [categories, setCategories] = useState<MediaCategory[]>([])
    const [media, setMedia] = useState<Media[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const [showLinkModal, setShowLinkModal] = useState(false)
    const [editingMedia, setEditingMedia] = useState<Media | null>(null)
    const [mediaLink, setMediaLink] = useState('')
    const [newCategoryName, setNewCategoryName] = useState('')
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

    const loadMedia = useCallback(async () => {
        try {
            const url = selectedCategory
                ? `/api/admin/media?categoryId=${selectedCategory}`
                : '/api/admin/media'
            const res = await fetch(url)
            const data = await res.json()
            setCategories(data.categories || [])
            setMedia(data.media || [])
        } catch (error) {
            console.error('Load error:', error)
        } finally {
            setLoading(false)
        }
    }, [selectedCategory])

    useEffect(() => {
        loadMedia()
    }, [loadMedia])

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return

        try {
            const formData = new FormData()
            formData.append('action', 'createCategory')
            formData.append('name', newCategoryName)

            const res = await fetch('/api/admin/media', {
                method: 'POST',
                body: formData
            })

            if (res.ok) {
                setNewCategoryName('')
                setShowCategoryModal(false)
                loadMedia()
            }
        } catch (error) {
            console.error('Create category error:', error)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files?.length) return

        setUploading(true)

        for (const file of Array.from(files)) {
            try {
                const formData = new FormData()
                formData.append('action', 'uploadMedia')
                formData.append('file', file)
                if (selectedCategory) {
                    formData.append('categoryId', selectedCategory)
                }

                await fetch('/api/admin/media', {
                    method: 'POST',
                    body: formData
                })
            } catch (error) {
                console.error('Upload error:', error)
            }
        }

        setUploading(false)
        loadMedia()
        e.target.value = ''
    }

    const handleDelete = async (mediaId: string) => {
        if (!confirm('Bu görseli silmek istediğinize emin misiniz?')) return

        try {
            await fetch(`/api/admin/media?mediaId=${mediaId}`, { method: 'DELETE' })
            loadMedia()
        } catch (error) {
            console.error('Delete error:', error)
        }
    }

    const handleDeleteCategory = async (categoryId: string) => {
        if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return

        try {
            await fetch(`/api/admin/media?categoryId=${categoryId}`, { method: 'DELETE' })
            setSelectedCategory('')
            loadMedia()
        } catch (error) {
            console.error('Delete category error:', error)
        }
    }

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(window.location.origin + url)
        setCopiedUrl(url)
        setTimeout(() => setCopiedUrl(null), 2000)
    }

    const formatSize = (bytes: number | null) => {
        if (!bytes) return '-'
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const openLinkModal = (item: Media) => {
        setEditingMedia(item)
        setMediaLink(item.link || '')
        setShowLinkModal(true)
    }

    const handleUpdateLink = async () => {
        if (!editingMedia) return

        try {
            const res = await fetch('/api/admin/media', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mediaId: editingMedia.id,
                    link: mediaLink
                })
            })

            if (res.ok) {
                setShowLinkModal(false)
                setEditingMedia(null)
                loadMedia()
            }
        } catch (error) {
            console.error('Link update error:', error)
        }
    }

    const handleToggleActive = async (item: Media) => {
        try {
            await fetch('/api/admin/media', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mediaId: item.id,
                    isActive: !item.isActive
                })
            })
            loadMedia()
        } catch (error) {
            console.error('Toggle active error:', error)
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Medya Yönetimi</h1>
                    <p className="text-slate-400">Görselleri yükleyin ve yönetin</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowCategoryModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                    >
                        <FolderPlus className="w-4 h-4" />
                        Kategori Ekle
                    </button>
                    <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition cursor-pointer">
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Yükleniyor...' : 'Görsel Yükle'}
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                    </label>
                </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${!selectedCategory
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                >
                    Tümü ({media.length})
                </button>
                {categories.map(cat => (
                    <div key={cat.id} className="flex items-center">
                        <button
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-l-lg font-medium transition ${selectedCategory === cat.id
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                        >
                            {cat.name} ({cat._count.media})
                        </button>
                        <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="px-2 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-r-lg transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Media Grid */}
            {media.length === 0 ? (
                <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-slate-700">
                    <ImageIcon className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Henüz görsel yok</h3>
                    <p className="text-slate-400">Görsel yüklemek için yukarıdaki butonu kullanın</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {media.map(item => (
                        <div
                            key={item.id}
                            className="group relative bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-500 transition"
                        >
                            <div className="aspect-square">
                                <img
                                    src={item.url}
                                    alt={item.filename}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-3">
                                <div className="flex justify-end gap-1 flex-wrap">
                                    <button
                                        onClick={() => openLinkModal(item)}
                                        className={`p-2 rounded-lg transition ${item.link ? 'bg-green-600 hover:bg-green-500' : 'bg-slate-700 hover:bg-slate-600'}`}
                                        title={item.link ? 'Link Düzenle: ' + item.link : 'Link Ekle'}
                                    >
                                        <LinkIcon className="w-4 h-4 text-white" />
                                    </button>
                                    <button
                                        onClick={() => handleToggleActive(item)}
                                        className={`p-2 rounded-lg transition ${item.isActive !== false ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-700 hover:bg-slate-600'}`}
                                        title={item.isActive !== false ? 'Aktif (Slider\'da görünür)' : 'Pasif (Slider\'da görünmez)'}
                                    >
                                        {item.isActive !== false ? (
                                            <Eye className="w-4 h-4 text-white" />
                                        ) : (
                                            <EyeOff className="w-4 h-4 text-white" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => copyUrl(item.url)}
                                        className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                                        title="URL Kopyala"
                                    >
                                        {copiedUrl === item.url ? (
                                            <Check className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-white" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition"
                                        title="Sil"
                                    >
                                        <Trash2 className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                                <div className="text-xs text-slate-300 truncate">
                                    {item.filename}
                                    <div className="text-slate-500">{formatSize(item.size)}</div>
                                    {item.link && (
                                        <div className="text-green-400 truncate">🔗 {item.link}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                    <div className="bg-slate-800 rounded-xl w-full max-w-md p-6 border border-slate-700">
                        <h2 className="text-xl font-bold text-white mb-4">Yeni Kategori</h2>
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={e => setNewCategoryName(e.target.value)}
                            placeholder="Kategori adı"
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white mb-4"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCategoryModal(false)}
                                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleCreateCategory}
                                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition"
                            >
                                Oluştur
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Link Editor Modal */}
            {showLinkModal && editingMedia && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                    <div className="bg-slate-800 rounded-xl w-full max-w-md p-6 border border-slate-700">
                        <h2 className="text-xl font-bold text-white mb-2">Link Düzenle</h2>
                        <p className="text-slate-400 text-sm mb-4">{editingMedia.filename}</p>
                        <div className="mb-4">
                            <label className="text-sm text-slate-400 mb-1 block">Tıklandığında yönlendirilecek URL</label>
                            <input
                                type="url"
                                value={mediaLink}
                                onChange={e => setMediaLink(e.target.value)}
                                placeholder="https://example.com"
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                autoFocus
                            />
                            <p className="text-xs text-slate-500 mt-1">Boş bırakırsanız görsel tıklanamaz olur</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowLinkModal(false)
                                    setEditingMedia(null)
                                }}
                                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleUpdateLink}
                                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition"
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
