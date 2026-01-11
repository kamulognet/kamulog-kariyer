import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'İptal ve İade Politikası | Kariyer Kamulog',
    description: 'Kariyer Kamulog İptal ve İade Politikası - Dijital abonelik hizmetleri için iptal ve iade koşulları.',
    keywords: [
        'iptal politikası',
        'iade politikası',
        'abonelik iptali',
        'kariyer kamulog iade'
    ],
    openGraph: {
        title: 'İptal ve İade Politikası | Kariyer Kamulog',
        description: 'Kariyer Kamulog İptal ve İade Politikası',
        url: 'https://kariyerkamulog.com/iptal-iade',
    },
    alternates: {
        canonical: 'https://kariyerkamulog.com/iptal-iade',
    },
}

async function getContent() {
    try {
        const setting = await prisma.siteSettings.findUnique({
            where: { key: 'legal_iptal-iade' }
        })
        return setting?.value || null
    } catch {
        return null
    }
}

export default async function IptalIadePage() {
    const customContent = await getContent()

    return (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 md:p-12">
            <h1 className="text-3xl font-bold text-white mb-8">İptal ve İade Politikası</h1>

            <div className="prose prose-invert prose-slate max-w-none space-y-6">
                {customContent ? (
                    <div
                        className="text-slate-300 leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: customContent.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>').replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-semibold text-purple-400 mb-4 mt-6">$1</h2>').replace(/# (.*?)(\n|$)/g, '') }}
                    />
                ) : (
                    <>
                        <section>
                            <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                                <p><strong className="text-white">Satıcı:</strong> Suat Hayri Şahin – Kamulog.net</p>
                                <p><strong className="text-white">Vergi No:</strong> 7960109842</p>
                                <p><strong className="text-white">Adres:</strong> Atatürk Mahallesi, Çelikel Sokak, Sancaktepe/İSTANBUL PK: 34785</p>
                                <p><strong className="text-white">E-posta:</strong> destek@kamulogkariyer.com</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-purple-400 mb-4">1. GENEL BİLGİ</h2>
                            <p className="text-slate-300 leading-relaxed">
                                Kariyer Kamulog platformunda sunulan hizmetler dijital içerik ve abonelik hizmetleridir.
                                Bu nedenle 6502 sayılı Tüketicinin Korunması Hakkında Kanun&apos;un 53. maddesi uyarınca,
                                dijital içeriklerin ifasına başlandığı andan itibaren cayma hakkı bulunmamaktadır.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-purple-400 mb-4">2. ABONELİK İPTALİ</h2>
                            <div className="space-y-4">
                                <div className="bg-slate-700/50 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-white mb-3">2.1 İptal Koşulları</h3>
                                    <ul className="list-disc list-inside text-slate-300 space-y-2">
                                        <li>Aktif aboneliğinizi istediğiniz zaman iptal edebilirsiniz.</li>
                                        <li>İptal işlemi, mevcut fatura döneminin sonuna kadar geçerlidir.</li>
                                        <li>İptal sonrası kalan süre boyunca hizmetleri kullanmaya devam edersiniz.</li>
                                    </ul>
                                </div>
                                <div className="bg-slate-700/50 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-white mb-3">2.2 İptal Nasıl Yapılır?</h3>
                                    <ol className="list-decimal list-inside text-slate-300 space-y-2">
                                        <li>Hesap ayarlarınıza gidin</li>
                                        <li>&quot;Abonelik&quot; bölümünü açın</li>
                                        <li>&quot;Aboneliği İptal Et&quot; butonuna tıklayın</li>
                                        <li>İptal nedeninizi belirtin</li>
                                    </ol>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-purple-400 mb-4">3. İADE DURUMU</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-red-400 mb-3">İade Yapılamayan Durumlar</h3>
                                    <ul className="list-disc list-inside text-slate-300 space-y-2">
                                        <li>Ödeme yapıldıktan ve hizmet aktif edildikten sonra</li>
                                        <li>Herhangi bir CV oluşturma işlemi yapıldıktan sonra</li>
                                        <li>AI sohbet özelliği kullanıldıktan sonra</li>
                                    </ul>
                                </div>
                                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-green-400 mb-3">İade Yapılabilen Durumlar</h3>
                                    <ul className="list-disc list-inside text-slate-300 space-y-2">
                                        <li>Teknik sorunlardan dolayı hizmetin hiç kullanılamaması</li>
                                        <li>Yanlışlıkla mükerrer ödeme yapılması</li>
                                        <li>Ödeme yapıldı ancak sistem tarafından abonelik aktif edilmedi</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-purple-400 mb-4">4. İADE SÜRECİ</h2>
                            <p className="text-slate-300 leading-relaxed">
                                İade talebiniz onaylandığında:
                            </p>
                            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
                                <li>Kredi kartı ödemelerinde 5-10 iş günü içinde</li>
                                <li>Banka havalesi ödemelerinde 3-5 iş günü içinde</li>
                            </ul>
                            <p className="text-slate-300 mt-3">iade işlemi gerçekleştirilir.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-purple-400 mb-4">5. İLETİŞİM</h2>
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                                <p className="text-slate-300">İade ve iptal talepleriniz için:</p>
                                <p className="text-white font-medium mt-2">E-posta: destek@kamulogkariyer.com</p>
                                <p className="text-slate-400 text-sm mt-1">Konu: Abonelik İade Talebi</p>
                            </div>
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
