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
    tokens: number
    features: string[]
    popular: boolean
    tag: string | null
}

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

interface OrderDetails {
    orderCode: string
    plan: string
    amount: number
    tokens: number
    user: {
        name: string
        email: string
    }
}

interface CouponInfo {
    id: string
    code: string
    name: string | null
    discountType: string
    discountValue: number
    planRestriction: string | null
}

interface DiscountResult {
    valid: boolean
    coupon?: CouponInfo
    discountAmount: number
    finalPrice: number
    isFree: boolean
    message?: string
    error?: string
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
    const [step, setStep] = useState<'select' | 'confirm' | 'billing' | 'complete'>('select')

    // Kupon state
    const [couponCode, setCouponCode] = useState('')
    const [couponLoading, setCouponLoading] = useState(false)
    const [appliedCoupon, setAppliedCoupon] = useState<DiscountResult | null>(null)
    const [couponError, setCouponError] = useState('')

    // Fatura bilgileri state
    const [billingInfo, setBillingInfo] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        address: '',
        city: '',
        district: '',
        taxNumber: '',
        taxOffice: ''
    })
    const [cities, setCities] = useState<string[]>([])
    const [districts, setDistricts] = useState<string[]>([])
    const [savingBilling, setSavingBilling] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            // Fetch from same API as panel/abonelik for consistency
            const [plansRes, paymentRes] = await Promise.all([
                fetch('/api/public/plans'),
                fetch('/api/settings/payment')
            ])

            const plansData = await plansRes.json()
            if (plansData.plans && Array.isArray(plansData.plans)) {
                // Only show paid plans on purchase page
                setPlans(plansData.plans.filter((p: Plan) => p.price > 0))
            }

            const paymentData = await paymentRes.json()
            if (paymentData) {
                setPaymentInfo(paymentData)
            }

            // Şehirleri yükle
            const citiesRes = await fetch('/api/locations')
            const citiesData = await citiesRes.json()
            setCities(citiesData.cities || [])

            // Kullanıcı bilgilerini yükle
            const userRes = await fetch('/api/user/profile')
            const userData = await userRes.json()
            if (userData.user) {
                setBillingInfo({
                    name: userData.user.name || '',
                    email: userData.user.email || '',
                    phoneNumber: userData.user.phoneNumber || '',
                    address: userData.user.address || '',
                    city: userData.user.city || '',
                    district: userData.user.district || '',
                    taxNumber: userData.user.taxNumber || '',
                    taxOffice: userData.user.taxOffice || ''
                })

                // Şehir varsa ilçeleri yükle
                if (userData.user.city) {
                    const distRes = await fetch(`/api/locations?city=${encodeURIComponent(userData.user.city)}`)
                    const distData = await distRes.json()
                    setDistricts(distData.districts || [])
                }
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

    // Fatura şehir değişikliği
    const handleBillingCityChange = async (city: string) => {
        setBillingInfo({ ...billingInfo, city, district: '' })
        if (city) {
            try {
                const res = await fetch(`/api/locations?city=${encodeURIComponent(city)}`)
                const data = await res.json()
                setDistricts(data.districts || [])
            } catch (e) {
                console.error('İlçeler yüklenemedi', e)
                setDistricts([])
            }
        } else {
            setDistricts([])
        }
    }

    // Fatura bilgilerini kaydet
    const saveBillingInfo = async () => {
        // Zorunlu alan kontrolü
        if (!billingInfo.name || !billingInfo.phoneNumber || !billingInfo.address || !billingInfo.city || !billingInfo.district) {
            alert('Lütfen tüm zorunlu alanları doldurun (Ad Soyad, Telefon, Adres, Şehir, İlçe)')
            return
        }

        setSavingBilling(true)
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: billingInfo.name,
                    phoneNumber: billingInfo.phoneNumber,
                    address: billingInfo.address,
                    city: billingInfo.city,
                    district: billingInfo.district,
                    taxNumber: billingInfo.taxNumber,
                    taxOffice: billingInfo.taxOffice
                })
            })

            if (res.ok) {
                setStep('complete')
            } else {
                alert('Fatura bilgileri kaydedilemedi')
            }
        } catch (error) {
            alert('Bir hata oluştu')
        } finally {
            setSavingBilling(false)
        }
    }

    // Kupon uygula
    const applyCoupon = async () => {
        if (!couponCode.trim() || !selectedPlan) return

        setCouponLoading(true)
        setCouponError('')
        setAppliedCoupon(null)

        try {
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: couponCode.trim(),
                    planId: selectedPlan.id,
                    originalPrice: selectedPlan.price
                })
            })

            const data = await res.json()

            if (data.valid) {
                setAppliedCoupon(data)
            } else {
                setCouponError(data.error || 'Kupon geçersiz')
            }
        } catch (error) {
            setCouponError('Kupon doğrulanamadı')
        } finally {
            setCouponLoading(false)
        }
    }

    // Kuponu kaldır
    const removeCoupon = () => {
        setAppliedCoupon(null)
        setCouponCode('')
        setCouponError('')
    }

    const handlePurchase = async () => {
        if (!selectedPlan || !session?.user) return

        setProcessing(true)
        try {
            // Gerçek fiyat (kuponlu veya normal)
            const finalAmount = appliedCoupon?.valid ? appliedCoupon.finalPrice : selectedPlan.price

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan: selectedPlan.id,
                    planName: selectedPlan.name,
                    amount: finalAmount,
                    originalAmount: selectedPlan.price,
                    couponCode: appliedCoupon?.coupon?.code || null,
                    couponDiscount: appliedCoupon?.discountAmount || 0,
                    isFree: appliedCoupon?.isFree || false
                })
            })

            const data = await res.json()
            if (res.ok && data.order) {
                setOrderDetails({
                    orderCode: data.order.orderCode,
                    plan: selectedPlan.name,
                    amount: finalAmount,
                    tokens: selectedPlan.tokens || 0,
                    user: {
                        name: data.order.user?.name || session.user.name || '',
                        email: data.order.user?.email || session.user.email || ''
                    }
                })

                // %100 indirim = otomatik aktivasyon mesajı
                if (appliedCoupon?.isFree) {
                    setStep('billing') // Fatura bilgisi adımına yönlendir
                } else {
                    setStep('billing') // Fatura bilgisi adımına yönlendir
                }
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
                            {/* Kupon Kodu Alanı */}
                            <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    🎁 Kupon Kodunuz Var mı?
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder="KUPONKODU"
                                        disabled={!!appliedCoupon?.valid}
                                        className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono disabled:opacity-50"
                                    />
                                    {appliedCoupon?.valid ? (
                                        <button
                                            onClick={removeCoupon}
                                            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition"
                                        >
                                            Kaldır
                                        </button>
                                    ) : (
                                        <button
                                            onClick={applyCoupon}
                                            disabled={!couponCode.trim() || couponLoading}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {couponLoading ? '...' : 'Uygula'}
                                        </button>
                                    )}
                                </div>
                                {couponError && (
                                    <p className="mt-2 text-red-400 text-sm">{couponError}</p>
                                )}
                                {appliedCoupon?.valid && (
                                    <div className="mt-2 p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                                        <p className="text-green-400 text-sm">
                                            ✓ {appliedCoupon.message}
                                            {appliedCoupon.isFree && ' - Ücretsiz abonelik!'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Plan Özeti */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedPlan.name}</h3>
                                    <p className="text-slate-400">Aylık abonelik</p>
                                </div>
                                <div className="text-right">
                                    {appliedCoupon?.valid ? (
                                        <>
                                            <p className="text-lg text-slate-400 line-through">{selectedPlan.price} TL</p>
                                            <p className="text-3xl font-bold text-green-400">
                                                {appliedCoupon.isFree ? 'ÜCRETSİZ' : `${appliedCoupon.finalPrice} TL`}
                                            </p>
                                            <p className="text-sm text-green-400">
                                                {appliedCoupon.discountAmount} TL indirim
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-3xl font-bold text-white">{selectedPlan.price} TL</p>
                                    )}
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

                {/* Billing Step - Fatura Bilgileri */}
                {step === 'billing' && orderDetails && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-6 text-center">
                            <h1 className="text-2xl font-bold text-white mb-2">📋 Fatura Bilgileri</h1>
                            <p className="text-blue-100">Siparişiniz oluşturuldu. Fatura kesilebilmesi için bilgilerinizi kontrol edin.</p>
                            <div className="bg-white/10 rounded-lg inline-block px-4 py-2 mt-3">
                                <span className="text-white">Sipariş No: <strong>{orderDetails.orderCode}</strong></span>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-4">
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                                <p className="text-yellow-400 text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Fatura kesilebilmesi için tüm <strong>zorunlu (*)</strong> alanları doldurmanız gerekmektedir.
                                </p>
                            </div>

                            {/* Ad Soyad & E-posta */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Ad Soyad *</label>
                                    <input
                                        type="text"
                                        value={billingInfo.name}
                                        onChange={(e) => setBillingInfo({ ...billingInfo, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="Ad Soyad"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">E-posta</label>
                                    <input
                                        type="email"
                                        value={billingInfo.email}
                                        disabled
                                        className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Telefon & Adres */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Telefon *</label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 bg-slate-700 border border-r-0 border-slate-600 rounded-l-xl text-slate-300 text-sm font-medium">
                                        +90
                                    </span>
                                    <input
                                        type="tel"
                                        value={billingInfo.phoneNumber.replace(/^\+90\s*/, '')}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                                            setBillingInfo({ ...billingInfo, phoneNumber: value ? `+90${value}` : '' })
                                        }}
                                        maxLength={10}
                                        className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-r-xl text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="5XX XXX XX XX"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">10 haneli telefon numarası girin</p>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Adres *</label>
                                <textarea
                                    value={billingInfo.address}
                                    onChange={(e) => setBillingInfo({ ...billingInfo, address: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none min-h-[80px] resize-none"
                                    placeholder="Fatura adresi..."
                                />
                            </div>

                            {/* Şehir & İlçe */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Şehir *</label>
                                    <select
                                        value={billingInfo.city}
                                        onChange={(e) => handleBillingCityChange(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    >
                                        <option value="">Şehir Seçin</option>
                                        {cities.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">İlçe *</label>
                                    <select
                                        value={billingInfo.district}
                                        onChange={(e) => setBillingInfo({ ...billingInfo, district: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        disabled={!billingInfo.city || districts.length === 0}
                                    >
                                        <option value="">İlçe Seçin</option>
                                        {districts.map(district => (
                                            <option key={district} value={district}>{district}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Vergi Bilgileri (Opsiyonel) */}
                            <div className="pt-4 border-t border-slate-700">
                                <p className="text-sm text-slate-500 mb-3">Kurumsal fatura için (opsiyonel)</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Vergi No</label>
                                        <input
                                            type="text"
                                            value={billingInfo.taxNumber}
                                            onChange={(e) => setBillingInfo({ ...billingInfo, taxNumber: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="Vergi numarası"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Vergi Dairesi</label>
                                        <input
                                            type="text"
                                            value={billingInfo.taxOffice}
                                            onChange={(e) => setBillingInfo({ ...billingInfo, taxOffice: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="Vergi dairesi"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={saveBillingInfo}
                                disabled={savingBilling}
                                className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition disabled:opacity-50"
                            >
                                {savingBilling ? 'Kaydediliyor...' : 'Kaydet ve Devam Et →'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 'complete' && orderDetails && (
                    <div className="max-w-2xl mx-auto">
                        {/* Ücretsiz Sipariş Başarı Ekranı */}
                        {appliedCoupon?.isFree ? (
                            <>
                                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 mb-6 text-center">
                                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-10 h-10 text-white" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-white mb-2">🎉 Tebrikler!</h1>
                                    <p className="text-green-100 text-lg mb-4">Aboneliğiniz başarıyla aktifleştirildi!</p>
                                    <div className="bg-white/10 rounded-xl p-4 inline-block">
                                        <p className="text-white text-sm">Sipariş No</p>
                                        <p className="text-2xl font-bold text-white">{orderDetails.orderCode}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-6">
                                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-yellow-400" />
                                        Aktif Planınız
                                    </h2>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-purple-400">{orderDetails.plan}</p>
                                            <p className="text-slate-400">Aylık abonelik aktif</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-400">Yüklenen jeton</p>
                                            <p className="text-3xl font-bold text-yellow-400">{orderDetails.tokens}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                                    <p className="text-green-400 text-sm flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        %100 indirim kuponu kullandınız - Ödeme gerektirmez!
                                    </p>
                                </div>

                                <Link
                                    href="/panel"
                                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-lg rounded-xl transition shadow-lg"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    Panele Git
                                </Link>
                            </>
                        ) : paymentInfo && (
                            <>
                                {/* Normal Sipariş - Ödeme Bilgileri */}
                                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                            <CheckCircle2 className="w-6 h-6 text-white" />
                                        </div>
                                        <h1 className="text-2xl font-bold text-green-800">Siparişiniz Oluşturuldu!</h1>
                                    </div>
                                    <p className="text-green-700">
                                        Sipariş No: <span className="font-bold text-green-900">{orderDetails.orderCode}</span>
                                    </p>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-6">
                                        <CreditCard className="w-5 h-5 text-slate-600" />
                                        <h2 className="text-lg font-bold text-slate-800">Ödeme Bilgileri</h2>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600">Toplam Tutar:</span>
                                            <span className="text-xl font-bold text-red-600">{orderDetails.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                                        </div>

                                        <hr className="border-slate-200" />

                                        <div>
                                            <p className="text-slate-500 text-sm mb-1">IBAN:</p>
                                            <p className="text-xl font-bold text-slate-900 font-mono tracking-wide">
                                                {paymentInfo.iban}
                                            </p>
                                        </div>

                                        <hr className="border-slate-200" />

                                        <div>
                                            <p className="text-slate-500 text-sm mb-1">Şirket:</p>
                                            <p className="font-bold text-slate-900">*{paymentInfo.companyName}*</p>
                                            {paymentInfo.companyNote && (
                                                <p className="text-slate-600 text-sm">{paymentInfo.companyNote}</p>
                                            )}
                                        </div>

                                        {(paymentInfo.vkn || paymentInfo.taxOffice) && (
                                            <>
                                                <hr className="border-slate-200" />
                                                <div>
                                                    <p className="text-slate-500 text-sm mb-2">Vergi Bilgileri:</p>
                                                    <div className="space-y-1">
                                                        {paymentInfo.vkn && (
                                                            <p className="text-slate-800 flex items-center gap-2">
                                                                <span className="text-blue-600 font-bold">🆔</span>
                                                                VKN: {paymentInfo.vkn}
                                                            </p>
                                                        )}
                                                        {paymentInfo.taxOffice && (
                                                            <p className="text-slate-800 flex items-center gap-2">
                                                                <span>🏛️</span>
                                                                *{paymentInfo.taxOffice}*
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <hr className="border-slate-200" />

                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                            <p className="text-amber-800 text-sm">
                                                <span className="font-bold">📝 Önemli:</span><br />
                                                Ödeme açıklamasına sipariş numaranızı (<span className="font-bold text-amber-900">{orderDetails.orderCode}</span>) yazın.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleWhatsAppRedirect}
                                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold text-lg rounded-xl transition shadow-lg"
                                >
                                    <CheckCircle2 className="w-6 h-6" />
                                    Ödemeyi Yaptım
                                </button>

                                <p className="text-center text-slate-500 text-sm mt-4">
                                    Ödeme yaptıktan sonra yukarıdaki butona tıklayarak WhatsApp üzerinden bilgilendiriniz.
                                </p>

                                <Link
                                    href="/panel/siparislerim"
                                    className="block text-center mt-4 text-slate-400 hover:text-slate-600 transition"
                                >
                                    Siparişlerimi Görüntüle →
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
