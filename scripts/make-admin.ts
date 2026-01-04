import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin() {
    const email = 'sdat.sahin@gmail.com';

    try {
        // Önce kullanıcıyı bul
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.log(`Kullanıcı bulunamadı: ${email}`);
            console.log('Mevcut kullanıcılar:');
            const users = await prisma.user.findMany({
                select: { email: true, role: true }
            });
            users.forEach(u => console.log(`  - ${u.email} (${u.role})`));
            return;
        }

        // Admin yap
        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' }
        });

        console.log(`✅ Kullanıcı başarıyla admin yapıldı!`);
        console.log(`   Email: ${updatedUser.email}`);
        console.log(`   Role: ${updatedUser.role}`);

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await prisma.$disconnect();
    }
}

makeAdmin();
