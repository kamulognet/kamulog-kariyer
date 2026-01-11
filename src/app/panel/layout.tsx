'use client'

import { ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Footer from '@/components/Footer'

interface PanelLayoutProps {
    children: ReactNode
}

export default function PanelLayout({ children }: PanelLayoutProps) {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        // Oturum yoksa login'e yönlendir
        if (status === 'unauthenticated') {
            router.replace('/login')
        }
    }, [status, router])

    // Loading state
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    // Not authenticated
    if (!session) {
        return null
    }

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    )
}
