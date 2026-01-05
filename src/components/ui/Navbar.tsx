'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { ArrowLeft, Coins, LogOut, User, Phone } from 'lucide-react'

export default function Navbar() {
    const router = useRouter()
    const { data: session } = useSession()

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Sol taraf: Logo ve Geri Dön */}
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2 rounded-lg">
                                <span className="text-white font-bold text-lg leading-none">K</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent hidden sm:block">
                                KariyerKamu
                            </span>
                        </Link>

                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm px-3 py-1.5 rounded-lg hover:bg-white/5"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Geri</span>
                        </button>

                        <Link
                            href="/panel/danismanlik"
                            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition text-sm px-3 py-1.5 rounded-lg hover:bg-purple-500/10 border border-purple-500/30"
                        >
                            <Phone className="w-4 h-4" />
                            <span className="hidden sm:inline">Danışmanlık</span>
                        </Link>
                    </div>

                    {/* Sağ taraf: Kredi ve Profil */}
                    <div className="flex items-center gap-4">
                        {session?.user && (
                            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full">
                                <Coins className="w-4 h-4 text-yellow-500" />
                                <span className="font-bold text-yellow-500 text-sm">{session.user.credits}</span>
                                <span className="text-xs text-yellow-500/70 hidden sm:inline">Kredi</span>
                            </div>
                        )}

                        <div className="h-6 w-px bg-slate-700 mx-2 hidden sm:block"></div>

                        {session ? (
                            <div className="flex items-center gap-3">
                                <Link href="/dashboard" className="hidden sm:flex items-center gap-2 text-slate-300 hover:text-white transition">
                                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                                        <span className="text-blue-400 font-bold text-xs">
                                            {session.user.name?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium">{session.user.name}</span>
                                </Link>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                    title="Çıkış Yap"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition"
                            >
                                Giriş Yap
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
