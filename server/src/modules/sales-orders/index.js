import { createSalesOrderRepository } from "./salesOrder.repository.js";
import { createSalesOrderService } from "./salesOrder.service.js";
import { createSalesOrderController } from "./salesOrder.controller.js";
import { createSalesOrderRoutes } from "./salesOrder.routes.js";

export function initSalesOrderModule(prisma, { auditService, authenticate, csrf }) {
  const repository = createSalesOrderRepository(prisma);
  const service = createSalesOrderService(repository, auditService, prisma);
  const controller = createSalesOrderController(service);
  const routes = createSalesOrderRoutes({ salesOrderController: controller, authenticate, csrf });

  return { repository, service, controller, routes };
}

export {
  createSalesOrderRepository,
  createSalesOrderService,
  createSalesOrderController,
  createSalesOrderRoutes,
};
