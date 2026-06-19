import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function wipe() {
  await prisma.job.deleteMany({});
  console.log('Jobs wiped.');
}

wipe().finally(() => prisma.$disconnect());
