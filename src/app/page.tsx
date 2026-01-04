import Link from 'next/link'
import { Sparkles, MessageCircle, Upload, Briefcase, Users, CheckCircle, ArrowRight, Zap, Shield, Target } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[150px]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                KARİYER KAMULOG
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-300 hover:text-white transition">
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-xl transition shadow-lg shadow-purple-500/25"
              >
                Ücretsiz Başla
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">Yapay Zeka Destekli Kariyer Platformu</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Yapay Zeka ile</span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Hayalinizdeki Kariyer
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              AI asistanımız CV&apos;nizi profesyonelce oluşturur, size en uygun iş ilanlarını bulur ve
              başvuru sürecinizde yanınızda olur.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-2xl transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                Ücretsiz Başla
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="/panel"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-2xl transition backdrop-blur-sm"
              >
                Panelime Git
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-white/5">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">5K+</div>
                <div className="text-gray-500 mt-1">Aktif Kullanıcı</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">10K+</div>
                <div className="text-gray-500 mt-1">Oluşturulan CV</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">95%</div>
                <div className="text-gray-500 mt-1">Memnuniyet</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Yapay Zeka Gücüyle
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Kariyerinizi Şekillendirin</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Modern teknoloji ile desteklenen özelliklerimizle iş arama sürecinizi kolaylaştırın
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-3xl hover:border-purple-500/40 transition-all backdrop-blur-sm">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI CV Asistanı</h3>
              <p className="text-gray-400">
                Yapay zeka ile sohbet ederek profesyonel CV&apos;nizi adım adım oluşturun. Kamu ve özel sektöre özel formatlama.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-3xl hover:border-blue-500/40 transition-all backdrop-blur-sm">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">PDF CV Analizi</h3>
              <p className="text-gray-400">
                Mevcut CV&apos;nizi yükleyin, AI eksik bilgileri tespit etsin ve profesyonelce güncellesin.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-3xl hover:border-cyan-500/40 transition-all backdrop-blur-sm">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Akıllı İş Eşleştirme</h3>
              <p className="text-gray-400">
                CV&apos;niz analiz edilir ve size en uygun kamu/özel sektör ilanları otomatik olarak önerilir.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-3xl hover:border-green-500/40 transition-all backdrop-blur-sm">
              <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Kamu Sektörü Odaklı</h3>
              <p className="text-gray-400">
                KPSS, personel alımları ve kamu kurumu ilanları için optimize edilmiş CV formatları.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-3xl hover:border-orange-500/40 transition-all backdrop-blur-sm">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Uyumluluk Analizi</h3>
              <p className="text-gray-400">
                Her ilan için CV&apos;nizin uyumluluk puanını görün ve eksiklerinizi tamamlayın.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20 rounded-3xl hover:border-pink-500/40 transition-all backdrop-blur-sm">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-600 to-pink-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Güvenli & Hızlı</h3>
              <p className="text-gray-400">
                Verileriniz güvende. PDF export ile anında profesyonel CV&apos;nizi indirin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Nasıl Çalışır?
            </h2>
            <p className="text-gray-400 text-lg">3 basit adımda kariyer yolculuğunuza başlayın</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/30">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Hesap Oluşturun</h3>
              <p className="text-gray-400">Ücretsiz kayıt olun ve AI asistanına erişim sağlayın.</p>
            </div>

            <div className="relative text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">CV&apos;nizi Oluşturun</h3>
              <p className="text-gray-400">AI ile sohbet edin veya mevcut CV&apos;nizi yükleyerek başlayın.</p>
            </div>

            <div className="relative text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-cyan-500/30">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">İş Bulun</h3>
              <p className="text-gray-400">AI size uygun ilanları bulsun, tek tıkla başvurun.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-cyan-600/20 border border-purple-500/30 rounded-3xl p-12 text-center backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Kariyerinize Yatırım Yapın
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                Ücretsiz plandan başlayın, ihtiyacınız oldukça yükseltin. Fiyatlandırma detayları için giriş yapın.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/panel/abonelik"
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-2xl transition shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  Planları İncele
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/register"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-2xl transition backdrop-blur-sm"
                >
                  Ücretsiz Dene
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">KARİYER KAMULOG</span>
            </div>
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} KARİYER KAMULOG. Tüm hakları saklıdır.
            </div>
            <div className="flex gap-6 text-gray-400 text-sm">
              <Link href="/gizlilik" className="hover:text-white transition">Gizlilik</Link>
              <Link href="/kullanim-sartlari" className="hover:text-white transition">Kullanım Şartları</Link>
              <Link href="/panel/abonelik" className="hover:text-white transition">Abonelik</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
