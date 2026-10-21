// server/modules/inventory/inventory.controller.js
import service from './inventory.service.js';

export async function listInventory(req, res, next) {
  try {
    const items = await service.listInventory(req.query);
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

export async function listGRNs(req, res, next) {
  try {
    const receipts = await service.listGoodsReceipts();
    res.json({ success: true, data: receipts });
  } catch (err) {
    next(err);
  }
}

export async function createGRN(req, res, next) {
  try {
    const grn = await service.createGoodsReceipt(req.body);
    res.status(201).json({ success: true, data: grn });
  } catch (err) {
    next(err);
  }
}

export async function listMovements(req, res, next) {
  try {
    const movements = await service.listInventoryMovements(req.query);
    res.json({ success: true, data: movements });
  } catch (err) {
    next(err);
  }
}

export async function recordMovement(req, res, next) {
  try {
    const movement = await service.recordStockMovement(req.body);
    res.status(201).json({ success: true, data: movement });
  } catch (err) {
    next(err);
  }
}

export default {
  listInventory,
  listGRNs,
  createGRN,
  listMovements,
  recordMovement,
};
