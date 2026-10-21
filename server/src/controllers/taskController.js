import store from '../services/store.js';

export const getTasks = async (req, res) => {
  try {
    const { department, status, priority, search } = req.query;
    const taskList = await store.getTasks({ department, status, priority, search });

    const openTasks = taskList.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
    const dueToday = taskList.filter((t) => t.status === 'DUE_TODAY' || (t.dueAt && t.dueAt.includes('Today'))).length;
    const highCritical = taskList.filter((t) => t.priority === 'HIGH' || t.priority === 'CRITICAL').length;
    const shopFloor = taskList.filter((t) => t.department === 'Production' || t.department === 'Quality').length;

    res.json({
      success: true,
      summary: {
        openTasks,
        dueToday,
        highCritical,
        shopFloor,
        onTimeCloseRate: taskList.length > 0 
          ? Math.round((taskList.filter((t) => t.status === 'COMPLETED').length / taskList.length) * 100) 
          : 0,
      },
      data: taskList,
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await store.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, department, stakeholderName, roleTitle, linkedJob, targetMetric, priority, status, dueAt, shift, evidenceUrl, description } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }
    const created = await store.createTask(
      {
        title,
        department: department || (req.user ? req.user.department : 'Operations'),
        stakeholderName: stakeholderName || (req.user ? req.user.name : 'Staff Member'),
        roleTitle: roleTitle || 'Executive',
        linkedJob: linkedJob || null,
        targetMetric: targetMetric || null,
        priority: priority || 'MEDIUM',
        status: status || 'IN_PROGRESS',
        dueAt: dueAt || null,
        shift: shift || 'GENERAL',
        evidenceUrl: evidenceUrl || null,
        description: description || null,
      },
      req.user
    );

    res.status(201).json({ success: true, message: 'Task created successfully', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const updated = await store.updateTask(req.params.id, req.body, req.user);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task assignment updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const handleApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision } = req.body; // 'APPROVE' or 'REJECT'
    const updated = await store.handleApproval(id, decision, req.user);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({
      success: true,
      message: `Task ${decision === 'APPROVE' ? 'approved and completed' : 'rejected'}`,
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const success = await store.deleteTask(req.params.id, req.user);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  handleApproval,
  deleteTask,
};
