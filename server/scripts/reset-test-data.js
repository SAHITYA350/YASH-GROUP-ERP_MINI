// Resets the two records that scripts/test-rbac.ps1 mutates, so the
// RBAC matrix can be re-run any number of times:
//   - EXP-CONSUMABLE-001  -> back to SUBMITTED (the approval test approves it)
//   - INV-API-TEST-001    -> deleted (the create-invoice test creates it)
const { PrismaClient } = require("@prisma/client");
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
