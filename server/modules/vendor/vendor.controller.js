// server/modules/vendor/vendor.controller.js
import service from './vendor.service.js';

export async function list(req, res, next) {
  try {
    const result = await service.listVendors(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    const vendor = await service.getVendorById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.json({ success: true, data: vendor });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    if (!req.body.name) {
      return res.status(400).json({ success: false, message: 'Vendor name is required' });
    }
    const vendor = await service.createVendor(req.body);
    res.status(201).json({ success: true, data: vendor });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const updated = await service.updateVendor(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export default { list, get, create, update };
