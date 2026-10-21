import { makeCode } from "../../utils/codes.js";
import { fail } from "../../utils/http.js";

export const createCustomerService = (customerRepo, auditService, prisma) => ({
  list: async ({ page, pageSize, search }) => {
    return customerRepo.findManyAndCount({ page, pageSize, search });
  },

  getById: async (id) => {
    const customer = await customerRepo.findById(id);
    if (!customer) throw fail(404, "Customer not found", "NOT_FOUND");
    return customer;
  },

  create: async (actor, input) => {
    return prisma.$transaction(async (tx) => {
      const code = makeCode("CUS");
      const created = await customerRepo.create({ ...input, code }, tx);
      if (auditService) {
        await auditService.log(tx, actor.id, "CUSTOMER_CREATED", "Customer", created.id, {
          code: created.code,
        });
      }
      return created;
    });
  },

  update: async (actor, id, input) => {
    return prisma.$transaction(async (tx) => {
      const before = await tx.customer.findUnique({ where: { id } });
      if (!before) throw fail(404, "Customer not found", "NOT_FOUND");
      const updated = await customerRepo.update(id, input, tx);
      if (auditService) {
        await auditService.log(tx, actor.id, "CUSTOMER_UPDATED", "Customer", id, input);
      }
      return updated;
    });
  },
});
