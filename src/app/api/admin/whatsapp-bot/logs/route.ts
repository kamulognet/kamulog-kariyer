import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/whatsapp-bot/logs
 * Returns recent WhatsApp message logs
 */
export async function GET() {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const logs = await prisma.whatsAppLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50, // Last 50 logs
        });

        return NextResponse.json({ logs });
    } catch (error: any) {
        console.error('WhatsApp logs fetch error:', error);
        return NextResponse.json({
            error: 'Loglar alınamadı',
            logs: []
        }, { status: 500 });
    }
}
