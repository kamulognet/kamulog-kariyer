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
    const cleaned = phone.replace(/\D/g, '')

    // If starts with 0, remove it
    const normalized = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned

    // Ensure 10 digits
    if (normalized.length !== 10) {
        throw new Error('Phone number must be 10 digits')
    }

    return `+90${normalized}`
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
