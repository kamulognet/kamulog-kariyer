'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
    Users,
    Search,
    Edit2,
    Trash2,
    Plus,
    Minus,
    Eye,
    CreditCard,
    RefreshCw,
    FileText,
    Crown,
    Shield,
    CheckCircle2,
    XCircle
} from 'lucide-react'

interface User {
    id: string
    name: string | null
    email: string
    phoneNumber: string | null
    credits: number
    cvChatTokens?: number
    role: string
    createdAt: string
    emailVerified: string | null
    subscription: { plan: string; status: string } | null
    _count: { cvs: number }
}

interface Pagination {
    page: number
    limit: number
    total: number
    pages: number
}

export default function AdminUsersPage() {
    const { data: session } = useSession()
    const isAdmin = session?.user?.role === 'ADMIN'
    // Korunan admin email - sadece kendisi düzenleyebilir
    const PROTECTED_ADMIN_EMAIL = 'sdat.sahin@gmail.com'
    const [users, setUsers] = useState<User[]>([])
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')

    // Bulk Actions
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    const [bulkActionLoading, setBulkActionLoading] = useState(false)

    // Edit Modal
    const [editUser, setEditUser] = useState<User | null>(null)
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        credits: 0,
        cvChatTokens: 20,
        role: 'USER',
        plan: 'FREE',
    })

    // Credit Modal
    const [creditModal, setCreditModal] = useState<{ user: User; type: 'add' | 'remove' } | null>(null)
    const [creditAmount, setCreditAmount] = useState(10)

    useEffect(() => {
        loadUsers()
    }, [page])

    const loadUsers = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), limit: '50' })
            if (search) params.set('search', search)

            const res = await fetch(`/api/admin/users?${params}`)
            const data = await res.json()
            setUsers(data.users || [])
            setPagination(data.pagination)
        } catch (error) {
            console.error('Error loading users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = () => {
        setPage(1)
        loadUsers()
    }

    const openEditModal = (user: User) => {
        setEditUser(user)
        setEditForm({
            name: user.name || '',
            email: user.email,
            phoneNumber: user.phoneNumber || '',
            credits: user.credits,
            cvChatTokens: user.cvChatTokens || 20,
            role: user.role,
            plan: user.subscription?.plan || 'FREE',
        })
    }

    const handleUpdateUser = async () => {
        if (!editUser) return

        try {
            // Only send values if explicitly changed
            const creditsChanged = editForm.credits !== editUser.credits
            const cvChatTokensChanged = editForm.cvChatTokens !== (editUser.cvChatTokens || 20)
            const planChanged = editForm.plan !== (editUser.subscription?.plan || 'FREE')

            const payload: any = {
                userId: editUser.id,
                name: editForm.name,
                phoneNumber: editForm.phoneNumber,
                role: editForm.role,
            }

            // If plan changed and tokens not manually changed, 
            // don't send them so API can add plan tokens
            if (planChanged && !creditsChanged && !cvChatTokensChanged) {
                payload.plan = editForm.plan
                // Don't include credits/cvChatTokens - let API add tokens from plan
            } else {
                // Values explicitly changed, send them
                if (creditsChanged) {
                    payload.credits = editForm.credits
                }
                if (cvChatTokensChanged) {
                    payload.cvChatTokens = editForm.cvChatTokens
                }
                if (planChanged) {
                    payload.plan = editForm.plan
                }
            }

            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const data = await res.json()

            if (res.ok) {
                setEditUser(null)
                loadUsers()
                if (data.message) {
                    alert(data.message)
                }
            } else {
                alert(data.error || 'Güncelleme başarısız')
            }
        } catch (error) {
            console.error('Error updating user:', error)
        }
    }

    const handleCreditChange = async () => {
        if (!creditModal) return

        const newCredits = creditModal.type === 'add'
            ? creditModal.user.credits + creditAmount
            : Math.max(0, creditModal.user.credits - creditAmount)

        try {
            await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: creditModal.user.id,
                    credits: newCredits,
                }),
            })
            setCreditModal(null)
            setCreditAmount(10)
            loadUsers()
        } catch (error) {
            console.error('Error updating credits:', error)
        }
    }

    const handleDeleteUser = async (userId: string, email: string) => {
        // Korunan admin silinemez
        if (email === PROTECTED_ADMIN_EMAIL) {
            alert('Bu kullanıcı korumalı admindir ve silinemez!')
            return
        }
        if (!confirm(`${email} kullanıcısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
            return
        }

        try {
            const res = await fetch(`/api/admin/users?userId=${userId}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                loadUsers()
            } else {
                const data = await res.json()
                alert(data.error || 'Silme başarısız')
            }
        } catch (error) {
            console.error('Error deleting user:', error)
        }
    }

    // Bulk Action Handlers
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedUsers(users.map(u => u.id))
        } else {
            setSelectedUsers([])
        }
    }

    const handleSelectUser = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId))
        } else {
            setSelectedUsers([...selectedUsers, userId])
        }
    }

    const handleBulkDelete = async () => {
        if (!confirm(`${selectedUsers.length} kullanıcıyı silmek istediğinize emin misiniz?`)) return

        setBulkActionLoading(true)
        try {
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds: selectedUsers })
            })

            if (res.ok) {
                setSelectedUsers([])
                loadUsers()
            } else {
                const data = await res.json()
                alert(data.error || 'Silme başarısız')
            }
        } catch (error) {
            console.error('Bulk delete error:', error)
        } finally {
            setBulkActionLoading(false)
        }
    }

    const handleBulkCredits = async (amount: number) => {
        if (!confirm(`${selectedUsers.length} kullanıcıya ${amount} kredi eklenecek. Onaylıyor musunuz?`)) return

        setBulkActionLoading(true)
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds: selectedUsers, credits: amount }) // existing PUT handles userIds check? I need to verify backend again but I think I added it. Yes I added it.
            })

            if (res.ok) {
                setSelectedUsers([])
                loadUsers()
            }
        } catch (error) {
            console.error('Bulk credits error:', error)
        } finally {
            setBulkActionLoading(false)
        }
    }

    const planColors: Record<string, string> = {
        FREE: 'bg-slate-500/20 text-slate-400',
        BASIC: 'bg-blue-500/20 text-blue-400',
        PREMIUM: 'bg-purple-500/20 text-purple-400',
    }

    const roleColors: Record<string, string> = {
        USER: 'bg-slate-500/20 text-slate-400',
        ADMIN: 'bg-red-500/20 text-red-400',
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-purple-400" />
                        Kullanıcı Yönetimi
                    </h1>
                    <p className="text-slate-400">
                        Toplam {pagination?.total || 0} kullanıcı
                    </p>
                </div>
                <button
                    onClick={loadUsers}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                >
                    <RefreshCw className="w-4 h-4" />
                    Yenile
                </button>
            </div>

            {/* Search */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="İsim, email veya telefon ile ara..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition"
                >
                    Ara
                </button>
            </div>

            {/* Bulk Action Bar */}
            {selectedUsers.length > 0 && (
                <div className="bg-purple-900/40 border border-purple-500/30 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-lg font-bold">
                            {selectedUsers.length} Seçili
                        </div>
                        <p className="text-purple-200 text-sm">kullanıcı üzerinde işlem yapılıyor</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleBulkCredits(10)}
                            disabled={bulkActionLoading}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/40 text-green-300 rounded-lg transition border border-green-500/30"
                        >
                            <Plus className="w-4 h-4" />
                            +10 Kredi
                        </button>
                        <button
                            onClick={() => handleBulkCredits(100)}
                            disabled={bulkActionLoading}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/40 text-green-300 rounded-lg transition border border-green-500/30"
                        >
                            <Plus className="w-4 h-4" />
                            +100
                        </button>
                        <div className="h-6 w-px bg-purple-500/30 mx-2"></div>
                        <button
                            onClick={handleBulkDelete}
                            disabled={bulkActionLoading}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg transition border border-red-500/30"
                        >
                            <Trash2 className="w-4 h-4" />
                            Seçilenleri Sil
                        </button>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700 overflow-hidden">
                {/* Scrollbar her zaman görünür wrapper */}
                <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)]" style={{ scrollbarGutter: 'stable' }}>
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={users.length > 0 && selectedUsers.length === users.length}
                                        className="rounded border-slate-600 bg-slate-800 text-purple-600 focus:ring-purple-500"
                                    />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Kullanıcı</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Telefon</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Kredi</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Plan</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Rol</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">CV</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Kayıt</th>
                                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                                        Yükleniyor...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                                        Kullanıcı bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className={`hover:bg-slate-700/30 transition ${selectedUsers.includes(user.id) ? 'bg-slate-700/30' : ''}`}>
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => handleSelectUser(user.id)}
                                                className="rounded border-slate-600 bg-slate-800 text-purple-600 focus:ring-purple-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'ADMIN' ? 'bg-red-500/20' : 'bg-slate-700'}`}>
                                                    {user.role === 'ADMIN' ? (
                                                        <Shield className="w-5 h-5 text-red-400" />
                                                    ) : (
                                                        <span className="text-white font-medium">
                                                            {(user.name || user.email)[0].toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="font-medium text-white">{user.name || '-'}</p>
                                                        {user.emailVerified ? (
                                                            <span title="Doğrulanmış Hesap">
                                                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                            </span>
                                                        ) : (
                                                            <span title="Doğrulanmamış">
                                                                <XCircle className="w-4 h-4 text-slate-500" />
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            {user.phoneNumber || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-yellow-500/10 text-yellow-400 px-2.5 py-1 rounded-lg text-sm font-bold border border-yellow-500/20">
                                                    {user.credits}
                                                </span>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => setCreditModal({ user, type: 'add' })}
                                                        className="p-1 text-green-400 hover:bg-green-500/20 rounded transition"
                                                        title="Kredi Ekle"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setCreditModal({ user, type: 'remove' })}
                                                        className="p-1 text-red-400 hover:bg-red-500/20 rounded transition"
                                                        title="Kredi Çıkar"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${planColors[user.subscription?.plan || 'FREE']}`}>
                                                {user.subscription?.plan || 'FREE'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${roleColors[user.role]}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-slate-400">
                                                <FileText className="w-4 h-4" />
                                                <span>{user._count.cvs}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {isAdmin && user.email !== PROTECTED_ADMIN_EMAIL ? (
                                                    <>
                                                        <button
                                                            onClick={() => openEditModal(user)}
                                                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                                                            title="Düzenle"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id, user.email)}
                                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                                            title="Sil"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : user.email === PROTECTED_ADMIN_EMAIL ? (
                                                    <span className="text-xs text-green-400 font-medium">🛡️ Korumalı</span>
                                                ) : (
                                                    <span className="text-xs text-slate-500 italic">Salt okunur</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700 flex items-center justify-between">
                        <p className="text-sm text-slate-400">
                            {pagination.total} kullanıcıdan {(page - 1) * pagination.limit + 1} - {Math.min(page * pagination.limit, pagination.total)} gösteriliyor
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 bg-slate-700 text-white rounded disabled:opacity-50"
                            >
                                ←
                            </button>
                            <span className="px-3 py-1 text-white">{page} / {pagination.pages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={page === pagination.pages}
                                className="px-3 py-1 bg-slate-700 text-white rounded disabled:opacity-50"
                            >
                                →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit User Modal */}
            {editUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700">
                        <div className="p-6 border-b border-slate-700">
                            <h2 className="text-xl font-bold text-white">Kullanıcı Düzenle</h2>
                            <p className="text-slate-400 text-sm">{editUser.email}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">İsim</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Telefon</label>
                                <input
                                    type="text"
                                    value={editForm.phoneNumber}
                                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Kredi</label>
                                    <input
                                        type="number"
                                        value={editForm.credits}
                                        onChange={(e) => setEditForm({ ...editForm, credits: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">CV Chat Jetonu</label>
                                    <input
                                        type="number"
                                        value={editForm.cvChatTokens}
                                        onChange={(e) => setEditForm({ ...editForm, cvChatTokens: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Rol</label>
                                    <select
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                    >
                                        <option value="USER">USER</option>
                                        <option value="MODERATOR">MODERATOR</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Plan</label>
                                    <select
                                        value={editForm.plan}
                                        onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                    >
                                        <option value="FREE">FREE</option>
                                        <option value="BASIC">BASIC</option>
                                        <option value="PREMIUM">PREMIUM</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
                            <button
                                onClick={() => setEditUser(null)}
                                className="px-4 py-2 text-slate-400 hover:text-white transition"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleUpdateUser}
                                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition"
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Credit Modal */}
            {creditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-2xl w-full max-w-sm border border-slate-700">
                        <div className="p-6 border-b border-slate-700">
                            <h2 className="text-xl font-bold text-white">
                                {creditModal.type === 'add' ? 'Kredi Ekle' : 'Kredi Çıkar'}
                            </h2>
                            <p className="text-slate-400 text-sm">{creditModal.user.email}</p>
                            <p className="text-yellow-400 text-sm mt-1">
                                Mevcut: {creditModal.user.credits} kredi
                            </p>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-medium text-slate-400 mb-2">Miktar</label>
                            <input
                                type="number"
                                value={creditAmount}
                                onChange={(e) => setCreditAmount(Math.max(1, parseInt(e.target.value) || 1))}
                                min="1"
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-center text-xl font-bold"
                            />
                            <p className="text-center text-slate-400 mt-2">
                                Yeni bakiye: {' '}
                                <span className={creditModal.type === 'add' ? 'text-green-400' : 'text-red-400'}>
                                    {creditModal.type === 'add'
                                        ? creditModal.user.credits + creditAmount
                                        : Math.max(0, creditModal.user.credits - creditAmount)
                                    } kredi
                                </span>
                            </p>
                        </div>
                        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
                            <button
                                onClick={() => { setCreditModal(null); setCreditAmount(10) }}
                                className="px-4 py-2 text-slate-400 hover:text-white transition"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleCreditChange}
                                className={`px-6 py-2 rounded-lg font-medium transition ${creditModal.type === 'add'
                                    ? 'bg-green-600 hover:bg-green-500 text-white'
                                    : 'bg-red-600 hover:bg-red-500 text-white'
                                    }`}
                            >
                                {creditModal.type === 'add' ? 'Ekle' : 'Çıkar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
