import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Gizlilik Politikası | Gizlilik Sözleşmesi - Kariyer Kamulog',
    description: 'Kariyer Kamulog Gizlilik Politikası ve Gizlilik Sözleşmesi - Kişisel verilerin korunması, veri güvenliği, KVKK uyumu ve gizlilik hakları hakkında detaylı bilgilendirme. Kamulog gizlilik.',
    keywords: [
        'gizlilik politikası',
        'gizlilik sözleşmesi',
        'kariyer kamulog gizlilik',
        'kamulog gizlilik',
        'kamulog kariyer gizlilik',
        'kişisel veri koruma',
        'veri güvenliği',
        'gizlilik hakları',
        'gizlilik metni',
        'privacy policy',
        'veri koruma politikası',
        'kişisel verilerin korunması'
    ],
    openGraph: {
        title: 'Gizlilik Politikası | Kariyer Kamulog',
        description: 'Kariyer Kamulog Gizlilik Politikası - Kişisel verilerinizin korunması hakkında bilgi edinin.',
        url: 'https://kariyerkamulog.com/gizlilik',
    },
    alternates: {
        canonical: 'https://kariyerkamulog.com/gizlilik',
    },
}

export default function GizlilikPage() {
    return (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 md:p-12">
            <h1 className="text-3xl font-bold text-white mb-8">Gizlilik Politikası</h1>

            <div className="prose prose-invert prose-slate max-w-none space-y-6">
                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">1. Giriş</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Bu Gizlilik Politikası, <strong className="text-white">Kariyer Kamulog</strong> platformunun
                        (bundan böyle "Platform", "biz", "bizim" olarak anılacaktır) kullanıcılarının kişisel verilerinin
                        nasıl toplandığını, kullanıldığını, korunduğunu ve paylaşıldığını açıklamaktadır.
                    </p>
                    <div className="bg-slate-700/50 rounded-lg p-4 mt-4 text-sm">
                        <p><strong className="text-white">Veri Sorumlusu:</strong> Suat Hayri Şahin – Kamulog.net</p>
                        <p><strong className="text-white">Vergi Kimlik No:</strong> 7960109842</p>
                        <p><strong className="text-white">Adres:</strong> Atatürk Mahallesi, Çelikel Sokak, Sancaktepe/İSTANBUL PK: 34785</p>
                        <p><strong className="text-white">E-Posta:</strong> destek@kamulogkariyer.com</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">2. Topladığımız Bilgiler</h2>

                    <h3 className="text-lg font-medium text-white mt-4 mb-2">2.1. Sağladığınız Bilgiler</h3>
                    <ul className="list-disc list-inside text-slate-300 space-y-2">
                        <li>Kayıt bilgileri (ad, soyad, e-posta, telefon)</li>
                        <li>CV bilgileri (eğitim, iş deneyimi, yetenekler, dil bilgisi)</li>
                        <li>Fatura bilgileri (adres, vergi numarası)</li>
                        <li>Profil fotoğrafı (isteğe bağlı)</li>
                    </ul>

                    <h3 className="text-lg font-medium text-white mt-4 mb-2">2.2. Otomatik Toplanan Bilgiler</h3>
                    <ul className="list-disc list-inside text-slate-300 space-y-2">
                        <li>IP adresi ve konum bilgisi</li>
                        <li>Cihaz ve tarayıcı bilgileri</li>
                        <li>Çerez verileri</li>
                        <li>Platform kullanım istatistikleri</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">3. Bilgilerin Kullanım Amaçları</h2>
                    <ul className="list-disc list-inside text-slate-300 space-y-2">
                        <li>Hesap oluşturma ve yönetimi</li>
                        <li>CV oluşturma ve düzenleme hizmetleri</li>
                        <li>Yapay zeka destekli iş eşleştirme</li>
                        <li>Abonelik ve ödeme işlemleri</li>
                        <li>Müşteri desteği sağlama</li>
                        <li>Platform güvenliği ve dolandırıcılık önleme</li>
                        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                        <li>Hizmet kalitesinin iyileştirilmesi</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">4. Çerezler (Cookies)</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Platform, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır:
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
                        <li><strong className="text-white">Zorunlu Çerezler:</strong> Oturum yönetimi, güvenlik</li>
                        <li><strong className="text-white">İşlevsel Çerezler:</strong> Tercihlerinizin hatırlanması</li>
                        <li><strong className="text-white">Analitik Çerezler:</strong> Platform kullanım analizi</li>
                    </ul>
                    <p className="text-slate-300 leading-relaxed mt-3">
                        Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz, ancak bu durumda bazı özellikler çalışmayabilir.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">5. Bilgi Paylaşımı</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Kişisel verilerinizi aşağıdaki durumlar dışında üçüncü taraflarla paylaşmayız:
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
                        <li>Açık izninizin bulunması halinde</li>
                        <li>Yasal zorunluluklar gereği (mahkeme kararı, savcılık talebi)</li>
                        <li>Ödeme işlemleri için ödeme sağlayıcılarına</li>
                        <li>Teknik altyapı sağlayıcılarına (sunucu, depolama)</li>
                    </ul>
                    <p className="text-slate-300 leading-relaxed mt-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                        <strong className="text-amber-400">Önemli:</strong> Verilerinizi hiçbir koşulda ticari amaçlarla üçüncü taraflara satmaz veya kiralamayız.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">6. Veri Güvenliği</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Verilerinizin güvenliği için aşağıdaki önlemleri uyguluyoruz:
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
                        <li>Endüstri standardı SSL/TLS şifreleme</li>
                        <li>Güvenli veri merkezlerinde depolama</li>
                        <li>Düzenli güvenlik güncellemeleri</li>
                        <li>Erişim kontrolü ve yetkilendirme sistemleri</li>
                        <li>Şifrelerin hash algoritması ile korunması</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">7. Veri Saklama Süresi</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Kişisel verileriniz, hizmet süresince ve yasal saklama yükümlülükleri kapsamında saklanır:
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
                        <li>Hesap bilgileri: Hesap silinene kadar</li>
                        <li>CV verileri: Hesap silinene kadar</li>
                        <li>Ödeme kayıtları: 10 yıl (yasal zorunluluk)</li>
                        <li>Log kayıtları: 2 yıl</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">8. Haklarınız</h2>
                    <p className="text-slate-300 leading-relaxed">
                        KVKK ve ilgili mevzuat kapsamında aşağıdaki haklara sahipsiniz:
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
                        <li>Verilerinize erişim talep etme</li>
                        <li>Verilerin düzeltilmesini isteme</li>
                        <li>Verilerin silinmesini talep etme</li>
                        <li>Veri işlemeye itiraz etme</li>
                        <li>Veri taşınabilirliği talep etme</li>
                    </ul>
                    <p className="text-slate-300 leading-relaxed mt-3">
                        Bu haklarınızı kullanmak için <strong className="text-white">destek@kamulogkariyer.com</strong> adresine başvurabilirsiniz.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">9. Politika Değişiklikleri</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Bu Gizlilik Politikası zaman zaman güncellenebilir. Önemli değişiklikler olması durumunda
                        kayıtlı e-posta adresinize bildirim gönderilecektir. Politikayı düzenli olarak kontrol etmenizi öneririz.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">10. İletişim</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Gizlilik politikamız hakkında sorularınız için:
                    </p>
                    <div className="bg-slate-700/50 rounded-lg p-4 mt-3 text-sm">
                        <p><strong className="text-white">E-Posta:</strong> destek@kamulogkariyer.com</p>
                        <p><strong className="text-white">Adres:</strong> Atatürk Mahallesi, Çelikel Sokak, Sancaktepe/İSTANBUL PK: 34785</p>
                    </div>
                </section>

                <div className="mt-8 pt-6 border-t border-slate-700 text-sm text-slate-500">
                    <p>Son güncelleme: Ocak 2025</p>
                </div>
            </div>
        </div>
    )
}
