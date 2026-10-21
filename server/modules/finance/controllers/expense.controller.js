// Expense controller - vendor bills without a purchase order.
import service from "../services/expense.service.js";
import asyncHandler from "../../../utils/asyncHandler.js";

// GET /api/finance/expenses
export const list = asyncHandler(async (req, res) => {
  res.json(await service.listExpenses());
});

// POST /api/finance/expenses
export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createExpense(req.body));
});

export default { list, create };
