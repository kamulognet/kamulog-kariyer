import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { formatPhoneNumber } from '@/utils/helpers';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { verifyReptika } from '@/lib/reptika';

/**
 * POST /api/auth/login
 * Handles login with Reptika bot detection and WhatsApp verification.
 * Always sends a verification code for every login attempt.
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

        // Check if user has phone number
        if (!user.phoneNumber) {
            return NextResponse.json({ error: 'Telefon numarası eksik. Lütfen profil ayarlarından ekleyin.' }, { status: 400 });
        }

        // Bot detection using phone number
        const formattedPhone = formatPhoneNumber(user.phoneNumber);
        const isHuman = await verifyReptika(formattedPhone);
        if (!isHuman) {
            return NextResponse.json({ error: 'Bot tespit edildi. Giriş yapılamıyor.' }, { status: 400 });
        }

        // Always send WhatsApp verification code for every login
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        await prisma.user.update({
            where: { id: user.id },
            data: { verificationCode, verificationExpires },
        });

        const msg = `Kamulog Kariyer giriş doğrulama kodunuz: ${verificationCode}`;
        await sendWhatsAppMessage(formattedPhone, msg);

        return NextResponse.json({
            success: true,
            requiresVerification: true,
            message: 'Doğrulama kodu WhatsApp üzerinden gönderildi.',
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Giriş sırasında bir hata oluştu' }, { status: 500 });
    }
}
