// server/modules/project/project.routes.js
import express from "express";
import controller from "./project.controller.js";
import { missingFields } from "../../common/validation.js";

const router = express.Router();

function validateProject(req, res, next) {
  const required = ['name', 'customerId'];
  const missing = missingFields(req.body, required);
  if (missing.length) {
    return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
  }
  next();
}

router.get("/projects", controller.list);
router.get("/projects/:id", controller.get);
router.post("/projects", validateProject, controller.create);
router.patch("/projects/:id/status", controller.patchStatus);

export default router;
