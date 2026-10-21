import prisma from "../Config/prisma.js";

const validDate = (value, fallback) => {
  const date = value ? new Date(value) : fallback;
  if (Number.isNaN(date.getTime())) throw new Error("Planning date is invalid.");
  return date;
};
const windowFromQuery = (query = {}) => {
  const from = validDate(query.from, new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const to = validDate(query.to, new Date(from.getTime() + 30 * 86400000));
  if (to < from) throw new Error("The planning end date must be after its start date.");
  return { from, to };
};
const dayKey = (date) => date.toISOString().slice(0, 10);

export const getPlanningDashboard = async (query = {}) => {
  const { from, to } = windowFromQuery(query);
  const dateFilter = { plannedStart: { lte: to }, plannedEnd: { gte: from } };
  const [orders, approvalQueue, machines, demand] = await Promise.all([
    prisma.workOrder.findMany({ where: { ...dateFilter, status: { notIn: ["COMPLETED", "CANCELLED"] } }, include: { salesOrder: { select: { orderNumber: true, expectedDeliveryDate: true, customer: { select: { name: true } }, items: { include: { product: { select: { id: true, name: true, sku: true } } } } } }, machineAssignments: { where: { AND: [{ OR: [{ startAt: null }, { startAt: { lte: to } }] }, { OR: [{ endAt: null }, { endAt: { gte: from } }] }] }, include: { machine: true } } }, orderBy: [{ priority: "desc" }, { plannedEnd: "asc" }] }),
    prisma.workOrder.findMany({ where: { planApprovalStatus: { in: ["DRAFT", "PENDING", "REJECTED"] }, status: { in: ["DRAFT", "PLANNED"] } }, include: { salesOrder: { select: { orderNumber: true, customer: { select: { name: true } } } } }, orderBy: { updatedAt: "asc" } }),
    prisma.machine.findMany({ include: { assignments: { where: { AND: [{ OR: [{ startAt: null }, { startAt: { lte: to } }] }, { OR: [{ endAt: null }, { endAt: { gte: from } }] }] }, include: { workOrder: { select: { id: true, workOrderNo: true, plannedQuantity: true, plannedStart: true, plannedEnd: true, status: true } } } }, _count: { select: { assignments: true } } }, orderBy: { machineCode: "asc" } }),
    getDemandForecast({ from: from.toISOString(), to: to.toISOString() }),
  ]);
  const calendar = await getProductionCalendar({ from: from.toISOString(), to: to.toISOString() });
  const active = orders.filter((order) => ["RELEASED", "IN_PROGRESS", "MATERIAL_HOLD", "QC_HOLD"].includes(order.status));
  const overdue = orders.filter((order) => order.plannedEnd < new Date() && order.status !== "COMPLETED");
  return { range: { from, to }, summary: { scheduledOrders: orders.length, overdue: overdue.length, activeOrders: active.length, pendingApprovals: approvalQueue.filter((order) => order.planApprovalStatus === "PENDING").length, demandUnits: demand.totalDemand, plannedUnits: orders.reduce((sum, order) => sum + Number(order.plannedQuantity), 0) }, orders, approvalQueue, demand, capacity: summarizeCapacity(machines, orders, from, to), calendar };
};

export const getProductionCalendar = async (query = {}) => {
  const { from, to } = windowFromQuery(query);
  const orders = await prisma.workOrder.findMany({ where: { plannedStart: { lte: to }, plannedEnd: { gte: from }, status: { not: "CANCELLED" } }, include: { salesOrder: { select: { orderNumber: true, customer: { select: { name: true } } } } }, orderBy: { plannedStart: "asc" } });
  const days = new Map();
  for (const order of orders) {
    const start = new Date(Math.max(new Date(order.plannedStart).getTime(), from.getTime()));
    const end = new Date(Math.min(new Date(order.plannedEnd).getTime(), to.getTime()));
    for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const key = dayKey(date);
      if (!days.has(key)) days.set(key, []);
      days.get(key).push({ id: order.id, workOrderNo: order.workOrderNo, status: order.status, priority: order.priority, plannedQuantity: Number(order.plannedQuantity), salesOrder: order.salesOrder });
    }
  }
  return { range: { from, to }, days: [...days].map(([date, entries]) => ({ date, count: entries.length, entries })) };
};

export const getDemandForecast = async (query = {}) => {
  const { from, to } = windowFromQuery(query);
  const salesOrders = await prisma.salesOrder.findMany({ where: { status: { in: ["CONFIRMED", "PROCESSING", "READY_FOR_DISPATCH"] }, expectedDeliveryDate: { gte: from, lte: to } }, include: { customer: { select: { name: true } }, items: { include: { product: { select: { id: true, sku: true, name: true, unitOfMeasure: true, isManufactured: true, inventory: { select: { physicalQuantity: true, reservedQuantity: true } } } } } }, workOrders: { where: { status: { notIn: ["CANCELLED"] } }, select: { plannedQuantity: true, bomRevision: { select: { productId: true } } } } }, orderBy: { expectedDeliveryDate: "asc" } });
  const products = new Map();
  for (const order of salesOrders) for (const item of order.items) {
    if (!item.product.isManufactured) continue;
    const demand = Number(item.quantity);
    const planned = order.workOrders.filter((workOrder) => workOrder.bomRevision?.productId === item.productId || (!workOrder.bomRevision && order.items.length === 1)).reduce((sum, workOrder) => sum + Number(workOrder.plannedQuantity), 0);
    const availableStock = Math.max(0, Number(item.product.inventory?.physicalQuantity || 0) - Number(item.product.inventory?.reservedQuantity || 0));
    const record = products.get(item.productId) || { productId: item.productId, sku: item.product.sku, product: item.product.name, unit: item.product.unitOfMeasure, demand: 0, planned: 0, availableStock, remaining: 0, orders: 0 };
    record.demand += demand; record.planned += planned; record.remaining = Math.max(0, record.demand - record.planned - record.availableStock); record.orders += 1;
    products.set(item.productId, record);
  }
  const forecast = [...products.values()].sort((a, b) => b.remaining - a.remaining);
  return { range: { from, to }, totalDemand: forecast.reduce((sum, row) => sum + row.demand, 0), totalPlanned: forecast.reduce((sum, row) => sum + row.planned, 0), totalRemaining: forecast.reduce((sum, row) => sum + row.remaining, 0), products: forecast };
};

const summarizeCapacity = (machines, orders, from, to) => machines.map((machine) => {
  const assigned = machine.assignments.filter((assignment) => orders.some((order) => order.id === assignment.workOrder.id));
  const plannedLoad = assigned.reduce((sum, assignment) => sum + Number(assignment.workOrder.plannedQuantity), 0);
  const capacity = Number(machine.capacityPerShift || 0);
  const windowDays = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86400000) + 1);
  const availableCapacity = capacity * windowDays;
  return { id: machine.id, machineCode: machine.machineCode, name: machine.name, workCenter: machine.workCenter, status: machine.status, capacityPerShift: capacity, availableCapacity, windowDays, assignedOrders: assigned.length, plannedLoad, utilizationPercent: availableCapacity > 0 ? Math.min(999, Math.round(plannedLoad / availableCapacity * 100)) : null };
});

export const getProductionCapacity = async (query = {}) => {
  const { from, to } = windowFromQuery(query);
  const [machines, orders] = await Promise.all([
    prisma.machine.findMany({
      include: {
        assignments: {
          where: { AND: [{ OR: [{ startAt: null }, { startAt: { lte: to } }] }, { OR: [{ endAt: null }, { endAt: { gte: from } }] }] },
          include: { workOrder: { select: { id: true, workOrderNo: true, plannedQuantity: true, plannedStart: true, plannedEnd: true, status: true } } },
        },
      },
      orderBy: { machineCode: "asc" },
    }),
    prisma.workOrder.findMany({ where: { plannedStart: { lte: to }, plannedEnd: { gte: from }, status: { notIn: ["COMPLETED", "CANCELLED"] } }, select: { id: true, plannedQuantity: true } }),
  ]);
  return { range: { from, to }, machines: summarizeCapacity(machines, orders, from, to), unassignedOrders: orders.filter((order) => !machines.some((machine) => machine.assignments.some((assignment) => assignment.workOrder.id === order.id))).length };
};

export const updatePlanApproval = async (workOrderId, data, userId) => {
  const id = Number(workOrderId);
  if (!Number.isInteger(id) || id < 1) throw new Error("Work order ID must be a positive integer.");
  const order = await prisma.workOrder.findUnique({ where: { id } });
  if (!order) throw new Error("Work order not found.");
  if (!["DRAFT", "PLANNED"].includes(order.status)) throw new Error("Only draft or planned work orders can change plan approval.");
  const action = data.action;
  if (action === "SUBMIT") {
    if (!["DRAFT", "REJECTED"].includes(order.planApprovalStatus)) throw new Error("Only a draft or rejected plan can be submitted for approval.");
    if (!order.plannedStart || !order.plannedEnd) throw new Error("Set both the planned start date and deadline before submitting the plan.");
    return prisma.workOrder.update({ where: { id }, data: { planApprovalStatus: "PENDING", planApprovalNotes: data.notes || null, planApprovedById: null, planApprovedAt: null } });
  }
  if (action === "APPROVE") {
    if (order.planApprovalStatus !== "PENDING") throw new Error("Only pending plans can be approved.");
    return prisma.workOrder.update({ where: { id }, data: { planApprovalStatus: "APPROVED", planApprovalNotes: data.notes || order.planApprovalNotes, planApprovedById: userId ? Number(userId) : null, planApprovedAt: new Date(), status: order.status === "DRAFT" ? "PLANNED" : order.status } });
  }
  if (action === "REJECT") {
    if (order.planApprovalStatus !== "PENDING") throw new Error("Only pending plans can be rejected.");
    if (!data.notes?.trim()) throw new Error("Provide a reason when rejecting a production plan.");
    return prisma.workOrder.update({ where: { id }, data: { planApprovalStatus: "REJECTED", planApprovalNotes: data.notes.trim(), planApprovedById: null, planApprovedAt: null } });
  }
  throw new Error("Action must be SUBMIT, APPROVE, or REJECT.");
};
