'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import PanelHeader from '@/components/PanelHeader'
import {
    CreditCard,
    CheckCircle2,
    Sparkles,
    Shield,
    MessageCircle,
    Building2,
    Copy,
    Check,
    FileText,
    AlertCircle,
    Package,
    ArrowRight
} from 'lucide-react'

interface Plan {
    id: string
    name: string
    price: number
    features: string[]
    popular: boolean
}

interface PaymentInfo {
    companyName: string
    iban: string
    bankName: string
    whatsappNumber: string
    salesAgreement: string
    refundPolicy: string
}

interface OrderDetails {
    orderCode: string
    plan: string
    amount: number
    user: {
        name: string
        email: string
    }
}

export default function PurchasePage() {
    const { data: session } = useSession()
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
    const [plans, setPlans] = useState<Plan[]>([])
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [copied, setCopied] = useState(false)
    const [agreementAccepted, setAgreementAccepted] = useState(false)
    const [refundAccepted, setRefundAccepted] = useState(false)
    const [showAgreement, setShowAgreement] = useState(false)
    const [showRefund, setShowRefund] = useState(false)
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
    const [step, setStep] = useState<'select' | 'confirm' | 'complete'>('select')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [plansRes, paymentRes] = await Promise.all([
                fetch('/api/admin/settings?key=subscription_plans'),
                fetch('/api/settings/payment')
            ])

            const plansData = await plansRes.json()
            if (plansData.value && Array.isArray(plansData.value)) {
                setPlans(plansData.value.filter((p: Plan) => p.price > 0))
            } else {
                setPlans([
                    { id: 'BASIC', name: 'Profesyonel Yükseliş', price: 199, features: ['Ayda 5 CV', '100 AI Mesaj', '20 AI Analiz'], popular: true },
                    { id: 'PREMIUM', name: 'Kamu Lideri', price: 399, features: ['Sınırsız CV', 'Sınırsız AI', 'Öncelikli Destek'], popular: false }
                ])
            }

            const paymentData = await paymentRes.json()
            if (paymentData) {
                setPaymentInfo(paymentData)
            }
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const copyIban = async () => {
        if (paymentInfo?.iban) {
            await navigator.clipboard.writeText(paymentInfo.iban)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handlePurchase = async () => {
        if (!selectedPlan || !session?.user) return

        setProcessing(true)
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan: selectedPlan.id,
                    amount: selectedPlan.price
                })
            })

            const data = await res.json()
            if (res.ok && data.order) {
                setOrderDetails({
                    orderCode: data.order.orderCode,
                    plan: selectedPlan.name,
                    amount: selectedPlan.price,
                    user: {
                        name: data.order.user?.name || session.user.name || '',
                        email: data.order.user?.email || session.user.email || ''
                    }
                })
                setStep('complete')
            } else {
                alert(data.error || 'Sipariş oluşturulamadı')
            }
        } catch (error) {
            alert('Bir hata oluştu')
        } finally {
            setProcessing(false)
        }
    }

    const handleWhatsAppRedirect = () => {
        if (!paymentInfo?.whatsappNumber || !orderDetails) return

        const message = encodeURIComponent(
            `🛒 *YENİ SİPARİŞ*

📋 *Sipariş No:* ${orderDetails.orderCode}
📦 *Plan:* ${orderDetails.plan}
💰 *Tutar:* ${orderDetails.amount} TL

👤 *Müşteri:* ${orderDetails.user.name}
📧 *E-posta:* ${orderDetails.user.email}

Ödeme yaptım, lütfen aboneliğimi aktifleştirin.`
        )

        let phone = paymentInfo.whatsappNumber.replace(/\D/g, '')
        if (phone.startsWith('0')) phone = '90' + phone.substring(1)
        else if (!phone.startsWith('90')) phone = '90' + phone

        window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    }

    const getPlanName = (planId: string) => {
        switch (planId) {
            case 'BASIC': return 'Profesyonel Yükseliş'
            case 'PREMIUM': return 'Kamu Lideri'
            default: return planId
        }
    }

    const canPurchase = agreementAccepted && refundAccepted && selectedPlan

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <PanelHeader />

            <main className="max-w-5xl mx-auto px-4 py-12">
                {step === 'select' && (
                    <>
                        <div className="text-center mb-12">
                            <h1 className="text-3xl font-bold text-white mb-3">Plan Satın Al</h1>
                            <p className="text-slate-400">Kariyer hedefinize ulaşmak için en uygun planı seçin</p>
                        </div>

                        {/* Plan Seçimi */}
                        <div className="grid md:grid-cols-2 gap-6 mb-12">
                            {plans.map((plan) => (
                                <button
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan)}
                                    className={`relative p-6 rounded-2xl border-2 text-left transition-all ${selectedPlan?.id === plan.id
                                            ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                        }`}
                                >
                                    {plan.popular && (
                                        <span className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full">
                                            EN POPÜLER
                                        </span>
                                    )}

                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                            <p className="text-3xl font-bold text-purple-400 mt-2">{plan.price} TL<span className="text-sm text-slate-400">/ay</span></p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlan?.id === plan.id ? 'border-purple-500 bg-purple-500' : 'border-slate-600'
                                            }`}>
                                            {selectedPlan?.id === plan.id && <Check className="w-4 h-4 text-white" />}
                                        </div>
                                    </div>

                                    <ul className="space-y-2">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-slate-300 text-sm">
                                                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </button>
                            ))}
                        </div>

                        {selectedPlan && (
                            <button
                                onClick={() => setStep('confirm')}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-lg rounded-xl transition flex items-center justify-center gap-2"
                            >
                                Devam Et
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        )}
                    </>
                )}

                {step === 'confirm' && selectedPlan && paymentInfo && (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-white mb-2">Ödeme Bilgileri</h1>
                            <p className="text-slate-400">Sözleşmeleri onaylayın ve siparişinizi tamamlayın</p>
                        </div>

                        {/* Ödeme Bilgileri */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8 mb-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-blue-400" />
                                Banka Hesap Bilgileri
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-slate-400 mb-1">Alıcı</p>
                                        <p className="text-white font-medium">{paymentInfo.companyName || 'Belirtilmemiş'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400 mb-1">Banka</p>
                                        <p className="text-white font-medium">{paymentInfo.bankName || 'Belirtilmemiş'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">IBAN</p>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 px-4 py-3 bg-slate-900 rounded-lg text-blue-400 font-mono text-sm">
                                            {paymentInfo.iban || 'Belirtilmemiş'}
                                        </code>
                                        <button onClick={copyIban} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition" title="Kopyala">
                                            {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-slate-400" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                <p className="text-yellow-400 text-sm">
                                    <AlertCircle className="w-4 h-4 inline mr-2" />
                                    Havale/EFT açıklamasına <strong>e-posta adresinizi</strong> yazmayı unutmayın.
                                </p>
                            </div>
                        </div>

                        {/* Sözleşmeler */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8 mb-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-orange-400" />
                                Sözleşmeler
                            </h2>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-900/50 rounded-xl">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={agreementAccepted}
                                            onChange={(e) => setAgreementAccepted(e.target.checked)}
                                            className="w-5 h-5 mt-0.5 rounded border-slate-600 bg-slate-800 text-purple-600 focus:ring-purple-500"
                                        />
                                        <div className="flex-1">
                                            <span className="text-white">
                                                <button onClick={() => setShowAgreement(!showAgreement)} className="text-purple-400 hover:underline">
                                                    Mesafeli Satış Sözleşmesi
                                                </button>
                                                'ni okudum ve kabul ediyorum.
                                            </span>
                                            {showAgreement && paymentInfo.salesAgreement && (
                                                <div className="mt-3 p-4 bg-slate-800 rounded-lg max-h-48 overflow-y-auto text-sm text-slate-300 whitespace-pre-wrap">
                                                    {paymentInfo.salesAgreement}
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                </div>

                                <div className="p-4 bg-slate-900/50 rounded-xl">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={refundAccepted}
                                            onChange={(e) => setRefundAccepted(e.target.checked)}
                                            className="w-5 h-5 mt-0.5 rounded border-slate-600 bg-slate-800 text-purple-600 focus:ring-purple-500"
                                        />
                                        <div className="flex-1">
                                            <span className="text-white">
                                                <button onClick={() => setShowRefund(!showRefund)} className="text-purple-400 hover:underline">
                                                    İptal ve İade Politikası
                                                </button>
                                                'nı okudum ve kabul ediyorum.
                                            </span>
                                            {showRefund && paymentInfo.refundPolicy && (
                                                <div className="mt-3 p-4 bg-slate-800 rounded-lg max-h-48 overflow-y-auto text-sm text-slate-300 whitespace-pre-wrap">
                                                    {paymentInfo.refundPolicy}
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Özet ve Satın Al */}
                        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-8">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedPlan.name}</h3>
                                    <p className="text-slate-400">Aylık abonelik</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-white">{selectedPlan.price} TL</p>
                                </div>
                            </div>

                            <button
                                onClick={handlePurchase}
                                disabled={!canPurchase || processing}
                                className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition ${canPurchase && !processing
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/30'
                                        : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                <Package className="w-6 h-6" />
                                {processing ? 'İşleniyor...' : 'Satın Al'}
                            </button>

                            {!canPurchase && (
                                <p className="mt-4 text-center text-yellow-400 text-sm">
                                    <AlertCircle className="w-4 h-4 inline mr-1" />
                                    Devam etmek için tüm sözleşmeleri onaylamanız gerekmektedir.
                                </p>
                            )}

                            <button
                                onClick={() => setStep('select')}
                                className="w-full mt-4 py-2 text-slate-400 hover:text-white transition"
                            >
                                ← Geri Dön
                            </button>
                        </div>
                    </>
                )}

                {step === 'complete' && orderDetails && paymentInfo && (
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-10 h-10 text-green-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Siparişiniz Oluşturuldu!</h1>
                            <p className="text-slate-400">Ödemenizi yapın ve WhatsApp üzerinden bilgilendirin</p>
                        </div>

                        {/* Sipariş Detayları */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8 mb-6">
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Package className="w-5 h-5 text-purple-400" />
                                Sipariş Özeti
                            </h2>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                    <span className="text-slate-400">Sipariş No</span>
                                    <span className="text-purple-400 font-mono font-bold text-lg">{orderDetails.orderCode}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Plan</span>
                                    <span className="text-white font-medium">{orderDetails.plan}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Tutar</span>
                                    <span className="text-white font-bold text-xl">{orderDetails.amount} TL</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Durum</span>
                                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-sm font-medium rounded-full">
                                        Ödeme Bekleniyor
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-700">
                                <h3 className="text-sm font-medium text-slate-400 mb-3">Ödeme Bilgileri</h3>
                                <div className="space-y-2 text-sm">
                                    <p className="text-white"><span className="text-slate-400">Alıcı:</span> {paymentInfo.companyName}</p>
                                    <p className="text-white"><span className="text-slate-400">Banka:</span> {paymentInfo.bankName}</p>
                                    <p className="text-blue-400 font-mono"><span className="text-slate-400">IBAN:</span> {paymentInfo.iban}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-6">
                            <p className="text-yellow-400 text-sm text-center">
                                <AlertCircle className="w-4 h-4 inline mr-2" />
                                Ödeme yaptıktan sonra aşağıdaki buton ile WhatsApp'tan bilgilendirin. Aboneliğiniz onaylandıktan sonra aktif olacaktır.
                            </p>
                        </div>

                        <button
                            onClick={handleWhatsAppRedirect}
                            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded-xl transition shadow-lg shadow-green-500/30"
                        >
                            <MessageCircle className="w-6 h-6" />
                            WhatsApp ile Bildir
                        </button>

                        <Link
                            href="/panel/siparislerim"
                            className="block text-center mt-4 text-slate-400 hover:text-white transition"
                        >
                            Siparişlerimi Görüntüle →
                        </Link>
                    </div>
                )}
            </main>
        </div>
    )
}
