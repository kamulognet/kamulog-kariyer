'use client'

import { Toaster, toast } from 'react-hot-toast'

export function ToastProvider() {
    return (
        <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
                // Default options for all toasts
                duration: 4000,
                style: {
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.2)',
                },
                // Success toast
                success: {
                    duration: 4000,
                    iconTheme: {
                        primary: '#22c55e',
                        secondary: '#fff',
                    },
                    style: {
                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                        border: '1px solid #22c55e30',
                    },
                },
                // Error toast
                error: {
                    duration: 5000,
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                    },
                    style: {
                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                        border: '1px solid #ef444430',
                    },
                },
            }}
        />
    )
}

// Export toast utilities for use across the app
export const showSuccess = (message: string) => {
    toast.success(message, {
        style: {
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#fff',
            border: '1px solid #22c55e40',
        },
    })
}

export const showError = (message: string) => {
    toast.error(message, {
        style: {
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#fff',
            border: '1px solid #ef444440',
        },
    })
}

export const showInfo = (message: string) => {
    toast(message, {
        icon: '💡',
        style: {
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#fff',
            border: '1px solid #3b82f640',
        },
    })
}

export const showWarning = (message: string) => {
    toast(message, {
        icon: '⚠️',
        style: {
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#fff',
            border: '1px solid #f59e0b40',
        },
    })
}

export const showLoading = (message: string) => {
    return toast.loading(message, {
        style: {
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#fff',
            border: '1px solid #8b5cf640',
        },
    })
}

export const dismissToast = (toastId: string) => {
    toast.dismiss(toastId)
}

export { toast }
