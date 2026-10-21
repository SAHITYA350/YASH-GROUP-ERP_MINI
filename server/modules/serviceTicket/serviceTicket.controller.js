// server/modules/serviceTicket/serviceTicket.controller.js
import service from './serviceTicket.service.js';

// List all service tickets
export async function list(req, res, next) {
  try {
    const tickets = await service.listTickets();
    res.json({ success: true, data: tickets });
  } catch (e) {
    next(e);
  }
}

// Create a new service ticket
export async function create(req, res, next) {
  try {
    const ticket = await service.createTicket(req.body);
    res.status(201).json({ success: true, data: ticket });
  } catch (e) {
    next(e);
  }
}

// Update an existing service ticket
export async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const ticket = await service.updateTicket(id, req.body);
    res.json({ success: true, data: ticket });
  } catch (e) {
    next(e);
  }
}

export default { list, create, update };
