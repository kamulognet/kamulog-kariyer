import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const jobs = await prisma.jobListing.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { title: true, type: true, sourceUrl: true, applicationUrl: true }
  })
  console.log(JSON.stringify(jobs, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.())
