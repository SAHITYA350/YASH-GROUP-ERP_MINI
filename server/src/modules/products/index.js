import { createProductRepository } from "./product.repository.js";
import { createProductService } from "./product.service.js";
import { createProductController } from "./product.controller.js";
import { createProductRoutes } from "./product.routes.js";

export function initProductModule(prisma, { authenticate }) {
  const repository = createProductRepository(prisma);
  const service = createProductService(repository);
  const controller = createProductController(service);
  const routes = createProductRoutes({ productController: controller, authenticate });

  return { repository, service, controller, routes };
}

export {
  createProductRepository,
  createProductService,
  createProductController,
  createProductRoutes,
};
