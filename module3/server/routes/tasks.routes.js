import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

// GET /api/tasks - List engineering tasks
router.get("/", async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    const where = { department: "Engineering" };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { taskNo: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        assignedTo: { select: { id: true, name: true, email: true, designation: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    res.json({ success: true, data: tasks });
  } catch (err) {
    console.error("Fetch tasks error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tasks - Create new engineering task
router.post("/", async (req, res) => {
  try {
    const { title, description, priority = "MEDIUM", dueAt, stakeholderName, roleTitle } = req.body;

    if (!title) return res.status(400).json({ success: false, error: "Task title is required" });

    // Generate task number
    const count = await prisma.task.count();
    const taskNo = `ENG-TSK-${(count + 1).toString().padStart(3, "0")}`;

    let user = await prisma.user.findFirst({ where: { department: "Engineering" } });
    if (!user) user = await prisma.user.findFirst();

    const task = await prisma.task.create({
      data: {
        taskNo,
        title: title.trim(),
        description: description || null,
        department: "Engineering",
        priority: priority || "MEDIUM",
        status: "OPEN",
        stakeholderName: stakeholderName || "Engineering R&D Team",
        roleTitle: roleTitle || "Standards & Design",
        dueAt: dueAt ? new Date(dueAt) : null,
        createdById: user.id,
        assignedToId: user.id,
      },
      include: {
        assignedTo: true,
      },
    });

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/tasks/:id - Update task status / priority / completion
router.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, priority, description, title, assignedToId } = req.body;

    const data = {
      ...(status && {
        status,
        ...(status === "COMPLETED" ? { completedAt: new Date() } : { completedAt: null }),
      }),
      ...(priority && { priority }),
      ...(description !== undefined && { description }),
      ...(title && { title }),
      ...(assignedToId && { assignedToId: parseInt(assignedToId, 10) }),
    };

    const updated = await prisma.task.update({
      where: { id },
      data,
      include: {
        assignedTo: true,
        createdBy: true,
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
