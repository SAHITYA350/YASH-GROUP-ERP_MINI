import { createCustomerRepository } from "./customer.repository.js";
import { createCustomerService } from "./customer.service.js";
import { createCustomerController } from "./customer.controller.js";
import { createCustomerRoutes } from "./customer.routes.js";

export function initCustomerModule(prisma, { auditService, authenticate, csrf }) {
  const repository = createCustomerRepository(prisma);
  const service = createCustomerService(repository, auditService, prisma);
  const controller = createCustomerController(service);
  const routes = createCustomerRoutes({ customerController: controller, authenticate, csrf });

  return { repository, service, controller, routes };
}

export {
  createCustomerRepository,
  createCustomerService,
  createCustomerController,
  createCustomerRoutes,
};
