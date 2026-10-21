import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import dashboardRoutes from "./routes/dashboard.routes.js";
import productsRoutes from "./routes/products.routes.js";
import specificationsRoutes from "./routes/specifications.routes.js";
import bomsRoutes from "./routes/boms.routes.js";
import documentsRoutes from "./routes/documents.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";
import traceabilityRoutes from "./routes/traceability.routes.js";
import reportsRoutes from "./routes/reports.routes.js";

dotenv.config();

// Fix for BigInt JSON serialization
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    module: "Module 3: Product & Engineering Workspace",
    timestamp: new Date().toISOString(),
  });
});

// Register Module 3 API Routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/specifications", specificationsRoutes);
app.use("/api/boms", bomsRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/traceability", traceabilityRoutes);
app.use("/api/reports", reportsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server uncaught error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error occurred",
  });
});

app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(`🚀 YASH GROUP ERP - Module 3 Backend`);
  console.log(`📡 Product & Engineering Workspace API running on http://localhost:${PORT}`);
  console.log(`========================================================`);
});
