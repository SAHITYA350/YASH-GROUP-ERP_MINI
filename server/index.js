// ============================================================================
// YASH GROUP ERP - Unified API Entry Point
// ============================================================================

import "dotenv/config";
import express from "express";
import cors from "cors";

import errorHandler from "./common/errorHandler.js";
import modulesRouter from "./modules/index.js";
import financeRoutes from "./modules/finance/finance.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import leadRoutes from "./modules/leads/lead.routes.js";
import serviceRoutes from "./modules/services/service.routes.js";

// Module 7 routes
import authRoutes from "./src/routes/authRoutes.js";
import employeeRoutes from "./src/routes/employeeRoutes.js";
import attendanceRoutes from "./src/routes/attendanceRoutes.js";
import payrollRoutes from "./src/routes/payrollRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import misRoutes from "./src/routes/misRoutes.js";
import leaveRoutes from "./src/routes/leaveRoutes.js";
import mediaRoutes from "./src/routes/mediaRoutes.js";
import { checkDatabaseConnection } from "./src/config/prisma.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Comprehensive Health check endpoint
app.get("/api/health", async (req, res) => {
  let dbStatus = { connected: false, message: 'Unchecked' };
  try {
    dbStatus = await checkDatabaseConnection();
  } catch (e) {
    dbStatus = { connected: false, message: e.message };
  }
  res.status(200).json({
    success: true,
    status: "online",
    message: "YASH ERP backend is running",
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// Module 7 Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/mis", misRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/media", mediaRoutes);

// Module 6 Finance Routes
app.use("/api/finance", financeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/services", serviceRoutes);

// Module 2 & 5 Modules (Projects, Installations, Service Tickets, Vendors, Procurement, Inventory, Lookups)
app.use("/api", modulesRouter);

// Central error handler
app.use(errorHandler);

// Central 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.originalUrl}`
  });
});

app.listen(PORT, () => {
  console.log(`YASH GROUP ERP API running on http://localhost:${PORT}`);
});

export default app;
