'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import ChatWindow from '@/components/chat/ChatWindow'
import CVPreview from '@/components/cv/CVPreview'
import type { ChatMessage, CVData } from '@/types'
import { Upload, FileText, MessageCircle, Sparkles } from 'lucide-react'

type Step = 'select' | 'chat' | 'upload' | 'preview' | 'saving'

export default function CVBuilderPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [step, setStep] = useState<Step>('select')
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [remaining, setRemaining] = useState<number | undefined>()
    const [cvData, setCvData] = useState<CVData | null>(null)
    const [cvTitle, setCvTitle] = useState('')
    const [error, setError] = useState('')
    const [uploadProgress, setUploadProgress] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
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
                setError(data.error || 'Mesaj gönderilemedi')
                return
            }

            const assistantMessage: ChatMessage = { role: 'assistant', content: data.message }
            setMessages([...newMessages, assistantMessage])
            setRemaining(data.remaining)
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

            setUploadProgress('AI CV\'nizi analiz ediyor...')
            const res = await fetch('/api/cv/upload-pdf', {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'PDF yüklenemedi')
                return
            }

            // Session ve CV verilerini ayarla
            setSessionId(data.sessionId)
            setCvData(data.cvData)

            // Eksik alanlar varsa chat'e yönlendir
            if (data.missingFields && data.missingFields.length > 0) {
                setMessages([
                    {
                        role: 'assistant',
                        content: `PDF'niz başarıyla yüklendi ve analiz edildi! 📄\n\n${data.welcomeMessage}`
                    }
                ])
                setStep('chat')
            } else {
                // Eksik alan yoksa direkt preview'a geç
                setStep('preview')
            }
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
            setStep('preview')
        } catch (error) {
            setError('CV oluşturulamadı')
        } finally {
            setIsLoading(false)
        }
    }

    const handleExportPDF = async () => {
        if (!cvData) return
        setIsLoading(true)

        try {
            const res = await fetch('/api/cv/export-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cvId: sessionId }),
            })

            const data = await res.json()

            if (data.html) {
                // Yeni pencerede aç ve yazdır
                const printWindow = window.open('', '_blank')
                if (printWindow) {
                    printWindow.document.write(data.html)
                    printWindow.document.close()
                    printWindow.focus()
                    setTimeout(() => printWindow.print(), 500)
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
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="text-slate-400 hover:text-white transition">
                                ← Dashboard
                            </Link>
                            <h1 className="text-xl font-bold text-white">AI CV Oluşturucu</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            {step === 'chat' && messages.length > 3 && (
                                <>
                                    <input
                                        type="text"
                                        value={cvTitle}
                                        onChange={(e) => setCvTitle(e.target.value)}
                                        placeholder="CV Başlığı"
                                        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={handleGenerateCV}
                                        disabled={isLoading}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        CV Oluştur
                                    </button>
                                </>
                            )}
                            {step === 'preview' && (
                                <>
                                    <button
                                        onClick={() => setStep('chat')}
                                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition"
                                    >
                                        Düzenle
                                    </button>
                                    <button
                                        onClick={handleExportPDF}
                                        disabled={isLoading}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition disabled:opacity-50"
                                    >
                                        PDF İndir
                                    </button>
                                </>
                            )}
                            {step === 'select' && (
                                <button
                                    onClick={() => setStep('select')}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition"
                                    disabled
                                >
                                    Yöntem Seçin
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

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
                        <ChatWindow
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            onGenerateCV={handleGenerateCV}
                            isLoading={isLoading}
                            remaining={remaining}
                            showCVButton={messages.length > 4}
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
