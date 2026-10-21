// Resets test records for finance workflows
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

(async () => {
  const bill = await prisma.vendorBill.updateMany({
    where: { billNo: "EXP-CONSUMABLE-001" },
    data: { status: "SUBMITTED" },
  });
  const invoice = await prisma.invoice.deleteMany({
    where: { invoiceNo: "INV-API-TEST-001" },
  });
  console.log(
    `reset: ${bill.count} bill(s) -> SUBMITTED, ${invoice.count} test invoice(s) deleted`
  );
  await prisma.$disconnect();
})();
