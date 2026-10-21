import express from 'express';
import * as employeeController from '../controllers/employeeController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, employeeController.getEmployees);
router.get('/todos', authenticate, employeeController.getDailyTodos);
router.patch('/todos/:id/toggle', authenticate, employeeController.toggleDailyTodo);
router.get('/:id', authenticate, employeeController.getEmployeeById);
router.post('/', authenticate, employeeController.createEmployee);
router.put('/:id', authenticate, employeeController.updateEmployee);

export default router;
