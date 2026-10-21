import { prisma } from '../config/prisma.js';

// Support BigInt serialization for JSON responses
if (typeof BigInt !== 'undefined') {
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };
}

// In-Memory Module State for Features Not Yet in Shared Schema (Leave Requests & Attendance Settings)
const moduleLocalState = {
  attendanceSettings: {
    workStartTime: '09:30',
    graceBufferMinutes: 10,
    workEndTime: '18:30',
    requireGeofence: false,
    officeAddress: 'YASH Group HQ - Sector 4, Industrial Area',
  },
  hrDailyTodos: [
    {
      id: 1,
      title: 'Verify shop floor shift logs',
      description: 'Review biometric attendance reconciliation with shift supervisor',
      completed: false,
      urgency: 'high',
      tag: 'Shift Check',
    },
    {
      id: 2,
      title: 'Review overtime authorization',
      description: 'Check machine operator OT logs for laser cutting batch',
      completed: false,
      urgency: 'warning',
      tag: 'OT Review',
    },
  ],
  leaveRequests: [],
};

let nextLeaveId = 1;

export const store = {
  // ==========================================
  // EMPLOYEES & WORKFORCE REGISTER (POSTGRESQL)
  // ==========================================
  getEmployees: async (filters = {}) => {
    if (!prisma) {
      throw new Error('Database disconnected: PrismaClient is not available');
    }

    const where = {};
    if (filters.department && filters.department !== 'All') {
      where.department = filters.department;
    }
    if (filters.status && filters.status !== 'All') {
      if (filters.status === 'Active') where.isActive = true;
      if (filters.status === 'Inactive') where.isActive = false;
    }
    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { employeeCode: { contains: filters.search, mode: 'insensitive' } },
        { department: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        attendance: {
          take: 1,
          orderBy: { workDate: 'desc' },
        },
      },
      orderBy: { id: 'asc' },
    });

    return employees.map((emp) => {
      const latestAtt = emp.attendance[0];
      return {
        id: emp.id,
        employeeCode: emp.employeeCode || `EMP-${String(emp.id).padStart(3, '0')}`,
        fullName: emp.fullName,
        department: emp.department || 'Operations',
        designation: emp.designation || 'Staff',
        employmentType: emp.employmentType || 'Full-time',
        shift: 'General',
        salary: emp.salary ? Number(emp.salary) : 0,
        todayAttendance: latestAtt?.status === 'PRESENT' ? 'Present' : 'Absent',
        attendanceRate: 100,
        taskCompletionRate: 0,
        targetAchievementRate: 0,
        qualityScore: 100,
        currentWork: emp.designation || 'Operational Role',
        isActive: emp.isActive ?? true,
      };
    });
  },

  getEmployeeById: async (id) => {
    if (!prisma) {
      throw new Error('Database disconnected: PrismaClient is not available');
    }
    const numId = Number(id);
    return await prisma.employee.findUnique({
      where: { id: numId },
      include: { attendance: { take: 10, orderBy: { workDate: 'desc' } } },
    });
  },

  createEmployee: async (data, user) => {
    if (!prisma) {
      throw new Error('Database disconnected: Cannot persist employee record');
    }

    const employeeCode = data.employeeCode || `EMP-${Date.now().toString().slice(-4)}`;
    return await prisma.employee.create({
      data: {
        employeeCode,
        fullName: data.fullName,
        department: data.department || 'Operations',
        designation: data.designation || 'Staff',
        employmentType: data.employmentType || 'Full-time',
        salary: data.salary ? Number(data.salary) : 0,
        isActive: true,
      },
    });
  },

  updateEmployee: async (id, data, user) => {
    if (!prisma) {
      throw new Error('Database disconnected: Cannot update employee record');
    }
    const numId = Number(id);
    return await prisma.employee.update({
      where: { id: numId },
      data: {
        fullName: data.fullName,
        department: data.department,
        designation: data.designation,
        employmentType: data.employmentType,
        salary: data.salary ? Number(data.salary) : undefined,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
      },
    });
  },

  // ==========================================
  // HR DAILY TODOS (OPERATIONAL QUEUE)
  // ==========================================
  getTodos: async () => {
    return moduleLocalState.hrDailyTodos;
  },

  toggleTodo: async (id) => {
    const todo = moduleLocalState.hrDailyTodos.find((t) => t.id === Number(id));
    if (todo) {
      todo.completed = !todo.completed;
      return todo;
    }
    return null;
  },

  // ==========================================
  // TASKS, ROLES & APPROVAL WORKFLOWS (POSTGRESQL)
  // ==========================================
  getTasks: async (filters = {}) => {
    if (!prisma) {
      throw new Error('Database disconnected: PrismaClient is not available');
    }

    const where = {};
    if (filters.department && filters.department !== 'All') {
      where.department = filters.department;
    }
    if (filters.status && filters.status !== 'All') {
      where.status = filters.status;
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { taskNo: { contains: filters.search, mode: 'insensitive' } },
        { stakeholderName: { contains: filters.search, mode: 'insensitive' } },
        { linkedJob: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { id: 'desc' },
      take: 100,
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
        assignedTo: { select: { id: true, name: true, role: true } },
      },
    });

    return tasks.map((t) => ({
      id: t.id,
      taskNo: t.taskNo,
      department: t.department || 'Operations',
      stakeholderName: t.stakeholderName || t.assignedTo?.name || 'Unassigned',
      roleTitle: t.roleTitle || t.assignedTo?.role || 'Staff',
      linkedJob: t.linkedJob || '',
      title: t.title,
      targetMetric: t.targetMetric || '',
      priority: t.priority || 'MEDIUM',
      status: t.status || 'OPEN',
      dueAt: t.dueAt ? t.dueAt.toISOString().slice(0, 10) : 'Today',
      shift: t.shift || 'GENERAL',
      evidenceUrl: t.evidenceUrl || '',
      description: t.description || '',
    }));
  },

  getTaskById: async (id) => {
    if (!prisma) {
      throw new Error('Database disconnected: PrismaClient is not available');
    }
    const numId = Number(id);
    return await prisma.task.findUnique({
      where: { id: numId },
      include: { createdBy: true, assignedTo: true },
    });
  },

  createTask: async (data, user) => {
    if (!prisma) {
      throw new Error('Database disconnected: Cannot persist task record');
    }

    // Map priority and status to Prisma enum values
    let priority = 'MEDIUM';
    if (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(data.priority)) {
      priority = data.priority;
    }

    let status = 'IN_PROGRESS';
    if (['OPEN', 'IN_PROGRESS', 'BLOCKED', 'WAITING_APPROVAL', 'COMPLETED', 'CANCELLED'].includes(data.status)) {
      status = data.status;
    }

    const taskNo = `TSK-${Date.now().toString().slice(-4)}`;
    const createdById = user?.id ? Number(user.id) : 1;

    return await prisma.task.create({
      data: {
        taskNo,
        title: data.title,
        department: data.department || 'Operations',
        stakeholderName: data.stakeholderName || user?.name || 'Staff Member',
        roleTitle: data.roleTitle || 'Executive',
        linkedJob: data.linkedJob || null,
        targetMetric: data.targetMetric || null,
        priority,
        status,
        dueAt: data.dueAt ? new Date(data.dueAt) : null,
        shift: 'GENERAL',
        evidenceUrl: data.evidenceUrl || null,
        description: data.description || null,
        createdById,
      },
    });
  },

  updateTask: async (id, data, user) => {
    if (!prisma) {
      throw new Error('Database disconnected: Cannot update task');
    }
    const numId = Number(id);
    const updateData = {};
    if (data.title) updateData.title = data.title;
    if (data.department) updateData.department = data.department;
    if (data.stakeholderName) updateData.stakeholderName = data.stakeholderName;
    if (data.roleTitle) updateData.roleTitle = data.roleTitle;
    if (data.priority) updateData.priority = data.priority;
    if (data.status) updateData.status = data.status;
    if (data.description !== undefined) updateData.description = data.description;

    return await prisma.task.update({
      where: { id: numId },
      data: updateData,
    });
  },

  handleApproval: async (id, decision, user) => {
    if (!prisma) {
      throw new Error('Database disconnected: Cannot update task approval');
    }
    const numId = Number(id);
    const nextStatus = decision === 'APPROVE' ? 'COMPLETED' : 'CANCELLED';
    return await prisma.task.update({
      where: { id: numId },
      data: {
        status: nextStatus,
        completedAt: decision === 'APPROVE' ? new Date() : null,
      },
    });
  },

  deleteTask: async (id, user) => {
    if (!prisma) {
      throw new Error('Database disconnected: Cannot delete task');
    }
    const numId = Number(id);
    await prisma.task.delete({ where: { id: numId } });
    return true;
  },

  // ==========================================
  // ATTENDANCE REGISTER (POSTGRESQL)
  // ==========================================
  getAttendance: async () => {
    if (!prisma) {
      throw new Error('Database disconnected: PrismaClient is not available');
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.attendance.findMany({
      where: { workDate: today },
      include: { employee: true },
    });
  },

  markAttendance: async (payload, user) => {
    if (!prisma) {
      throw new Error('Database disconnected: Cannot mark attendance');
    }

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const empId = Number(payload.employeeId);

    return await prisma.attendance.upsert({
      where: {
        employeeId_workDate: {
          employeeId: empId,
          workDate: todayDate,
        },
      },
      update: {
        status: payload.status || 'PRESENT',
        checkIn: payload.checkIn ? new Date(payload.checkIn) : new Date(),
        checkOut: payload.checkOut ? new Date(payload.checkOut) : undefined,
        hoursWorked: payload.hoursWorked ? Number(payload.hoursWorked) : undefined,
      },
      create: {
        employeeId: empId,
        workDate: todayDate,
        status: payload.status || 'PRESENT',
        checkIn: payload.checkIn ? new Date(payload.checkIn) : new Date(),
        checkOut: payload.checkOut ? new Date(payload.checkOut) : null,
        hoursWorked: payload.hoursWorked ? Number(payload.hoursWorked) : 0,
      },
    });
  },

  getAttendanceSettings: async () => {
    return moduleLocalState.attendanceSettings;
  },

  updateAttendanceSettings: async (settings, user) => {
    moduleLocalState.attendanceSettings = { ...moduleLocalState.attendanceSettings, ...settings };
    return moduleLocalState.attendanceSettings;
  },

  // ==========================================
  // PAYROLL (CALCULATED FROM POSTGRESQL WORKFORCE)
  // ==========================================
  getPayroll: async () => {
    // Calculated dynamically based on live employee records in PostgreSQL
    if (!prisma) {
      throw new Error('Database disconnected: Cannot compute payroll register');
    }
    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      include: {
        attendance: { take: 30, orderBy: { workDate: 'desc' } },
      },
      orderBy: { id: 'asc' },
    });

    return employees.map((emp) => {
      const basicSalary = emp.salary ? Number(emp.salary) : 0;
      const presentDays = emp.attendance.filter((a) => a.status === 'PRESENT').length;
      return {
        id: emp.id,
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        department: emp.department || 'Operations',
        designation: emp.designation || 'Staff',
        basicSalary,
        daysWorked: presentDays,
        paymentStatus: 'CALCULATED',
        payPeriod: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      };
    });
  },

  updatePayrollStatus: async (id, status, user) => {
    return { id: Number(id), status, updatedAt: new Date().toISOString() };
  },

  // ==========================================
  // MANAGEMENT MIS (CALCULATED FROM LIVE DB)
  // ==========================================
  getMISDashboard: async () => {
    if (!prisma) {
      throw new Error('Database disconnected: PrismaClient is not available');
    }

    const [empCount, tasks, salesOrders, invoices, payments] = await Promise.all([
      prisma.employee.count({ where: { isActive: true } }),
      prisma.task.findMany({ select: { id: true, status: true } }),
      prisma.salesOrder.findMany({ select: { totalAmount: true, status: true } }),
      prisma.invoice.findMany({ select: { totalAmount: true, status: true } }),
      prisma.payment.aggregate({ _sum: { amount: true } }),
    ]);

    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
    const taskOnTimePct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    const totalOrders = salesOrders.length;
    const completedOrders = salesOrders.filter((o) => o.status === 'COMPLETED' || o.status === 'DELIVERED').length;
    const totalSales = salesOrders.reduce((sum, o) => sum + (o.totalAmount ? Number(o.totalAmount) : 0), 0);
    const totalInvoiced = invoices.reduce((sum, i) => sum + (i.totalAmount ? Number(i.totalAmount) : 0), 0);
    const totalCollected = payments._sum?.amount ? Number(payments._sum.amount) : 0;

    const orderOnTimePct = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
    const collectionPct = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

    return {
      kpis: {
        salesTarget: {
          value: totalSales > 0 ? `₹${(totalSales / 100000).toFixed(1)}L` : '₹0.0L',
          subtitle: `Orders: ${totalOrders} registered in DB`,
          color: 'blue',
        },
        grossMargin: {
          value: totalSales > 0 ? 'Live DB' : '0.0%',
          subtitle: totalSales > 0 ? 'Aggregated from sales' : 'No sales records',
          color: 'green',
        },
        orderOnTime: {
          value: `${orderOnTimePct}%`,
          subtitle: `${completedOrders}/${totalOrders} Completed`,
          color: 'orange',
        },
        collection: {
          value: `${collectionPct}%`,
          subtitle: totalInvoiced > 0 ? `₹${(totalCollected / 100000).toFixed(1)}L Collected` : 'No Invoices',
          color: 'purple',
        },
        workforce: {
          value: `${empCount} Active`,
          subtitle: `${empCount} Registered Employees`,
          color: 'blue',
        },
      },
      healthScorecard: [
        { metric: 'Order fulfillment', percentage: orderOnTimePct, target: '90%' },
        { metric: 'Payment collection', percentage: collectionPct, target: '80%' },
        { metric: 'Workforce registered', percentage: empCount > 0 ? 100 : 0, target: '95%' },
        { metric: 'Task on-time rate', percentage: taskOnTimePct, target: '85%' },
      ],
      decisionFeed: [],
    };
  },

  getDecisionFeed: async () => {
    // Generate verified operational alerts based strictly on live PostgreSQL conditions
    const alerts = [];
    if (prisma) {
      try {
        const pendingTasks = await prisma.task.count({ where: { status: 'WAITING_APPROVAL' } });
        if (pendingTasks > 0) {
          alerts.push({
            id: 1,
            category: 'Task Approval',
            title: `${pendingTasks} Task(s) Awaiting Management Sign-off`,
            impact: 'Action required in Task Queue',
            urgency: 'HIGH',
            timeAgo: 'Live',
            department: 'Operations',
            status: 'PENDING',
          });
        }

        const unpaidInvoices = await prisma.invoice.count({ where: { status: 'ISSUED' } });
        if (unpaidInvoices > 0) {
          alerts.push({
            id: 2,
            category: 'Payment Follow-up',
            title: `${unpaidInvoices} Customer Invoice(s) Pending Settlement`,
            impact: 'Working capital recovery',
            urgency: 'MEDIUM',
            timeAgo: 'Live',
            department: 'Finance',
            status: 'PENDING',
          });
        }
      } catch (e) {
        console.warn('[Store] Decision feed query notice:', e.message);
      }
    }
    return alerts;
  },

  getExecutiveMatrix: async () => {
    // Built from real projects and work orders in the database
    if (!prisma) return [];
    try {
      const orders = await prisma.salesOrder.findMany({
        take: 20,
        orderBy: { id: 'desc' },
        include: { customer: { select: { name: true } } },
      });
      return orders.map((o) => ({
        id: o.id,
        jobCode: o.orderNumber || `SO-${o.id}`,
        clientName: o.customer?.name || 'Enterprise Customer',
        description: `Order ${o.orderNumber || o.id} - ${o.status}`,
        stage: o.status,
        targetDate: o.deliveryDate ? o.deliveryDate.toISOString().slice(0, 10) : 'Pending',
        completionPct: o.status === 'COMPLETED' || o.status === 'DELIVERED' ? 100 : 50,
        status: o.status === 'CONFIRMED' || o.status === 'PROCESSING' ? 'ON_TRACK' : o.status,
        priority: 'HIGH',
        manager: 'Assigned Officer',
      }));
    } catch (e) {
      console.warn('[Store] Executive matrix query notice:', e.message);
      return [];
    }
  },

  getAuditLogs: async () => {
    if (!prisma) {
      throw new Error('Database disconnected: PrismaClient is not available');
    }
    const logs = await prisma.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true } } },
    });
    return logs.map((l) => ({
      id: Number(l.id),
      userName: l.user?.name || 'System User',
      action: l.action,
      entityType: l.entityType,
      entityId: l.entityId,
      before: l.before,
      after: l.after,
      ipAddress: l.ipAddress || '127.0.0.1',
      createdAt: l.createdAt,
    }));
  },

  // ==========================================
  // LEAVE MANAGEMENT (SCHEMA GAP - DOCUMENTED MODULE QUEUE)
  // ==========================================
  getLeaveDashboard: async () => {
    const totalRequests = moduleLocalState.leaveRequests.length;
    const pendingApprovals = moduleLocalState.leaveRequests.filter((r) => r.status === 'PENDING').length;
    const approvedRequests = moduleLocalState.leaveRequests.filter((r) => r.status === 'APPROVED').length;
    const rejectedRequests = moduleLocalState.leaveRequests.filter((r) => r.status === 'REJECTED').length;

    return {
      totalRequests,
      pendingApprovals,
      approvedRequests,
      rejectedRequests,
      onLeaveTodayCount: 0,
      employeesOnLeaveToday: [],
      upcomingSchedule: [],
      databaseStatus: 'Module Queue Active (LeaveRequest table not present in shared DB schema)',
    };
  },

  getLeaveRequests: async (filters = {}) => {
    let list = [...moduleLocalState.leaveRequests];
    if (filters.status && filters.status !== 'All') {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters.department && filters.department !== 'All') {
      list = list.filter((r) => r.department === filters.department);
    }
    return list;
  },

  getLeaveRequestById: async (id) => {
    return moduleLocalState.leaveRequests.find((r) => r.id === Number(id)) || null;
  },

  getLeaveBalances: async (employeeId) => {
    return {
      CASUAL: { allocated: 12, used: 0, available: 12 },
      SICK: { allocated: 10, used: 0, available: 10 },
      EARNED: { allocated: 15, used: 0, available: 15 },
    };
  },

  createLeaveRequest: async (data, user) => {
    const req = {
      id: nextLeaveId++,
      requestId: `LR-${Date.now().toString().slice(-4)}`,
      employeeId: Number(data.employeeId),
      employeeName: user?.name || 'Staff Member',
      department: data.department || 'Operations',
      leaveType: data.leaveType || 'CASUAL',
      startDate: data.startDate,
      endDate: data.endDate,
      requestedDays: Number(data.requestedDays) || 1,
      reason: data.reason || 'Personal necessity',
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
    };
    moduleLocalState.leaveRequests.unshift(req);
    return req;
  },

  approveLeaveRequest: async (id, user) => {
    const req = moduleLocalState.leaveRequests.find((r) => r.id === Number(id));
    if (req) {
      req.status = 'APPROVED';
      req.reviewedBy = user?.name || 'Manager';
      req.reviewedAt = new Date().toISOString();
      return { request: req, updatedBalances: { CASUAL: { available: 11 } } };
    }
    throw new Error('Leave request not found');
  },

  rejectLeaveRequest: async (id, reason, user) => {
    const req = moduleLocalState.leaveRequests.find((r) => r.id === Number(id));
    if (req) {
      req.status = 'REJECTED';
      req.rejectionReason = reason;
      req.reviewedBy = user?.name || 'Manager';
      req.reviewedAt = new Date().toISOString();
      return req;
    }
    throw new Error('Leave request not found');
  },

  // ==========================================
  // MEDIA ASSETS (POSTGRESQL)
  // ==========================================
  getMediaAssets: async () => {
    if (!prisma) {
      throw new Error('Database disconnected: PrismaClient is not available');
    }
    const assets = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        uploadedBy: { select: { id: true, name: true, email: true, department: true } },
        workOrder: { select: { id: true, workOrderNo: true } },
        project: { select: { id: true, name: true } },
      },
    });
    return assets.map((a) => ({
      id: a.id,
      title: a.title,
      type: a.type,
      linkedEntity: a.workOrder?.workOrderNo || a.project?.name || 'General',
      size: a.fileSize ? `${(Number(a.fileSize) / (1024 * 1024)).toFixed(1)} MB` : '1.0 MB',
      updatedAt: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'N/A',
      url: a.storageKey || '#',
      department: a.uploadedBy?.department || 'Operations',
      isApproved: a.isApproved,
    }));
  },
};

export default store;
