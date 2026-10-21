import { createInvoiceRepository } from "./invoice.repository.js";
import { createInvoiceService } from "./invoice.service.js";
import { createInvoiceController } from "./invoice.controller.js";
import { createInvoiceRoutes } from "./invoice.routes.js";

export function initInvoiceModule(prisma, { auditService, authenticate, csrf }) {
  const repository = createInvoiceRepository(prisma);
  const service = createInvoiceService(repository, auditService, prisma);
  const controller = createInvoiceController(service);
  const routes = createInvoiceRoutes({ invoiceController: controller, authenticate, csrf });

  return { repository, service, controller, routes };
}

export {
  createInvoiceRepository,
  createInvoiceService,
  createInvoiceController,
  createInvoiceRoutes,
};
