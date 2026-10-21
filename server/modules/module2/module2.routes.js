// server/modules/module2/module2.routes.js
import express from 'express';
import service from './module2.service.js';

const router = express.Router();

// ==========================================
// 1. VENDORS
// ==========================================

router.get('/vendors', async (req, res, next) => {
  try {
    const result = await service.listVendors(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

router.get('/vendors/:id', async (req, res, next) => {
  try {
    const vendor = await service.getVendorById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.json({ success: true, data: vendor });
  } catch (err) {
    next(err);
  }
});

router.post('/vendors', async (req, res, next) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ success: false, message: 'Vendor name is required' });
    }
    const vendor = await service.createVendor(req.body);
    res.status(201).json({ success: true, data: vendor });
  } catch (err) {
    next(err);
  }
});

router.patch('/vendors/:id', async (req, res, next) => {
  try {
    const updated = await service.updateVendor(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 2. PROCUREMENT & PURCHASE ORDERS
// ==========================================

router.get('/purchase-requests', async (req, res, next) => {
  try {
    const prs = await service.listPurchaseRequests();
    res.json({ success: true, data: prs });
  } catch (err) {
    next(err);
  }
});

router.post('/purchase-requests', async (req, res, next) => {
  try {
    const pr = await service.createPurchaseRequest(req.body);
    res.status(201).json({ success: true, data: pr });
  } catch (err) {
    next(err);
  }
});

router.get('/purchase-orders', async (req, res, next) => {
  try {
    const pos = await service.listPurchaseOrders(req.query);
    res.json({ success: true, data: pos });
  } catch (err) {
    next(err);
  }
});

router.post('/purchase-orders', async (req, res, next) => {
  try {
    const po = await service.createPurchaseOrder(req.body);
    res.status(201).json({ success: true, data: po });
  } catch (err) {
    next(err);
  }
});

router.patch('/purchase-orders/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = await service.updatePOStatus(req.params.id, status);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 3. INVENTORY & GOODS RECEIPT (GRN)
// ==========================================

router.get('/inventory', async (req, res, next) => {
  try {
    const items = await service.listInventory(req.query);
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

router.get('/goods-receipts', async (req, res, next) => {
  try {
    const receipts = await service.listGoodsReceipts();
    res.json({ success: true, data: receipts });
  } catch (err) {
    next(err);
  }
});

router.post('/goods-receipts', async (req, res, next) => {
  try {
    const grn = await service.createGoodsReceipt(req.body);
    res.status(201).json({ success: true, data: grn });
  } catch (err) {
    next(err);
  }
});

router.get('/inventory-movements', async (req, res, next) => {
  try {
    const movements = await service.listInventoryMovements(req.query);
    res.json({ success: true, data: movements });
  } catch (err) {
    next(err);
  }
});

router.post('/inventory-movements', async (req, res, next) => {
  try {
    const movement = await service.recordStockMovement(req.body);
    res.status(201).json({ success: true, data: movement });
  } catch (err) {
    next(err);
  }
});

export default router;
