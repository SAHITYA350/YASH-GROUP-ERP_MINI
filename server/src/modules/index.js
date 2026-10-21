import { Router } from "express";
import { initAuditModule } from "./audit/index.js";
import { initAuthModule } from "./auth/index.js";
import { initUserModule } from "./users/index.js";
import { initCustomerModule } from "./customers/index.js";
import { initEnquiryModule } from "./enquiries/index.js";
import { initQuotationModule } from "./quotations/index.js";
import { initSalesOrderModule } from "./sales-orders/index.js";
import { initInvoiceModule } from "./invoices/index.js";
import { initProductModule } from "./products/index.js";
import { initDashboardModule } from "./dashboard/index.js";

export function createModularApiRoutes({ prisma, authenticate, csrf, production }) {
  const router = Router();

  // Audit module (used by other modules for transactional audit logging)
  const audit = initAuditModule(prisma);

  // Auth module
  const auth = initAuthModule(prisma, { authenticate, csrf, production });

  // Users & Accessibility Management module
  const users = initUserModule(prisma, {
    auditService: audit.service,
    authenticate,
    csrf,
  });

  // Business domain modules
  const customers = initCustomerModule(prisma, {
    auditService: audit.service,
    authenticate,
    csrf,
  });

  const enquiries = initEnquiryModule(prisma, {
    auditService: audit.service,
    authenticate,
    csrf,
  });

  const quotations = initQuotationModule(prisma, {
    auditService: audit.service,
    authenticate,
    csrf,
  });

  const salesOrders = initSalesOrderModule(prisma, {
    auditService: audit.service,
    authenticate,
    csrf,
  });

  const invoices = initInvoiceModule(prisma, {
    auditService: audit.service,
    authenticate,
    csrf,
  });

  const products = initProductModule(prisma, { authenticate });

  const dashboard = initDashboardModule(prisma, { authenticate });

  // Health check
  router.get("/health", (_req, res) =>
    res.json({ data: { status: "ok" } })
  );

  // Mount modular route packages
  router.use("/auth", auth.routes);
  router.use("/users", users.routes);
  router.use("/dashboard", dashboard.routes);
  router.use("/customers", customers.routes);
  router.use("/enquiries", enquiries.routes);
  router.use("/products", products.routes);
  router.use("/quotations", quotations.routes);
  router.use("/sales-orders", salesOrders.routes);
  router.use("/invoices", invoices.routes);

  return router;
}
