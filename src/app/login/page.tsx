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
            const res = await fetch('/api/auth/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Bir hata oluştu')
                return
            }

            setStep('verification')
            setResendTimer(60) // 60 saniye bekleme
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

                            {/* Divider */}
                            <div className="my-6 flex items-center">
                                <div className="flex-1 border-t border-white/20"></div>
                                <span className="px-4 text-sm text-blue-300">veya</span>
                                <div className="flex-1 border-t border-white/20"></div>
                            </div>

                            {/* Google Login */}
                            <button
                                onClick={() => signIn('google', { callbackUrl: '/panel' })}
                                className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-lg shadow-lg transform transition hover:scale-[1.02] flex items-center justify-center gap-3"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google ile Giriş Yap
                            </button>

                            <div className="mt-6 text-center">
                                <p className="text-blue-200">
                                    Hesabınız yok mu?{' '}
                                    <Link href="/register" className="text-white font-semibold hover:underline">
                                        Kayıt Ol
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
