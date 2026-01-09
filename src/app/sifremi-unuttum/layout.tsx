import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Şifremi Unuttum | Kariyer Kamulog',
    description: 'Kariyer Kamulog şifrenizi mi unuttunuz? E-posta adresinizi girerek şifrenizi kolayca sıfırlayın ve hesabınıza yeniden erişin.',
    keywords: [
        'şifremi unuttum',
        'şifre sıfırlama',
        'kariyer kamulog şifre',
        'hesap kurtarma',
        'şifre yenileme'
    ],
    openGraph: {
        title: 'Şifremi Unuttum | Kariyer Kamulog',
        description: 'Kariyer Kamulog şifrenizi sıfırlayın ve hesabınıza yeniden erişin.',
        url: 'https://kariyerkamulog.com/sifremi-unuttum',
        type: 'website',
    },
    alternates: {
        canonical: 'https://kariyerkamulog.com/sifremi-unuttum',
    },
}

export default function SifremiUnuttumLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
