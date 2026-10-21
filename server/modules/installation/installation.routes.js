// server/modules/installation/installation.routes.js
import express from "express";
import controller from "./installation.controller.js";

const router = express.Router();

// List all installations
router.get("/installations", controller.list);

// Create installation for a project
router.post("/projects/:projectId/installations", controller.create);

// Update installation status/details
router.patch("/installations/:id", controller.patch);

export default router;
