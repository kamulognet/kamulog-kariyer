'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
    User,
    Mail,
    Phone,
    Lock,
    MapPin,
    Building2,
    Save,
    AlertCircle,
    CheckCircle2,
    ShieldCheck
} from 'lucide-react'
import PanelHeader from '@/components/PanelHeader'

export default function ProfilePage() {
    const { data: session, update } = useSession()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [activeTab, setActiveTab] = useState<'personal' | 'billing' | 'account'>('personal')

    const [form, setForm] = useState({
        name: '',
        phoneNumber: '',
        address: '',
        city: '',
        district: '',
        taxNumber: '',
        taxOffice: '',
        currentEmail: '',
        newEmail: '',
        emailCode: '',
        password: '',
        confirmPassword: ''
    })

    const [emailChangeStep, setEmailChangeStep] = useState<'idle' | 'verify'>('idle')

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            const res = await fetch('/api/user/profile')
            const data = await res.json()
            if (data.user) {
                setForm(prev => ({
                    ...prev,
                    name: data.user.name || '',
                    phoneNumber: data.user.phoneNumber || '',
                    address: data.user.address || '',
                    city: data.user.city || '',
                    district: data.user.district || '',
                    taxNumber: data.user.taxNumber || '',
                    taxOffice: data.user.taxOffice || '',
                    currentEmail: data.user.email || ''
                }))
            }
        } catch (error) {
            console.error('Error loading profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })

            const data = await res.json()
            if (res.ok) {
                setMessage({ type: 'success', text: 'Profil başarıyla güncellendi' })
                update({ name: form.name })
            } else {
                setMessage({ type: 'error', text: data.error || 'Güncelleme başarısız' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Bir hata oluştu' })
        } finally {
            setSaving(false)
        }
    }

    const handleEmailChangeRequest = async () => {
        if (!form.newEmail) return
        setSaving(true)
        try {
            const res = await fetch('/api/user/profile/email-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newEmail: form.newEmail })
            })
            const data = await res.json()
            if (res.ok) {
                setEmailChangeStep('verify')
                setMessage({ type: 'success', text: 'Doğrulama kodu gönderildi. Lütfen konsolu kontrol edin (Simülasyon).' })
            } else {
                setMessage({ type: 'error', text: data.error || 'Hata oluştu' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Bir hata oluştu' })
        } finally {
            setSaving(false)
        }
    }

    const handleVerifyEmail = async () => {
        if (!form.emailCode) return
        setSaving(true)
        try {
            const res = await fetch('/api/user/profile/email-verification', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: form.emailCode })
            })
            const data = await res.json()
            if (res.ok) {
                setMessage({ type: 'success', text: 'E-posta başarıyla değiştirildi.' })
                setForm(prev => ({ ...prev, currentEmail: form.newEmail, newEmail: '', emailCode: '' }))
                setEmailChangeStep('idle')
                loadProfile()
            } else {
                setMessage({ type: 'error', text: data.error || 'Doğrulama başarısız' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Bir hata oluştu' })
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordChange = async () => {
        if (!form.password || form.password !== form.confirmPassword) {
            setMessage({ type: 'error', text: 'Şifreler uyuşmuyor' })
            return
        }
        setSaving(true)
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: form.password })
            })
            if (res.ok) {
                setMessage({ type: 'success', text: 'Şifre başarıyla güncellendi' })
                setForm(prev => ({ ...prev, password: '', confirmPassword: '' }))
            } else {
                const data = await res.json()
                setMessage({ type: 'error', text: data.error || 'Hata oluştu' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Bir hata oluştu' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <PanelHeader />
            <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <User className="w-6 h-6 text-purple-400" />
                            Profil Ayarları
                        </h1>
                        <p className="text-slate-400">Kişisel bilgilerinizi ve hesap ayarlarınızı yönetin</p>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                        }`}>
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                        <p className="text-sm">{message.text}</p>
                    </div>
                )}

                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-700">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`px-6 py-4 text-sm font-medium transition flex items-center gap-2 ${activeTab === 'personal' ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/5' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <User className="w-4 h-4" />
                            Kişisel Bilgiler
                        </button>
                        <button
                            onClick={() => setActiveTab('billing')}
                            className={`px-6 py-4 text-sm font-medium transition flex items-center gap-2 ${activeTab === 'billing' ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/5' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <Building2 className="w-4 h-4" />
                            Fatura Bilgileri
                        </button>
                        <button
                            onClick={() => setActiveTab('account')}
                            className={`px-6 py-4 text-sm font-medium transition flex items-center gap-2 ${activeTab === 'account' ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/5' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Hesap ve Güvenlik
                        </button>
                    </div>

                    <div className="p-8">
                        {activeTab === 'personal' && (
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Ad Soyad</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                                placeholder="Adınız Soyadınız"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Telefon</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type="tel"
                                                value={form.phoneNumber}
                                                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                                placeholder="+90 5xx xxx xx xx"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 text-white font-medium rounded-xl transition shadow-lg shadow-purple-500/20"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                                </button>
                            </form>
                        )}

                        {activeTab === 'billing' && (
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Adres</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                        <textarea
                                            value={form.address}
                                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none min-h-[100px]"
                                            placeholder="Fatura adresi..."
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Şehir</label>
                                        <input
                                            type="text"
                                            value={form.city}
                                            onChange={(e) => setForm({ ...form, city: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="Şehir"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">İlçe</label>
                                        <input
                                            type="text"
                                            value={form.district}
                                            onChange={(e) => setForm({ ...form, district: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="İlçe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Vergi No / T.C. Kimlik</label>
                                        <input
                                            type="text"
                                            value={form.taxNumber}
                                            onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="Vergi No veya T.C. Kimlik"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Vergi Dairesi</label>
                                        <input
                                            type="text"
                                            value={form.taxOffice}
                                            onChange={(e) => setForm({ ...form, taxOffice: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="Vergi Dairesi"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 text-white font-medium rounded-xl transition shadow-lg shadow-purple-500/20"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                                </button>
                            </form>
                        )}

                        {activeTab === 'account' && (
                            <div className="space-y-8">
                                {/* Email Change */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-blue-400" />
                                        E-posta Adresi
                                    </h3>
                                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 space-y-4">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm text-slate-400">Mevcut E-posta</p>
                                                <p className="text-white font-medium">{form.currentEmail}</p>
                                            </div>
                                            {emailChangeStep === 'idle' ? (
                                                <div className="flex-1 max-w-sm space-y-2">
                                                    <input
                                                        type="email"
                                                        value={form.newEmail}
                                                        onChange={(e) => setForm({ ...form, newEmail: e.target.value })}
                                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Yeni e-posta adresi"
                                                    />
                                                    <button
                                                        onClick={handleEmailChangeRequest}
                                                        disabled={saving || !form.newEmail}
                                                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-sm font-medium rounded-lg transition"
                                                    >
                                                        Değiştirme Kodu Gönder
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex-1 max-w-sm space-y-2">
                                                    <p className="text-xs text-blue-400">Doğrulama kodu {form.newEmail} adresine gönderildi.</p>
                                                    <input
                                                        type="text"
                                                        value={form.emailCode}
                                                        onChange={(e) => setForm({ ...form, emailCode: e.target.value })}
                                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm font-mono tracking-widest text-center"
                                                        placeholder="6 Haneli Kod"
                                                        maxLength={6}
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={handleVerifyEmail}
                                                            disabled={saving || form.emailCode.length < 6}
                                                            className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition"
                                                        >
                                                            Onayla
                                                        </button>
                                                        <button
                                                            onClick={() => setEmailChangeStep('idle')}
                                                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition"
                                                        >
                                                            İptal
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Password Change */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Lock className="w-5 h-5 text-orange-400" />
                                        Şifre Değiştir
                                    </h3>
                                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm text-slate-400">Yeni Şifre</label>
                                                <input
                                                    type="password"
                                                    value={form.password}
                                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-orange-500"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-slate-400">Şifre Tekrar</label>
                                                <input
                                                    type="password"
                                                    value={form.confirmPassword}
                                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-orange-500"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={handlePasswordChange}
                                            disabled={saving || !form.password}
                                            className="px-6 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-600/50 text-white text-sm font-medium rounded-lg transition"
                                        >
                                            Şifreyi Güncelle
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
