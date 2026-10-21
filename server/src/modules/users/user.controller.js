import { z } from "zod";
import { userAccessibilitySchema } from "../../schemas/index.js";
import { parse, serialise } from "../../utils/http.js";

export const createUserController = (userService) => ({
  listUsers: async (req, res, next) => {
    try {
      const search = req.query.search ? String(req.query.search) : undefined;
      const users = await userService.getUsers({ search });
      res.json({ data: serialise(users) });
    } catch (error) {
      next(error);
    }
  },

  getMeta: async (_req, res, next) => {
    try {
      const meta = await userService.getAccessibilityMeta();
      res.json({ data: meta });
    } catch (error) {
      next(error);
    }
  },

  getUser: async (req, res, next) => {
    try {
      const id = parse(z.coerce.number().int().positive(), req.params.id);
      const user = await userService.getUserById(id);
      res.json({ data: serialise(user) });
    } catch (error) {
      next(error);
    }
  },

  updateAccessibility: async (req, res, next) => {
    try {
      const id = parse(z.coerce.number().int().positive(), req.params.id);
      const input = parse(userAccessibilitySchema, req.body);
      const updated = await userService.updateAccessibility(req.user, id, input);
      res.json({ data: serialise(updated) });
    } catch (error) {
      next(error);
    }
  },
});
