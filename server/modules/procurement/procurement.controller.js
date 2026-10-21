// server/modules/procurement/procurement.controller.js
import service from './procurement.service.js';

export async function listPRs(req, res, next) {
  try {
    const prs = await service.listPurchaseRequests();
    res.json({ success: true, data: prs });
  } catch (err) {
    next(err);
  }
}

export async function createPR(req, res, next) {
  try {
    const pr = await service.createPurchaseRequest(req.body);
    res.status(201).json({ success: true, data: pr });
  } catch (err) {
    next(err);
  }
}

export async function listPOs(req, res, next) {
  try {
    const pos = await service.listPurchaseOrders(req.query);
    res.json({ success: true, data: pos });
  } catch (err) {
    next(err);
  }
}

export async function createPO(req, res, next) {
  try {
    const po = await service.createPurchaseOrder(req.body);
    res.status(201).json({ success: true, data: po });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const updated = await service.updatePOStatus(req.params.id, status);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export default {
  listPRs,
  createPR,
  listPOs,
  createPO,
  updateStatus,
};
