// server/modules/index.js
import express from 'express';
import { prisma } from '../lib/prisma.js';
import projectRoutes from './project/project.routes.js';
import installationRoutes from './installation/installation.routes.js';
import serviceTicketRoutes from './serviceTicket/serviceTicket.routes.js';

const router = express.Router();

// Lookups endpoint for cross-module integration (SalesOrder, Customer, Product, Users)
router.get('/lookups', async (req, res, next) => {
  try {
    const [salesOrders, customers, products, users] = await Promise.all([
      prisma.salesOrder.findMany({
        take: 50,
        orderBy: { id: 'desc' },
        include: {
          customer: { select: { id: true, name: true, phone: true, email: true } },
          items: { include: { product: { select: { id: true, name: true, sku: true } } } },
        },
      }),
      prisma.customer.findMany({
        take: 100,
        orderBy: { name: 'asc' },
        select: { id: true, name: true, phone: true, email: true, city: true },
      }),
      prisma.product.findMany({
        take: 50,
        orderBy: { name: 'asc' },
        select: { id: true, name: true, sku: true, unitOfMeasure: true },
      }),
      prisma.user.findMany({
        take: 50,
        select: { id: true, name: true, email: true, role: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        salesOrders: salesOrders.map((so) => ({
          id: so.id,
          orderNumber: so.orderNumber,
          customer: so.customer,
          deliveryLocation: so.deliveryLocation,
          productSummary: so.productSummary || so.items?.map((it) => it.product?.name).filter(Boolean).join(', '),
          approvalStatus: so.approvalStatus,
          dispatchStatus: so.dispatchStatus,
        })),
        customers,
        products,
        users,
      },
    });
  } catch (err) {
    console.error('Error fetching lookups:', err);
    res.json({
      success: true,
      data: { salesOrders: [], customers: [], products: [], users: [] },
    });
  }
});

// Tasks endpoint for Module 5 & 7 workflow
router.get('/tasks', async (req, res) => {
  try {
    const { projectId } = req.query;
    const where = {};
    if (projectId) where.projectId = Number(projectId);
    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, projectCode: true, name: true } },
      },
    });
    res.json({ success: true, data: tasks });
  } catch (e) {
    console.error('Error listing tasks:', e);
    res.json({ success: true, data: [] });
  }
});

router.post('/tasks', async (req, res) => {
  try {
    const { title, department, stakeholderName, roleTitle, linkedJob, priority, shift, dueAt, assignedToId, projectId, description } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    // Find default creator user if not specified
    const defaultUser = await prisma.user.findFirst();
    const createdById = defaultUser ? defaultUser.id : 1;

    const task = await prisma.task.create({
      data: {
        taskNo: `TSK-${Date.now().toString().slice(-6)}`,
        title: String(title).trim(),
        department: department || 'Projects',
        stakeholderName: stakeholderName || null,
        roleTitle: roleTitle || null,
        linkedJob: linkedJob || null,
        priority: priority || 'MEDIUM',
        shift: shift || 'GENERAL',
        dueAt: dueAt ? new Date(dueAt) : null,
        assignedToId: assignedToId ? Number(assignedToId) : null,
        projectId: projectId ? Number(projectId) : null,
        description: description || null,
        createdById,
      },
      include: {
        assignedTo: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });
    res.status(201).json({ success: true, data: task });
  } catch (e) {
    console.error('Error creating task:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

router.patch('/tasks/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const task = await prisma.task.update({
      where: { id },
      data: {
        status,
        ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
      },
    });
    res.json({ success: true, data: task });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Trace Endpoint for Cross-module continuity
router.get('/trace/:projectId', async (req, res) => {
  try {
    const id = Number(req.params.projectId);
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        customer: true,
        salesOrder: {
          include: {
            items: { include: { product: true } },
          },
        },
        installations: {
          include: { mediaAssets: true },
        },
        tasks: {
          include: { assignedTo: true },
        },
      },
    });

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Look for any related service tickets
    const tickets = await prisma.serviceTicket.findMany({
      where: {
        OR: [
          { customerId: project.customerId },
          { salesOrderId: project.salesOrderId },
        ],
      },
      include: { assignedTo: true, product: true },
    });

    res.json({
      success: true,
      data: {
        project,
        salesOrder: project.salesOrder,
        customer: project.customer,
        installations: project.installations,
        tasks: project.tasks,
        serviceTickets: tickets,
      },
    });
  } catch (e) {
    console.error('Trace error:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// Mount feature routers
router.use(projectRoutes);
router.use(installationRoutes);
router.use(serviceTicketRoutes);

export default router;
