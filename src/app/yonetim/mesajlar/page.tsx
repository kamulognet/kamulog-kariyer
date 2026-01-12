'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
    MessageCircle,
    User,
    Send,
    Loader2,
    RefreshCw,
    Mail,
    Calendar,
    Hash,
    CheckCircle,
    Clock,
    Smile
} from 'lucide-react'

interface ChatRoom {
    id: string
    user: { id: string; name: string | null; email: string }
    status: string
    lastMessage: ChatMessage | null
    messageCount: number
    unreadCount: number
    createdAt: string
    updatedAt: string
}

interface ChatMessage {
    id: string
    senderId: string
    senderType: string
    content: string
    isRead: boolean
    createdAt: string
}

interface ConsultantInfo {
    id: string
    name: string
    title: string
}

interface Stats {
    totalRooms: number
    totalMessages: number
    unreadCount: number
}

const EMOJI_LIST = ['😊', '👍', '❤️', '🙏', '💪', '✨', '🎉', '👏', '🤝', '💼', '📝', '✅']

export default function ModeratorMessagesPage() {
    const [loading, setLoading] = useState(true)
    const [consultant, setConsultant] = useState<ConsultantInfo | null>(null)
    const [rooms, setRooms] = useState<ChatRoom[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [showEmoji, setShowEmoji] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const pollingRef = useRef<NodeJS.Timeout | null>(null)

    const loadData = useCallback(async () => {
        try {
            const res = await fetch('/api/moderator/chats')
            const data = await res.json()

            if (data.error) {
                console.error(data.error)
                return
            }

            setConsultant(data.consultant || null)
            setRooms(data.rooms || [])
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

    // Polling for new messages
    useEffect(() => {
        if (selectedRoom) {
            pollingRef.current = setInterval(() => {
                loadRoomMessages(selectedRoom.id)
            }, 5000)
        }
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current)
        }
    }, [selectedRoom])

    const loadRoomMessages = async (roomId: string) => {
        try {
            const res = await fetch(`/api/moderator/chats?roomId=${roomId}`)
            const data = await res.json()
            if (data.room) {
                setMessages(data.room.messages || [])
            }
        } catch (error) {
            console.error('Load messages error:', error)
        } finally {
            setLoadingMessages(false)
        }
    }

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedRoom || sending) return

        setSending(true)
        const content = newMessage.trim()
        setNewMessage('')
        setShowEmoji(false)

        // Optimistic update
        const tempMessage: ChatMessage = {
            id: 'temp-' + Date.now(),
            senderId: consultant?.id || '',
            senderType: 'CONSULTANT',
            content,
            isRead: false,
            createdAt: new Date().toISOString()
        }
        setMessages(prev => [...prev, tempMessage])

        try {
            const res = await fetch('/api/moderator/chats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId: selectedRoom.id, content })
            })

            if (res.ok) {
                loadRoomMessages(selectedRoom.id)
                loadData() // Refresh room list
            }
        } catch (error) {
            console.error('Send error:', error)
        } finally {
            setSending(false)
        }
    }

    const addEmoji = (emoji: string) => {
        setNewMessage(prev => prev + emoji)
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (days === 0) {
            return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        } else if (days === 1) {
            return 'Dün ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        }
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
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

    if (!consultant) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Danışman Profili Bulunamadı</h2>
                    <p className="text-slate-400">Bu hesaba bağlı bir danışman profili yok.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Mesajlarım</h1>
                    <p className="text-slate-400">{consultant.name} - {consultant.title}</p>
                </div>
                <button onClick={loadData} className="p-2 hover:bg-slate-700 rounded-lg transition">
                    <RefreshCw className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <Hash className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.totalRooms}</p>
                                <p className="text-sm text-slate-400">Görüşme</p>
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
                                <p className="text-sm text-slate-400">Mesaj</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <Mail className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.unreadCount}</p>
                                <p className="text-sm text-slate-400">Okunmamış</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
                {/* Room List */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-700">
                        <h2 className="text-white font-semibold">Görüşmeler</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {rooms.length === 0 ? (
                            <p className="p-4 text-slate-500 text-center">Henüz görüşme yok</p>
                        ) : (
                            rooms.map(room => (
                                <button
                                    key={room.id}
                                    onClick={() => {
                                        setSelectedRoom(room)
                                        setLoadingMessages(true)
                                        loadRoomMessages(room.id)
                                    }}
                                    className={`w-full p-4 border-b border-slate-700/50 transition text-left ${selectedRoom?.id === room.id ? 'bg-purple-600/20' : 'hover:bg-slate-700/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-medium truncate">{room.user.name || 'İsimsiz'}</p>
                                            {room.status === 'CLOSED' && (
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                            )}
                                        </div>
                                        {room.unreadCount > 0 && (
                                            <span className="w-5 h-5 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                                {room.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 truncate">{room.user.email}</p>
                                    {room.lastMessage && (
                                        <p className="text-xs text-slate-500 mt-1 truncate">
                                            {room.lastMessage.senderType === 'CONSULTANT' ? 'Siz: ' : ''}
                                            {room.lastMessage.content}
                                        </p>
                                    )}
                                </button>
                            ))
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
                                    <div className="flex items-center gap-2">
                                        <p className="text-white font-semibold">{selectedRoom.user.name}</p>
                                        {selectedRoom.status === 'CLOSED' && (
                                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                                                Tamamlandı
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Mail className="w-3 h-3" />
                                            {selectedRoom.user.email}
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
                            <p className="text-slate-400">Mesaj görüntülemek için görüşme seçin</p>
                        )}
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {loadingMessages ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                            </div>
                        ) : !selectedRoom ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                                    <p className="text-slate-500">Görüşme seçin</p>
                                </div>
                            </div>
                        ) : messages.length === 0 ? (
                            <p className="text-slate-500 text-center">Henüz mesaj yok</p>
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
                                            {formatTime(msg.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Reply Input */}
                    {selectedRoom && selectedRoom.status !== 'CLOSED' && (
                        <div className="p-4 border-t border-slate-700">
                            {/* Emoji Picker */}
                            {showEmoji && (
                                <div className="mb-2 p-2 bg-slate-900 rounded-lg flex flex-wrap gap-2">
                                    {EMOJI_LIST.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => addEmoji(emoji)}
                                            className="text-xl hover:scale-125 transition"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowEmoji(!showEmoji)}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition"
                                >
                                    <Smile className="w-5 h-5 text-slate-400" />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                    placeholder="Mesajınızı yazın..."
                                    className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim() || sending}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Closed Room Notice */}
                    {selectedRoom && selectedRoom.status === 'CLOSED' && (
                        <div className="p-4 border-t border-slate-700 bg-green-500/10">
                            <p className="text-green-400 text-sm text-center flex items-center justify-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Bu görüşme tamamlanmış. Yeni mesaj gönderemezsiniz.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
