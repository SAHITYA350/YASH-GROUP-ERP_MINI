import express from 'express';
import * as taskController from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, taskController.getTasks);
router.get('/:id', authenticate, taskController.getTaskById);
router.post('/', authenticate, taskController.createTask);
router.put('/:id', authenticate, taskController.updateTask);
router.post('/:id/approval', authenticate, taskController.handleApproval);
router.delete('/:id', authenticate, taskController.deleteTask);

export default router;
