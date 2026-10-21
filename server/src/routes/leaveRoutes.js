import express from 'express';
import * as leaveController from '../controllers/leaveController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// All leave routes require authentication
router.use(authenticate);

// Leave metrics dashboard
router.get('/dashboard', leaveController.getLeaveDashboard);

// Leave balances for an employee
router.get('/balances/:employeeId', leaveController.getLeaveBalances);

// Leave requests list and details
router.get('/', leaveController.getLeaveRequests);
router.get('/:id', leaveController.getLeaveRequestById);

// Submit new leave request
router.post('/', leaveController.createLeaveRequest);

// Manager/Admin Approval and Rejection workflows (Role-Guarded)
router.post('/:id/approve', authorizeRoles('ADMIN', 'HR_MANAGER'), leaveController.approveLeaveRequest);
router.post('/:id/reject', authorizeRoles('ADMIN', 'HR_MANAGER'), leaveController.rejectLeaveRequest);

export default router;
