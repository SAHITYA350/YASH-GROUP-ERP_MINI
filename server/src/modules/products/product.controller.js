import { serialise } from "../../utils/http.js";

export const createProductController = (productService) => ({
  listProducts: async (_req, res, next) => {
    try {
      const products = await productService.list();
      res.json({ data: serialise(products) });
    } catch (error) {
      next(error);
    }
  },
});
