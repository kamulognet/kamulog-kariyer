import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/auth/login
 * Handles login - TEMPORARILY BYPASSED for admin testing.
 * TODO: Re-enable WhatsApp verification and Reptika bot detection
 */
export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 400 });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return NextResponse.json({ error: 'Şifre hatalı' }, { status: 400 });
        }

        // TEMPORARY: Skip all verification, allow direct login
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
