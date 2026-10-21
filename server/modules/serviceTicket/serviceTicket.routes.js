// server/modules/serviceTicket/serviceTicket.routes.js
import express from 'express';
import controller from './serviceTicket.controller.js';

const router = express.Router();

// List all service tickets
router.get('/service-tickets', controller.list);

// Create a new service ticket
router.post('/service-tickets', controller.create);

// Update an existing service ticket
router.patch('/service-tickets/:id', controller.update);

export default router;
