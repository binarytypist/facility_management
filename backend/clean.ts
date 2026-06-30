import { prisma } from './lib/db/prisma';

async function run() {
  await prisma.workResult.deleteMany({});
  await prisma.workEvent.deleteMany({});
  await prisma.workItem.deleteMany({});
  await prisma.workType.deleteMany({});
  console.log('Cleaned');
}
run();
