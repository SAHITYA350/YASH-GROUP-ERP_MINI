import "dotenv/config";
import express from "express";
import cors from "cors";

import errorHandler from "./common/errorHandler.js";
import modulesRouter from "./modules/index.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "YASH ERP backend is running",
    timestamp: new Date().toISOString()
  });
});

// Primary modules (Module 2 & Module 5)
app.use("/api", modulesRouter);

// Safely mount team dev modules if their dependencies are present
try {
  const finance = await import("./modules/finance/finance.routes.js");
  if (finance?.default) app.use("/api/finance", finance.default);
} catch (_) {}

try {
  const users = await import("./modules/users/user.routes.js");
  if (users?.default) app.use("/api/users", users.default);
} catch (_) {}

try {
  const leads = await import("./modules/leads/lead.routes.js");
  if (leads?.default) app.use("/api/leads", leads.default);
} catch (_) {}

try {
  const services = await import("./modules/services/service.routes.js");
  if (services?.default) app.use("/api/services", services.default);
} catch (_) {}

// Central Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found"
  });
});

app.listen(PORT, () => {
  console.log(`YASH ERP backend running at http://localhost:${PORT}`);
});
