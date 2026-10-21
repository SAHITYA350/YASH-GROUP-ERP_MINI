import express from 'express';
import * as payrollController from '../controllers/payrollController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, payrollController.getPayrollRegister);
router.patch('/:id/status', authenticate, payrollController.updatePayrollStatus);

export default router;
