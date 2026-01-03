'use client'

import { useState, useEffect } from 'react'
import {
    Save,
    MessageCircle,
    AlertCircle,
    CheckCircle2,
    Phone,
    Eye,
    EyeOff,
    Smartphone
} from 'lucide-react'

interface WhatsAppSettings {
    phoneNumber: string
    enabled: boolean
    defaultMessage: string
}

const defaultSettings: WhatsAppSettings = {
    phoneNumber: '',
    enabled: true,
    defaultMessage: 'Merhaba, bilgi almak istiyorum.'
}

export default function WhatsAppAdminPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [settings, setSettings] = useState<WhatsAppSettings>(defaultSettings)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const res = await fetch('/api/settings/whatsapp')
            const data = await res.json()
            if (data && typeof data === 'object') {
                setSettings({ ...defaultSettings, ...data })
            }
        } catch (error) {
            console.error('Error loading settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        setMessage(null)

        try {
            const res = await fetch('/api/settings/whatsapp', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })

            if (res.ok) {
                setMessage({ type: 'success', text: 'WhatsApp ayarları kaydedildi' })
            } else {
                setMessage({ type: 'error', text: 'Kaydetme başarısız' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Bir hata oluştu' })
        } finally {
            setSaving(false)
        }
    }

    const formatPhonePreview = () => {
        let phone = settings.phoneNumber.replace(/\D/g, '')
        if (phone.startsWith('0')) phone = '90' + phone.substring(1)
        else if (!phone.startsWith('90')) phone = '90' + phone
        return phone
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <MessageCircle className="w-6 h-6 text-green-400" />
                        WhatsApp Ayarları
                    </h1>
                    <p className="text-slate-400">Sitede görünen WhatsApp iletişim butonunu yönetin</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-medium rounded-xl transition disabled:opacity-50"
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

            <div className="grid md:grid-cols-2 gap-8">
                {/* Settings */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-white">Buton Ayarları</h2>

                    {/* Enable/Disable */}
                    <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                        <div className="flex items-center gap-3">
                            {settings.enabled ? (
                                <Eye className="w-5 h-5 text-green-400" />
                            ) : (
                                <EyeOff className="w-5 h-5 text-slate-400" />
                            )}
                            <div>
                                <p className="text-white font-medium">Butonu Göster</p>
                                <p className="text-sm text-slate-400">Sitede WhatsApp butonu görünsün mü?</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                            className={`w-14 h-8 rounded-full transition relative ${settings.enabled ? 'bg-green-600' : 'bg-slate-600'
                                }`}
                        >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition ${settings.enabled ? 'left-7' : 'left-1'
                                }`} />
                        </button>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Telefon Numarası
                        </label>
                        <div className="flex">
                            <span className="px-4 py-3 bg-slate-700 border border-slate-600 border-r-0 rounded-l-xl text-slate-400">
                                +90
                            </span>
                            <input
                                type="tel"
                                value={settings.phoneNumber}
                                onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-r-xl text-white focus:ring-2 focus:ring-green-500 outline-none font-mono"
                                placeholder="5551234567"
                                maxLength={10}
                            />
                        </div>
                        <p className="text-xs text-slate-500">10 haneli telefon numarası (başında 0 olmadan)</p>
                    </div>

                    {/* Default Message */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Varsayılan Mesaj
                        </label>
                        <textarea
                            value={settings.defaultMessage}
                            onChange={(e) => setSettings({ ...settings, defaultMessage: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-green-500 outline-none resize-none"
                            placeholder="Merhaba, bilgi almak istiyorum."
                        />
                        <p className="text-xs text-slate-500">Kullanıcı butona tıkladığında açılacak varsayılan mesaj</p>
                    </div>
                </div>

                {/* Preview */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">Önizleme</h2>

                    <div className="relative bg-slate-900 rounded-xl p-8 min-h-[300px]">
                        <p className="text-slate-500 text-sm text-center mb-8">Site görünümü simülasyonu</p>

                        {settings.enabled && settings.phoneNumber.length === 10 && (
                            <div className="absolute bottom-4 right-4">
                                <div className="relative group">
                                    <button className="w-14 h-14 bg-green-500 hover:bg-green-400 rounded-full shadow-lg shadow-green-500/30 flex items-center justify-center transition-transform hover:scale-110">
                                        <MessageCircle className="w-7 h-7 text-white fill-white" />
                                    </button>
                                    <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap">
                                        +90 {settings.phoneNumber}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!settings.enabled && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-slate-500">Buton devre dışı</p>
                            </div>
                        )}

                        {settings.enabled && settings.phoneNumber.length < 10 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-yellow-500 text-sm">Telefon numarası giriniz</p>
                            </div>
                        )}
                    </div>

                    {settings.phoneNumber.length === 10 && (
                        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <p className="text-green-400 text-sm">
                                <Smartphone className="w-4 h-4 inline mr-2" />
                                WhatsApp linki: wa.me/{formatPhonePreview()}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
