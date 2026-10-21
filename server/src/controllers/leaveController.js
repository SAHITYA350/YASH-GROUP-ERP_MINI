import { store } from '../services/store.js';

export const getLeaveDashboard = async (req, res) => {
  try {
    const dashboard = await store.getLeaveDashboard();
    res.json({
      success: true,
      dashboard,
    });
  } catch (err) {
    console.error('[Leave Dashboard Error]', err);
    res.status(500).json({ success: false, message: 'Error retrieving leave dashboard: ' + err.message });
  }
};

export const getLeaveRequests = async (req, res) => {
  try {
    const { department, status, leaveType, employeeId, startDate, endDate, search } = req.query;
    const requests = await store.getLeaveRequests({
      department,
      status,
      leaveType,
      employeeId,
      startDate,
      endDate,
      search,
    });
    res.json({
      success: true,
      count: requests.length,
      requests,
      data: requests,
    });
  } catch (err) {
    console.error('[Leave Requests Error]', err);
    res.status(500).json({ success: false, message: 'Error retrieving leave requests: ' + err.message });
  }
};

export const getLeaveRequestById = async (req, res) => {
  try {
    const request = await store.getLeaveRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    res.json({
      success: true,
      request,
    });
  } catch (err) {
    console.error('[Leave Request Details Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getLeaveBalances = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const balances = await store.getLeaveBalances(employeeId);
    res.json({
      success: true,
      employeeId: parseInt(employeeId, 10),
      balances,
    });
  } catch (err) {
    console.error('[Leave Balances Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createLeaveRequest = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, requestedDays, reason } = req.body;
    if (!employeeId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'employeeId, startDate, and endDate are required',
      });
    }

    const newRequest = await store.createLeaveRequest(
      {
        employeeId,
        leaveType,
        startDate,
        endDate,
        requestedDays,
        reason,
      },
      req.user
    );

    res.status(201).json({
      success: true,
      message: `Leave request ${newRequest.requestId} submitted successfully. Pending manager approval.`,
      request: newRequest,
    });
  } catch (err) {
    console.error('[Create Leave Error]', err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const approveLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await store.approveLeaveRequest(id, req.user);
    res.json({
      success: true,
      message: `Leave request ${result.request.requestId} approved successfully. Leave balance updated.`,
      request: result.request,
      updatedBalances: result.updatedBalances,
    });
  } catch (err) {
    console.error('[Approve Leave Error]', err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const rejectLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'A mandatory rejection reason is required (minimum 3 characters).',
      });
    }

    const updated = await store.rejectLeaveRequest(id, reason, req.user);
    res.json({
      success: true,
      message: `Leave request ${updated.requestId} rejected.`,
      request: updated,
    });
  } catch (err) {
    console.error('[Reject Leave Error]', err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export default {
  getLeaveDashboard,
  getLeaveRequests,
  getLeaveRequestById,
  getLeaveBalances,
  createLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
};
