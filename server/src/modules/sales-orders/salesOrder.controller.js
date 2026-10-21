import { z } from "zod";
import { pageSchema } from "../../schemas/index.js";
import { paged, parse, serialise } from "../../utils/http.js";

export const createSalesOrderController = (salesOrderService) => ({
  listSalesOrders: async (req, res, next) => {
    try {
      const query = parse(pageSchema, req.query);
      const { total, data } = await salesOrderService.list(query);
      res.json(paged(query.page, query.pageSize, total, data));
    } catch (error) {
      next(error);
    }
  },

  getSalesOrder: async (req, res, next) => {
    try {
      const id = parse(z.coerce.number().int().positive(), req.params.id);
      const order = await salesOrderService.getById(id);
      res.json({ data: serialise(order) });
    } catch (error) {
      next(error);
    }
  },

  createSalesOrder: async (req, res, next) => {
    try {
      const id = parse(z.coerce.number().int().positive(), req.params.id);
      const input = parse(
        z.object({
          customerPONumber: z.string().trim().min(1).max(100),
          expectedDeliveryDate: z.coerce.date().optional().nullable(),
          notes: z.string().max(4000).optional().nullable(),
        }),
        req.body
      );
      const order = await salesOrderService.createFromQuotation(req.user, id, input);
      res.status(201).json({ data: serialise(order) });
    } catch (error) {
      next(error);
    }
  },

  generateInvoice: async (req, res, next) => {
    try {
      const id = parse(z.coerce.number().int().positive(), req.params.id);
      const invoice = await salesOrderService.generateInvoice(req.user, id);
      res.status(201).json({ data: serialise(invoice) });
    } catch (error) {
      next(error);
    }
  },
});
