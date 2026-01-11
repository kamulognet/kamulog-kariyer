'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, Smartphone, Wifi, WifiOff, Trash2, MessageSquare } from 'lucide-react'

interface BotStatus {
    status: string
    connected: boolean
    qrCode: string | null
    message: string
}

interface WhatsAppLog {
    id: string
    phoneNumber: string
    message: string
    messageType: string
    status: string
    userEmail: string | null
    errorMessage: string | null
    createdAt: string
}

export default function WhatsAppBotPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [botStatus, setBotStatus] = useState<BotStatus | null>(null)
    const [logs, setLogs] = useState<WhatsAppLog[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState('')

    // Check admin access
    useEffect(() => {
        if (status === 'authenticated' && (session?.user as { role?: string })?.role !== 'ADMIN') {
            router.replace('/panel')
        }
    }, [status, session, router])

    // Fetch bot status
    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/admin/whatsapp-bot')
            if (res.ok) {
                const data = await res.json()
                setBotStatus(data)
            } else {
                setError('Durum alınamadı')
            }
        } catch (err) {
            setError('Bağlantı hatası')
        } finally {
            setLoading(false)
        }
    }

    // Fetch logs
    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/admin/whatsapp-bot/logs')
            if (res.ok) {
                const data = await res.json()
                setLogs(data.logs || [])
            }
        } catch (err) {
            console.error('Logs fetch error:', err)
        }
    }

    useEffect(() => {
        fetchStatus()
        fetchLogs()
        // Auto-refresh every 5 seconds if not connected
        const interval = setInterval(() => {
            if (!botStatus?.connected) {
                fetchStatus()
            }
            fetchLogs()
        }, 5000)
        return () => clearInterval(interval)
    }, [botStatus?.connected])

    // Perform action
    const performAction = async (action: string) => {
        setActionLoading(true)
        setError('')
        try {
            const res = await fetch('/api/admin/whatsapp-bot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'İşlem başarısız')
            }
            // Refresh status after action
            setTimeout(fetchStatus, 1000)
        } catch (err) {
            setError('İşlem sırasında hata oluştu')
        } finally {
            setActionLoading(false)
        }
    }

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/yonetim" className="text-white hover:text-blue-300 transition">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Smartphone className="w-7 h-7 text-green-400" />
                        WhatsApp Bot Yönetimi
                    </h1>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-white">Bağlantı Durumu</h2>
                                <button
                                    onClick={fetchStatus}
                                    disabled={actionLoading}
                                    className="p-2 text-blue-300 hover:text-white transition disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-5 h-5 ${actionLoading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            {error && (
                                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm mb-4">
                                    {error}
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-4">
                                {botStatus?.connected ? (
                                    <>
                                        <Wifi className="w-6 h-6 text-green-400" />
                                        <span className="text-green-400 font-medium">Bağlı</span>
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="w-6 h-6 text-yellow-400" />
                                        <span className="text-yellow-400 font-medium">
                                            {botStatus?.status === 'connecting' ? 'Bağlanıyor...' : 'Bağlı Değil'}
                                        </span>
                                    </>
                                )}
                            </div>

                            <p className="text-blue-200 text-sm">{botStatus?.message}</p>
                        </div>

                        {/* QR Code Card */}
                        {botStatus?.qrCode && !botStatus.connected && (
                            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                                <h2 className="text-lg font-semibold text-white mb-4">QR Kod</h2>
                                <div className="bg-white p-4 rounded-xl inline-block">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(botStatus.qrCode)}`}
                                        alt="WhatsApp QR Code"
                                        className="w-48 h-48"
                                    />
                                </div>
                                <p className="text-blue-200 text-sm mt-4">
                                    1. WhatsApp'ı telefonunuzda açın<br />
                                    2. Ayarlar &gt; Bağlı Cihazlar &gt; Cihaz Bağla<br />
                                    3. Bu QR kodu tarayın
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                            <h2 className="text-lg font-semibold text-white mb-4">İşlemler</h2>
                            <div className="flex flex-wrap gap-3">
                                {!botStatus?.connected && (
                                    <button
                                        onClick={() => performAction('init')}
                                        disabled={actionLoading}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
                                    >
                                        Bağlantı Başlat
                                    </button>
                                )}
                                {botStatus?.connected && (
                                    <button
                                        onClick={() => performAction('disconnect')}
                                        disabled={actionLoading}
                                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition disabled:opacity-50"
                                    >
                                        Bağlantıyı Kes
                                    </button>
                                )}
                                <button
                                    onClick={() => performAction('clear')}
                                    disabled={actionLoading}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Oturumu Temizle
                                </button>
                            </div>
                            <p className="text-blue-300 text-xs mt-4">
                                * Oturumu temizlerseniz yeniden QR kod taramanız gerekecek
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Logs */}
                    <div className="space-y-6">
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5" />
                                    Mesaj Logları
                                </h2>
                                <button
                                    onClick={fetchLogs}
                                    className="p-2 text-blue-300 hover:text-white transition"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>

                            {logs.length === 0 ? (
                                <p className="text-blue-300 text-sm">Henüz mesaj kaydı yok</p>
                            ) : (
                                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                    {logs.map((log) => (
                                        <div
                                            key={log.id}
                                            className={`p-3 rounded-lg border ${log.status === 'SENT'
                                                    ? 'bg-green-500/10 border-green-500/30'
                                                    : 'bg-red-500/10 border-red-500/30'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-white font-medium text-sm">{log.phoneNumber}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded ${log.status === 'SENT' ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'
                                                    }`}>
                                                    {log.status}
                                                </span>
                                            </div>
                                            <p className="text-blue-200 text-xs truncate">{log.message}</p>
                                            {log.userEmail && (
                                                <p className="text-blue-400 text-xs mt-1">{log.userEmail}</p>
                                            )}
                                            {log.errorMessage && (
                                                <p className="text-red-300 text-xs mt-1">{log.errorMessage}</p>
                                            )}
                                            <p className="text-blue-400/60 text-xs mt-1">
                                                {new Date(log.createdAt).toLocaleString('tr-TR')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <h3 className="text-white font-medium mb-2">Nasıl Çalışır?</h3>
                    <ul className="text-blue-200 text-sm space-y-1">
                        <li>• WhatsApp Business hesabınızı bu bota bağlayın</li>
                        <li>• Kullanıcı kayıt/giriş yaptığında doğrulama kodu otomatik gönderilir</li>
                        <li>• Tüm gönderilen mesajlar loglanır ve bu sayfada görünür</li>
                        <li>• Oturum sunucuda saklanır, her seferinde QR taramaya gerek yok</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

