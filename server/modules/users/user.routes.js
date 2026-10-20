// Users routes - mounted at /api/users.
const express = require("express");
const { authenticate, authorize } = require("../../utils/auth");
const asyncHandler = require("../../utils/asyncHandler");
const service = require("./user.service");

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

module.exports = router;
