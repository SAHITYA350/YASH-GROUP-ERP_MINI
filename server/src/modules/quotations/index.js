import { createQuotationRepository } from "./quotation.repository.js";
import { createQuotationService } from "./quotation.service.js";
import { createQuotationController } from "./quotation.controller.js";
import { createQuotationRoutes } from "./quotation.routes.js";

export function initQuotationModule(prisma, { auditService, authenticate, csrf }) {
  const repository = createQuotationRepository(prisma);
  const service = createQuotationService(repository, auditService, prisma);
  const controller = createQuotationController(service);
  const routes = createQuotationRoutes({ quotationController: controller, authenticate, csrf });

  return { repository, service, controller, routes };
}

export {
  createQuotationRepository,
  createQuotationService,
  createQuotationController,
  createQuotationRoutes,
};
