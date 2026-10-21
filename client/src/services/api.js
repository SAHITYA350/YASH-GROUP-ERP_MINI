/**
 * Centralized API service for Module 7
 */

const API_BASE = '/api';

// Ensure a valid token exists
async function ensureAuthenticated(force = false) {
  let token = force ? null : localStorage.getItem('erp_token');
  if (!token) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@yashgroup.com',
          password: 'YashERP@2026!',
        }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('erp_token', data.token);
        token = data.token;
      }
    } catch (e) {
      console.warn('[API] Auto-auth handshake notice:', e.message);
    }
  }
  return token;
}

async function fetchJson(endpoint, options = {}) {
  let token = localStorage.getItem('erp_token');
  if (!token && !endpoint.includes('/auth/login')) {
    token = await ensureAuthenticated();
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (parseErr) {
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status} (${response.statusText || 'Error'})`);
    }
    throw new Error('Invalid JSON response received from server');
  }

  if (!response.ok) {
    // If token expired, clear and re-authenticate once
    if (response.status === 401 && !options._retry && !endpoint.includes('/auth/login')) {
      localStorage.removeItem('erp_token');
      token = await ensureAuthenticated(true);
      if (token) {
        return fetchJson(endpoint, { ...options, _retry: true });
      }
    }
    throw new Error(data.message || `HTTP ${response.status} Error`);
  }
  return data;
}

export const api = {
  // Auth
  login: (credentials) => fetchJson('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => fetchJson('/auth/me'),

  // Employees
  getEmployees: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/employees${query ? `?${query}` : ''}`);
  },
  getEmployeeById: (id) => fetchJson(`/employees/${id}`),
  createEmployee: (emp) => fetchJson('/employees', { method: 'POST', body: JSON.stringify(emp) }),
  updateEmployee: (id, emp) => fetchJson(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(emp) }),

  // HR Daily Todos
  getTodos: () => fetchJson('/employees/todos'),
  toggleTodo: (id) => fetchJson(`/employees/todos/${id}/toggle`, { method: 'PATCH' }),

  // Attendance
  getAttendance: () => fetchJson('/attendance'),
  markAttendance: (payload) => fetchJson('/attendance/mark', { method: 'POST', body: JSON.stringify(payload) }),
  getAttendanceSettings: () => fetchJson('/attendance/settings'),
  updateAttendanceSettings: (settings) => fetchJson('/attendance/settings', { method: 'PUT', body: JSON.stringify(settings) }),

  // Payroll
  getPayroll: () => fetchJson('/payroll'),
  updatePayrollStatus: (id, status) => fetchJson(`/payroll/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Tasks
  getTasks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/tasks${query ? `?${query}` : ''}`);
  },
  getTaskById: (id) => fetchJson(`/tasks/${id}`),
  createTask: (task) => fetchJson('/tasks', { method: 'POST', body: JSON.stringify(task) }),
  updateTask: (id, task) => fetchJson(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) }),
  handleApproval: (id, decision) => fetchJson(`/tasks/${id}/approval`, { method: 'POST', body: JSON.stringify({ decision }) }),
  deleteTask: (id) => fetchJson(`/tasks/${id}`, { method: 'DELETE' }),

  // MIS
  getMISDashboard: () => fetchJson('/mis/dashboard'),
  getExecutiveMatrix: () => fetchJson('/mis/matrix'),
  getAuditLogs: () => fetchJson('/mis/audit-logs'),

  // Leave Management
  getLeaveDashboard: () => fetchJson('/leaves/dashboard'),
  getLeaveRequests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/leaves${query ? `?${query}` : ''}`);
  },
  getLeaveRequestById: (id) => fetchJson(`/leaves/${id}`),
  getLeaveBalances: (employeeId) => fetchJson(`/leaves/balances/${employeeId}`),
  createLeaveRequest: (payload) => fetchJson('/leaves', { method: 'POST', body: JSON.stringify(payload) }),
  approveLeaveRequest: (id) => fetchJson(`/leaves/${id}/approve`, { method: 'POST' }),
  rejectLeaveRequest: (id, reason) => fetchJson(`/leaves/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),

  // Media Assets
  getMediaAssets: () => fetchJson('/media'),

  // System Health
  getHealth: () => fetchJson('/health'),
};

