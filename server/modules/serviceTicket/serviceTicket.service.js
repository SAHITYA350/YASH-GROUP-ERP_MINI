// server/modules/serviceTicket/serviceTicket.service.js
import repository from './serviceTicket.repository.js';
import { makeCode, toId } from '../../common/utils.js';

export const serviceStatuses = ["OPEN", "ASSIGNED", "IN_PROGRESS", "WAITING_PARTS", "RESOLVED", "CLOSED"];

// List service tickets
export async function listTickets(query = {}) {
  try {
    const where = {};
    if (query.status && serviceStatuses.includes(query.status)) {
      where.status = query.status;
    }
    if (query.customerId) {
      const cid = toId(query.customerId);
      if (cid) where.customerId = cid;
    }
    return repository.findMany({ where, orderBy: { reportedAt: 'desc' } });
  } catch (e) {
    console.error("Error listing tickets:", e);
    return [];
  }
}

// Create a new service ticket
export async function createTicket(data) {
  return repository.create({
    ticketNo: makeCode("SRV"),
    customerId: toId(data.customerId),
    issue: String(data.issue).trim(),
    assignedToId: data.assignedToId == null ? null : toId(data.assignedToId),
    productId: data.productId == null ? null : toId(data.productId),
    salesOrderId: data.salesOrderId == null ? null : toId(data.salesOrderId),
    serialNumber: data.serialNumber || null,
    warrantyStart: data.warrantyStart ? new Date(data.warrantyStart) : null,
    warrantyEnd: data.warrantyEnd ? new Date(data.warrantyEnd) : null,
  });
}

// Update an existing service ticket
export async function updateTicket(id, body) {
  const nid = toId(id);
  const { status, assignedToId, resolution } = body;
  if (status !== undefined && !serviceStatuses.includes(status)) {
    throw new Error(`Invalid service status: ${status}`);
  }
  if (assignedToId != null && !toId(assignedToId)) {
    throw new Error(`Invalid assignedToId`);
  }

  const data = {};
  if (status !== undefined) {
    data.status = status;
    if (status === "RESOLVED" || status === "CLOSED") data.resolvedAt = new Date();
  }
  if (assignedToId !== undefined) {
    data.assignedToId = assignedToId == null ? null : toId(assignedToId);
    if (assignedToId != null && status === undefined) data.status = "ASSIGNED";
  }
  if (resolution !== undefined) data.resolution = resolution;

  return repository.update(nid, data);
}

export default { listTickets, createTicket, updateTicket, serviceStatuses };
