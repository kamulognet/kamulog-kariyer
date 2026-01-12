const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

function generateJobCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return 'JOB-' + code;
}

async function assignCodes() {
    const jobs = await p.jobListing.findMany({ where: { code: null } });
    console.log('Found', jobs.length, 'jobs without codes');

    for (const job of jobs) {
        let code = generateJobCode();
        let attempts = 0;
        while (attempts < 10) {
            const existing = await p.jobListing.findFirst({ where: { code } });
            if (!existing) break;
            code = generateJobCode();
            attempts++;
        }
        await p.jobListing.update({ where: { id: job.id }, data: { code } });
        console.log('Assigned', code, 'to', job.title.substring(0, 30));
    }

    await p.$disconnect();
}

assignCodes().then(() => console.log('Done!')).catch(console.error);
