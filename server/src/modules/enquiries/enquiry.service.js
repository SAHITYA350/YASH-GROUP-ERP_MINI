import crypto from "node:crypto";
import { makeCode } from "../../utils/codes.js";
import { fail } from "../../utils/http.js";

export const createEnquiryService = (enquiryRepo, auditService, prisma) => {
  const autoAssignStaff = async (actor) => {
    const consultants = await enquiryRepo.findSalesStaff();
    if (!consultants.length) return actor.id;
    const sorted = consultants.sort((a, b) => a._count.assignedLeads - b._count.assignedLeads);
    return sorted[0].id;
  };

  return {
    list: async (params) => {
      return enquiryRepo.findManyAndCount(params);
    },

    getById: async (id) => {
      const enquiry = await enquiryRepo.findById(id);
      if (!enquiry) throw fail(404, "Enquiry not found", "NOT_FOUND");
      return enquiry;
    },

    create: async (actor, input) => {
      const assignedToId = await autoAssignStaff(actor);

      const requestedItems = input.items?.length
        ? input.items
        : input.productId
          ? [{ productId: input.productId, quantity: input.quantity || 1 }]
          : [];

      const productIds = [...new Set(requestedItems.map((item) => item.productId))];
      const products = productIds.length
        ? await enquiryRepo.findActiveProductsByIds(productIds)
        : [];

      if (products.length !== productIds.length) {
        throw fail(404, "One or more products were not found", "NOT_FOUND");
      }

      const productsById = new Map(products.map((p) => [p.id, p]));
      const itemData = requestedItems.map((item) => {
        const product = productsById.get(item.productId);
        return {
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          variant: product.variant,
          quantity: item.quantity,
        };
      });
      const firstItem = itemData[0];

      return prisma.$transaction(async (tx) => {
        let customerId = input.customerId;
        if (!customerId) {
          const existing = await enquiryRepo.findCustomerByContact({
            email: input.email,
            phone: input.phone,
          });
          if (existing) {
            customerId = existing.id;
          } else {
            const customerCount = await enquiryRepo.countCustomers();
            const newCustomer = await enquiryRepo.createCustomer(
              {
                code: `CUS-${String(customerCount + 1).padStart(4, "0")}`,
                name: input.customerName,
                email: input.email || null,
                phone: input.phone || null,
                city: input.city || null,
                state: input.state || null,
              },
              tx
            );
            customerId = newCustomer.id;
          }
        }

        const code = makeCode("ENQ");
        const created = await enquiryRepo.create(
          {
            code,
            source: input.source || "MANUAL",
            customerName: input.customerName,
            contactName: input.contactName || null,
            email: input.email || null,
            phone: input.phone || null,
            city: input.city || null,
            state: input.state || null,
            quantity:
              input.quantity ||
              (itemData.length
                ? itemData.reduce((total, item) => total + item.quantity, 0)
                : null),
            expectedValue: input.expectedValue || null,
            requirement: input.requirement || null,
            priority: input.priority || "MEDIUM",
            stage: "NEW",
            customerId,
            assignedToId,
            assignedById: actor.id,
            assignedByName: actor.name,
            contactType: "New Contact",
            productId: firstItem?.productId || null,
            productSku: firstItem?.productSku || null,
            productName: firstItem?.productName || input.productName || null,
            variant: firstItem?.variant || null,
            ...(itemData.length > 0 && { items: { create: itemData } }),
          },
          tx
        );

        if (auditService) {
          await auditService.log(tx, actor.id, "ENQUIRY_CREATED", "Lead", created.id, { code });
        }

        return created;
      });
    },

    update: async (actor, id, input) => {
      return prisma.$transaction(async (tx) => {
        const before = await tx.lead.findUnique({ where: { id } });
        if (!before) throw fail(404, "Enquiry not found", "NOT_FOUND");
        if (
          before.stage === "CONVERTED" &&
          input.stage &&
          input.stage !== before.stage
        ) {
          throw fail(
            409,
            "A converted enquiry cannot be moved backwards",
            "INVALID_TRANSITION"
          );
        }
        const updated = await enquiryRepo.update(id, input, tx);
        if (auditService) {
          await auditService.log(tx, actor.id, "ENQUIRY_UPDATED", "Lead", id, input);
        }
        return updated;
      });
    },

    recordActivity: async (actor, id, input) => {
      return prisma.$transaction(async (tx) => {
        const lead = await tx.lead.findUnique({ where: { id } });
        if (!lead) throw fail(404, "Enquiry not found", "NOT_FOUND");

        const communication = await enquiryRepo.createCommunication(
          {
            leadId: id,
            userId: actor.id,
            channel: input.channel,
            body: input.body,
            status: input.outcome || "RECORDED",
            followUpAt: input.nextFollowUpAt || null,
          },
          tx
        );

        await enquiryRepo.update(
          id,
          {
            lastActivityNote: input.body,
            nextFollowUpAt: input.nextFollowUpAt || null,
            stage: lead.stage === "NEW" ? "CONTACTED" : undefined,
          },
          tx
        );

        if (auditService) {
          await auditService.log(tx, actor.id, "ACTIVITY_RECORDED", "Lead", id, {
            channel: input.channel,
          });
        }

        return communication;
      });
    },

    importRows: async (actor, rows) => {
      const created = [];
      const rejected = [];

      for (let index = 0; index < rows.length; index += 1) {
        try {
          const row = rows[index];
          const assignedToId = await autoAssignStaff(actor);
          const leadCode = `ENQ-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

          const lead = await prisma.$transaction(async (tx) => {
            const newLead = await tx.lead.create({
              data: {
                ...row,
                code: leadCode,
                source: "EXCEL",
                assignedToId,
                stage: "NEW",
              },
            });

            if (auditService) {
              await auditService.log(
                tx,
                actor.id,
                "ENQUIRY_CREATED_AUTO_ASSIGNED",
                "Lead",
                newLead.id,
                { code: newLead.code, assignedToId }
              );
            }
            return newLead;
          });

          created.push(lead);
        } catch (error) {
          rejected.push({ row: index + 2, message: error.message });
        }
      }

      return { created, rejected };
    },
  };
};
