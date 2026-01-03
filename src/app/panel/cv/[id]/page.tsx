'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import CVPreview from '@/components/cv/CVPreview'
import type { CVData } from '@/types'
import { ArrowLeft, Download, Edit2, Sparkles } from 'lucide-react'

interface CVResponse {
    id: string
    title: string
    data: string
    template: string
    createdAt: string
}

export default function CVViewPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const params = useParams()
    const [cv, setCV] = useState<CVResponse | null>(null)
    const [cvData, setCvData] = useState<CVData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    useEffect(() => {
        if (session?.user && params.id) {
            loadCV()
        }
    }, [session, params.id])

    const loadCV = async () => {
        try {
            const res = await fetch(`/api/cv/${params.id}`)
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'CV yüklenemedi')
                return
            }

            setCV(data.cv)
            setCvData(JSON.parse(data.cv.data))
        } catch (error) {
            console.error('Error loading CV:', error)
            setError('CV yüklenirken bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const handleExportPDF = async () => {
        if (!cv) return

        try {
            const res = await fetch('/api/cv/export-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cvId: cv.id }),
            })

            const data = await res.json()

            if (data.html) {
                const printWindow = window.open('', '_blank')
                if (printWindow) {
                    printWindow.document.write(data.html)
                    printWindow.document.close()
                    printWindow.focus()
                    setTimeout(() => printWindow.print(), 500)
                }
            }
        } catch (error) {
            console.error('PDF export error:', error)
        }
    }

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (error || !cvData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-white mb-2">{error || 'CV bulunamadı'}</h2>
                    <Link
                        href="/panel/cvlerim"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition mt-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        CV&apos;lerime Dön
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/panel/cvlerim" className="text-slate-400 hover:text-white transition flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                CV&apos;lerim
                            </Link>
                            <div className="h-6 w-px bg-slate-700"></div>
                            <h1 className="text-xl font-bold text-white">{cv?.title}</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/panel/ilanlar"
                                className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 font-medium rounded-lg transition flex items-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                İş Eşleştir
                            </Link>
                            <button
                                onClick={handleExportPDF}
                                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                PDF İndir
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <CVPreview data={cvData} />
            </main>
        </div>
    )
}
