// Expense controller - vendor bills without a purchase order.
const service = require("../services/expense.service");
const asyncHandler = require("../../../utils/asyncHandler");

// GET /api/finance/expenses
const list = asyncHandler(async (req, res) => {
  res.json(await service.listExpenses());
});

// POST /api/finance/expenses
const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createExpense(req.body));
});

module.exports = { list, create };
