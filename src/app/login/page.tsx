'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type LoginStep = 'credentials' | 'verification'

export default function LoginPage() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<LoginStep>('credentials')
    const [resendTimer, setResendTimer] = useState(0)

    // Giriş yapmış kullanıcıları dashboard'a yönlendir
    useEffect(() => {
        if (status === 'authenticated' && session) {
            router.replace('/panel')
        }
    }, [status, session, router])

    // Resend timer countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [resendTimer])

    // Session yüklenirken loading göster
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    // Giriş yapmış kullanıcı varsa null döndür (yönlendirme yapılacak)
    if (status === 'authenticated') {
        return null
    }

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Bypass verification - direct login
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError('Email veya şifre hatalı')
                return
            }

            router.push('/panel')
            router.refresh()
        } catch (err) {
            setError('Bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyAndLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Önce kodu doğrula
            const verifyRes = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: verificationCode })
            })

            const verifyData = await verifyRes.json()

            if (!verifyRes.ok) {
                setError(verifyData.error || 'Doğrulama başarısız')
                setLoading(false)
                return
            }

            // Doğrulama başarılı, şimdi giriş yap
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError(result.error)
            } else {
                router.push('/panel')
                router.refresh()
            }
        } catch (err) {
            setError('Bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const handleResendCode = async () => {
        if (resendTimer > 0) return

        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Kod gönderilemedi')
                return
            }

            setResendTimer(60)
        } catch (err) {
            setError('Kod gönderilemedi')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">KARİYER KAMULOG</h1>
                        <p className="text-blue-200">AI destekli CV oluşturucu</p>
                    </div>

                    {step === 'credentials' ? (
                        <>
                            <form onSubmit={handleSendCode} className="space-y-6">
                                {error && (
                                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-blue-200 mb-2">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="ornek@email.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-blue-200 mb-2">
                                        Şifre
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-lg shadow-lg transform transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            İşleniyor...
                                        </span>
                                    ) : (
                                        'Devam Et'
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center space-y-2">
                                <p className="text-blue-200">
                                    Hesabınız yok mu?{' '}
                                    <Link href="/register" className="text-white font-semibold hover:underline">
                                        Kayıt Ol
                                    </Link>
                                </p>
                                <p>
                                    <Link href="/sifremi-unuttum" className="text-blue-300 hover:text-white text-sm transition">
                                        Şifremi Unuttum
                                    </Link>
                                </p>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleVerifyAndLogin} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="bg-blue-500/20 border border-blue-500/50 text-blue-200 px-4 py-3 rounded-lg text-sm text-center">
                                <span className="font-semibold">{email}</span> adresine doğrulama kodu gönderildi.
                            </div>

                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-blue-200 mb-2">
                                    Doğrulama Kodu
                                </label>
                                <input
                                    id="code"
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    maxLength={6}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-center text-2xl tracking-widest font-mono"
                                    placeholder="000000"
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || verificationCode.length !== 6}
                                className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-lg shadow-lg transform transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Doğrulanıyor...
                                    </span>
                                ) : (
                                    'Giriş Yap'
                                )}
                            </button>

                            <div className="flex items-center justify-between text-sm">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep('credentials')
                                        setVerificationCode('')
                                        setError('')
                                    }}
                                    className="text-blue-300 hover:text-white transition"
                                >
                                    ← Geri Dön
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={resendTimer > 0 || loading}
                                    className="text-blue-300 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {resendTimer > 0 ? `Tekrar gönder (${resendTimer}s)` : 'Kodu Tekrar Gönder'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
