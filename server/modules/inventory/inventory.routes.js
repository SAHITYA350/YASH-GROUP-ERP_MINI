// server/modules/inventory/inventory.routes.js
import express from 'express';
import controller from './inventory.controller.js';

const router = express.Router();

router.get('/inventory', controller.listInventory);
router.get('/goods-receipts', controller.listGRNs);
router.post('/goods-receipts', controller.createGRN);
router.get('/inventory-movements', controller.listMovements);
router.post('/inventory-movements', controller.recordMovement);

export default router;
