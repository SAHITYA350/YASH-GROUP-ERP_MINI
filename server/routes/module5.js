import express from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

const projectStatuses = [
  "DRAFT", "SURVEY_PENDING", "PLANNED", "IN_PROGRESS",
  "ON_HOLD", "COMPLETED", "CANCELLED"
];

const installationStatuses = [
  "NOT_REQUIRED", "SURVEY_DUE", "PLANNED", "SCHEDULED",
  "IN_PROGRESS", "TESTING", "HANDOVER_PENDING", "COMPLETED", "BLOCKED"
];

const serviceStatuses = [
  "OPEN", "ASSIGNED", "IN_PROGRESS", "WAITING_PARTS",
  "RESOLVED", "CLOSED"
];

const makeCode = (prefix) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;

const toId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

// PROJECTS

router.get("/projects", async (req, res) => {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      salesOrder: true,
      owner: { select: { id: true, name: true, email: true } },
      installations: true,
      tasks: true
    }
  });
  res.json({ success: true, data: projects });
});

router.get("/projects/:id", async (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "Invalid project ID" });

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      customer: true,
      salesOrder: true,
      owner: { select: { id: true, name: true, email: true } },
      installations: true,
      tasks: true,
      mediaAssets: true
    }
  });

  if (!project) return res.status(404).json({ success: false, message: "Project not found" });
  res.json({ success: true, data: project });
});

router.post("/projects", async (req, res) => {
  const { name, customerId, salesOrderId, ownerId, siteName, siteAddress,
    plannedStart, plannedEnd, surveyDate, notes } = req.body;

  if (!name || !String(name).trim() || !toId(customerId) || !toId(salesOrderId)) {
    return res.status(400).json({
      success: false,
      message: "name, valid customerId and valid salesOrderId are required"
    });
  }

  if (ownerId != null && !toId(ownerId)) {
    return res.status(400).json({ success: false, message: "Invalid ownerId" });
  }

  const project = await prisma.project.create({
    data: {
      projectCode: makeCode("PRJ"),
      name: String(name).trim(),
      customerId: toId(customerId),
      salesOrderId: toId(salesOrderId),
      ownerId: ownerId == null ? null : toId(ownerId),
      siteName: siteName || null,
      siteAddress: siteAddress || undefined,
      plannedStart: plannedStart ? new Date(plannedStart) : null,
      plannedEnd: plannedEnd ? new Date(plannedEnd) : null,
      surveyDate: surveyDate ? new Date(surveyDate) : null,
      notes: notes || null
    },
    include: { customer: true, salesOrder: true }
  });

  res.status(201).json({ success: true, data: project });
});

router.patch("/projects/:id/status", async (req, res) => {
  const id = toId(req.params.id);
  const { status } = req.body;

  if (!id) return res.status(400).json({ success: false, message: "Invalid project ID" });
  if (!projectStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid project status", allowed: projectStatuses });
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      status,
      ...(status === "IN_PROGRESS" ? { actualStart: new Date() } : {}),
      ...(status === "COMPLETED" ? { actualEnd: new Date() } : {})
    }
  });

  res.json({ success: true, data: project });
});

// INSTALLATIONS

router.get("/installations", async (req, res) => {
  const installations = await prisma.installation.findMany({
    orderBy: { createdAt: "desc" },
    include: { project: { include: { customer: true } }, mediaAssets: true }
  });
  res.json({ success: true, data: installations });
});

router.post("/projects/:projectId/installations", async (req, res) => {
  const projectId = toId(req.params.projectId);
  if (!projectId) return res.status(400).json({ success: false, message: "Invalid project ID" });

  const { scheduledAt, notes } = req.body;
  const installation = await prisma.installation.create({
    data: {
      installationNo: makeCode("INS"),
      projectId,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      notes: notes || null
    },
    include: { project: true }
  });

  res.status(201).json({ success: true, data: installation });
});

router.patch("/installations/:id", async (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "Invalid installation ID" });

  const { status, scheduledAt, notes, customerSignoffName, testResults } = req.body;
  if (status !== undefined && !installationStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid installation status", allowed: installationStatuses });
  }

  const data = {};
  if (status !== undefined) data.status = status;
  if (scheduledAt !== undefined) data.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
  if (notes !== undefined) data.notes = notes;
  if (customerSignoffName !== undefined) {
    data.customerSignoffName = customerSignoffName;
    data.customerSignedAt = customerSignoffName ? new Date() : null;
  }
  if (testResults !== undefined) data.testResults = testResults;

  if (status === "IN_PROGRESS") data.startedAt = new Date();
  if (status === "COMPLETED") data.completedAt = new Date();

  const installation = await prisma.installation.update({
    where: { id },
    data,
    include: { project: true }
  });

  res.json({ success: true, data: installation });
});

// SERVICE TICKETS

router.get("/service-tickets", async (req, res) => {
  const tickets = await prisma.serviceTicket.findMany({
    orderBy: { reportedAt: "desc" },
    include: {
      customer: true,
      product: true,
      assignedTo: { select: { id: true, name: true, email: true } }
    }
  });
  res.json({ success: true, data: tickets });
});

router.post("/service-tickets", async (req, res) => {
  const { customerId, issue, assignedToId, productId, salesOrderId,
    serialNumber, warrantyStart, warrantyEnd } = req.body;

  if (!toId(customerId) || !issue || !String(issue).trim()) {
    return res.status(400).json({
      success: false,
      message: "Valid customerId and issue are required"
    });
  }

  for (const [field, value] of Object.entries({ assignedToId, productId, salesOrderId })) {
    if (value != null && !toId(value)) {
      return res.status(400).json({ success: false, message: `Invalid ${field}` });
    }
  }

  const ticket = await prisma.serviceTicket.create({
    data: {
      ticketNo: makeCode("SRV"),
      customerId: toId(customerId),
      issue: String(issue).trim(),
      assignedToId: assignedToId == null ? null : toId(assignedToId),
      productId: productId == null ? null : toId(productId),
      salesOrderId: salesOrderId == null ? null : toId(salesOrderId),
      serialNumber: serialNumber || null,
      warrantyStart: warrantyStart ? new Date(warrantyStart) : null,
      warrantyEnd: warrantyEnd ? new Date(warrantyEnd) : null
    },
    include: { customer: true, product: true }
  });

  res.status(201).json({ success: true, data: ticket });
});

router.patch("/service-tickets/:id", async (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "Invalid ticket ID" });

  const { status, assignedToId, resolution } = req.body;
  if (status !== undefined && !serviceStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid service status", allowed: serviceStatuses });
  }
  if (assignedToId != null && !toId(assignedToId)) {
    return res.status(400).json({ success: false, message: "Invalid assignedToId" });
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

  const ticket = await prisma.serviceTicket.update({
    where: { id },
    data,
    include: { customer: true, product: true }
  });

  res.json({ success: true, data: ticket });
});

router.use((err, req, res, next) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ success: false, message: "A record with that unique value already exists" });
    }
    if (err.code === "P2003") {
      return res.status(400).json({ success: false, message: "A related customer, order, product, user or project does not exist" });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
  }

  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

export default router;
