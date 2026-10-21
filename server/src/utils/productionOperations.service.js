import prisma from "../Config/prisma.js";

const id = (value, label = "ID") => {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw new Error(`${label} must be a positive integer.`);
  return n;
};
const qty = (value, label = "Quantity") => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`${label} must be greater than zero.`);
  return n;
};
const validDate = (value, label) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error(`${label} is invalid.`);
  return d;
};

export const listMachines = (filters = {}) => prisma.machine.findMany({
  where: { ...(filters.status ? { status: filters.status } : {}), ...(filters.workCenter ? { workCenter: filters.workCenter } : {}) },
  include: { _count: { select: { assignments: true, operationLogs: true } } }, orderBy: { machineCode: "asc" },
});

export const saveMachine = async (data, machineId) => {
  const payload = {};
  if (machineId === undefined) {
    if (!data.machineCode?.trim() || !data.name?.trim()) throw new Error("Machine code and name are required.");
    payload.machineCode = data.machineCode.trim().toUpperCase();
    payload.name = data.name.trim();
  }
  for (const key of ["name", "workCenter", "status", "notes"]) if (data[key] !== undefined) payload[key] = data[key]?.trim?.() || (key === "name" ? data[key] : null);
  if (data.capacityPerShift !== undefined) payload.capacityPerShift = data.capacityPerShift === null ? null : qty(data.capacityPerShift, "Capacity per shift");
  if (data.hourlyCost !== undefined) {
    const cost = Number(data.hourlyCost);
    if (!Number.isFinite(cost) || cost < 0) throw new Error("Hourly cost cannot be negative.");
    payload.hourlyCost = cost;
  }
  if (machineId === undefined) return prisma.machine.create({ data: payload });
  const existing = await prisma.machine.findUnique({ where: { id: id(machineId, "Machine ID") } });
  if (!existing) throw new Error("Machine not found.");
  if (data.status && data.status !== "AVAILABLE") {
    const active = await prisma.machineAssignment.count({ where: { machineId: existing.id, endAt: null } });
    if (active) throw new Error("End the active machine assignment before changing its availability.");
  }
  return prisma.machine.update({ where: { id: existing.id }, data: payload });
};

export const listWorkforce = async () => prisma.user.findMany({
  where: { isActive: true, role: { in: ["PRODUCTION_MANAGER", "QUALITY_INSPECTOR", "ENGINEER"] } },
  select: { id: true, name: true, email: true, employeeCode: true, designation: true, department: true, role: true, shift: true },
  orderBy: { name: "asc" },
});

export const listProductionSalesOrders = () => prisma.salesOrder.findMany({
  where: { status: { notIn: ["CANCELLED", "COMPLETED"] } },
  select: { id: true, orderNumber: true, status: true, customer: { select: { name: true } }, items: { select: { productId: true, productNameSnapshot: true, productSkuSnapshot: true, quantity: true } } },
  orderBy: { orderDate: "desc" }, take: 200,
});

export const listManufacturedProducts = () => prisma.product.findMany({
  where: { isManufactured: true, isActive: true },
  select: { id: true, sku: true, name: true, unitOfMeasure: true }, orderBy: { name: "asc" },
});

export const allocateWorker = async (workOrderId, data) => {
  const woId = id(workOrderId, "Work order ID");
  const userId = id(data.userId, "Worker ID");
  const startAt = validDate(data.startAt, "Start date");
  const endAt = validDate(data.endAt, "End date");
  if (startAt && endAt && endAt <= startAt) throw new Error("Allocation end must be after its start.");
  return prisma.$transaction(async (tx) => {
    const [wo, user] = await Promise.all([
      tx.workOrder.findUnique({ where: { id: woId } }), tx.user.findUnique({ where: { id: userId } }),
    ]);
    if (!wo) throw new Error("Work order not found.");
    if (!user?.isActive) throw new Error("Active worker not found.");
    if (["COMPLETED", "CANCELLED"].includes(wo.status)) throw new Error("Cannot allocate a worker to a closed work order.");
    if (startAt && endAt) {
      const collision = await tx.workerAllocation.findFirst({ where: { userId, startAt: { lt: endAt }, endAt: { gt: startAt } } });
      if (collision) throw new Error("This worker already has an overlapping production allocation.");
    }
    return tx.workerAllocation.create({ data: {
      workOrderId: woId, userId, operationName: data.operationName || null, shift: data.shift || user.shift,
      allocatedHours: data.allocatedHours ? qty(data.allocatedHours, "Allocated hours") : null,
      startAt, endAt, notes: data.notes || null,
    }, include: { user: { select: { id: true, name: true, employeeCode: true, role: true } }, workOrder: { select: { id: true, workOrderNo: true } } } });
  }, { isolationLevel: "Serializable" });
};

export const removeWorkerAllocation = async (allocationId) => {
  const existing = await prisma.workerAllocation.findUnique({ where: { id: id(allocationId, "Allocation ID") } });
  if (!existing) throw new Error("Worker allocation not found.");
  return prisma.workerAllocation.delete({ where: { id: existing.id } });
};

export const assignMachine = async (workOrderId, data) => {
  const woId = id(workOrderId, "Work order ID");
  const machineId = id(data.machineId, "Machine ID");
  const startAt = validDate(data.startAt, "Start date");
  const endAt = validDate(data.endAt, "End date");
  if (startAt && endAt && endAt <= startAt) throw new Error("Assignment end must be after its start.");
  return prisma.$transaction(async (tx) => {
    const [wo, machine] = await Promise.all([tx.workOrder.findUnique({ where: { id: woId } }), tx.machine.findUnique({ where: { id: machineId } })]);
    if (!wo) throw new Error("Work order not found.");
    if (!machine) throw new Error("Machine not found.");
    if (machine.status === "MAINTENANCE" || machine.status === "OFFLINE") throw new Error("Machine is not available for production.");
    if (["COMPLETED", "CANCELLED"].includes(wo.status)) throw new Error("Cannot assign a machine to a closed work order.");
    if (startAt && endAt) {
      const collision = await tx.machineAssignment.findFirst({ where: { machineId, startAt: { lt: endAt }, endAt: { gt: startAt } } });
      if (collision) throw new Error("This machine already has an overlapping assignment.");
    }
    await tx.machine.update({ where: { id: machineId }, data: { status: "IN_USE" } });
    return tx.machineAssignment.create({ data: { workOrderId: woId, machineId, startAt, endAt, notes: data.notes || null }, include: { machine: true, workOrder: { select: { id: true, workOrderNo: true } } } });
  }, { isolationLevel: "Serializable" });
};

export const removeMachineAssignment = async (assignmentId) => {
  const assignment = await prisma.machineAssignment.findUnique({ where: { id: id(assignmentId, "Assignment ID") } });
  if (!assignment) throw new Error("Machine assignment not found.");
  return prisma.$transaction(async (tx) => {
    const deleted = await tx.machineAssignment.delete({ where: { id: assignment.id } });
    const activeAssignments = await tx.machineAssignment.count({ where: { machineId: assignment.machineId, endAt: null } });
    if (!activeAssignments) await tx.machine.updateMany({ where: { id: assignment.machineId, status: "IN_USE" }, data: { status: "AVAILABLE" } });
    return deleted;
  });
};

export const recordProduction = async (workOrderId, data, userId) => {
  const woId = id(workOrderId, "Work order ID");
  const quantity = qty(data.quantity);
  const downtimeMinutes = Number(data.downtimeMinutes ?? 0);
  if (!Number.isInteger(downtimeMinutes) || downtimeMinutes < 0) throw new Error("Downtime minutes must be a non-negative integer.");
  return prisma.$transaction(async (tx) => {
    const wo = await tx.workOrder.findUnique({ where: { id: woId } });
    if (!wo) throw new Error("Work order not found.");
    if (!["RELEASED", "IN_PROGRESS"].includes(wo.status)) throw new Error("Production can only be recorded for a released or in-progress work order.");
    if (Number(wo.producedQuantity) + quantity > Number(wo.plannedQuantity)) throw new Error("Reported production quantity exceeds the work order plan.");
    let machineId = null;
    if (data.machineId) {
      machineId = id(data.machineId, "Machine ID");
      const machine = await tx.machine.findUnique({ where: { id: machineId } });
      if (!machine) throw new Error("Machine not found.");
      if (["MAINTENANCE", "OFFLINE"].includes(machine.status)) throw new Error("Machine is not available for production.");
      const assignment = await tx.machineAssignment.findFirst({ where: { workOrderId: woId, machineId, endAt: null } });
      if (!assignment) throw new Error("Assign this machine to the work order before recording production against it.");
    }
    let operationLogId;
    if (data.operationLogId || data.operationName) {
      let operation;
      if (data.operationLogId) {
        operation = await tx.operationLog.findUnique({ where: { id: id(data.operationLogId, "Operation ID") } });
        if (!operation || operation.workOrderId !== woId) throw new Error("Operation does not belong to this work order.");
        if (operation.status === "COMPLETED") throw new Error("Cannot record output against a completed routing operation.");
        operation = await tx.operationLog.update({ where: { id: operation.id }, data: { status: "IN_PROGRESS", ...(machineId ? { machineId } : {}) } });
      } else {
        if (!data.operationName?.trim()) throw new Error("Operation name is required when creating an ad hoc operation.");
        operation = await tx.operationLog.create({ data: { workOrderId: woId, operationName: data.operationName.trim(), sequence: Number(data.sequence) || 1, status: "IN_PROGRESS", machineId, startedAt: new Date() } });
      }
      operationLogId = operation.id;
    }
    const entry = await tx.productionEntry.create({ data: { workOrderId: woId, operationLogId, recordedById: userId ? id(userId, "User ID") : null, quantity, downtimeMinutes, notes: data.notes || null } });
    if (operationLogId) await tx.operationLog.update({ where: { id: operationLogId }, data: { goodQuantity: { increment: quantity }, downtimeMinutes: { increment: downtimeMinutes } } });
    await tx.workOrder.update({ where: { id: woId }, data: { producedQuantity: { increment: quantity }, status: "IN_PROGRESS", actualStart: wo.actualStart || new Date() } });
    return entry;
  }, { isolationLevel: "Serializable" });
};

export const getProductionTracking = async (workOrderId) => {
  const woId = id(workOrderId, "Work order ID");
  const workOrder = await prisma.workOrder.findUnique({ where: { id: woId }, include: {
    productionEntries: { orderBy: { recordedAt: "desc" }, include: { operationLog: true, recordedBy: { select: { id: true, name: true } } } },
    operationLogs: { orderBy: { sequence: "asc" }, include: { machine: true, entries: true } },
    machineAssignments: { where: { endAt: null }, include: { machine: true }, orderBy: { startAt: "asc" } },
  } });
  if (!workOrder) throw new Error("Work order not found.");
  return workOrder;
};

export const updateOperationStatus = async (operationId, status) => {
  const opId = id(operationId, "Operation ID");
  const allowed = { PENDING: ["IN_PROGRESS", "BLOCKED"], IN_PROGRESS: ["COMPLETED", "BLOCKED"], BLOCKED: ["IN_PROGRESS"], COMPLETED: [] };
  return prisma.$transaction(async (tx) => {
    const operation = await tx.operationLog.findUnique({ where: { id: opId } });
    if (!operation) throw new Error("Operation not found.");
    if (!allowed[operation.status]?.includes(status)) throw new Error(`Cannot transition operation from ${operation.status} to ${status}.`);
    const updated = await tx.operationLog.update({ where: { id: opId }, data: { status, ...(status === "COMPLETED" ? { completedAt: new Date() } : {}) }, include: { machine: true, workOrder: { select: { workOrderNo: true } } } });
    if (status === "COMPLETED" && operation.machineId) {
      await tx.machineAssignment.updateMany({ where: { workOrderId: operation.workOrderId, machineId: operation.machineId, endAt: null }, data: { endAt: new Date() } });
      const remaining = await tx.machineAssignment.count({ where: { machineId: operation.machineId, endAt: null } });
      if (!remaining) await tx.machine.updateMany({ where: { id: operation.machineId, status: "IN_USE" }, data: { status: "AVAILABLE" } });
    }
    return updated;
  });
};

export const consumeWorkOrderMaterial = async (workOrderId, items, userId) => {
  const woId = id(workOrderId, "Work order ID");
  if (!Array.isArray(items) || !items.length) throw new Error("Add at least one material consumption line.");
  const lineIds = items.map((line) => id(line.workOrderItemId, "Work order item ID"));
  if (new Set(lineIds).size !== lineIds.length) throw new Error("Each work order item may only appear once in a consumption entry.");
  return prisma.$transaction(async (tx) => {
    const wo = await tx.workOrder.findUnique({ where: { id: woId }, include: { items: true } });
    if (!wo) throw new Error("Work order not found.");
    if (!["RELEASED", "IN_PROGRESS", "QC_HOLD"].includes(wo.status)) throw new Error("Material can only be consumed on an active work order.");
    const results = [];
    for (const line of items) {
      const rowId = id(line.workOrderItemId, "Work order item ID");
      const amount = qty(line.quantity, "Consumed quantity");
      const row = wo.items.find((item) => item.id === rowId);
      if (!row) throw new Error(`Work order item ${rowId} is not part of this work order.`);
      if (Number(row.consumedQuantity) + amount > Number(row.issuedQuantity)) throw new Error(`Consumption exceeds issued material for item ${rowId}.`);
      await tx.workOrderItem.update({ where: { id: rowId }, data: { consumedQuantity: { increment: amount } } });
      results.push(await tx.materialConsumption.create({ data: { workOrderItemId: rowId, recordedById: userId ? id(userId, "User ID") : null, quantity: amount, notes: line.notes || null } }));
    }
    return results;
  }, { isolationLevel: "Serializable" });
};

export const getMaterialConsumption = async (workOrderId) => {
  const woId = id(workOrderId, "Work order ID");
  const workOrder = await prisma.workOrder.findUnique({ where: { id: woId }, include: { items: { include: {
    product: { select: { id: true, sku: true, name: true, unitOfMeasure: true } },
    consumptions: { orderBy: { consumedAt: "desc" }, include: { recordedBy: { select: { name: true } } } },
  } } } });
  if (!workOrder) throw new Error("Work order not found.");
  return workOrder;
};

export const getProductionWorkforceSummary = () => prisma.workerAllocation.findMany({
  include: { user: { select: { id: true, name: true, employeeCode: true, role: true } }, workOrder: { select: { id: true, workOrderNo: true, status: true, plannedStart: true, plannedEnd: true } } },
  orderBy: [{ startAt: "asc" }, { createdAt: "desc" }],
});
