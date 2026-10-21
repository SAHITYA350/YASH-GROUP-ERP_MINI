// server/modules/procurement/procurement.routes.js
import express from 'express';
import controller from './procurement.controller.js';

const router = express.Router();

router.get('/purchase-requests', controller.listPRs);
router.post('/purchase-requests', controller.createPR);
router.get('/purchase-orders', controller.listPOs);
router.post('/purchase-orders', controller.createPO);
router.patch('/purchase-orders/:id/status', controller.updateStatus);

export default router;
