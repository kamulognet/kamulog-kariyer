import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { getUsageStats } from '@/lib/usage-limiter'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const stats = await getUsageStats(session.user.id)

        return NextResponse.json(stats)
    } catch (error) {
        console.error('Usage stats error:', error)
        return NextResponse.json({ error: 'Kullanım bilgileri alınamadı' }, { status: 500 })
    }
}
