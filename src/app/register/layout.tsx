import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Ücretsiz Kayıt Ol | Üye Kayıt - Kariyer Kamulog',
    description: 'Kariyer Kamulog\'a ücretsiz kayıt olun! Yapay zeka ile CV oluşturun, kamu personel alımları ve özel sektör iş ilanlarına erişin. Üye kayıt yaparak profesyonel kariyerinize bugün başlayın.',
    keywords: [
        'kayıt',
        'kayıt ol',
        'üye kayıt',
        'üye ol',
        'hesap oluştur',
        'kariyer kamulog kayıt',
        'kamulog kariyer kayıt',
        'kamulog kayıt',
        'ücretsiz kayıt',
        'ücretsiz hesap',
        'cv oluşturma kayıt',
        'iş arama kayıt',
        'üye ol kamulog',
        'register',
        'kariyer kamulog üye ol',
        'kamulog üye kayıt',
        'ücretsiz üye ol'
    ],
    openGraph: {
        title: 'Ücretsiz Kayıt Ol | Kariyer Kamulog',
        description: 'Kariyer Kamulog\'a ücretsiz kayıt olun! AI destekli CV oluşturma ve iş eşleştirme platformu.',
        url: 'https://kariyerkamulog.com/register',
        type: 'website',
    },
    alternates: {
        canonical: 'https://kariyerkamulog.com/register',
    },
}

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
