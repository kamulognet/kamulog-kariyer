'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
    MessageCircle,
    User,
    Send,
    Loader2,
    ChevronLeft,
    Phone,
    Mail,
    Calendar,
    Hash,
    RefreshCw
} from 'lucide-react'

interface Consultant {
    id: string
    name: string
    title: string
    phone: string
    chatRooms: ChatRoom[]
    _count: { chatRooms: number }
}

interface ChatRoom {
    id: string
    createdAt: string
    updatedAt: string
    user: { name: string; email: string }
    messages: ChatMessage[]
    _count: { messages: number }
}

interface ChatMessage {
    id: string
    senderId: string
    senderType: string
    content: string
    isRead: boolean
    createdAt: string
}

interface Stats {
    totalConsultants: number
    totalRooms: number
    totalMessages: number
}

export default function DanismanMesajlariPage() {
    const [loading, setLoading] = useState(true)
    const [consultants, setConsultants] = useState<Consultant[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null)
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const loadData = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/consultant-chats')
            const data = await res.json()
            setConsultants(data.consultants || [])
            setStats(data.stats || null)
        } catch (error) {
            console.error('Load error:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadData()
    }, [loadData])

    const loadRoomMessages = async (roomId: string) => {
        setLoadingMessages(true)
        try {
            const res = await fetch(`/api/admin/consultant-chats?roomId=${roomId}`)
            const data = await res.json()
            if (data.room) {
                setMessages(data.room.messages || [])
                setSelectedRoom(data.room)
            }
        } catch (error) {
            console.error('Load messages error:', error)
        } finally {
            setLoadingMessages(false)
        }
    }

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedRoom || !selectedConsultant || sending) return

        setSending(true)
        const content = newMessage.trim()
        setNewMessage('')

        try {
            const res = await fetch('/api/admin/consultant-chats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: selectedRoom.id,
                    consultantId: selectedConsultant.id,
                    content
                })
            })

            if (res.ok) {
                loadRoomMessages(selectedRoom.id)
            }
        } catch (error) {
            console.error('Send error:', error)
        } finally {
            setSending(false)
        }
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Danışman Mesajları</h1>
                    <p className="text-slate-400">Premium kullanıcı görüşmelerini takip edin ve yanıtlayın</p>
                </div>
                <button
                    onClick={loadData}
                    className="p-2 hover:bg-slate-700 rounded-lg transition"
                >
                    <RefreshCw className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <User className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.totalConsultants}</p>
                                <p className="text-sm text-slate-400">Danışman</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <Hash className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.totalRooms}</p>
                                <p className="text-sm text-slate-400">Sohbet Odası</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.totalMessages}</p>
                                <p className="text-sm text-slate-400">Toplam Mesaj</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Consultant List */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-700">
                        <h2 className="text-white font-semibold">Danışmanlar</h2>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                        {consultants.map(consultant => (
                            <button
                                key={consultant.id}
                                onClick={() => {
                                    setSelectedConsultant(consultant)
                                    setSelectedRoom(null)
                                    setMessages([])
                                }}
                                className={`w-full flex items-center gap-3 p-4 border-b border-slate-700/50 transition text-left ${selectedConsultant?.id === consultant.id
                                        ? 'bg-purple-600/20'
                                        : 'hover:bg-slate-700/50'
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">{consultant.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{consultant.title}</p>
                                </div>
                                <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                                    {consultant._count.chatRooms}
                                </span>
                            </button>
                        ))}
                        {consultants.length === 0 && (
                            <p className="p-4 text-slate-500 text-center">Danışman bulunamadı</p>
                        )}
                    </div>
                </div>

                {/* Chat Rooms List */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-700">
                        <h2 className="text-white font-semibold">
                            {selectedConsultant ? `${selectedConsultant.name} - Sohbetler` : 'Sohbetler'}
                        </h2>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                        {selectedConsultant?.chatRooms.map(room => (
                            <button
                                key={room.id}
                                onClick={() => loadRoomMessages(room.id)}
                                className={`w-full p-4 border-b border-slate-700/50 transition text-left ${selectedRoom?.id === room.id
                                        ? 'bg-purple-600/20'
                                        : 'hover:bg-slate-700/50'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-white font-medium truncate">{room.user.name || 'İsimsiz'}</p>
                                    <span className="text-xs text-slate-500">{room._count.messages}</span>
                                </div>
                                <p className="text-xs text-slate-400 truncate">{room.user.email}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Son: {formatDate(room.updatedAt)}
                                </p>
                            </button>
                        ))}
                        {!selectedConsultant && (
                            <p className="p-4 text-slate-500 text-center">Danışman seçin</p>
                        )}
                        {selectedConsultant && selectedConsultant.chatRooms.length === 0 && (
                            <p className="p-4 text-slate-500 text-center">Henüz sohbet yok</p>
                        )}
                    </div>
                </div>

                {/* Messages */}
                <div className="lg:col-span-2 bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                    {/* Room Header */}
                    <div className="p-4 border-b border-slate-700">
                        {selectedRoom ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-semibold">{selectedRoom.user.name}</p>
                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Mail className="w-3 h-3" />
                                            {selectedRoom.user.email}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(selectedRoom.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => loadRoomMessages(selectedRoom.id)}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition"
                                >
                                    <RefreshCw className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                        ) : (
                            <p className="text-slate-400">Mesaj görüntülemek için sohbet seçin</p>
                        )}
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[350px]">
                        {loadingMessages ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                            </div>
                        ) : messages.length === 0 ? (
                            <p className="text-slate-500 text-center">
                                {selectedRoom ? 'Henüz mesaj yok' : 'Sohbet seçin'}
                            </p>
                        ) : (
                            messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.senderType === 'CONSULTANT' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-xl px-4 py-2 ${msg.senderType === 'CONSULTANT'
                                                ? 'bg-purple-600 text-white rounded-br-md'
                                                : 'bg-slate-700 text-white rounded-bl-md'
                                            }`}
                                    >
                                        <p className="whitespace-pre-wrap break-words text-sm">{msg.content}</p>
                                        <p className={`text-xs mt-1 ${msg.senderType === 'CONSULTANT' ? 'text-purple-200' : 'text-slate-400'
                                            }`}>
                                            {msg.senderType === 'USER' ? '👤 Kullanıcı' : '👨‍💼 Danışman'} • {formatTime(msg.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Reply Input */}
                    {selectedRoom && selectedConsultant && (
                        <div className="p-4 border-t border-slate-700">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                    placeholder="Danışman olarak yanıt yazın..."
                                    className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim() || sending}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {sending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                {selectedConsultant.name} adına yanıt gönderilecek
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
