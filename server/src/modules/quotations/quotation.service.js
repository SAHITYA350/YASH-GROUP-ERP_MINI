import { Prisma } from "@prisma/client";
import { hasPermission } from "../../constants/permissions.js";
import { makeCode } from "../../utils/codes.js";
import { fail } from "../../utils/http.js";

const decimal = (value) => new Prisma.Decimal(value).toDecimalPlaces(2);

function quoteTotals(items) {
  return items.reduce(
    (totals, item) => {
      const base = decimal(item.quantity).mul(decimal(item.unitPrice));
      const subtotal = base
        .minus(base.mul(decimal(item.discountPercent || 0)).div(100))
        .toDecimalPlaces(2);
      const tax = subtotal
        .mul(decimal(item.taxPercent || 0))
        .div(100)
        .toDecimalPlaces(2);
      totals.subtotal = totals.subtotal.plus(subtotal);
      totals.tax = totals.tax.plus(tax);
      totals.items.push({ ...item, subtotal, lineTotal: subtotal.plus(tax) });
      return totals;
    },
    { subtotal: decimal(0), tax: decimal(0), items: [] },
  );
}

export const createQuotationService = (quotationRepo, auditService, prisma) => ({
  list: async ({ page, pageSize, search }) => {
    return quotationRepo.findManyAndCount({ page, pageSize, search });
  },

  getById: async (id) => {
    const quote = await quotationRepo.findById(id);
    if (!quote) throw fail(404, "Quotation not found", "NOT_FOUND");
    return quote;
  },

  create: async (actor, input) => {
    return prisma.$transaction(async (tx) => {
      if (input.leadId) {
        const lead = await tx.lead.findUnique({ where: { id: input.leadId } });
        if (!lead) throw fail(404, "Enquiry not found", "NOT_FOUND");
        if (
          !["QUALIFIED", "REQUIREMENT_CAPTURED", "QUOTATION_DRAFT"].includes(
            lead.stage
          )
        ) {
          throw fail(
            409,
            "Qualify the enquiry before creating a quotation",
            "INVALID_TRANSITION"
          );
        }
      }

      const totals = quoteTotals(input.items);
      const quotation = await quotationRepo.create(
        {
          quotationNo: makeCode("QT"),
          customerId: input.customerId,
          leadId: input.leadId || null,
          salesRepresentativeId: actor.id,
          status: "DRAFT",
          subtotal: totals.subtotal,
          taxableAmount: totals.subtotal,
          taxAmount: totals.tax,
          gstAmount: totals.tax,
          total: totals.subtotal.plus(totals.tax),
          validUntil: input.validUntil || null,
          termsAndConditions: input.termsAndConditions || null,
          notes: input.notes || null,
          items: {
            create: totals.items.map((item) => ({
              productId: item.productId,
              description: item.description || null,
              quantity: decimal(item.quantity),
              unitPrice: decimal(item.unitPrice),
              discountPercent: decimal(item.discountPercent || 0),
              taxPercent: decimal(item.taxPercent || 0),
              subtotal: item.subtotal,
              lineTotal: item.lineTotal,
            })),
          },
        },
        tx
      );

      if (input.leadId) {
        await quotationRepo.updateLeadStage(input.leadId, "QUOTATION_DRAFT", tx);
      }

      if (auditService) {
        await auditService.log(
          tx,
          actor.id,
          "QUOTATION_CREATED",
          "Quotation",
          quotation.id,
          { quotationNo: quotation.quotationNo }
        );
      }

      return quotation;
    });
  },

  updateStatus: async (actor, id, status) => {
    if (status === "APPROVED" && !hasPermission(actor, "quote:approve")) {
      throw fail(
        403,
        "Quotation approval requires manager permission",
        "FORBIDDEN"
      );
    }

    return quotationRepo.update(id, {
      status,
      ...(status === "SENT_TO_CLIENT" && { sentAt: new Date() }),
      ...(status === "APPROVED" && { approvedAt: new Date() }),
    });
  },
});
