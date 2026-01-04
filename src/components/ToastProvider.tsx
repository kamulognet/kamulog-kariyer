'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle, Coins } from 'lucide-react'

// Toast Types
export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'token'

interface Toast {
    id: string
    type: ToastType
    message: string
    duration?: number
    tokenChange?: number
}

interface ToastContextType {
    showToast: (type: ToastType, message: string, options?: { duration?: number; tokenChange?: number }) => void
    showSuccess: (message: string) => void
    showError: (message: string) => void
    showInfo: (message: string) => void
    showWarning: (message: string) => void
    showTokenDeduction: (amount: number, newBalance: number) => void
    credits: number
    setCredits: (credits: number) => void
    refreshCredits: () => Promise<void>
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

// Toast Component
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose()
        }, toast.duration || 4000)
        return () => clearTimeout(timer)
    }, [toast, onClose])

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <CheckCircle2 className="w-5 h-5 text-green-400" />
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-400" />
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-400" />
            case 'token':
                return <Coins className="w-5 h-5 text-yellow-500" />
            default:
                return <Info className="w-5 h-5 text-blue-400" />
        }
    }

    const getBorderColor = () => {
        switch (toast.type) {
            case 'success': return 'border-green-500/30'
            case 'error': return 'border-red-500/30'
            case 'warning': return 'border-yellow-500/30'
            case 'token': return 'border-yellow-500/30'
            default: return 'border-blue-500/30'
        }
    }

    const getBgColor = () => {
        switch (toast.type) {
            case 'success': return 'bg-green-500/10'
            case 'error': return 'bg-red-500/10'
            case 'warning': return 'bg-yellow-500/10'
            case 'token': return 'bg-yellow-500/10'
            default: return 'bg-blue-500/10'
        }
    }

    return (
        <div
            className={`
                flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl
                ${getBorderColor()} ${getBgColor()}
                bg-slate-800/90 shadow-xl shadow-black/20
                animate-in slide-in-from-right-5 fade-in duration-300
                min-w-[320px] max-w-[420px]
            `}
        >
            <div className="shrink-0 mt-0.5">{getIcon()}</div>
            <div className="flex-1">
                <p className="text-slate-200 text-sm leading-relaxed">{toast.message}</p>
                {toast.type === 'token' && toast.tokenChange !== undefined && (
                    <p className="text-yellow-500 text-xs mt-1 font-semibold">
                        -{toast.tokenChange} jeton kullanıldı
                    </p>
                )}
            </div>
            <button
                onClick={onClose}
                className="shrink-0 text-slate-400 hover:text-white transition p-1 -mr-1 -mt-1"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}

// Toast Provider
export function ToastProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession()
    const [toasts, setToasts] = useState<Toast[]>([])
    const [credits, setCreditsState] = useState<number>(0)

    // Session'dan krediyi senkronize et
    useEffect(() => {
        if (session?.user?.credits !== undefined) {
            setCreditsState(session.user.credits)
        }
    }, [session?.user?.credits])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const showToast = useCallback((
        type: ToastType,
        message: string,
        options?: { duration?: number; tokenChange?: number }
    ) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
        const newToast: Toast = {
            id,
            type,
            message,
            duration: options?.duration || 4000,
            tokenChange: options?.tokenChange,
        }
        setToasts(prev => [...prev, newToast])
    }, [])

    const showSuccess = useCallback((message: string) => {
        showToast('success', message)
    }, [showToast])

    const showError = useCallback((message: string) => {
        showToast('error', message, { duration: 6000 })
    }, [showToast])

    const showInfo = useCallback((message: string) => {
        showToast('info', message)
    }, [showToast])

    const showWarning = useCallback((message: string) => {
        showToast('warning', message, { duration: 5000 })
    }, [showToast])

    const showTokenDeduction = useCallback((amount: number, newBalance: number) => {
        // Krediyi anında güncelle
        setCreditsState(newBalance)
        // Toast göster
        showToast('token', `Kalan jeton: ${newBalance}`, { tokenChange: amount, duration: 3000 })
    }, [showToast])

    const setCredits = useCallback((newCredits: number) => {
        setCreditsState(newCredits)
    }, [])

    const refreshCredits = useCallback(async () => {
        try {
            const res = await fetch('/api/user/credits')
            const data = await res.json()
            if (data.credits !== undefined) {
                setCreditsState(data.credits)
            }
        } catch (error) {
            console.error('Failed to refresh credits:', error)
        }
    }, [])

    return (
        <ToastContext.Provider value={{
            showToast,
            showSuccess,
            showError,
            showInfo,
            showWarning,
            showTokenDeduction,
            credits,
            setCredits,
            refreshCredits,
        }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3">
                {toasts.map(toast => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    )
}
