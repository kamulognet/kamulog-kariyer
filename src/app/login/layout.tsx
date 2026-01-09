import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Giriş Yap | Üye Girişi - Kariyer Kamulog',
    description: 'Kariyer Kamulog hesabınıza giriş yapın. Yapay zeka destekli CV oluşturma, iş eşleştirme, kamu ilanları ve kariyer danışmanlığı hizmetlerine erişin. Üye girişi yaparak panele ulaşın.',
    keywords: [
        'giriş',
        'giriş yap',
        'üye girişi',
        'kariyer kamulog giriş',
        'kamulog kariyer giriş',
        'kamulog giriş',
        'hesabıma giriş',
        'cv oluşturma giriş',
        'iş arama giriş',
        'login',
        'üye giriş sayfası',
        'kariyer kamulog login',
        'kamulog üye girişi'
    ],
    openGraph: {
        title: 'Giriş Yap | Kariyer Kamulog',
        description: 'Kariyer Kamulog hesabınıza giriş yapın. AI destekli CV oluşturma ve iş eşleştirme platformu.',
        url: 'https://kariyerkamulog.com/login',
        type: 'website',
    },
    alternates: {
        canonical: 'https://kariyerkamulog.com/login',
    },
}

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
