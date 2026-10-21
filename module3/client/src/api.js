const API_BASE = "http://localhost:5003/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || `HTTP Error ${res.status}`);
    }
    return json.data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Dashboard
  getDashboard: () => request("/dashboard"),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products?${query}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) => request("/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  cloneProduct: (id) => request(`/products/${id}/clone`, { method: "POST" }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),

  // Specifications
  getSpecifications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/specifications?${query}`);
  },
  createSpecification: (data) => request("/specifications", { method: "POST", body: JSON.stringify(data) }),
  updateSpecification: (id, data) => request(`/specifications/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // BOMs
  getBOMs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/boms?${query}`);
  },
  getBOM: (id) => request(`/boms/${id}`),
  createBOM: (data) => request("/boms", { method: "POST", body: JSON.stringify(data) }),
  updateBOM: (id, data) => request(`/boms/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  explodeBOM: (id, batchQuantity = 1) => request(`/boms/${id}/explosion?batchQuantity=${batchQuantity}`),
  simulateBOMCost: (id, simData) => request(`/boms/${id}/simulate`, { method: "POST", body: JSON.stringify(simData) }),
  getBOMShortages: (id, orderQuantity = 100) => request(`/boms/${id}/shortages?orderQuantity=${orderQuantity}`),

  // Documents
  getDocuments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/documents?${query}`);
  },
  createDocument: (data) => request("/documents", { method: "POST", body: JSON.stringify(data) }),
  updateDocument: (id, data) => request(`/documents/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteDocument: (id) => request(`/documents/${id}`, { method: "DELETE" }),

  // Tasks
  getTasks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/tasks?${query}`);
  },
  createTask: (data) => request("/tasks", { method: "POST", body: JSON.stringify(data) }),
  updateTask: (id, data) => request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  // Traceability
  getTraceability: (skuOrId) => request(`/traceability/${encodeURIComponent(skuOrId)}`),

  // Reports
  getProductSummaryReport: () => request("/reports/products-summary"),
  getBOMCostingReport: () => request("/reports/bom-costing"),
};
