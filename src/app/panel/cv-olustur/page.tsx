'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import ChatWindow from '@/components/chat/ChatWindow'
import CVPreview from '@/components/cv/CVPreview'
import type { ChatMessage, CVData } from '@/types'
import { Upload, FileText, MessageCircle, Sparkles } from 'lucide-react'
import PanelHeader from '@/components/PanelHeader'
import { useToast } from '@/components/ToastProvider'

type Step = 'select' | 'chat' | 'upload' | 'preview' | 'saving'

export default function CVBuilderPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const { showTokenDeduction, showError } = useToast()
    const [step, setStep] = useState<Step>('select')
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [cvId, setCvId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [remaining, setRemaining] = useState<number | undefined>()
    const [cvData, setCvData] = useState<CVData | null>(null)
    const [cvTitle, setCvTitle] = useState('')
    const [error, setError] = useState('')
    const [uploadProgress, setUploadProgress] = useState<string>('')
    const [isFinished, setIsFinished] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Jeton limiti state'leri
    const [sessionTokenLimit, setSessionTokenLimit] = useState(25)
    const [tokenCost, setTokenCost] = useState(2)
    const usedTokens = messages.filter(m => m.role === 'user').length * tokenCost
    const remainingSessionTokens = Math.max(0, sessionTokenLimit - usedTokens)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }

        // Jeton ayarlarını yükle
        const loadSettings = async () => {
            try {
                const res = await fetch('/api/settings/chat-limits')
                if (res.ok) {
                    const data = await res.json()
                    if (data.sessionLimit) setSessionTokenLimit(data.sessionLimit)
                    if (data.tokenCost) setTokenCost(data.tokenCost)
                }
            } catch (e) {
                console.error('Failed to load chat settings')
            }
        }
        loadSettings()
    }, [status, router])

    const startChatSession = async () => {
        try {
            setIsLoading(true)
            const res = await fetch('/api/chat', { method: 'PUT' })
            const data = await res.json()
            setSessionId(data.sessionId)

            // İlk mesajı gönder
            const welcomeMessage: ChatMessage = {
                role: 'assistant',
                content: 'Merhaba! 👋 Ben CV asistanınızım. Size profesyonel bir CV oluşturmanızda yardımcı olacağım.\n\nBaşlamak için, lütfen adınızı ve soyadınızı söyler misiniz?'
            }
            setMessages([welcomeMessage])
            setStep('chat')
        } catch (error) {
            console.error('Session error:', error)
            setError('Chat başlatılamadı')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSendMessage = async (content: string) => {
        if (!sessionId) return

        const userMessage: ChatMessage = { role: 'user', content }
        const newMessages = [...messages, userMessage]
        setMessages(newMessages)
        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages,
                    sessionId,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                showError(data.error || 'Mesaj gönderilemedi')
                setError(data.error || 'Mesaj gönderilemedi')
                return
            }

            const assistantMessage: ChatMessage = { role: 'assistant', content: data.message }
            setMessages([...newMessages, assistantMessage])
            setRemaining(data.remainingCredits)

            // Jeton düşümünü anlık göster
            if (data.creditsUsed && data.remainingCredits !== undefined) {
                showTokenDeduction(data.creditsUsed, data.remainingCredits)
            }

            if (data.isFinished) {
                setIsFinished(true)
            }
        } catch (error) {
            setError('Bir hata oluştu')
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.name.toLowerCase().endsWith('.pdf')) {
            setError('Lütfen PDF formatında bir dosya seçin')
            return
        }

        setIsLoading(true)
        setError('')
        setUploadProgress('PDF dosyanız yükleniyor...')

        try {
            const formData = new FormData()
            formData.append('pdf', file)

            setUploadProgress('CV kaydediliyor...')
            const res = await fetch('/api/cv/upload-pdf', {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'PDF yüklenemedi')
                return
            }

            // Başarılı yükleme - kullanıcıyı bilgilendir ve yönlendir
            setCvId(data.cvId)
            alert(`✅ ${data.message}\n\nDosya: ${data.fileName}\nMetin uzunluğu: ${data.textLength} karakter`)

            // Panel sayfasına yönlendir
            router.push('/panel')
        } catch (error) {
            setError('PDF yüklenirken bir hata oluştu')
        } finally {
            setIsLoading(false)
            setUploadProgress('')
        }
    }

    const handleGenerateCV = async () => {
        if (!sessionId) return
        setIsLoading(true)
        setError('')

        try {
            // CV verisi extract et
            const res = await fetch('/api/cv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: cvTitle || 'CV',
                    chatSessionId: sessionId,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'CV oluşturulamadı')
                return
            }

            setCvData(data.cv.data)
            setCvId(data.cv.id)
            setStep('preview')
        } catch (error) {
            setError('CV oluşturulamadı')
        } finally {
            setIsLoading(false)
        }
    }

    const handleExportPDF = async () => {
        if (!cvData || !cvId) {
            setError('Önce CV oluşturmalısınız')
            return
        }
        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/cv/export-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cvId }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'PDF oluşturulamadı')
                return
            }

            if (data.html) {
                // Yeni pencerede aç ve yazdır
                const printWindow = window.open('', '_blank')
                if (printWindow) {
                    printWindow.document.write(data.html)
                    printWindow.document.close()
                    printWindow.focus()
                    // PDF olarak kaydet mesajı ekle
                    setTimeout(() => {
                        printWindow.print()
                    }, 500)
                } else {
                    setError('Popup engellendi. Lütfen popup engelleyiciyi devre dışı bırakın.')
                }
            }
        } catch (error) {
            setError('PDF oluşturulamadı')
        } finally {
            setIsLoading(false)
        }
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <PanelHeader />

            {/* Sub Header for page specific controls */}
            <div className="bg-slate-800/30 border-b border-slate-700/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Link href="/panel" className="p-2 text-slate-400 hover:text-white bg-slate-700/30 rounded-lg transition" title="Geri">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                            </Link>
                            <h1 className="text-lg font-bold text-white">AI CV Oluşturucu</h1>
                        </div>

                        <div className="flex items-center gap-3">
                            {step === 'chat' && messages.length > 3 && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={cvTitle}
                                        onChange={(e) => setCvTitle(e.target.value)}
                                        placeholder="CV Başlığı"
                                        className="px-3 py-1.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                    <button
                                        onClick={handleGenerateCV}
                                        disabled={isLoading}
                                        className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Oluştur
                                    </button>
                                </div>
                            )}
                            {step === 'preview' && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setStep('chat')}
                                        className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition"
                                    >
                                        Düzenle
                                    </button>
                                    <button
                                        onClick={handleExportPDF}
                                        disabled={isLoading}
                                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition"
                                    >
                                        PDF İndir
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Main */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Selection Step */}
                {step === 'select' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-white mb-4">CV&apos;nizi Nasıl Oluşturmak İstersiniz?</h2>
                            <p className="text-slate-400 text-lg">
                                AI asistanımızla sohbet ederek sıfırdan CV oluşturabilir veya mevcut CV&apos;nizi yükleyebilirsiniz.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* AI Chat Option */}
                            <button
                                onClick={startChatSession}
                                disabled={isLoading}
                                className="group bg-gradient-to-br from-blue-600/20 to-blue-700/20 border-2 border-blue-500/30 hover:border-blue-400 rounded-2xl p-8 text-left transition-all hover:scale-[1.02] disabled:opacity-50"
                            >
                                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                                    <MessageCircle className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">AI ile Sohbet Et</h3>
                                <p className="text-slate-400 mb-4">
                                    Yapay zeka asistanımızla sohbet ederek profesyonel CV&apos;nizi adım adım oluşturun.
                                </p>
                                <ul className="space-y-2 text-sm text-slate-300">
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Adım adım bilgi toplama
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Profesyonel dil önerileri
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Kamu sektörüne özel format
                                    </li>
                                </ul>
                                <div className="mt-6 inline-flex items-center gap-2 text-blue-400 font-medium">
                                    {isLoading ? 'Başlatılıyor...' : 'Sohbete Başla'}
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </button>

                            {/* PDF Upload Option */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="group bg-gradient-to-br from-green-600/20 to-green-700/20 border-2 border-green-500/30 hover:border-green-400 rounded-2xl p-8 text-left transition-all hover:scale-[1.02] cursor-pointer"
                            >
                                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                                    <Upload className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">PDF CV Yükle</h3>
                                <p className="text-slate-400 mb-4">
                                    Mevcut CV&apos;nizi yükleyin, AI analiz etsin ve eksik bilgileri tamamlasın.
                                </p>
                                <ul className="space-y-2 text-sm text-slate-300">
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Otomatik bilgi çıkarma
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Eksik alan tespiti
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Hızlı güncelleme
                                    </li>
                                </ul>
                                <div className="mt-6 inline-flex items-center gap-2 text-green-400 font-medium">
                                    {uploadProgress || 'PDF Seç'}
                                    <FileText className="w-4 h-4" />
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Loading overlay */}
                        {isLoading && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-slate-800 rounded-2xl p-8 text-center max-w-sm mx-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                    <p className="text-white font-medium">{uploadProgress || 'Lütfen bekleyin...'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {step === 'chat' && (
                    <div className="h-[calc(100vh-200px)]">
                        {/* Jeton Limiti Gösterge Kutusu */}
                        <div className="mb-4 p-3 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-sm">Sohbet Limiti:</span>
                                    <span className="text-white font-medium">{sessionTokenLimit} jeton</span>
                                </div>
                                <div className="w-px h-4 bg-slate-600"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-sm">Kullanılan:</span>
                                    <span className="text-yellow-400 font-medium">{usedTokens} jeton</span>
                                </div>
                                <div className="w-px h-4 bg-slate-600"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-sm">Kalan:</span>
                                    <span className={`font-medium ${remainingSessionTokens <= 5 ? 'text-red-400' : 'text-green-400'}`}>
                                        {remainingSessionTokens} jeton
                                    </span>
                                </div>
                            </div>
                            <div className="text-xs text-slate-500">
                                Her mesaj {tokenCost} jeton
                            </div>
                        </div>

                        {/* Limit uyarısı */}
                        {remainingSessionTokens <= 5 && remainingSessionTokens > 0 && (
                            <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
                                ⚠️ Sohbet jetonunuz azaldı! Kalan {remainingSessionTokens} jeton.
                            </div>
                        )}
                        {remainingSessionTokens <= 0 && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                🚫 Bu sohbette jeton limitine ulaştınız. Yeni CV oluşturmak için yeni bir sohbet başlatın.
                            </div>
                        )}

                        <ChatWindow
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            onGenerateCV={handleGenerateCV}
                            isLoading={isLoading}
                            remaining={remaining}
                            showCVButton={isFinished}
                            cvTitle={cvTitle}
                            onCVTitleChange={setCvTitle}
                        />
                    </div>
                )}

                {step === 'preview' && cvData && (
                    <div className="max-w-4xl mx-auto">
                        <CVPreview data={cvData} />
                    </div>
                )}
            </main>
        </div>
    )
}
