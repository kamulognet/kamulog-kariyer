import nodemailer from 'nodemailer'
import { emailConfig } from '@/config'

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: emailConfig.smtp.host,
        port: emailConfig.smtp.port,
        secure: emailConfig.smtp.secure,
        auth: {
            user: emailConfig.smtp.user,
            pass: emailConfig.smtp.pass,
        },
        tls: {
            rejectUnauthorized: false
        }
    })
}

// Send verification code email
export async function sendVerificationCode(email: string, code: string): Promise<boolean> {
    try {
        if (!emailConfig.smtp.user || !emailConfig.smtp.pass) {
            console.log('Email not configured, skipping email send')
            return false
        }

        const transporter = createTransporter()

        const htmlContent = generateVerificationEmailTemplate(code)

        await transporter.sendMail({
            from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
            to: email,
            subject: `Giriş Doğrulama Kodu - ${code}`,
            html: htmlContent,
        })

        console.log('Verification code email sent to:', email)
        return true
    } catch (error) {
        console.error('Error sending verification email:', error)
        return false
    }
}

// Send password reset email
export async function sendPasswordReset(email: string, code: string): Promise<boolean> {
    try {
        if (!emailConfig.smtp.user || !emailConfig.smtp.pass) {
            console.log('Email not configured, skipping password reset email')
            return false
        }

        const transporter = createTransporter()

        const htmlContent = generatePasswordResetEmailTemplate(code)

        await transporter.sendMail({
            from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
            to: email,
            subject: `Şifre Sıfırlama Kodu - ${code}`,
            html: htmlContent,
        })

        console.log('Password reset email sent to:', email)
        return true
    } catch (error) {
        console.error('Error sending password reset email:', error)
        return false
    }
}

// Send order confirmation email
export async function sendOrderConfirmation(data: {
    orderCode: string
    planName: string
    amount: number
    userName: string
    userEmail: string
}): Promise<boolean> {
    try {
        if (!emailConfig.smtp.user || !emailConfig.smtp.pass) {
            console.log('Email not configured, skipping order confirmation email')
            return false
        }

        const transporter = createTransporter()

        const htmlContent = generateOrderConfirmationEmailTemplate(data)

        await transporter.sendMail({
            from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
            to: data.userEmail,
            subject: `Sipariş Onayı - ${data.orderCode}`,
            html: htmlContent,
        })

        console.log('Order confirmation email sent to:', data.userEmail)
        return true
    } catch (error) {
        console.error('Error sending order email:', error)
        return false
    }
}

// Email Templates
function generateVerificationEmailTemplate(code: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #0f172a; color: #fff; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; }
        .header { text-align: center; margin-bottom: 32px; }
        .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
        .code-box { background: #3b82f620; border: 1px solid #3b82f640; border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center; }
        .code { font-size: 36px; font-weight: bold; color: #3b82f6; letter-spacing: 8px; font-family: monospace; }
        .info { color: #94a3b8; font-size: 14px; text-align: center; margin-top: 16px; }
        .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 32px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">KARİYER KAMULOG</div>
            <p style="color: #94a3b8;">Giriş Doğrulama</p>
        </div>
        <p>Merhaba,</p>
        <p>Hesabınıza giriş yapmak için aşağıdaki doğrulama kodunu kullanın:</p>
        <div class="code-box">
            <div class="code">${code}</div>
        </div>
        <p class="info">Bu kod 10 dakika içinde geçerliliğini yitirecektir.</p>
        <p class="info">Eğer bu girişi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Kariyer Kamulog. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>
`
}

function generatePasswordResetEmailTemplate(code: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #0f172a; color: #fff; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; }
        .header { text-align: center; margin-bottom: 32px; }
        .logo { font-size: 24px; font-weight: bold; color: #ef4444; }
        .code-box { background: #ef444420; border: 1px solid #ef444440; border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center; }
        .code { font-size: 36px; font-weight: bold; color: #ef4444; letter-spacing: 8px; font-family: monospace; }
        .info { color: #94a3b8; font-size: 14px; text-align: center; margin-top: 16px; }
        .warning { color: #fbbf24; font-size: 14px; text-align: center; margin-top: 16px; }
        .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 32px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">KARİYER KAMULOG</div>
            <p style="color: #94a3b8;">Şifre Sıfırlama</p>
        </div>
        <p>Merhaba,</p>
        <p>Şifrenizi sıfırlamak için aşağıdaki kodu kullanın:</p>
        <div class="code-box">
            <div class="code">${code}</div>
        </div>
        <p class="info">Bu kod 10 dakika içinde geçerliliğini yitirecektir.</p>
        <p class="warning">⚠️ Eğer bu isteği siz yapmadıysanız, bu emaili görmezden gelin.</p>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Kariyer Kamulog. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>
`
}

function generateOrderConfirmationEmailTemplate(data: {
    orderCode: string
    planName: string
    amount: number
    userName: string
}): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #0f172a; color: #fff; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; }
        .header { text-align: center; margin-bottom: 32px; }
        .logo { font-size: 24px; font-weight: bold; color: #22c55e; }
        .order-box { background: #22c55e20; border: 1px solid #22c55e40; border-radius: 12px; padding: 24px; margin: 20px 0; }
        .order-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ffffff10; }
        .amount { font-size: 24px; font-weight: bold; color: #22c55e; text-align: center; margin-top: 16px; }
        .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 32px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">✓ SİPARİŞ ONAYLANDI</div>
        </div>
        <p>Merhaba ${data.userName},</p>
        <p>Siparişiniz başarıyla alındı. Detaylar aşağıdadır:</p>
        <div class="order-box">
            <div class="order-row">
                <span>Sipariş Kodu:</span>
                <strong>${data.orderCode}</strong>
            </div>
            <div class="order-row">
                <span>Plan:</span>
                <strong>${data.planName}</strong>
            </div>
            <div class="amount">${data.amount.toLocaleString('tr-TR')} ₺</div>
        </div>
        <p style="color: #94a3b8; text-align: center;">Ödemeniz onaylandıktan sonra planınız aktif edilecektir.</p>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Kariyer Kamulog. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>
`
}
