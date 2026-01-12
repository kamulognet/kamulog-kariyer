'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Phone, MessageCircle, Crown, Lock } from 'lucide-react'
import Link from 'next/link'

interface AskConsultantButtonProps {
    className?: string
    context?: string // Hangi bağlamda kullanıldığı (job-analysis, job-match, etc.)
    jobInfo?: {
        code: string
        title: string
        company: string
        description?: string
    }
    cvInfo?: {
        id: string
        title: string
    }
    analysisResult?: {
        score: number
        feedback: string
    }
}

/**
 * Premium-only "Kariyer Danışmanına Sor" butonu
 * Şimdilik /panel/danismanlik sayfasına yönlendirir
 */
export default function AskConsultantButton({
    className = '',
    context = 'general',
    jobInfo,
    cvInfo,
    analysisResult
}: AskConsultantButtonProps) {
    const { data: session } = useSession()
    const [isPremium, setIsPremium] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkPremium = async () => {
            if (!session?.user?.id) {
                setLoading(false)
                return
            }

            try {
                // isUnlimited kontrolü için chat-limits API kullan
                const res = await fetch('/api/settings/chat-limits')
                if (res.ok) {
                    const data = await res.json()
                    setIsPremium(data.isUnlimited === true)
                }
            } catch (e) {
                console.error('Error checking premium:', e)
            }
            setLoading(false)
        }

        checkPremium()
    }, [session])

    // İş bilgisi, CV ve analiz sonucu içeren URL oluştur
    const getConsultantUrl = () => {
        const params = new URLSearchParams()

        if (jobInfo) {
            params.set('jobCode', jobInfo.code)
            params.set('jobTitle', jobInfo.title)
            params.set('jobCompany', jobInfo.company)
            if (jobInfo.description) {
                params.set('jobDesc', jobInfo.description.substring(0, 200))
            }
        }

        if (cvInfo) {
            params.set('cvId', cvInfo.id)
            params.set('cvTitle', cvInfo.title)
        }

        if (analysisResult) {
            params.set('analysisScore', analysisResult.score.toString())
            params.set('analysisFeedback', analysisResult.feedback.substring(0, 500))
        }

        const queryString = params.toString()
        return queryString ? `/panel/danismanlik?${queryString}` : '/panel/danismanlik'
    }

    if (loading) {
        return (
            <div className={`flex items-center gap-2 px-4 py-3 bg-slate-700/50 rounded-xl text-slate-400 animate-pulse ${className}`}>
                <MessageCircle className="w-5 h-5" />
                <span>Yükleniyor...</span>
            </div>
        )
    }

    // Premium kullanıcı - danışmanlık sayfasına yönlendir
    if (isPremium) {
        return (
            <Link
                href={getConsultantUrl()}
                className={`flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-medium rounded-xl transition shadow-lg shadow-purple-500/30 ${className}`}
            >
                <Phone className="w-5 h-5" />
                <span>Kariyer Danışmanına Sor</span>
            </Link>
        )
    }

    // Premium olmayan kullanıcı - upgrade prompt
    return (
        <Link
            href="/panel/satin-al"
            className={`flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-slate-300 font-medium rounded-xl transition border border-slate-500/30 ${className}`}
        >
            <Lock className="w-4 h-4" />
            <span>Kariyer Danışmanına Sor</span>
            <Crown className="w-4 h-4 text-yellow-500" />
        </Link>
    )
}

interface ConsultantPromoCardProps {
    className?: string
    jobInfo?: {
        code: string
        title: string
        company: string
        description?: string
    }
    cvInfo?: {
        id: string
        title: string
    }
    analysisResult?: {
        score: number
        feedback: string
    }
}

/**
 * İş analizi sonucu altında gösterilen danışman kartı
 */
export function ConsultantPromoCard({ className = '', jobInfo, cvInfo, analysisResult }: ConsultantPromoCardProps) {
    const { data: session } = useSession()
    const [isPremium, setIsPremium] = useState(false)

    useEffect(() => {
        const checkPremium = async () => {
            if (!session?.user?.id) return

            try {
                // isUnlimited kontrolü için chat-limits API kullan
                const res = await fetch('/api/settings/chat-limits')
                if (res.ok) {
                    const data = await res.json()
                    setIsPremium(data.isUnlimited === true)
                }
            } catch (e) {
                console.error('Error checking premium:', e)
            }
        }

        checkPremium()
    }, [session])

    return (
        <div className={`bg-gradient-to-r from-purple-900/30 to-slate-800/50 border border-purple-500/30 rounded-2xl p-4 ${className}`}>
            <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/20 rounded-xl flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">Bu İlan Hakkında Danışmanlık Alın</h4>
                    <p className="text-sm text-slate-400 mb-3">
                        {isPremium
                            ? 'Kariyer danışmanlarımızla bu pozisyon ve CV analiziniz hakkında görüşün.'
                            : 'Premium üyelere özel kariyer danışmanlığı hizmetimizden yararlanın.'
                        }
                    </p>
                    <AskConsultantButton jobInfo={jobInfo} cvInfo={cvInfo} analysisResult={analysisResult} />
                </div>
            </div>
        </div>
    )
}

