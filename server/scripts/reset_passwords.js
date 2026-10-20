const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function run() {
  const hash = await bcrypt.hash('Yash@Test123', 12);
  const emails = [
    'admin@yash.test',
    'finance@yash.test',
    'accountant@yash.test',
    'sales@yash.test',
    'viewer@yash.test',
  ];

  const result = await prisma.user.updateMany({
    where: { email: { in: emails } },
    data: { passwordHash: hash, isActive: true },
  });

  console.log(`Updated passwords for ${result.count} test users to Yash@Test123`);
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
