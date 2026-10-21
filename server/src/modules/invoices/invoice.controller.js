import { z } from "zod";
import { pageSchema } from "../../schemas/index.js";
import { paged, parse, serialise } from "../../utils/http.js";

export const createInvoiceController = (invoiceService) => ({
  listInvoices: async (req, res, next) => {
    try {
      const query = parse(pageSchema, req.query);
      const { total, data } = await invoiceService.list(query);
      res.json(paged(query.page, query.pageSize, total, data));
    } catch (error) {
      next(error);
    }
  },

  getInvoice: async (req, res, next) => {
    try {
      const id = parse(z.coerce.number().int().positive(), req.params.id);
      const invoice = await invoiceService.getById(id);
      res.json({ data: serialise(invoice) });
    } catch (error) {
      next(error);
    }
  },

  recordPayment: async (req, res, next) => {
    try {
      const id = parse(z.coerce.number().int().positive(), req.params.id);
      const input = parse(
        z.object({
          amount: z.coerce.number().positive().max(999999999),
          method: z.enum(["CASH", "BANK_TRANSFER", "UPI", "CHEQUE", "CREDIT", "OTHER"]),
          referenceNo: z.string().max(100).optional().nullable(),
          notes: z.string().max(2000).optional().nullable(),
        }),
        req.body
      );
      const payment = await invoiceService.recordPayment(req.user, id, input);
      res.status(201).json({ data: serialise(payment) });
    } catch (error) {
      next(error);
    }
  },
});
