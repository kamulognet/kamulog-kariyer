import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Default payment info
const defaultPaymentInfo = {
    companyName: 'Kariyer Kamulog',
    iban: 'TR00 0000 0000 0000 0000 0000 00',
    bankName: 'Banka Adı',
    whatsappNumber: '+905551234567',
    salesAgreement: 'Mesafeli satış sözleşmesi metni burada yer alacaktır.',
    refundPolicy: 'İptal ve iade politikası metni burada yer alacaktır.'
}

// GET - Ödeme bilgilerini getir (public)
export async function GET() {
    try {
        // Fetch payment info
        const paymentSetting = await prisma.siteSettings.findUnique({
            where: { key: 'payment_info' }
        })

        let paymentInfo = { ...defaultPaymentInfo }

        if (paymentSetting?.value) {
            const storedInfo = typeof paymentSetting.value === 'string'
                ? JSON.parse(paymentSetting.value)
                : paymentSetting.value
            paymentInfo = { ...paymentInfo, ...storedInfo }
        }

        // Fetch legal contracts from admin-managed legal pages
        const [salesAgreementSetting, refundPolicySetting] = await Promise.all([
            prisma.siteSettings.findUnique({ where: { key: 'legal_mesafeli-satis' } }),
            prisma.siteSettings.findUnique({ where: { key: 'legal_iptal-iade' } })
        ])

        // Use admin-managed legal pages if available
        if (salesAgreementSetting?.value) {
            paymentInfo.salesAgreement = salesAgreementSetting.value
        }
        if (refundPolicySetting?.value) {
            paymentInfo.refundPolicy = refundPolicySetting.value
        }

        return NextResponse.json(paymentInfo)
    } catch (error) {
        console.error('Error fetching payment info:', error)
        return NextResponse.json(defaultPaymentInfo)
    }
}

// PUT - Ödeme bilgilerini güncelle (admin only)
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const body = await request.json()
        const { companyName, iban, bankName, whatsappNumber, salesAgreement, refundPolicy } = body

        const paymentInfo = {
            companyName: companyName || defaultPaymentInfo.companyName,
            iban: iban || defaultPaymentInfo.iban,
            bankName: bankName || defaultPaymentInfo.bankName,
            whatsappNumber: whatsappNumber || defaultPaymentInfo.whatsappNumber,
            salesAgreement: salesAgreement || defaultPaymentInfo.salesAgreement,
            refundPolicy: refundPolicy || defaultPaymentInfo.refundPolicy
        }

        await prisma.siteSettings.upsert({
            where: { key: 'payment_info' },
            update: { value: JSON.stringify(paymentInfo) },
            create: { key: 'payment_info', value: JSON.stringify(paymentInfo) }
        })

        // Admin log
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id,
                action: 'UPDATE',
                targetType: 'SETTINGS',
                details: JSON.stringify({ type: 'payment_info' })
            }
        })

        return NextResponse.json({ success: true, paymentInfo })
    } catch (error) {
        console.error('Error updating payment info:', error)
        return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 })
    }
}
