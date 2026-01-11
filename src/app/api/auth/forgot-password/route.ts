import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatPhoneNumber } from '@/utils/helpers';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

/**
 * POST /api/auth/forgot-password
 * Initiates a password reset flow by sending a WhatsApp verification code.
 */
export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        // Find user by email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
        }

        if (!user.phoneNumber) {
            return NextResponse.json({ error: 'Kullanıcı telefon numarası eksik' }, { status: 400 });
        }

        // Generate verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store code in DB
        await prisma.user.update({
            where: { id: user.id },
            data: { verificationCode, verificationExpires },
        });

        // Send via WhatsApp
        const msg = `Şifre sıfırlama kodunuz: ${verificationCode}`;
        await sendWhatsAppMessage(formatPhoneNumber(user.phoneNumber), msg);

        return NextResponse.json({ success: true, message: 'Kod gönderildi' });
    } catch (error: any) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Şifre sıfırlama sırasında bir hata oluştu' }, { status: 500 });
    }
}
