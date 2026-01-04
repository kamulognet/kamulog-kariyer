// Email Service Configuration
export const emailConfig = {
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: parseInt(process.env.SMTP_PORT || '465') === 465,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    from: {
        name: 'Kariyer Kamulog',
        email: 'info@kamulogkariyer.com',
    },
    templates: {
        verificationCodeExpiry: 10 * 60 * 1000, // 10 minutes
    }
}

// Database Configuration
export const dbConfig = {
    url: process.env.DATABASE_URL,
}

// Authentication Configuration
export const authConfig = {
    session: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        strategy: 'jwt' as const,
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }
}

// OpenAI Configuration
export const aiConfig = {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o',
    maxTokens: 4000,
}

// Application Configuration
export const appConfig = {
    name: 'Kariyer Kamulog',
    url: process.env.NEXTAUTH_URL || 'https://kamulogkariyer.com',
    credits: {
        defaultFreeCredits: 10,
    }
}
