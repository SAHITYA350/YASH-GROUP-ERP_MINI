import express from 'express';
import * as misController from '../controllers/misController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', authenticate, misController.getDashboard);
router.get('/matrix', authenticate, misController.getExecutiveMatrix);
router.get('/audit-logs', authenticate, misController.getAuditLogs);

export default router;
