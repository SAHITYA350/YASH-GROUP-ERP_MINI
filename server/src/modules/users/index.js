import { createUserRepository } from "./user.repository.js";
import { createUserService } from "./user.service.js";
import { createUserController } from "./user.controller.js";
import { createUserRoutes } from "./user.routes.js";

export function initUserModule(prisma, { auditService, authenticate, csrf }) {
  const repository = createUserRepository(prisma);
  const service = createUserService(repository, auditService);
  const controller = createUserController(service);
  const routes = createUserRoutes({ userController: controller, authenticate, csrf });

  return { repository, service, controller, routes };
}

export {
  createUserRepository,
  createUserService,
  createUserController,
  createUserRoutes,
};
