import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// IP adresi al
function getIpAddress(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }
    const realIp = request.headers.get('x-real-ip')
    if (realIp) {
        return realIp
    }
    return 'unknown'
}

// Çerez onayı kontrolü - GET
export async function GET(request: NextRequest) {
    try {
        const ipAddress = getIpAddress(request)

        // Bu IP için aktif çerez onayı var mı?
        const consent = await prisma.cookieConsent.findFirst({
            where: {
                ipAddress,
                expiresAt: {
                    gte: new Date()
                }
            },
            orderBy: {
                acceptedAt: 'desc'
            }
        })

        if (consent) {
            return NextResponse.json({
                hasConsent: true,
                consentType: consent.consentType,
                acceptedAt: consent.acceptedAt,
                expiresAt: consent.expiresAt
            })
        }

        return NextResponse.json({ hasConsent: false })
    } catch (error) {
        console.error('Cookie consent check error:', error)
        return NextResponse.json({ hasConsent: false })
    }
}

// Çerez onayı kaydet - POST
export async function POST(request: NextRequest) {
    try {
        const ipAddress = getIpAddress(request)
        const userAgent = request.headers.get('user-agent') || null
        const body = await request.json()
        const consentType = body.consentType || 'all'

        // Session varsa userId al
        const session = await getServerSession(authOptions)
        const userId = session?.user?.id || null

        // 30 gün geçerli
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

        // Çerez onayı kaydet
        const consent = await prisma.cookieConsent.create({
            data: {
                ipAddress,
                userAgent,
                userId,
                consentType,
                expiresAt
            }
        })

        console.log(`[Cookie Consent] IP: ${ipAddress}, Type: ${consentType}, User: ${userId || 'anonymous'}`)

        return NextResponse.json({
            success: true,
            consentId: consent.id,
            expiresAt: consent.expiresAt
        })
    } catch (error) {
        console.error('Cookie consent save error:', error)
        return NextResponse.json({ success: false, error: 'Kayıt hatası' }, { status: 500 })
    }
}
