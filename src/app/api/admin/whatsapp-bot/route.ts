import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
    getQRCode,
    getConnectionStatus,
    isConnected,
    forceReconnect,
    disconnect,
    clearSession
} from '@/lib/whatsapp';

/**
 * GET /api/admin/whatsapp-bot
 * Returns current WhatsApp bot status and QR code if available
 */
export async function GET(req: NextRequest) {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = getConnectionStatus();
    const qrCode = getQRCode();
    const connected = isConnected();

    return NextResponse.json({
        status,
        connected,
        qrCode,
        message: connected
            ? 'WhatsApp bağlı ve mesaj göndermeye hazır'
            : qrCode
                ? 'QR kodu telefonunuzla tarayın'
                : 'WhatsApp bağlantısı başlatılıyor...'
    });
}

/**
 * POST /api/admin/whatsapp-bot
 * Actions: init, disconnect, clear
 */
export async function POST(req: NextRequest) {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { action } = await req.json();

        switch (action) {
            case 'init':
                // Use forceReconnect to ensure fresh connection
                await forceReconnect();
                return NextResponse.json({
                    success: true,
                    message: 'WhatsApp bağlantısı başlatıldı. QR kodu için sayfayı yenileyin.'
                });

            case 'disconnect':
                await disconnect();
                return NextResponse.json({
                    success: true,
                    message: 'WhatsApp bağlantısı kesildi. Yeniden bağlanmak için "Bağlantı Başlat" butonuna basın.'
                });

            case 'clear':
                await clearSession();
                return NextResponse.json({
                    success: true,
                    message: 'WhatsApp oturumu temizlendi. Yeniden QR taraması gerekecek.'
                });

            default:
                return NextResponse.json({
                    error: 'Geçersiz işlem. Geçerli işlemler: init, disconnect, clear'
                }, { status: 400 });
        }
    } catch (error: any) {
        console.error('WhatsApp bot action error:', error);
        return NextResponse.json({
            error: 'İşlem sırasında bir hata oluştu: ' + error.message
        }, { status: 500 });
    }
}

