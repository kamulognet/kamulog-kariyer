import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Kullanım Koşulları',
    description: 'Kariyer Kamulog Kullanım Koşulları - Platform kullanım şartları ve sorumluluklar'
}

export default function KullanimKosullariPage() {
    return (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 md:p-12">
            <h1 className="text-3xl font-bold text-white mb-8">Kullanım Koşulları</h1>

            <div className="prose prose-invert prose-slate max-w-none space-y-6">
                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">1. Giriş ve Kabul</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Bu Kullanım Koşulları, <strong className="text-white">Kariyer Kamulog</strong> platformunu
                        ("Platform", "Hizmet") kullanımınızı düzenlemektedir. Platformu kullanarak bu koşulları
                        kabul etmiş sayılırsınız.
                    </p>
                    <div className="bg-slate-700/50 rounded-lg p-4 mt-4 text-sm">
                        <p><strong className="text-white">Platform Sahibi:</strong> Suat Hayri Şahin – Kamulog.net</p>
                        <p><strong className="text-white">Vergi Kimlik No:</strong> 7960109842</p>
                        <p><strong className="text-white">Adres:</strong> Atatürk Mahallesi, Çelikel Sokak, Sancaktepe/İSTANBUL PK: 34785</p>
                        <p><strong className="text-white">E-Posta:</strong> destek@kamulogkariyer.com</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">2. Hizmet Tanımı</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Kariyer Kamulog, aşağıdaki hizmetleri sunmaktadır:
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
                        <li>Yapay zeka destekli CV oluşturma ve düzenleme</li>
                        <li>Kamu ve özel sektör iş ilanları listeleme</li>
                        <li>CV-iş ilanı eşleştirme ve uyumluluk analizi</li>
                        <li>Kariyer danışmanlığı hizmetleri (Premium)</li>
                        <li>PDF CV indirme ve dışa aktarma</li>
                    </ul>
                </section>

                <section className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
                    <h2 className="text-xl font-semibold text-amber-400 mb-4">⚠️ 3. Önemli Uyarı - İşe Yerleştirme</h2>
                    <p className="text-slate-300 leading-relaxed">
                        <strong className="text-white">Kariyer Kamulog, herhangi bir işe yerleştirme garantisi sunmamaktadır.</strong>
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
                        <li>Platform, yalnızca bilgilendirme ve araç sağlama amacı taşımaktadır</li>
                        <li>CV analizi ve iş eşleştirme sonuçları yapay zeka desteklidir ve kesin değildir</li>
                        <li>İş başvuruları ve mülakat süreçleri tamamen kullanıcının sorumluluğundadır</li>
                        <li>Herhangi bir iş garantisi veya vaadi bulunmamaktadır</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">4. Hesap Oluşturma ve Güvenlik</h2>
                    <ul className="list-disc list-inside text-slate-300 space-y-2">
                        <li>Hesap oluşturmak için 18 yaşından büyük olmalısınız</li>
                        <li>Doğru ve güncel bilgiler sağlamakla yükümlüsünüz</li>
                        <li>Hesap güvenliğinizden siz sorumlusunuz</li>
                        <li>Şifrenizi başkalarıyla paylaşmamalısınız</li>
                        <li>Şüpheli aktiviteleri derhal bildirmelisiniz</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">5. Abonelik ve Ödemeler</h2>
                    <ul className="list-disc list-inside text-slate-300 space-y-2">
                        <li>Abonelik planları aylık olarak faturalandırılır</li>
                        <li>Fiyatlar TL cinsinden belirtilmiştir ve KDV dahildir</li>
                        <li>Ödemeler banka havalesi yoluyla alınmaktadır</li>
                        <li>Ödeme onayı ile hesabınıza jeton/kredi yüklenir</li>
                        <li>Kullanılmayan jetonlar/krediler sonraki aya devretmez</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">6. İade Politikası</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Dijital hizmet yapısı gereği, kullanılmış jetonlar/krediler için iade yapılmamaktadır.
                        Ancak aşağıdaki durumlarda iade değerlendirilebilir:
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
                        <li>Teknik hata nedeniyle hizmet alınamaması</li>
                        <li>Mükerrer ödeme yapılması</li>
                        <li>Ödeme sonrası hesap aktif edilmemesi</li>
                    </ul>
                    <p className="text-slate-300 leading-relaxed mt-3">
                        İade talepleri için <strong className="text-white">destek@kamulogkariyer.com</strong> adresine başvurunuz.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">7. Kullanıcı Yükümlülükleri</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Platform kullanımında aşağıdaki kurallara uymakla yükümlüsünüz:
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
                        <li>Doğru ve gerçek bilgiler sağlamak</li>
                        <li>Başkalarının bilgilerini izinsiz kullanmamak</li>
                        <li>Platformu yasa dışı amaçlarla kullanmamak</li>
                        <li>Spam veya zararlı içerik paylaşmamak</li>
                        <li>Teknik altyapıya zarar vermemek</li>
                        <li>Otomatik veri toplama araçları kullanmamak</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">8. Fikri Mülkiyet</h2>
                    <ul className="list-disc list-inside text-slate-300 space-y-2">
                        <li>Platform tasarımı, kodu ve içeriği Platform'a aittir</li>
                        <li>CV içerikleriniz size aittir</li>
                        <li>Platform logosunu ve markasını izinsiz kullanamazsınız</li>
                        <li>İçerikleri ticari amaçla kopyalayamazsınız</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">9. Sorumluluk Sınırlaması</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Platform, yasaların izin verdiği en geniş ölçüde:
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
                        <li>Hizmet kesintilerinden dolayı sorumluluk kabul etmez</li>
                        <li>Yapay zeka çıktılarının doğruluğunu garanti etmez</li>
                        <li>Kullanıcının iş başvuru sonuçlarından sorumlu değildir</li>
                        <li>Üçüncü taraf sitelerine bağlantılardan sorumlu değildir</li>
                        <li>Dolaylı, özel veya cezai zararlardan sorumlu tutulamaz</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">10. Hesap Askıya Alma ve Fesih</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Aşağıdaki durumlarda hesabınız askıya alınabilir veya feshedilebilir:
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
                        <li>Kullanım koşullarının ihlali</li>
                        <li>Yasa dışı faaliyetler</li>
                        <li>Diğer kullanıcılara zarar verici davranışlar</li>
                        <li>Sahte veya yanıltıcı bilgi sağlama</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">11. Değişiklikler</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Bu Kullanım Koşulları'nı önceden bildirim yapmaksızın değiştirme hakkını saklı tutuyoruz.
                        Önemli değişiklikler e-posta yoluyla bildirilecektir. Değişiklikler sonrası platformu
                        kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">12. Uygulanacak Hukuk ve Uyuşmazlıklar</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Bu Kullanım Koşulları, Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda
                        İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">13. İletişim</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Kullanım koşulları hakkında sorularınız için:
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
