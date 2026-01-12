'use client'

import { useState, useRef, useEffect } from 'react'
import type { ChatMessage } from '@/types'
import { Sparkles, Send } from 'lucide-react'

interface ChatWindowProps {
    messages: ChatMessage[]
    onSendMessage: (message: string) => void
    onGenerateCV?: () => void
    isLoading: boolean
    remaining?: number
    showCVButton?: boolean
    cvTitle?: string
    onCVTitleChange?: (title: string) => void
}

export default function ChatWindow({
    messages,
    onSendMessage,
    onGenerateCV,
    isLoading,
    remaining,
    showCVButton = false,
    cvTitle = '',
    onCVTitleChange
}: ChatWindowProps) {
    const [input, setInput] = useState('')
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
        }
    }

    useEffect(() => {
        scrollToBottom()
        // Scroll sonrası inputa focus ver
        inputRef.current?.focus()
    }, [messages])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim())
            setInput('')
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // @ işareti ve diğer özel karakterleri ekvoyaluaya
        const value = e.target.value
        setInput(value)
    }

    return (
        <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-white font-semibold text-lg">CV Asistanı</h2>
                <p className="text-blue-200 text-sm">
                    Bilgilerinizi adım adım toplayarak profesyonel CV&apos;nizi oluşturuyoruz
                </p>
                {remaining !== undefined && remaining >= 0 && (
                    <p className="text-blue-300 text-xs mt-1">
                        Kalan mesaj hakkı: {remaining}
                    </p>
                )}
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-slate-400 py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-600/20 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <p className="font-medium">CV oluşturmaya başlayalım!</p>
                        <p className="text-sm mt-1">Size sorular soracağım, bilgilerinizi adım adım toplayacağız.</p>
                    </div>
                )}

                {messages.filter(m => m.role !== 'system').map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] px-4 py-3 rounded-2xl ${message.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-slate-800 text-slate-100 rounded-bl-sm'
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 text-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-slate-800 border-t border-slate-700">
                {/* CV Generation Section - visible when showCVButton is true */}
                {showCVButton && onGenerateCV && (
                    <div className="mb-3 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                        <p className="text-green-400 text-sm mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            CV bilgileriniz toplandı! Şimdi CV oluşturabilirsiniz.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={cvTitle}
                                onChange={(e) => onCVTitleChange?.(e.target.value)}
                                placeholder="CV Başlığı (örn: Yazılım Geliştirici CV)"
                                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                                type="button"
                                onClick={onGenerateCV}
                                disabled={isLoading}
                                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                            >
                                <Sparkles className="w-4 h-4" />
                                CV Oluştur
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Mesajınızı yazın..."
                        disabled={isLoading}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        className="flex-1 px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    )
}
