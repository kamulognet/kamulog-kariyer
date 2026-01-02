'use client'

import { useState, useEffect } from 'react'
import {
    Search,
    Filter,
    Download,
    Trash2,
    Eye,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    XCircle,
    Edit,
    User,
    FileText,
    CreditCard,
    Briefcase
} from 'lucide-react'

interface AdminLog {
    id: string
    adminId: string
    action: string
    targetType: string
    targetId: string | null
    details: string | null
    ipAddress: string | null
    userAgent: string | null
    createdAt: string
    admin: { id: string; name: string | null; email: string }
}

interface Pagination {
    page: number
    limit: number
    total: number
    pages: number
}

const actionColors: Record<string, string> = {
    CREATE: 'bg-green-500/20 text-green-400 border-green-500/30',
    UPDATE: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
    APPROVE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    REJECT: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    LOGIN: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

const targetTypeIcons: Record<string, any> = {
    USER: User,
    SUBSCRIPTION: CreditCard,
    JOB: Briefcase,
    SALES: FileText,
    LOGS: FileText,
    SYSTEM: AlertCircle,
}

const actionIcons: Record<string, any> = {
    CREATE: CheckCircle,
    UPDATE: Edit,
    DELETE: Trash2,
    APPROVE: CheckCircle,
    REJECT: XCircle,
}

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<AdminLog[]>([])
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [stats, setStats] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)

    // Filters
    const [search, setSearch] = useState('')
    const [actionFilter, setActionFilter] = useState('')
    const [targetTypeFilter, setTargetTypeFilter] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    // Modal
    const [selectedLog, setSelectedLog] = useState<AdminLog | null>(null)

    useEffect(() => {
        loadLogs()
    }, [page, actionFilter, targetTypeFilter, startDate, endDate])

    const loadLogs = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: '50',
            })
            if (search) params.set('search', search)
            if (actionFilter) params.set('action', actionFilter)
            if (targetTypeFilter) params.set('targetType', targetTypeFilter)
            if (startDate) params.set('startDate', startDate)
            if (endDate) params.set('endDate', endDate)

            const res = await fetch(`/api/admin/logs?${params}`)
            const data = await res.json()
            setLogs(data.logs || [])
            setPagination(data.pagination)
            setStats(data.stats || {})
        } catch (error) {
            console.error('Error loading logs:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = () => {
        setPage(1)
        loadLogs()
    }

    const handleClearOldLogs = async () => {
        if (!confirm('30 günden eski tüm loglar silinecek. Emin misiniz?')) return

        try {
            await fetch('/api/admin/logs?olderThan=30', { method: 'DELETE' })
            loadLogs()
        } catch (error) {
            console.error('Error clearing logs:', error)
        }
    }

    const formatDetails = (details: string | null) => {
        if (!details) return null
        try {
            return JSON.parse(details)
        } catch {
            return details
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Sistem Logları</h1>
                    <p className="text-slate-400">Tüm admin işlemlerini görüntüleyin ve yönetin</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadLogs}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Yenile
                    </button>
                    <button
                        onClick={handleClearOldLogs}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 rounded-lg transition"
                    >
                        <Trash2 className="w-4 h-4" />
                        Eski Logları Temizle
                    </button>
                </div>
            </div>

            {/* Stats (Son 24 saat) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT'].map((action) => {
                    const Icon = actionIcons[action] || AlertCircle
                    return (
                        <div
                            key={action}
                            className={`rounded-xl p-4 border ${actionColors[action] || 'bg-slate-700/50 text-slate-400 border-slate-600'}`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className="w-5 h-5" />
                                <div>
                                    <p className="text-2xl font-bold">{stats[action] || 0}</p>
                                    <p className="text-sm opacity-70">{action}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Filters */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <span className="text-white font-medium">Filtreler</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Detaylarda ara..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                    <select
                        value={actionFilter}
                        onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
                        className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="">Tüm İşlemler</option>
                        <option value="CREATE">CREATE</option>
                        <option value="UPDATE">UPDATE</option>
                        <option value="DELETE">DELETE</option>
                        <option value="APPROVE">APPROVE</option>
                        <option value="REJECT">REJECT</option>
                    </select>
                    <select
                        value={targetTypeFilter}
                        onChange={(e) => { setTargetTypeFilter(e.target.value); setPage(1) }}
                        className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="">Tüm Hedefler</option>
                        <option value="USER">USER</option>
                        <option value="SUBSCRIPTION">SUBSCRIPTION</option>
                        <option value="JOB">JOB</option>
                        <option value="SALES">SALES</option>
                    </select>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
                        className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Tarih/Saat</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Admin</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">İşlem</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Hedef</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Detay</th>
                                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        Yükleniyor...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        Log kaydı bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => {
                                    const TargetIcon = targetTypeIcons[log.targetType] || AlertCircle
                                    const ActionIcon = actionIcons[log.action] || AlertCircle

                                    return (
                                        <tr key={log.id} className="hover:bg-slate-700/30 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-white text-sm">
                                                    {new Date(log.createdAt).toLocaleDateString('tr-TR')}
                                                </p>
                                                <p className="text-slate-400 text-xs">
                                                    {new Date(log.createdAt).toLocaleTimeString('tr-TR')}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-white text-sm">{log.admin.name || '-'}</p>
                                                <p className="text-slate-400 text-xs">{log.admin.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${actionColors[log.action] || 'bg-slate-700/50 text-slate-400 border-slate-600'}`}>
                                                    <ActionIcon className="w-3.5 h-3.5" />
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <TargetIcon className="w-4 h-4 text-slate-400" />
                                                    <span className="text-slate-300 text-sm">{log.targetType}</span>
                                                </div>
                                                {log.targetId && (
                                                    <p className="text-slate-500 text-xs font-mono mt-1">{log.targetId.slice(0, 12)}...</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <p className="text-slate-400 text-sm truncate">
                                                    {log.details ? log.details.slice(0, 50) + '...' : '-'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedLog(log)}
                                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700 flex items-center justify-between">
                        <p className="text-sm text-slate-400">
                            {pagination.total} kayıttan {(page - 1) * pagination.limit + 1} - {Math.min(page * pagination.limit, pagination.total)} gösteriliyor
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="px-3 py-1 bg-slate-700 text-white rounded disabled:opacity-50"
                            >
                                ←
                            </button>
                            <span className="px-3 py-1 text-white">{page} / {pagination.pages}</span>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page === pagination.pages}
                                className="px-3 py-1 bg-slate-700 text-white rounded disabled:opacity-50"
                            >
                                →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Log Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-700 max-h-[80vh] overflow-auto">
                        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Log Detayı</h2>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-slate-400">Tarih</label>
                                    <p className="text-white">{new Date(selectedLog.createdAt).toLocaleString('tr-TR')}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400">Admin</label>
                                    <p className="text-white">{selectedLog.admin.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400">İşlem</label>
                                    <p className="text-white">{selectedLog.action}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400">Hedef</label>
                                    <p className="text-white">{selectedLog.targetType}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400">Hedef ID</label>
                                    <p className="text-white font-mono text-sm">{selectedLog.targetId || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400">IP Adresi</label>
                                    <p className="text-white font-mono text-sm">{selectedLog.ipAddress || '-'}</p>
                                </div>
                            </div>

                            {selectedLog.details && (
                                <div>
                                    <label className="text-sm text-slate-400">Detaylar</label>
                                    <pre className="mt-2 p-4 bg-slate-900 rounded-lg text-slate-300 text-sm overflow-auto">
                                        {JSON.stringify(formatDetails(selectedLog.details), null, 2)}
                                    </pre>
                                </div>
                            )}

                            {selectedLog.userAgent && (
                                <div>
                                    <label className="text-sm text-slate-400">User Agent</label>
                                    <p className="text-slate-300 text-sm mt-1">{selectedLog.userAgent}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
