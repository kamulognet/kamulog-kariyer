import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Çerez Politikası',
    description: 'Kariyer Kamulog Çerez Politikası - Çerezlerin kullanımı hakkında bilgilendirme'
}

export default function CerezPage() {
    return (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 md:p-12">
            <h1 className="text-3xl font-bold text-white mb-8">Çerez Politikası</h1>

            <div className="prose prose-invert prose-slate max-w-none space-y-6">
                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">1. Çerez Nedir?</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Çerezler (cookies), web siteleri tarafından tarayıcınıza gönderilen ve cihazınızda saklanan
                        küçük metin dosyalarıdır. Bu dosyalar, siteyi tekrar ziyaret ettiğinizde sizi tanımak,
                        tercihlerinizi hatırlamak ve kullanıcı deneyiminizi iyileştirmek için kullanılır.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">2. Kullandığımız Çerez Türleri</h2>

                    <h3 className="text-lg font-medium text-white mt-4 mb-2">2.1. Zorunlu Çerezler</h3>
                    <p className="text-slate-300 leading-relaxed">
                        Web sitesinin temel işlevlerinin çalışması için gerekli olan çerezlerdir. Bu çerezler olmadan
                        site düzgün çalışmaz.
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 mt-2">
                        <li><strong className="text-white">Oturum çerezi:</strong> Giriş durumunuzu takip eder</li>
                        <li><strong className="text-white">CSRF koruması:</strong> Güvenlik doğrulaması sağlar</li>
                        <li><strong className="text-white">Çerez onayı:</strong> Çerez tercihlerinizi hatırlar</li>
                    </ul>

                    <h3 className="text-lg font-medium text-white mt-4 mb-2">2.2. İşlevsel Çerezler</h3>
                    <p className="text-slate-300 leading-relaxed">
                        Tercihlerinizi hatırlayarak daha kişiselleştirilmiş bir deneyim sunar.
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 mt-2">
                        <li><strong className="text-white">Dil tercihi:</strong> Seçtiğiniz dili hatırlar</li>
                        <li><strong className="text-white">Tema tercihi:</strong> Görünüm tercihlerinizi saklar</li>
                        <li><strong className="text-white">Hoş geldin mesajı:</strong> İlk kullanım bildirimini kontrol eder</li>
                    </ul>

                    <h3 className="text-lg font-medium text-white mt-4 mb-2">2.3. Analitik Çerezler</h3>
                    <p className="text-slate-300 leading-relaxed">
                        Siteyi nasıl kullandığınızı anlamamıza yardımcı olur ve hizmetlerimizi geliştirmemize olanak tanır.
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 mt-2">
                        <li><strong className="text-white">Sayfa görüntüleme:</strong> Hangi sayfaların ziyaret edildiğini takip eder</li>
                        <li><strong className="text-white">Performans:</strong> Site hızını ölçer</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">3. Kullandığımız Çerezler</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-slate-300">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left py-3 px-2 text-white">Çerez Adı</th>
                                    <th className="text-left py-3 px-2 text-white">Tür</th>
                                    <th className="text-left py-3 px-2 text-white">Süre</th>
                                    <th className="text-left py-3 px-2 text-white">Amaç</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-700/50">
                                    <td className="py-2 px-2">next-auth.session-token</td>
                                    <td className="py-2 px-2">Zorunlu</td>
                                    <td className="py-2 px-2">Oturum</td>
                                    <td className="py-2 px-2">Kullanıcı oturumu yönetimi</td>
                                </tr>
                                <tr className="border-b border-slate-700/50">
                                    <td className="py-2 px-2">cookie_consent</td>
                                    <td className="py-2 px-2">Zorunlu</td>
                                    <td className="py-2 px-2">1 yıl</td>
                                    <td className="py-2 px-2">Çerez onay tercihini saklar</td>
                                </tr>
                                <tr className="border-b border-slate-700/50">
                                    <td className="py-2 px-2">kamulog_welcome_acknowledged</td>
                                    <td className="py-2 px-2">İşlevsel</td>
                                    <td className="py-2 px-2">1 yıl</td>
                                    <td className="py-2 px-2">Hoş geldin mesajı gösterimini kontrol eder</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">4. Çerez Kontrolü</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Çerezleri tarayıcı ayarlarınızdan yönetebilirsiniz. Ancak çerezleri devre dışı bırakmak
                        bazı site özelliklerinin çalışmamasına neden olabilir.
                    </p>
                    <div className="bg-slate-700/50 rounded-lg p-4 mt-4 text-sm">
                        <p className="font-semibold text-white mb-2">Tarayıcı Ayarları:</p>
                        <ul className="list-disc list-inside text-slate-300 space-y-1">
                            <li>Chrome: Ayarlar → Gizlilik ve Güvenlik → Çerezler</li>
                            <li>Firefox: Ayarlar → Gizlilik ve Güvenlik → Çerezler</li>
                            <li>Safari: Tercihler → Gizlilik → Çerezler</li>
                            <li>Edge: Ayarlar → Çerezler ve Site İzinleri</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">5. Üçüncü Taraf Çerezler</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Platformumuz, üçüncü taraf hizmetler kullanmaktadır. Bu hizmetler kendi çerezlerini
                        kullanabilir:
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
                        <li><strong className="text-white">Google (OAuth):</strong> Google ile giriş için kullanılır</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">6. İletişim</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Çerez politikamız hakkında sorularınız için:
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
