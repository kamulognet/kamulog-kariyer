import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'KVKK Aydınlatma Metni',
    description: 'Kariyer Kamulog KVKK Aydınlatma Metni - Kişisel verilerin işlenmesi hakkında bilgilendirme'
}

export default function KVKKPage() {
    return (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 md:p-12">
            <h1 className="text-3xl font-bold text-white mb-8">KVKK Aydınlatma Metni</h1>

            <div className="prose prose-invert prose-slate max-w-none space-y-6">
                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">1. Veri Sorumlusu</h2>
                    <p className="text-slate-300 leading-relaxed">
                        6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz;
                        veri sorumlusu olarak <strong className="text-white">Suat Hayri Şahin – Kamulog.net</strong>
                        ("Kariyer Kamulog" veya "Platform") tarafından aşağıda açıklanan kapsamda işlenebilecektir.
                    </p>
                    <div className="bg-slate-700/50 rounded-lg p-4 mt-4 text-sm">
                        <p><strong className="text-white">Vergi Kimlik No:</strong> 7960109842</p>
                        <p><strong className="text-white">Adres:</strong> Atatürk Mahallesi, Çelikel Sokak, Sancaktepe/İSTANBUL PK: 34785</p>
                        <p><strong className="text-white">E-Posta:</strong> destek@kamulogkariyer.com</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">2. İşlenen Kişisel Veriler</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Platform tarafından aşağıdaki kişisel verileriniz işlenmektedir:
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
                        <li><strong className="text-white">Kimlik Bilgileri:</strong> Ad, soyad</li>
                        <li><strong className="text-white">İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, adres</li>
                        <li><strong className="text-white">Özgeçmiş Bilgileri:</strong> Eğitim, iş deneyimi, yetenekler, sertifikalar</li>
                        <li><strong className="text-white">Finansal Bilgiler:</strong> Fatura adresi, vergi numarası (ödeme işlemleri için)</li>
                        <li><strong className="text-white">İşlem Bilgileri:</strong> Abonelik geçmişi, jeton kullanımı, oturum bilgileri</li>
                        <li><strong className="text-white">Teknik Bilgiler:</strong> IP adresi, tarayıcı bilgileri, çerez verileri</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">3. Kişisel Verilerin İşlenme Amaçları</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
                        <li>Üyelik işlemlerinin gerçekleştirilmesi ve hesap yönetimi</li>
                        <li>CV oluşturma ve iş eşleştirme hizmetlerinin sunulması</li>
                        <li>Yapay zeka destekli CV analizi ve kariyer önerilerinin sağlanması</li>
                        <li>Abonelik ve ödeme işlemlerinin yürütülmesi</li>
                        <li>Fatura düzenlenmesi ve muhasebe kayıtlarının tutulması</li>
                        <li>Müşteri destek hizmetlerinin sunulması</li>
                        <li>Platform güvenliğinin sağlanması</li>
                        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">4. Kişisel Verilerin Aktarılması</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Kişisel verileriniz, KVKK'nın 8. ve 9. maddelerinde belirtilen şartlara uygun olarak;
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
                        <li>Yetkili kamu kurum ve kuruluşlarına (yasal zorunluluk halinde)</li>
                        <li>Ödeme hizmeti sağlayıcılarına (ödeme işlemleri için)</li>
                        <li>Bulut hizmeti sağlayıcılarına (veri depolama için)</li>
                        <li>Yapay zeka hizmeti sağlayıcılarına (CV analizi için - anonimleştirilmiş)</li>
                    </ul>
                    <p className="text-slate-300 leading-relaxed mt-3">
                        aktarılabilmektedir. Verileriniz, ticari amaçlarla üçüncü taraflara satılmaz veya kiralanmaz.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">5. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Kişisel verileriniz, Platform'a kayıt olurken, CV oluştururken, abonelik satın alırken ve
                        Platform'u kullanırken elektronik ortamda toplanmaktadır. Verileriniz KVKK'nın 5. maddesinde
                        belirtilen aşağıdaki hukuki sebeplere dayanarak işlenmektedir:
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
                        <li>Açık rızanızın bulunması</li>
                        <li>Sözleşmenin kurulması veya ifası için gerekli olması</li>
                        <li>Hukuki yükümlülüklerin yerine getirilmesi</li>
                        <li>Meşru menfaatlerimiz için zorunlu olması</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">6. KVKK Kapsamındaki Haklarınız</h2>
                    <p className="text-slate-300 leading-relaxed">
                        KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
                        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                        <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
                        <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                        <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri öğrenme</li>
                        <li>Kişisel verilerin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</li>
                        <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme</li>
                        <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                        <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">7. Başvuru Yöntemi</h2>
                    <p className="text-slate-300 leading-relaxed">
                        KVKK kapsamındaki haklarınızı kullanmak için <strong className="text-white">destek@kamulogkariyer.com</strong>
                        adresine e-posta göndererek veya yazılı olarak yukarıda belirtilen adrese başvurabilirsiniz.
                    </p>
                    <p className="text-slate-300 leading-relaxed mt-3">
                        Başvurunuzda kimliğinizi tespit edici bilgiler ile talep konusunu açıkça belirtmeniz gerekmektedir.
                        Talebiniz, niteliğine göre en kısa sürede ve en geç 30 gün içinde ücretsiz olarak sonuçlandırılacaktır.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-purple-400 mb-4">8. Veri Güvenliği</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Kişisel verilerinizin güvenliği için endüstri standardı güvenlik önlemleri uygulanmaktadır:
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
                        <li>SSL/TLS şifreleme ile veri iletimi</li>
                        <li>Şifreli veri depolama</li>
                        <li>Erişim kontrolü ve yetkilendirme</li>
                        <li>Düzenli güvenlik denetimleri</li>
                    </ul>
                </section>

                <div className="mt-8 pt-6 border-t border-slate-700 text-sm text-slate-500">
                    <p>Son güncelleme: Ocak 2025</p>
                </div>
            </div>
        </div>
    )
}
