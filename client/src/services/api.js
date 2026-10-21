// client/src/services/api.js

export const API_BASE = 'http://localhost:5000/api';

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
