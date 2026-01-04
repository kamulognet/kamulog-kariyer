import nodemailer from 'nodemailer'

// Email configuration - uses environment variables
const smtpPort = parseInt(process.env.SMTP_PORT || '587')
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: smtpPort,
    secure: smtpPort === 465, // true for SSL on 465, false for TLS on 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

interface OrderEmailData {
    orderCode: string
    planName: string
    amount: number
    userName: string
    userEmail: string
    bankName?: string
    iban?: string
    companyName?: string
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log('Email not configured, skipping email send')
            return false
        }

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #0f172a; color: #fff; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; }
        .header { text-align: center; margin-bottom: 32px; }
        .logo { font-size: 24px; font-weight: bold; color: #a855f7; }
        .order-box { background: #7c3aed20; border: 1px solid #7c3aed40; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .order-code { font-size: 28px; font-weight: bold; color: #a855f7; text-align: center; letter-spacing: 2px; }
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #334155; }
        .info-label { color: #94a3b8; }
        .info-value { color: #fff; font-weight: 500; }
        .bank-box { background: #1e3a5f; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .bank-title { color: #60a5fa; font-weight: bold; margin-bottom: 16px; }
        .iban { font-family: monospace; color: #60a5fa; font-size: 14px; }
        .warning { background: #fbbf2420; border: 1px solid #fbbf2440; border-radius: 8px; padding: 16px; color: #fbbf24; font-size: 14px; margin: 20px 0; }
        .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 32px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">KARİYER KAMULOG</div>
            <p style="color: #94a3b8;">Sipariş Onayı</p>
        </div>
        
        <p>Merhaba <strong>${data.userName}</strong>,</p>
        <p>Siparişiniz başarıyla oluşturuldu. Ödeme bilgileri aşağıdadır:</p>
        
        <div class="order-box">
            <div class="order-code">${data.orderCode}</div>
        </div>
        
        <div class="info-row">
            <span class="info-label">Plan</span>
            <span class="info-value">${data.planName}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Tutar</span>
            <span class="info-value">${data.amount} TL</span>
        </div>
        <div class="info-row">
            <span class="info-label">Durum</span>
            <span class="info-value" style="color: #fbbf24;">Ödeme Bekleniyor</span>
        </div>
        
        <div class="bank-box">
            <div class="bank-title">💳 Banka Hesap Bilgileri</div>
            ${data.companyName ? `<p><strong>Alıcı:</strong> ${data.companyName}</p>` : ''}
            ${data.bankName ? `<p><strong>Banka:</strong> ${data.bankName}</p>` : ''}
            ${data.iban ? `<p><strong>IBAN:</strong> <span class="iban">${data.iban}</span></p>` : ''}
        </div>
        
        <div class="warning">
            ⚠️ Havale/EFT açıklamasına e-posta adresinizi (${data.userEmail}) yazmayı unutmayın.<br><br>
            Ödeme yaptıktan sonra WhatsApp üzerinden bilgilendirmeniz gerekmektedir.
        </div>
        
        <div class="footer">
            <p>Bu e-posta ${data.userEmail} adresine gönderilmiştir.</p>
            <p>© ${new Date().getFullYear()} Kariyer Kamulog. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>
`

        await transporter.sendMail({
            from: `"Kariyer Kamulog" <info@kamulogkariyer.com>`,
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

export async function sendVerificationCodeEmail(email: string, code: string): Promise<boolean> {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log('Email not configured, skipping verification email')
            return false
        }

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #0f172a; color: #fff; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; }
        .header { text-align: center; margin-bottom: 32px; }
        .logo { font-size: 24px; font-weight: bold; color: #a855f7; }
        .code-box { background: #7c3aed20; border: 1px solid #7c3aed40; border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center; }
        .code { font-size: 36px; font-weight: bold; color: #a855f7; letter-spacing: 8px; font-family: monospace; }
        .info { color: #94a3b8; font-size: 14px; text-align: center; margin-top: 16px; }
        .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 32px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">KARİYER KAMULOG</div>
            <p style="color: #94a3b8;">Giriş Doğrulama Kodu</p>
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

        await transporter.sendMail({
            from: `"Kariyer Kamulog" <info@kamulogkariyer.com>`,
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
