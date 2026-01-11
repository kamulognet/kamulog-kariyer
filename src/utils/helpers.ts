// Generate random 6-digit verification code
export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate unique order code
export function generateOrderCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `KK-${timestamp}-${random}`
}

// Format phone number to +90 format
export function formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '')

    // If starts with 90 and has 12 digits total, it's already formatted
    if (cleaned.startsWith('90') && cleaned.length === 12) {
        return `+${cleaned}`
    }

    // If starts with 0, remove it
    if (cleaned.startsWith('0')) {
        cleaned = cleaned.slice(1)
    }

    // If it's 10 digits (without country code), add +90
    if (cleaned.length === 10) {
        return `+90${cleaned}`
    }

    // If it's 11 digits starting with 90, format it
    if (cleaned.length === 11 && cleaned.startsWith('90')) {
        return `+${cleaned}`
    }

    // For any other case, just ensure it starts with +
    console.warn(`[formatPhoneNumber] Unexpected format: ${phone} -> cleaned: ${cleaned}`)
    return cleaned.startsWith('+') ? phone : `+${cleaned}`
}

// Format currency for display
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(amount)
}

// Format date for display
export function formatDate(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// Check if verification code is expired
export function isCodeExpired(expiresAt: Date | null): boolean {
    if (!expiresAt) return true
    return new Date() > new Date(expiresAt)
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength - 3) + '...'
}
