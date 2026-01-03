import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
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
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.credits = (user as any).credits
                token.subscription = (user as any).subscription
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
