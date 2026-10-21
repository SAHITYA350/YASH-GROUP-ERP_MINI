import { createAuthRepository } from "./auth.repository.js";
import { createAuthService } from "./auth.service.js";
import { createAuthController } from "./auth.controller.js";
import { createAuthRoutes } from "./auth.routes.js";

export function initAuthModule(prisma, { authenticate, csrf, production }) {
  const repository = createAuthRepository(prisma);
  const service = createAuthService(repository);
  const controller = createAuthController(service, { production });
  const routes = createAuthRoutes({
    authController: controller,
    authenticate,
    csrf,
  });

  return { repository, service, controller, routes };
}

export {
  createAuthRepository,
  createAuthService,
  createAuthController,
  createAuthRoutes,
};
