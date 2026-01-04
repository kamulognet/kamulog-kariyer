import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            email: string
            name?: string | null
            role: string
            credits: number
            subscription?: {
                plan: string
                status: string
            }
        }
    }
    interface User {
        id: string
        email: string
        name?: string | null
        role: string
        credits: number
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        role: string
        credits: number
        subscription?: {
            plan: string
            status: string
        }
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email ve şifre gereklidir')
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { subscription: true }
                })

                if (!user) {
                    throw new Error('Kullanıcı bulunamadı')
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!isPasswordValid) {
                    throw new Error('Hatalı şifre')
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    credits: user.credits,
                    subscription: user.subscription ? {
                        plan: user.subscription.plan,
                        status: user.subscription.status
                    } : undefined
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 gün
    },
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === 'production'
                ? '__Secure-next-auth.session-token'
                : 'next-auth.session-token',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
    },
    callbacks: {
        async signIn({ user, account }) {
            // Google ile giriş yapan kullanıcılar için otomatik kayıt
            if (account?.provider === 'google' && user.email) {
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email }
                })

                if (!existingUser) {
                    // Yeni kullanıcı oluştur (Google ile kayıt)
                    await prisma.user.create({
                        data: {
                            email: user.email,
                            name: user.name,
                            password: '', // Google kullanıcıları için şifre yok
                            role: 'USER',
                            credits: 10,
                            emailVerified: new Date(), // Google hesabı zaten doğrulanmış
                        }
                    })
                }
            }
            return true
        },
        async jwt({ token, user, account }) {
            if (user) {
                // Google girişi için veritabanından kullanıcı bilgilerini al
                if (account?.provider === 'google' && user.email) {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: user.email },
                        include: { subscription: true }
                    })
                    if (dbUser) {
                        token.id = dbUser.id
                        token.role = dbUser.role
                        token.credits = dbUser.credits
                        token.subscription = dbUser.subscription ? {
                            plan: dbUser.subscription.plan,
                            status: dbUser.subscription.status
                        } : undefined
                    }
                } else {
                    token.id = user.id
                    token.role = user.role
                    token.credits = (user as any).credits
                    token.subscription = (user as any).subscription
                }
            }

            // Her istekte veritabanından güncel bilgileri al
            if (token.id) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: {
                        role: true,
                        credits: true,
                        subscription: {
                            select: {
                                plan: true,
                                status: true
                            }
                        }
                    }
                })
                if (dbUser) {
                    token.role = dbUser.role
                    token.credits = dbUser.credits
                    token.subscription = dbUser.subscription ? {
                        plan: dbUser.subscription.plan,
                        status: dbUser.subscription.status
                    } : undefined
                }
            }

            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id
                session.user.role = token.role
                session.user.credits = token.credits
                session.user.subscription = token.subscription
            }
            return session
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
