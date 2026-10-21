import express from 'express';
import * as attendanceController from '../controllers/attendanceController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, attendanceController.getAttendanceRegister);
router.post('/mark', authenticate, attendanceController.markAttendance);
router.get('/settings', authenticate, attendanceController.getSettings);
router.put('/settings', authenticate, attendanceController.updateSettings);

export default router;
