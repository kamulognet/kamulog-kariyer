import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_SESSION_LIMIT = 25
const DEFAULT_TOKEN_COST = 2

// GET - Chat limit ayarlarını döndür (public)
export async function GET() {
    try {
        const settings = await prisma.siteSettings.findMany({
            where: {
                key: {
                    in: ['cv_chat_session_limit', 'cv_chat_token_cost']
                }
            }
        })

        let sessionLimit = DEFAULT_SESSION_LIMIT
        let tokenCost = DEFAULT_TOKEN_COST

        settings.forEach(s => {
            if (s.key === 'cv_chat_session_limit') {
                sessionLimit = parseInt(s.value, 10) || DEFAULT_SESSION_LIMIT
            } else if (s.key === 'cv_chat_token_cost') {
                tokenCost = parseInt(s.value, 10) || DEFAULT_TOKEN_COST
            }
        })

        return NextResponse.json({
            sessionLimit,
            tokenCost
        })
    } catch (error) {
        console.error('Get chat limits error:', error)
        // Varsayılan değerler döndür
        return NextResponse.json({
            sessionLimit: DEFAULT_SESSION_LIMIT,
            tokenCost: DEFAULT_TOKEN_COST
        })
    }
}
