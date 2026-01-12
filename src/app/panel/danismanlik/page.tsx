'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    MessageCircle,
    Send,
    Loader2,
    Lock,
    Crown,
    User,
    Phone,
    ArrowLeft,
    Check,
    CheckCheck,
    X,
    Star,
    LogOut
} from 'lucide-react'

interface Consultant {
    id: string
    name: string
    title: string
    avatarUrl: string | null
    phone?: string
}

interface ChatRoom {
    id: string
    consultant: Consultant
    lastMessage: ChatMessage | null
    unreadCount: number
    updatedAt: string
    status?: string
}

interface ChatMessage {
    id: string
    senderId: string
    senderType: string
    content: string
    isRead: boolean
    createdAt: string
}

export default function KariyerDanismanligiPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [isPremium, setIsPremium] = useState(false)
    const [consultants, setConsultants] = useState<Consultant[]>([])
    const [rooms, setRooms] = useState<ChatRoom[]>([])
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [showRatingModal, setShowRatingModal] = useState(false)
    const [rating, setRating] = useState(0)
    const [ratingComment, setRatingComment] = useState('')
    const [submittingRating, setSubmittingRating] = useState(false)
    const [closingSession, setClosingSession] = useState(false)
    const [restartingSession, setRestartingSession] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const pollingRef = useRef<NodeJS.Timeout | null>(null)

    // Scroll to bottom - container içinde scroll yap
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
        }
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Initial load
    const loadData = useCallback(async () => {
        try {
            const res = await fetch('/api/chat/consultant')
            const data = await res.json()

            if (res.status === 403) {
                setIsPremium(false)
                setLoading(false)
                return
            }

            if (res.ok) {
                setIsPremium(true)
                setConsultants(data.consultants || [])
                setRooms(data.rooms || [])
            }
        } catch (error) {
            console.error('Load error:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (status === 'authenticated') {
            loadData()
        } else if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, loadData, router])

    // Start chat with consultant
    const startChat = async (consultantId: string) => {
        setLoadingMessages(true)
        try {
            const res = await fetch(`/api/chat/consultant?consultantId=${consultantId}`)
            const data = await res.json()

            if (res.ok && data.room) {
                setSelectedRoom(data.room)
                loadMessages(data.room.id)
            }
        } catch (error) {
            console.error('Start chat error:', error)
        }
    }

    // Load messages for room
    const loadMessages = async (roomId: string) => {
        try {
            const res = await fetch(`/api/chat/consultant?roomId=${roomId}`)
            const data = await res.json()

            if (res.ok) {
                setMessages(data.messages || [])
                setSelectedRoom(data.room)
            }
        } catch (error) {
            console.error('Load messages error:', error)
        } finally {
            setLoadingMessages(false)
        }
    }

    // Polling for new messages
    useEffect(() => {
        if (selectedRoom) {
            pollingRef.current = setInterval(() => {
                loadMessages(selectedRoom.id)
            }, 5000)

            return () => {
                if (pollingRef.current) {
                    clearInterval(pollingRef.current)
                }
            }
        }
    }, [selectedRoom])

    // Send message
    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !selectedRoom || sending) return

        setSending(true)
        const content = newMessage.trim()
        setNewMessage('')

        // Optimistic update
        const tempMessage: ChatMessage = {
            id: 'temp-' + Date.now(),
            senderId: session?.user?.id || '',
            senderType: 'USER',
            content,
            isRead: false,
            createdAt: new Date().toISOString()
        }
        setMessages(prev => [...prev, tempMessage])

        try {
            const res = await fetch('/api/chat/consultant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId: selectedRoom.id, content })
            })

            if (res.ok) {
                loadMessages(selectedRoom.id)
            }
        } catch (error) {
            console.error('Send error:', error)
        } finally {
            setSending(false)
        }
    }

    // Format time
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (days === 0) {
            return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        } else if (days === 1) {
            return 'Dün'
        } else if (days < 7) {
            return date.toLocaleDateString('tr-TR', { weekday: 'short' })
        }
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
    }

    // Close session
    const closeSession = async () => {
        if (!selectedRoom || closingSession) return
        setClosingSession(true)
        try {
            const res = await fetch('/api/chat/consultant', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId: selectedRoom.id, action: 'close' })
            })
            if (res.ok) {
                setSelectedRoom({ ...selectedRoom, status: 'CLOSED' })
                setShowRatingModal(true)
            }
        } catch (error) {
            console.error('Close error:', error)
        } finally {
            setClosingSession(false)
        }
    }

    // Restart session - Sohbeti yeniden başlat
    const restartSession = async () => {
        if (!selectedRoom || restartingSession) return
        setRestartingSession(true)
        try {
            const res = await fetch('/api/chat/consultant', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId: selectedRoom.id, action: 'restart' })
            })
            if (res.ok) {
                setSelectedRoom({ ...selectedRoom, status: 'ACTIVE' })
                loadData() // Refresh list
            }
        } catch (error) {
            console.error('Restart error:', error)
        } finally {
            setRestartingSession(false)
        }
    }

    // Submit rating
    const submitRating = async () => {
        if (!selectedRoom || rating === 0 || submittingRating) return
        setSubmittingRating(true)
        try {
            await fetch('/api/consultant-rating', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: selectedRoom.id,
                    rating,
                    comment: ratingComment.trim() || null
                })
            })
            setShowRatingModal(false)
            setRating(0)
            setRatingComment('')
        } catch (error) {
            console.error('Rating error:', error)
        } finally {
            setSubmittingRating(false)
        }
    }

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        )
    }

    // Premium Lock Screen
    if (!isPremium) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-slate-700 p-8 max-w-md text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-3">Premium Üyelere Özel</h1>
                    <p className="text-slate-400 mb-6">
                        Kariyer danışmanlarıyla anlık mesajlaşma özelliği sadece Premium üyelere açıktır.
                        Profesyonel kariyer desteği almak için Premium'a geçin!
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-slate-300 text-sm">
                            <Crown className="w-5 h-5 text-amber-400" />
                            <span>Sınırsız danışman görüşmesi</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300 text-sm">
                            <MessageCircle className="w-5 h-5 text-purple-400" />
                            <span>Anlık mesajlaşma</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300 text-sm">
                            <User className="w-5 h-5 text-blue-400" />
                            <span>Kişiselleştirilmiş kariyer tavsiyeleri</span>
                        </div>
                    </div>
                    <Link
                        href="/pricing"
                        className="mt-8 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold rounded-xl transition shadow-lg shadow-amber-500/30"
                    >
                        <Crown className="w-5 h-5" />
                        Premium'a Geç
                    </Link>
                    <Link href="/panel" className="block mt-4 text-slate-400 hover:text-white transition">
                        ← Panele Dön
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="h-screen flex flex-col">
                {/* Header */}
                <header className="bg-slate-800/80 backdrop-blur-lg border-b border-slate-700 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {selectedRoom ? (
                                <button
                                    onClick={() => {
                                        setSelectedRoom(null)
                                        setMessages([])
                                        loadData()
                                    }}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition md:hidden"
                                >
                                    <ArrowLeft className="w-5 h-5 text-slate-300" />
                                </button>
                            ) : (
                                <Link href="/panel" className="p-2 hover:bg-slate-700 rounded-lg transition">
                                    <ArrowLeft className="w-5 h-5 text-slate-300" />
                                </Link>
                            )}
                            <div>
                                <h1 className="text-lg font-bold text-white">
                                    {selectedRoom ? selectedRoom.consultant.name : 'Kariyer Danışmanlığı'}
                                </h1>
                                <p className="text-sm text-slate-400">
                                    {selectedRoom ? selectedRoom.consultant.title : 'Premium üyelere özel anlık destek'}
                                </p>
                            </div>
                        </div>
                        {selectedRoom?.consultant.phone && (
                            <a
                                href={`tel:${selectedRoom.consultant.phone}`}
                                className="p-2 bg-green-600 hover:bg-green-500 rounded-lg transition"
                            >
                                <Phone className="w-5 h-5 text-white" />
                            </a>
                        )}
                        {selectedRoom && selectedRoom.status !== 'CLOSED' && (
                            <button
                                onClick={closeSession}
                                disabled={closingSession}
                                className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition disabled:opacity-50"
                                title="Görüşmeyi Bitir"
                            >
                                {closingSession ? (
                                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                                ) : (
                                    <LogOut className="w-5 h-5 text-white" />
                                )}
                            </button>
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar - Consultant List */}
                    <div className={`w-full md:w-80 bg-slate-800/50 border-r border-slate-700 flex flex-col ${selectedRoom ? 'hidden md:flex' : 'flex'}`}>
                        {/* Consultants */}
                        <div className="p-4 border-b border-slate-700">
                            <h2 className="text-sm font-semibold text-purple-400 mb-3">Danışmanlar</h2>
                            <div className="space-y-2">
                                {consultants.map(consultant => (
                                    <button
                                        key={consultant.id}
                                        onClick={() => startChat(consultant.id)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/50 transition text-left"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                                            {consultant.avatarUrl ? (
                                                <img src={consultant.avatarUrl} alt={consultant.name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5 text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">{consultant.name}</p>
                                            <p className="text-slate-400 text-xs truncate">{consultant.title}</p>
                                        </div>
                                        <MessageCircle className="w-4 h-4 text-slate-500" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recent Chats */}
                        <div className="flex-1 overflow-y-auto">
                            <h2 className="px-4 pt-4 text-sm font-semibold text-purple-400 mb-3">Son Sohbetler</h2>
                            {rooms.length === 0 ? (
                                <p className="px-4 text-slate-500 text-sm">Henüz sohbet yok</p>
                            ) : (
                                <div className="space-y-1 px-2">
                                    {rooms.map(room => (
                                        <button
                                            key={room.id}
                                            onClick={() => {
                                                setSelectedRoom(room)
                                                loadMessages(room.id)
                                            }}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-left ${selectedRoom?.id === room.id ? 'bg-purple-600/20' : 'hover:bg-slate-700/50'
                                                }`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                                                {room.consultant.avatarUrl ? (
                                                    <img src={room.consultant.avatarUrl} alt={room.consultant.name} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 text-white" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-white font-medium truncate">{room.consultant.name}</p>
                                                    {room.lastMessage && (
                                                        <span className="text-xs text-slate-500">{formatTime(room.lastMessage.createdAt)}</span>
                                                    )}
                                                </div>
                                                <p className="text-slate-400 text-xs truncate">
                                                    {room.lastMessage?.content || 'Sohbete başla...'}
                                                </p>
                                            </div>
                                            {room.unreadCount > 0 && (
                                                <span className="w-5 h-5 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                                    {room.unreadCount}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`flex-1 flex flex-col ${selectedRoom ? 'flex' : 'hidden md:flex'}`}>
                        {!selectedRoom ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <MessageCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                    <h2 className="text-xl font-semibold text-white mb-2">Sohbet Seçin</h2>
                                    <p className="text-slate-400">Bir danışman seçerek sohbete başlayın</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Messages */}
                                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {loadingMessages ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center">
                                                <p className="text-slate-400">Henüz mesaj yok</p>
                                                <p className="text-slate-500 text-sm">İlk mesajı gönderin!</p>
                                            </div>
                                        </div>
                                    ) : (
                                        messages.map(msg => (
                                            <div
                                                key={msg.id}
                                                className={`flex ${msg.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] md:max-w-[60%] rounded-2xl px-4 py-2 ${msg.senderType === 'USER'
                                                        ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-br-md'
                                                        : 'bg-slate-700 text-white rounded-bl-md'
                                                        }`}
                                                >
                                                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                                    <div className={`flex items-center gap-1 mt-1 text-xs ${msg.senderType === 'USER' ? 'justify-end text-purple-200' : 'text-slate-400'
                                                        }`}>
                                                        <span>{formatTime(msg.createdAt)}</span>
                                                        {msg.senderType === 'USER' && (
                                                            msg.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <form onSubmit={sendMessage} className="p-4 bg-slate-800/50 border-t border-slate-700">
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            placeholder="Mesajınızı yazın..."
                                            className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || sending}
                                            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {sending ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Send className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </form>

                                {/* Closed Session - Restart Option */}
                                {selectedRoom?.status === 'CLOSED' && (
                                    <div className="p-4 bg-green-500/10 border-t border-slate-700 space-y-3">
                                        <p className="text-green-400 text-sm text-center flex items-center justify-center gap-2">
                                            <Check className="w-4 h-4" />
                                            Bu görüşme tamamlanmış.
                                        </p>
                                        <button
                                            onClick={restartSession}
                                            disabled={restartingSession}
                                            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {restartingSession ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <MessageCircle className="w-5 h-5" />
                                            )}
                                            Yeni Sohbet Başlat
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Rating Modal */}
            {showRatingModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Danışmanı Puanla</h3>
                            <button onClick={() => setShowRatingModal(false)} className="p-1 hover:bg-slate-700 rounded-lg">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <p className="text-slate-400 text-sm mb-4">
                            {selectedRoom?.consultant.name} ile görüşmenizi nasıl değerlendirirsiniz?
                        </p>
                        {/* Stars */}
                        <div className="flex justify-center gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className="transition hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                                    />
                                </button>
                            ))}
                        </div>
                        {/* Comment */}
                        <textarea
                            value={ratingComment}
                            onChange={e => setRatingComment(e.target.value)}
                            placeholder="Yorumunuz (isteğe bağlı)..."
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 resize-none"
                            rows={3}
                        />
                        {/* Submit */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRatingModal(false)}
                                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition"
                            >
                                Atla
                            </button>
                            <button
                                onClick={submitRating}
                                disabled={rating === 0 || submittingRating}
                                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submittingRating ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>Gönder</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
