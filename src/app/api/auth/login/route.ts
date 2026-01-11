import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { formatPhoneNumber } from '@/utils/helpers';
import { sendWhatsAppMessage, isBotReady } from '@/lib/whatsapp';
import { verifyReptika } from '@/lib/reptika';

/**
 * POST /api/auth/login
 * Handles login with Reptika bot detection and WhatsApp verification.
 * If WhatsApp bot is not connected, bypasses verification and allows login.
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
            // No phone number, allow direct login
            console.log('[Login] User has no phone, allowing direct login');
            return NextResponse.json({
                success: true,
                requiresVerification: false,
                message: 'Giriş başarılı',
            });
        }

        // Bot detection using phone number
        const formattedPhone = formatPhoneNumber(user.phoneNumber);
        const isHuman = await verifyReptika(formattedPhone);
        if (!isHuman) {
            return NextResponse.json({ error: 'Bot tespit edildi. Giriş yapılamıyor.' }, { status: 400 });
        }

        // Generate verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        await prisma.user.update({
            where: { id: user.id },
            data: { verificationCode, verificationExpires },
        });

        // Try to send WhatsApp verification code
        const msg = `Kamulog Kariyer giriş doğrulama kodunuz: ${verificationCode}`;
        const messageSent = await sendWhatsAppMessage(formattedPhone, msg);

        if (messageSent) {
            // Message sent successfully, require verification
            return NextResponse.json({
                success: true,
                requiresVerification: true,
                message: 'Doğrulama kodu WhatsApp üzerinden gönderildi.',
            });
        } else {
            // WhatsApp bot not available, bypass verification and allow direct login
            console.log('[Login] WhatsApp bot not available, bypassing verification');
            return NextResponse.json({
                success: true,
                requiresVerification: false,
                message: 'Giriş başarılı (WhatsApp doğrulaması geçici olarak devre dışı)',
            });
        }
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Giriş sırasında bir hata oluştu' }, { status: 500 });
    }
}

