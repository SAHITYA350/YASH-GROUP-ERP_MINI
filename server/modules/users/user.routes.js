// Users routes - mounted at /api/users.
import express from "express";
import { authenticate, authorize } from "../../utils/auth.js";
import asyncHandler from "../../utils/asyncHandler.js";
import service from "./user.service.js";

const router = express.Router();

// GET /api/users
router.get(
  "/",
  authenticate,
  authorize("users", "read"),
  asyncHandler(async (req, res) => {
    res.json(await service.listUsers());
  })
);

// GET /api/users/:id
router.get(
  "/:id",
  authenticate,
  authorize("users", "read"),
  asyncHandler(async (req, res) => {
    res.json(await service.getUser(req.params.id));
  })
);

export default router;
