import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { formatPhoneNumber } from '@/utils/helpers';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { verifyReptika } from '@/lib/reptika';

/**
 * POST /api/auth/login
 * Handles login with Reptika bot detection and WhatsApp verification.
 */
export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 400 });
        }

        // Verify password first
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return NextResponse.json({ error: 'Şifre hatalı' }, { status: 400 });
        }

        // Bot detection using phone number (if available)
        if (user.phoneNumber) {
            const isHuman = await verifyReptika(formatPhoneNumber(user.phoneNumber));
            if (!isHuman) {
                return NextResponse.json({ error: 'Bot tespit edildi. Giriş yapılamıyor.' }, { status: 400 });
            }
        }

        // If user is not verified, start WhatsApp verification flow
        if (!user.emailVerified && user.phoneNumber) {
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

            await prisma.user.update({
                where: { id: user.id },
                data: { verificationCode, verificationExpires },
            });

            const msg = `Kamulog Kariyer giriş doğrulama kodunuz: ${verificationCode}`;
            await sendWhatsAppMessage(formatPhoneNumber(user.phoneNumber), msg);

            return NextResponse.json({
                success: true,
                requiresVerification: true,
                message: 'Doğrulama kodu WhatsApp üzerinden gönderildi.',
            });
        }

        // Already verified or no phone – successful login
        return NextResponse.json({
            success: true,
            requiresVerification: false,
            message: 'Giriş başarılı',
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Giriş sırasında bir hata oluştu' }, { status: 500 });
    }
}
