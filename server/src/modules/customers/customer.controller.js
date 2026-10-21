import { z } from "zod";
import { customerSchema, pageSchema } from "../../schemas/index.js";
import { paged, parse, serialise } from "../../utils/http.js";

export const createCustomerController = (customerService) => ({
  listCustomers: async (req, res, next) => {
    try {
      const { page, pageSize, search } = parse(pageSchema, req.query);
      const { total, data } = await customerService.list({ page, pageSize, search });
      res.json(paged(page, pageSize, total, data));
    } catch (error) {
      next(error);
    }
  },

  getCustomer: async (req, res, next) => {
    try {
      const id = parse(z.coerce.number().int().positive(), req.params.id);
      const customer = await customerService.getById(id);
      res.json({ data: serialise(customer) });
    } catch (error) {
      next(error);
    }
  },

  createCustomer: async (req, res, next) => {
    try {
      const input = parse(customerSchema, req.body);
      const customer = await customerService.create(req.user, input);
      res.status(201).json({ data: serialise(customer) });
    } catch (error) {
      next(error);
    }
  },

  updateCustomer: async (req, res, next) => {
    try {
      const id = parse(z.coerce.number().int().positive(), req.params.id);
      const input = parse(customerSchema.partial(), req.body);
      const customer = await customerService.update(req.user, id, input);
      res.json({ data: serialise(customer) });
    } catch (error) {
      next(error);
    }
  },
});
