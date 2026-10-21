import { createDashboardRepository } from "./dashboard.repository.js";
import { createDashboardService } from "./dashboard.service.js";
import { createDashboardController } from "./dashboard.controller.js";
import { createDashboardRoutes } from "./dashboard.routes.js";

export function initDashboardModule(prisma, { authenticate }) {
  const repository = createDashboardRepository(prisma);
  const service = createDashboardService(repository);
  const controller = createDashboardController(service);
  const routes = createDashboardRoutes({ dashboardController: controller, authenticate });

  return { repository, service, controller, routes };
}

export {
  createDashboardRepository,
  createDashboardService,
  createDashboardController,
  createDashboardRoutes,
};
