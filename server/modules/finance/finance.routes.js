// ============================================================================
// Module 6 - Finance & Commercial: route aggregator.
// Mounted at /api/finance in server/index.js.
// ============================================================================

import express from "express";
import { authenticate, authorize } from "../../utils/auth.js";
import reportCtrl from "./controllers/financeReport.controller.js";
import paymentCtrl from "./controllers/payment.controller.js";

import invoiceRoutes from "./routes/invoice.routes.js";
import receivablesRoutes from "./routes/receivables.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import vendorBillRoutes from "./routes/vendorBill.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import costingRoutes from "./routes/costing.routes.js";

const router = express.Router();

// ---------------- Dashboard & MIS reports ----------------
router.get("/dashboard", authenticate, authorize("finance", "read"), reportCtrl.dashboard);
router.get("/reports/mis", authenticate, authorize("finance", "read"), reportCtrl.mis);

// ---------------- Workflow sub-routers ----------------
router.use("/invoices", invoiceRoutes);
router.use("/receivables", receivablesRoutes);
router.use("/payments", paymentRoutes);
router.use("/vendor-bills", vendorBillRoutes);
router.use("/expenses", expenseRoutes);
router.use("/jobs", costingRoutes);

// ---------------- Nested money-movement endpoints ----------------
// Customer receipt against an invoice
router.post(
  "/invoices/:id/receipts",
  authenticate,
  authorize("finance", "create"),
  paymentCtrl.createReceipt
);

// Supplier payment against a vendor bill.
router.post(
  "/vendor-bills/:id/payments",
  authenticate,
  authorize("finance", "create"),
  paymentCtrl.createBillPayment
);

export default router;
