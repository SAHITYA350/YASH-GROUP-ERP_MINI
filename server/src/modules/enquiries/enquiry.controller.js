import { z } from "zod";
import { SOURCES, STAGES, enquirySchema, pageSchema } from "../../schemas/index.js";
import { paged, parse, serialise } from "../../utils/http.js";

export const createEnquiryController = (enquiryService) => ({
  listEnquiries: async (req, res, next) => {
    try {
      const query = parse(
        pageSchema.extend({
          status: z.enum(STAGES).optional(),
          source: z.enum(SOURCES).optional(),
          ownerId: z.coerce.number().int().positive().optional(),
        }),
        req.query
      );
      const { total, data } = await enquiryService.list(query);
      res.json(paged(query.page, query.pageSize, total, data));
    } catch (error) {
      next(error);
    }
  },

  getEnquiry: async (req, res, next) => {
    try {
      const id = parse(z.coerce.number().int().positive(), req.params.id);
      const enquiry = await enquiryService.getById(id);
      res.json({ data: serialise(enquiry) });
    } catch (error) {
      next(error);
    }
  },

  createEnquiry: async (req, res, next) => {
    try {
      const input = parse(enquirySchema, req.body);
      const enquiry = await enquiryService.create(req.user, input);
      res.status(201).json({ data: serialise(enquiry) });
    } catch (error) {
      next(error);
    }
  },

  updateEnquiry: async (req, res, next) => {
    try {
      const id = parse(z.coerce.number().int().positive(), req.params.id);
      const input = parse(
        enquirySchema.partial().extend({ stage: z.enum(STAGES).optional() }),
        req.body
      );
      const enquiry = await enquiryService.update(req.user, id, input);
      res.json({ data: serialise(enquiry) });
    } catch (error) {
      next(error);
    }
  },

  recordActivity: async (req, res, next) => {
    try {
      const id = parse(z.coerce.number().int().positive(), req.params.id);
      const input = parse(
        z.object({
          channel: z.enum(["CALL", "MEETING", "EMAIL", "WHATSAPP", "NOTE"]),
          body: z.string().trim().min(1).max(4000),
          outcome: z.string().max(100).optional(),
          nextFollowUpAt: z.coerce.date().optional().nullable(),
        }),
        req.body
      );
      const activity = await enquiryService.recordActivity(req.user, id, input);
      res.status(201).json({ data: serialise(activity) });
    } catch (error) {
      next(error);
    }
  },

  importLeads: async (req, res, next) => {
    try {
      const rows = z
        .array(z.record(z.string(), z.unknown()))
        .min(1)
        .max(500)
        .parse(req.body.rows);
      const { created, rejected } = await enquiryService.importRows(req.user, rows);
      res.status(rejected.length ? 207 : 201).json({ data: { created, rejected } });
    } catch (error) {
      next(error);
    }
  },
});
