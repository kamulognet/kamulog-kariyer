'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react'

interface PageContent {
    about: string
    contact: string
    privacy: string
    terms: string
    mapEmbed?: string
    address?: string
    phone?: string
    email?: string
}

export default function Footer() {
    const [content, setContent] = useState<PageContent | null>(null)

    useEffect(() => {
        fetch('/api/settings/pages')
            .then(res => res.json())
            .then(data => setContent(data))
            .catch(console.error)
    }, [])

    return (
        <footer className="bg-slate-900 border-t border-slate-800">
            {/* Map Section */}
            {content?.mapEmbed && (
                <div className="w-full h-64 md:h-80">
                    <iframe
                        src={content.mapEmbed}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Kariyer Kamulog Konum"
                    />
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo & About */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-3 mb-4">
                            <Image
                                src="/logo.png"
                                alt="Kariyer Kamulog"
                                width={50}
                                height={50}
                                className="rounded-lg"
                            />
                            <div>
                                <h3 className="text-xl font-bold text-white">KARİYER KAMULOG</h3>
                                <p className="text-xs text-purple-400">AI CV Oluşturucu</p>
                            </div>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                            {content?.about?.substring(0, 200) || 'Yapay zeka destekli profesyonel CV oluşturma ve iş eşleştirme platformu. Kamu ve özel sektör iş ilanları ile kariyer hedeflerinize ulaşın.'}
                            {content?.about && content.about.length > 200 && '...'}
                        </p>
                    </div>

                    {/* Site Haritası */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Site Haritası</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-slate-400 hover:text-purple-400 text-sm transition">
                                    Anasayfa
                                </Link>
                            </li>
                            <li>
                                <Link href="/panel" className="text-slate-400 hover:text-purple-400 text-sm transition">
                                    Kullanıcı Paneli
                                </Link>
                            </li>
                            <li>
                                <Link href="/panel/ilanlar" className="text-slate-400 hover:text-purple-400 text-sm transition">
                                    İş İlanları
                                </Link>
                            </li>
                            <li>
                                <Link href="/panel/cv-olustur" className="text-slate-400 hover:text-purple-400 text-sm transition">
                                    CV Oluştur
                                </Link>
                            </li>
                            <li>
                                <Link href="/panel/abonelik" className="text-slate-400 hover:text-purple-400 text-sm transition">
                                    Abonelik Planları
                                </Link>
                            </li>
                            <li>
                                <Link href="/panel/danismanlik" className="text-slate-400 hover:text-purple-400 text-sm transition">
                                    Kariyer Danışmanı
                                </Link>
                            </li>
                            <li>
                                <Link href="/hakkimizda" target="_blank" rel="noopener" className="text-slate-400 hover:text-purple-400 text-sm transition">
                                    Hakkımızda
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Yasal Sayfalar */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Yasal Bilgiler</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/gizlilik" target="_blank" rel="noopener" className="text-slate-400 hover:text-purple-400 text-sm transition">
                                    Gizlilik Politikası
                                </Link>
                            </li>
                            <li>
                                <Link href="/kvkk" target="_blank" rel="noopener" className="text-slate-400 hover:text-purple-400 text-sm transition">
                                    KVKK Aydınlatma Metni
                                </Link>
                            </li>
                            <li>
                                <Link href="/kullanim-kosullari" target="_blank" rel="noopener" className="text-slate-400 hover:text-purple-400 text-sm transition">
                                    Kullanım Koşulları
                                </Link>
                            </li>
                            <li>
                                <Link href="/cerez-politikasi" target="_blank" rel="noopener" className="text-slate-400 hover:text-purple-400 text-sm transition">
                                    Çerez Politikası
                                </Link>
                            </li>
                            <li>
                                <Link href="/mesafeli-satis" target="_blank" rel="noopener" className="text-slate-400 hover:text-purple-400 text-sm transition">
                                    Mesafeli Satış Sözleşmesi
                                </Link>
                            </li>
                            <li>
                                <Link href="/iptal-iade" target="_blank" rel="noopener" className="text-slate-400 hover:text-purple-400 text-sm transition">
                                    İptal ve İade Koşulları
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* İletişim */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">İletişim</h4>
                        <ul className="space-y-3">
                            {content?.address && (
                                <li className="flex items-start gap-2 text-slate-400 text-sm">
                                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-400" />
                                    <span>{content.address}</span>
                                </li>
                            )}
                            {content?.phone && (
                                <li className="flex items-center gap-2 text-slate-400 text-sm">
                                    <Phone className="w-4 h-4 flex-shrink-0 text-purple-400" />
                                    <a href={`tel:${content.phone}`} className="hover:text-white transition">{content.phone}</a>
                                </li>
                            )}
                            {content?.email && (
                                <li className="flex items-center gap-2 text-slate-400 text-sm">
                                    <Mail className="w-4 h-4 flex-shrink-0 text-purple-400" />
                                    <a href={`mailto:${content.email}`} className="hover:text-white transition">{content.email}</a>
                                </li>
                            )}
                            {!content?.address && !content?.phone && !content?.email && (
                                <>
                                    <li className="flex items-center gap-2 text-slate-400 text-sm">
                                        <Mail className="w-4 h-4 flex-shrink-0 text-purple-400" />
                                        <a href="mailto:destek@kariyerkamulog.com" className="hover:text-white transition">destek@kariyerkamulog.com</a>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-slate-800">
                    <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                        <p className="text-slate-500 text-sm">
                            © {new Date().getFullYear()} Kariyer Kamulog. Tüm hakları saklıdır.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
