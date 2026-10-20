// Services module - after-sales service tickets + technician schedule.
const prisma = require("../../utils/prisma");
const httpError = require("../../utils/httpError");

const TICKET_SELECT = {
  id: true,
  ticketNo: true,
  issue: true,
  status: true,
  serialNumber: true,
  reportedAt: true,
  resolvedAt: true,
  resolution: true,
  warrantyStart: true,
  warrantyEnd: true,
  customer: { select: { id: true, name: true, phone: true } },
  product: { select: { id: true, name: true, sku: true } },
  assignedTo: { select: { id: true, name: true } },
};

async function listTickets() {
  const rows = await prisma.serviceTicket.findMany({
    select: TICKET_SELECT,
    orderBy: { reportedAt: "desc" },
  });
  return rows.map((t) => ({
    ...t,
    customer: t.customer?.name ?? null,
    product: t.product?.name ?? null,
    assignedTo: t.assignedTo?.name ?? null,
    underWarranty:
      t.warrantyEnd ? new Date(t.warrantyEnd) >= new Date() : false,
  }));
}

async function getTicket(id) {
  const ticket = await prisma.serviceTicket.findUnique({
    where: { id: Number(id) },
    select: TICKET_SELECT,
  });
  if (!ticket) throw httpError(404, "Service ticket not found");
  return ticket;
}

// Technician schedule: open/active tickets grouped by assignee.
async function getSchedule() {
  const active = await prisma.serviceTicket.findMany({
    where: { status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS", "WAITING_PARTS"] } },
    select: TICKET_SELECT,
    orderBy: { reportedAt: "asc" },
  });

  const byTech = {};
  for (const t of active) {
    const name = t.assignedTo?.name ?? "Unassigned";
    if (!byTech[name]) byTech[name] = [];
    byTech[name].push({
      id: t.id,
      ticketNo: t.ticketNo,
      issue: t.issue,
      status: t.status,
      customer: t.customer?.name ?? null,
      reportedAt: t.reportedAt,
    });
  }
  return Object.entries(byTech).map(([technician, tickets]) => ({
    technician,
    count: tickets.length,
    tickets,
  }));
}

module.exports = { listTickets, getTicket, getSchedule };
