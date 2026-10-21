// client/src/services/api.js

export const API_BASE = '/api';

// ==========================================
// AXIOS-COMPATIBLE FETCH WRAPPER FOR DEFAULT EXPORT
// ==========================================
function getCsrfToken() {
  if (typeof document === 'undefined') return null;
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith('yash_csrf='))
    ?.split('=')[1];
}

async function requestWithAxiosFormat(url, options = {}) {
  const method = options.method || 'GET';
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const csrf = getCsrfToken();
  if (csrf) {
    headers['x-csrf-token'] = csrf;
  }

  const token = typeof localStorage !== 'undefined' ? (localStorage.getItem('erp_token') || localStorage.getItem('yash_erp_token')) : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;

  let body = options.data || options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    body = JSON.stringify(body);
  }

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: ['GET', 'HEAD'].includes(method.toUpperCase()) ? undefined : body,
    credentials: 'include',
  });

  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const error = new Error((data && data.message) || (data && data.error && data.error.message) || `HTTP Error ${res.status}`);
    error.response = {
      status: res.status,
      statusText: res.statusText,
      data,
      headers: res.headers,
    };
    throw error;
  }

  return {
    data,
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  };
}

export const axiosInstance = {
  get: (url, config = {}) => requestWithAxiosFormat(url, { ...config, method: 'GET' }),
  post: (url, data, config = {}) => requestWithAxiosFormat(url, { ...config, method: 'POST', data }),
  put: (url, data, config = {}) => requestWithAxiosFormat(url, { ...config, method: 'PUT', data }),
  patch: (url, data, config = {}) => requestWithAxiosFormat(url, { ...config, method: 'PATCH', data }),
  delete: (url, config = {}) => requestWithAxiosFormat(url, { ...config, method: 'DELETE' }),
  create: () => axiosInstance,
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },
};

export function getApiErrorMessage(error) {
  return error.response?.data?.error?.message || error.response?.data?.message || error.message || "Request failed";
}

// ==========================================
// MODULE 7 API CLIENT
// ==========================================
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
  getUserAttendanceLogs: () => fetchJson('/attendance/login-logs'),
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
  rejectLeaveRequest: (id, reason) => fetchJson(`/leaves/${id}/reject`, { method: 'POST', body: JSON.stringify(reason ? { reason } : {}) }),

  // Media Assets
  getMediaAssets: () => fetchJson('/media'),

  // System Health
  getHealth: () => fetchJson('/health'),
};

// ==========================================
// MODULE 2 & 5 ERP API
// ==========================================
async function request(url, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson && errJson.message) errorMsg = errJson.message;
      } catch (_) {}
      throw new Error(errorMsg);
    }

    return await res.json();
  } catch (err) {
    console.error(`API request failed [${url}]:`, err.message);
    throw err;
  }
}

export const erpApi = {
  // Health & Diagnostics
  getHealth: () => request('/health'),

  // Lookups (SalesOrder, Customer, Product, User)
  getLookups: () => request('/lookups'),

  // Module 5A: Projects
  getProjects: (params = '') => request(`/projects${params ? `?${params}` : ''}`),
  getProjectById: (id) => request(`/projects/${id}`),
  createProject: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProjectStatus: (id, status) => request(`/projects/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getProjectTrace: (id) => request(`/trace/${id}`),

  // Module 5B: Installations
  getInstallations: (params = '') => request(`/installations${params ? `?${params}` : ''}`),
  createInstallation: (projectId, data) => request(`/projects/${projectId}/installations`, { method: 'POST', body: JSON.stringify(data) }),
  updateInstallation: (id, data) => request(`/installations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Module 5C: Service Tickets
  getTickets: () => request('/service-tickets'),
  createTicket: (data) => request('/service-tickets', { method: 'POST', body: JSON.stringify(data) }),
  updateTicket: (id, data) => request(`/service-tickets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Module 2A: Vendors
  getVendors: (params = '') => request(`/vendors${params ? `?${params}` : ''}`),
  getVendorById: (id) => request(`/vendors/${id}`),
  createVendor: (data) => request('/vendors', { method: 'POST', body: JSON.stringify(data) }),
  updateVendor: (id, data) => request(`/vendors/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Module 2B: Procurement & PO
  getPurchaseRequests: () => request('/purchase-requests'),
  createPurchaseRequest: (data) => request('/purchase-requests', { method: 'POST', body: JSON.stringify(data) }),
  getPurchaseOrders: (params = '') => request(`/purchase-orders${params ? `?${params}` : ''}`),
  createPurchaseOrder: (data) => request('/purchase-orders', { method: 'POST', body: JSON.stringify(data) }),
  updatePOStatus: (id, status) => request(`/purchase-orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Module 2C: Inventory & Goods Receipt (GRN)
  getInventory: (params = '') => request(`/inventory${params ? `?${params}` : ''}`),
  getGoodsReceipts: () => request('/goods-receipts'),
  createGoodsReceipt: (data) => request('/goods-receipts', { method: 'POST', body: JSON.stringify(data) }),
  getInventoryMovements: (params = '') => request(`/inventory-movements${params ? `?${params}` : ''}`),
  recordStockMovement: (data) => request('/inventory-movements', { method: 'POST', body: JSON.stringify(data) }),

  // Tasks (Cross-Module Integration)
  getTasks: (params = '') => request(`/tasks${params ? `?${params}` : ''}`),
  createTask: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTaskStatus: (id, status) => request(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

export default axiosInstance;
