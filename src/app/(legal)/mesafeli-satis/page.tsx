import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
    title: 'Mesafeli Satış Sözleşmesi | Kariyer Kamulog',
    description: 'Kariyer Kamulog Mesafeli Satış Sözleşmesi - 6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamında dijital abonelik hizmetleri satış sözleşmesi.',
    keywords: [
        'mesafeli satış sözleşmesi',
        'e-ticaret sözleşme',
        'kariyer kamulog sözleşme',
        'dijital hizmet satış'
    ],
    openGraph: {
        title: 'Mesafeli Satış Sözleşmesi | Kariyer Kamulog',
        description: 'Kariyer Kamulog Mesafeli Satış Sözleşmesi',
        url: 'https://kariyerkamulog.com/mesafeli-satis',
    },
    alternates: {
        canonical: 'https://kariyerkamulog.com/mesafeli-satis',
    },
}

async function getContent() {
    try {
        const setting = await prisma.siteSettings.findUnique({
            where: { key: 'legal_mesafeli-satis' }
        })
        return setting?.value || null
    } catch {
        return null
    }
}

export default async function MesafeliSatisPage() {
    const customContent = await getContent()

    return (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 md:p-12">
            <h1 className="text-3xl font-bold text-white mb-8">Mesafeli Satış Sözleşmesi</h1>

            <div className="prose prose-invert prose-slate max-w-none space-y-6">
                {customContent ? (
                    <div
                        className="text-slate-300 leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: customContent.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>').replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-semibold text-purple-400 mb-4 mt-6">$1</h2>').replace(/# (.*?)(\n|$)/g, '') }}
                    />
                ) : (
                    <>
                        <section>
                            <h2 className="text-xl font-semibold text-purple-400 mb-4">MADDE 1 - TARAFLAR</h2>
                            <div className="bg-slate-700/50 rounded-lg p-4">
                                <h3 className="text-lg font-medium text-white mb-3">1.1 SATICI BİLGİLERİ</h3>
                                <p><strong className="text-white">Ünvan:</strong> Kamulog.net - Kariyer Kamulog</p>
                                <p><strong className="text-white">Adres:</strong> Atatürk Mahallesi, Çelikel Sokak, Sancaktepe/İSTANBUL PK: 34785</p>
                                <p><strong className="text-white">E-posta:</strong> destek@kamulogkariyer.com</p>
                                <p><strong className="text-white">Vergi No:</strong> 7960109842</p>
                            </div>
                            <div className="bg-slate-700/50 rounded-lg p-4 mt-4">
                                <h3 className="text-lg font-medium text-white mb-3">1.2 ALICI BİLGİLERİ</h3>
                                <p className="text-slate-300">Üyelik formunda belirtilen bilgiler geçerlidir.</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-purple-400 mb-4">MADDE 2 - SÖZLEŞMENİN KONUSU</h2>
                            <p className="text-slate-300 leading-relaxed">
                                İşbu sözleşmenin konusu, ALICI&apos;nın SATICI&apos;ya ait kamulogkariyer.com web sitesinden elektronik ortamda satın aldığı dijital abonelik hizmetinin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-purple-400 mb-4">MADDE 3 - HİZMET BİLGİLERİ</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-slate-700/50 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-white mb-3">Temel Paket</h3>
                                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                                        <li>AI destekli CV oluşturma</li>
                                        <li>Sınırsız CV düzenleme</li>
                                        <li>PDF indirme</li>
                                        <li>Günlük 5 iş ilanı başvurusu</li>
                                    </ul>
                                </div>
                                <div className="bg-slate-700/50 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-white mb-3">Premium Paket</h3>
                                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                                        <li>Tüm Temel özellikler</li>
                                        <li>Kariyer danışmanlığı</li>
                                        <li>Özel şablon tasarımları</li>
                                        <li>Sınırsız iş başvurusu</li>
                                        <li>Öncelikli destek</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-purple-400 mb-4">MADDE 4 - GENEL HÜKÜMLER</h2>
                            <ul className="list-disc list-inside text-slate-300 space-y-2">
                                <li>ALICI, hizmet konusu aboneliğin temel nitelikleri, satış fiyatı, ödeme şekli ve hizmetin içeriğine ilişkin tüm bilgileri okuduğunu, anladığını ve elektronik ortamda gerekli onayı verdiğini kabul eder.</li>
                                <li>Dijital içerik satışlarında, hizmetin ifasına başlandıktan sonra cayma hakkı kullanılamaz.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-purple-400 mb-4">MADDE 5 - ÖDEME VE TESLİMAT</h2>
                            <ul className="list-disc list-inside text-slate-300 space-y-2">
                                <li>Ödeme, banka havalesi veya kredi kartı ile yapılabilir.</li>
                                <li>Abonelik, ödemenin onaylanmasının ardından derhal aktif hale gelir.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-purple-400 mb-4">MADDE 6 - CAYMA HAKKI</h2>
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                                <p className="text-yellow-300">
                                    <strong>Önemli:</strong> Dijital içerik ve hizmet abonelikleri için, hizmetin ifasına başlandığı andan itibaren cayma hakkı bulunmamaktadır (6502 sayılı Kanun madde 53/ç).
                                </p>
                            </div>
                            <p className="text-slate-300 mt-4">
                                Kullanıcı, satın alma öncesinde bu durumu kabul ettiğini beyan eder.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-purple-400 mb-4">MADDE 7 - UYUŞMAZLIK</h2>
                            <p className="text-slate-300 leading-relaxed">
                                İşbu sözleşmeden doğan uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
                            </p>
                        </section>

                        <div className="mt-8 pt-6 border-t border-slate-700 text-sm text-slate-500">
                            <p>Son güncelleme: Ocak 2026</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
