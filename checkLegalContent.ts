import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    const mesafeli = await prisma.siteSettings.findUnique({ where: { key: 'legal_mesafeli-satis' } });
    const iptal = await prisma.siteSettings.findUnique({ where: { key: 'legal_iptal-iade' } });
    console.log('mesafeli-satis:', mesafeli?.value ?? 'null');
    console.log('iptal-iade:', iptal?.value ?? 'null');
    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
