import { createEnquiryRepository } from "./enquiry.repository.js";
import { createEnquiryService } from "./enquiry.service.js";
import { createEnquiryController } from "./enquiry.controller.js";
import { createEnquiryRoutes } from "./enquiry.routes.js";

export function initEnquiryModule(prisma, { auditService, authenticate, csrf }) {
  const repository = createEnquiryRepository(prisma);
  const service = createEnquiryService(repository, auditService, prisma);
  const controller = createEnquiryController(service);
  const routes = createEnquiryRoutes({ enquiryController: controller, authenticate, csrf });

  return { repository, service, controller, routes };
}

export {
  createEnquiryRepository,
  createEnquiryService,
  createEnquiryController,
  createEnquiryRoutes,
};
