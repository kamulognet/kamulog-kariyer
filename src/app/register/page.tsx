'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

type RegisterStep = 'form' | 'verification'

export default function RegisterPage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<RegisterStep>('form')
    const [resendTimer, setResendTimer] = useState(0)
    const [acceptTerms, setAcceptTerms] = useState(false)

    // Resend timer countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [resendTimer])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Şifreler eşleşmiyor')
            return
        }

        if (password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır')
            return
        }

        if (phoneNumber.length !== 10 || !/^[0-9]+$/.test(phoneNumber)) {
            setError('Telefon numarası 10 haneli olmalıdır (Başında 0 olmadan)')
            return
        }

        if (!acceptTerms) {
            setError('Devam etmek için KVKK ve Gizlilik Sözleşmesini kabul etmelisiniz')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, phoneNumber }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Kayıt başarısız')
                return
            }

            // Bypass verification - auto login
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                // Kayıt tamamlandı ama giriş başarısız, login'e yönlendir
                router.push('/login?registered=true')
            } else {
                router.push('/panel')
                router.refresh()
            }
        } catch (err) {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.')
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/verify-registration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: verificationCode }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Doğrulama başarısız')
                setLoading(false)
                return
            }

            // Doğrulama başarılı, otomatik giriş yap
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                // Giriş başarısız olsa bile kayıt tamamlandı, login'e yönlendir
                router.push('/login?verified=true')
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
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, phoneNumber }),
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
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {step === 'form' ? 'Kayıt Ol' : 'Email Doğrulama'}
                        </h1>
                        <p className="text-blue-200">
                            {step === 'form' ? 'Ücretsiz hesap oluşturun' : 'Doğrulama kodunu girin'}
                        </p>
                    </div>

                    {step === 'form' ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
                                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-red-200 text-sm">{error}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-blue-200 mb-2">
                                    Ad Soyad
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    placeholder="Adınız Soyadınız"
                                />
                            </div>

                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-blue-200 mb-2">
                                    Telefon Numarası
                                </label>
                                <div className="flex rounded-lg shadow-sm">
                                    <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-white/20 bg-white/5 text-slate-300 text-sm">
                                        +90
                                    </span>
                                    <input
                                        id="phoneNumber"
                                        type="text"
                                        value={phoneNumber}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)
                                            setPhoneNumber(val)
                                        }}
                                        required
                                        className="flex-1 min-w-0 block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-r-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="5XX XXX XX XX"
                                    />
                                </div>
                            </div>

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

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-200 mb-2">
                                    Şifre Tekrar
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    placeholder="••••••••"
                                />
                            </div>

                            {/* KVKK ve Gizlilik Onayı */}
                            <div className="flex items-start gap-3">
                                <input
                                    id="acceptTerms"
                                    type="checkbox"
                                    checked={acceptTerms}
                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded border-white/30 bg-white/10 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="acceptTerms" className="text-sm text-blue-200">
                                    <a href="/kvkk" target="_blank" className="text-white underline hover:text-blue-300">KVKK Aydınlatma Metni</a>,{' '}
                                    <a href="/gizlilik" target="_blank" className="text-white underline hover:text-blue-300">Gizlilik Politikası</a> ve{' '}
                                    <a href="/kullanim-kosullari" target="_blank" className="text-white underline hover:text-blue-300">Kullanım Koşulları</a>'nı okudum ve kabul ediyorum.
                                </label>
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
                                    'Kayıt Ol'
                                )}
                            </button>

                            {/* Google ile Kayıt */}
                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/20"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-transparent text-blue-300">veya</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => signIn('google', { callbackUrl: '/panel' })}
                                className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-lg shadow-lg flex items-center justify-center gap-3 transition"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google ile Kayıt Ol
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-6">
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
                                    'Doğrula ve Giriş Yap'
                                )}
                            </button>

                            <div className="flex items-center justify-between text-sm">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep('form')
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

                    {step === 'form' && (
                        <>
                            <div className="mt-6 text-center">
                                <p className="text-blue-200">
                                    Zaten hesabınız var mı?{' '}
                                    <Link href="/login" className="text-white font-semibold hover:underline">
                                        Giriş Yap
                                    </Link>
                                </p>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/10">
                                <p className="text-xs text-blue-300/70 text-center">
                                    Kayıt olarak ücretsiz plana dahil olursunuz. Ayda 1 CV ve 20 chat mesajı hakkınız olur.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
