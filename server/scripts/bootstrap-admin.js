import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const [email, password, name = "ERP Administrator"] = process.arggv.slice(2);
if (!email || !password || password.length < 5) {
  console.error(
    'Usage: npm run bootstrap:admin -- admin@example.com "password-at-least-5" "Name"',
  );
  process.exit(1);
}
const prisma = new PrismaClient();
try {
  const existing = await prisma.user.count({ where: { role: "ADMIN" } });
  if (existing)
    throw new Error("An administrator already exists; bootstrap is disabled.");
  const passwordHash = await bcrypt.hash(
    password,
    Number(process.env.BCRYPT_ROUNDS || 12),
  );
  await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "ADMIN",
      department: "Administration",
    },
  });
  console.log(
    "Administrator created. Store the password securely and disable bootstrap access.",
  );
} finally {
  await prisma.$disconnect();
}
