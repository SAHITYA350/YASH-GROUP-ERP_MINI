import { z } from "zod";
import { pageSchema, quoteSchema } from "../../schemas/index.js";
import { paged, parse, serialise } from "../../utils/http.js";

export const createQuotationController = (quotationService) => ({
  listQuotations: async (req, res, next) => {
    try {
      const query = parse(pageSchema, req.query);
      const { total, data } = await quotationService.list(query);
      res.json(paged(query.page, query.pageSize, total, data));
    } catch (error) {
      next(error);
    }
  },

  getQuotation: async (req, res, next) => {
    try {
      const id = parse(z.coerce.number().int().positive(), req.params.id);
      const quotation = await quotationService.getById(id);
      res.json({ data: serialise(quotation) });
    } catch (error) {
      next(error);
    }
  },

  createQuotation: async (req, res, next) => {
    try {
      const input = parse(quoteSchema, req.body);
      const quotation = await quotationService.create(req.user, input);
      res.status(201).json({ data: serialise(quotation) });
    } catch (error) {
      next(error);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const id = parse(z.coerce.number().int().positive(), req.params.id);
      const { status } = parse(
        z.object({
          status: z.enum(["DRAFT", "SENT_TO_CLIENT", "APPROVED", "REJECTED"]),
        }),
        req.body
      );
      const quotation = await quotationService.updateStatus(req.user, id, status);
      res.json({ data: serialise(quotation) });
    } catch (error) {
      next(error);
    }
  },
});
