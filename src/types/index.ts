// Types for CV data
export interface PersonalInfo {
    fullName: string
    birthDate?: string
    email: string
    phone: string
    address?: string
    linkedIn?: string
}

export interface Education {
    institution: string
    degree: string
    field: string
    startDate: string
    endDate?: string
    gpa?: string
}

export interface Experience {
    company: string
    position: string
    startDate: string
    endDate?: string
    description?: string
    responsibilities?: string[]
}

export interface Skills {
    technical?: string[]
    languages?: string[]
    software?: string[]
}

export interface Certificate {
    name: string
    issuer: string
    date?: string
}

export interface CVData {
    personalInfo: PersonalInfo
    education: Education[]
    experience: Experience[]
    skills: Skills
    certificates: Certificate[]
    summary?: string
}

export interface CV {
    id: string
    userId: string
    title: string
    data: CVData
    template: string
    createdAt: string
    updatedAt: string
}

// Chat types
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
}

export interface ChatSession {
    id: string
    userId: string
    messages: ChatMessage[]
    cvId?: string
    createdAt: string
}

// CV Builder step types
export type CVBuilderStep =
    | 'idle'
    | 'collecting'
    | 'generating'
    | 'preview'
    | 'editing'
    | 'exporting'
    | 'saved'

// Subscription types
export type Plan = 'FREE' | 'BASIC' | 'PREMIUM'
export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'

export interface Subscription {
    id: string
    userId: string
    plan: Plan
    status: SubscriptionStatus
    orderCode?: string
    expiresAt?: string
    createdAt: string
}

// Usage types
export interface UsageStats {
    plan: Plan
    usage: {
        cv: { current: number; limit: number; remaining: number }
        chat: { current: number; limit: number; remaining: number }
        pdf: { current: number; limit: number; remaining: number }
    }
}
