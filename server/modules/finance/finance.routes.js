// ============================================================================
// Module 6 - Finance & Commercial: route aggregator.
// Mounted at /api/finance in server/index.js.
//
// Each sub-router lives in routes/ and owns one workflow:
//   invoice.routes.js       -> Billing & Receivables        (Member 1)
//   receivables.routes.js   -> Billing & Receivables        (Member 1)
//   payment.routes.js       -> shared receipts/payments     (Member 1/2)
//   vendorBill.routes.js    -> Payables & Expenses          (Member 2)
//   expense.routes.js       -> Payables & Expenses          (Member 2)
//   costing.routes.js       -> Costing & MIS                (Member 3)
//   financeReport.routes.js -> Dashboard & MIS reports      (Member 4)
//
// Every route: authenticate -> authorize(module, action) -> controller.
// Who can do what is defined in config/permissions.js - not here.
// 401 = not logged in, 403 = logged in but role not allowed.
// ============================================================================

const express = require("express");
const { authenticate, authorize } = require("../../utils/auth");
const reportCtrl = require("./controllers/financeReport.controller");
const paymentCtrl = require("./controllers/payment.controller");

const router = express.Router();

// ---------------- Dashboard & MIS reports ----------------
router.get("/dashboard", authenticate, authorize("finance", "read"), reportCtrl.dashboard);
router.get("/reports/mis", authenticate, authorize("finance", "read"), reportCtrl.mis);

// ---------------- Workflow sub-routers ----------------
router.use("/invoices", require("./routes/invoice.routes"));
router.use("/receivables", require("./routes/receivables.routes"));
router.use("/payments", require("./routes/payment.routes"));
router.use("/vendor-bills", require("./routes/vendorBill.routes"));
router.use("/expenses", require("./routes/expense.routes"));
router.use("/jobs", require("./routes/costing.routes"));

// ---------------- Nested money-movement endpoints ----------------
// Customer receipt against an invoice (kept here so the URL stays
// /api/finance/invoices/:id/receipts - same as the tested RBAC matrix).
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

module.exports = router;
