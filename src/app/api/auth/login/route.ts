import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { formatPhoneNumber } from '@/utils/helpers';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { verifyReptika } from '@/lib/reptika';

/**
 * POST /api/auth/login
 * Handles login with Reptika bot detection and optional WhatsApp verification.
 * Returns { success: true, requiresVerification: boolean, message: string }
 */
export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 400 });
        }

        // Bot detection using phone number
        if (!user.phoneNumber) {
            return NextResponse.json({ error: 'Kullanıcı telefon numarası eksik' }, { status: 400 });
        }
        const isHuman = await verifyReptika(formatPhoneNumber(user.phoneNumber));
        if (!isHuman) {
            return NextResponse.json({ error: 'Bot tespit edildi. Giriş yapılamıyor.' }, { status: 400 });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return NextResponse.json({ error: 'Şifre hatalı' }, { status: 400 });
        }

        // If user is not verified, start WhatsApp verification flow
        if (!user.emailVerified) {
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

            await prisma.user.update({
                where: { id: user.id },
                data: { verificationCode, verificationExpires },
            });

            const msg = `Giriş doğrulama kodunuz: ${verificationCode}`;
            await sendWhatsAppMessage(formatPhoneNumber(user.phoneNumber), msg);

            return NextResponse.json({
                success: true,
                requiresVerification: true,
                message: 'Doğrulama kodu WhatsApp üzerinden gönderildi.',
            });
        }

        // Already verified – successful login
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
