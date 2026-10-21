import { makeCode } from "../../utils/codes.js";
import { fail } from "../../utils/http.js";

export const createSalesOrderService = (salesOrderRepo, auditService, prisma) => ({
  list: async ({ page, pageSize, search }) => {
    return salesOrderRepo.findManyAndCount({ page, pageSize, search });
  },

  getById: async (id) => {
    const order = await salesOrderRepo.findById(id);
    if (!order) throw fail(404, "Sales order not found", "NOT_FOUND");
    return order;
  },

  createFromQuotation: async (actor, quotationId, input) => {
    return prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.findUnique({
        where: { id: quotationId },
        include: { items: true },
      });
      if (!quotation) throw fail(404, "Quotation not found", "NOT_FOUND");
      if (!["SENT_TO_CLIENT", "APPROVED"].includes(quotation.status)) {
        throw fail(
          409,
          "Only a sent or approved quotation can become an order",
          "INVALID_TRANSITION"
        );
      }

      const orderNumber = makeCode("SO");
      const order = await tx.salesOrder.create({
        data: {
          orderNumber,
          quotationId,
          customerId: quotation.customerId,
          createdById: actor.id,
          customerPONumber: input.customerPONumber,
          expectedDeliveryDate: input.expectedDeliveryDate || null,
          notes: input.notes || null,
          status: "PENDING",
          subtotal: quotation.subtotal,
          gstAmount: quotation.taxAmount,
          grandTotal: quotation.total,
          items: {
            create: quotation.items.map((item) => ({
              productId: item.productId,
              productSkuSnapshot: "",
              productNameSnapshot: item.description || "Quoted item",
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountPercent: item.discountPercent,
              gstPercent: item.taxPercent,
              baseAmount: item.subtotal,
              taxableAmount: item.subtotal,
              gstAmount: item.lineTotal.minus(item.subtotal),
              lineTotal: item.lineTotal,
            })),
          },
        },
      });

      await tx.quotation.update({ where: { id: quotationId }, data: { status: "CONVERTED" } });

      if (quotation.leadId) {
        await tx.lead.update({
          where: { id: quotation.leadId },
          data: { stage: "CONVERTED", convertedAt: new Date() },
        });
      }

      if (auditService) {
        await auditService.log(
          tx,
          actor.id,
          "SALES_ORDER_CREATED",
          "SalesOrder",
          order.id,
          { orderNumber: order.orderNumber, quotationId }
        );
      }

      return order;
    });
  },

  generateInvoice: async (actor, orderId) => {
    return prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: { product: { select: { name: true, variant: true } } },
          },
          invoices: { select: { id: true } },
        },
      });
      if (!order) throw fail(404, "Sales order not found", "NOT_FOUND");
      if (order.invoices.length > 0) {
        throw fail(409, "Invoice already generated for this sales order", "CONFLICT");
      }
      if (
        ![
          "PENDING",
          "CONFIRMED",
          "PROCESSING",
          "READY_FOR_DISPATCH",
          "DISPATCHED",
          "DELIVERED",
          "COMPLETED",
        ].includes(order.status)
      ) {
        throw fail(
          409,
          "Sales order must be at least PENDING to generate an invoice",
          "INVALID_STATE"
        );
      }

      const invoice = await tx.invoice.create({
        data: {
          invoiceNo: makeCode("INV"),
          customerId: order.customerId,
          salesOrderId: order.id,
          status: "ISSUED",
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 86_400_000),
          subtotal: order.subtotal,
          taxAmount: order.gstAmount,
          total: order.grandTotal,
          notes: `Invoice for Sales Order ${order.orderNumber}`,
          items: {
            create: order.items.map((item) => ({
              description: `${item.productNameSnapshot || item.product?.name || "Item"} (${item.product?.variant || ""})`,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxAmount: item.gstAmount,
              lineTotal: item.lineTotal,
            })),
          },
        },
        include: {
          items: true,
          customer: { select: { name: true } },
        },
      });

      if (auditService) {
        await auditService.log(
          tx,
          actor.id,
          "INVOICE_GENERATED",
          "Invoice",
          invoice.id,
          { invoiceNo: invoice.invoiceNo, salesOrderId: order.id }
        );
      }

      return invoice;
    });
  },
});
