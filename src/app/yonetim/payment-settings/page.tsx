'use client'

import { useState, useEffect } from 'react'
import {
    Save,
    CreditCard,
    Building2,
    Phone,
    FileText,
    AlertCircle,
    CheckCircle2,
    Landmark
} from 'lucide-react'

interface PaymentInfo {
    companyName: string
    companyNote: string
    iban: string
    bankName: string
    whatsappNumber: string
    vkn: string
    taxOffice: string
    salesAgreement: string
    refundPolicy: string
}

export default function PaymentSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [form, setForm] = useState<PaymentInfo>({
        companyName: '',
        companyNote: '',
        iban: '',
        bankName: '',
        whatsappNumber: '',
        vkn: '',
        taxOffice: '',
        salesAgreement: '',
        refundPolicy: ''
    })

    useEffect(() => {
        loadPaymentInfo()
    }, [])

    const loadPaymentInfo = async () => {
        try {
            const res = await fetch('/api/settings/payment')
            const data = await res.json()
            setForm({ ...form, ...data })
        } catch (error) {
            console.error('Error loading payment info:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        setMessage(null)

        try {
            const res = await fetch('/api/settings/payment', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })

            if (res.ok) {
                setMessage({ type: 'success', text: 'Ödeme bilgileri başarıyla kaydedildi' })
            } else {
                setMessage({ type: 'error', text: 'Kaydetme başarısız' })
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
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Ödeme Ayarları</h1>
                    <p className="text-slate-400">IBAN, şirket bilgileri, vergi bilgileri ve sözleşmeleri yönetin</p>
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

            {/* Şirket Bilgileri */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    Şirket Bilgileri
                </h2>

                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm text-slate-400">Şirket / Alıcı Adı</label>
                            <input
                                type="text"
                                value={form.companyName}
                                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                placeholder="SUAT HAYRİ ŞAHİN"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-slate-400">Banka Adı</label>
                            <input
                                type="text"
                                value={form.bankName}
                                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                placeholder="İş Bankası"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">Şirket Notu (Ödeme ekranında görünecek)</label>
                        <input
                            type="text"
                            value={form.companyNote}
                            onChange={(e) => setForm({ ...form, companyNote: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="(Şahıs firması olduğu için ünvan alınana kadar *alıcı kısmına şirket sahibi ismi girilmeli*)"
                        />
                    </div>
                </div>
            </div>

            {/* Vergi Bilgileri */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-purple-400" />
                    Vergi Bilgileri
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">VKN (Vergi Kimlik Numarası)</label>
                        <input
                            type="text"
                            value={form.vkn}
                            onChange={(e) => setForm({ ...form, vkn: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="7960109842"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">Vergi Dairesi</label>
                        <input
                            type="text"
                            value={form.taxOffice}
                            onChange={(e) => setForm({ ...form, taxOffice: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="Sultanbeyli Vergi Dairesi Müdürlüğü"
                        />
                    </div>
                </div>
            </div>

            {/* IBAN ve WhatsApp */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-400" />
                    Ödeme Bilgileri
                </h2>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">IBAN Numarası</label>
                        <input
                            type="text"
                            value={form.iban}
                            onChange={(e) => setForm({ ...form, iban: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="TR41 0001 5001 5800 7366 1834 72"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-slate-400 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            WhatsApp Numarası
                        </label>
                        <input
                            type="text"
                            value={form.whatsappNumber}
                            onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="+905551234567"
                        />
                        <p className="text-xs text-slate-500">Ülke kodu ile birlikte yazın (örn: +90...)</p>
                    </div>
                </div>
            </div>

            {/* Sözleşmeler */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-400" />
                    Sözleşmeler
                </h2>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">Mesafeli Satış Sözleşmesi</label>
                        <textarea
                            value={form.salesAgreement}
                            onChange={(e) => setForm({ ...form, salesAgreement: e.target.value })}
                            rows={8}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                            placeholder="Mesafeli satış sözleşmesi metnini buraya yazın..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">Dijital Ürün İade Politikası</label>
                        <textarea
                            value={form.refundPolicy}
                            onChange={(e) => setForm({ ...form, refundPolicy: e.target.value })}
                            rows={8}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                            placeholder="Dijital ürün iade politikası metnini buraya yazın..."
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
