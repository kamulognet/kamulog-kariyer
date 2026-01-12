import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    const defaultMesafeli = `# Mesafeli Satış Sözleşmesi\n\n**Satıcı:** Suat Hayri Şahin – Kamulog.net\n**Vergi No:** 7960109842\n**Adres:** Atatürk Mahallesi, Çelikel Sokak, Sancaktepe/İSTANBUL PK: 34785\n\n*Bu içerik varsayılan olarak eklenmiştir.*`;
    const defaultIptal = `# İptal ve İade Politikası\n\n**Satıcı:** Suat Hayri Şahin – Kamulog.net\n**Vergi No:** 7960109842\n\n*Bu içerik varsayılan olarak eklenmiştir.*`;
    await prisma.siteSettings.upsert({
        where: { key: 'legal_mesafeli-satis' },
        update: { value: defaultMesafeli },
        create: { key: 'legal_mesafeli-satis', value: defaultMesafeli },
    });
    await prisma.siteSettings.upsert({
        where: { key: 'legal_iptal-iade' },
        update: { value: defaultIptal },
        create: { key: 'legal_iptal-iade', value: defaultIptal },
    });
    console.log('Default legal contents upserted.');
    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
