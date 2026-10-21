import { makeCode } from "../../utils/codes.js";
import { fail } from "../../utils/http.js";

export const createInvoiceService = (invoiceRepo, auditService, prisma) => ({
  list: async ({ page, pageSize, search }) => {
    return invoiceRepo.findManyAndCount({ page, pageSize, search });
  },

  getById: async (id) => {
    const invoice = await invoiceRepo.findById(id);
    if (!invoice) throw fail(404, "Invoice not found", "NOT_FOUND");
    return invoice;
  },

  recordPayment: async (actor, id, input) => {
    return prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id } });
      if (!invoice) throw fail(404, "Invoice not found", "NOT_FOUND");
      if (invoice.status === "PAID" || invoice.status === "VOID") {
        throw fail(409, "Invoice is already paid or voided", "INVALID_STATE");
      }

      const payment = await invoiceRepo.createPayment(
        {
          paymentNo: makeCode("PAY"),
          invoiceId: id,
          amount: input.amount,
          method: input.method,
          referenceNo: input.referenceNo || null,
          notes: input.notes || null,
        },
        tx
      );

      const newPaid = parseFloat(invoice.paidAmount) + input.amount;
      const total = parseFloat(invoice.total);
      const newStatus =
        newPaid >= total ? "PAID" : newPaid > 0 ? "PARTIALLY_PAID" : invoice.status;

      await invoiceRepo.update(
        id,
        { paidAmount: newPaid, status: newStatus },
        tx
      );

      if (auditService) {
        await auditService.log(
          tx,
          actor.id,
          "PAYMENT_RECORDED",
          "Payment",
          payment.id,
          {
            invoiceId: id,
            paymentNo: payment.paymentNo,
            amount: input.amount,
            method: input.method,
          }
        );
      }

      return payment;
    });
  },
});
