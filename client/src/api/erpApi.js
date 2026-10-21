import { request } from "./client";

export async function fetchPageData(page, selectedOrder, params = {}) {
  if (page === "dashboard") return request("/production/dashboard");
  if (page === "orders" || page === "work-orders")
    return request("/production/orders?limit=100");
  if (page === "order-detail")
    return selectedOrder
      ? request(`/production/orders/${selectedOrder}`)
      : null;
  if (page === "planning")
    return request(
      `/production/planning/dashboard${params.from && params.to ? `?from=${encodeURIComponent(params.from)}&to=${encodeURIComponent(params.to)}` : ""}`,
    );
  if (page === "tracking")
    return selectedOrder
      ? request(`/production/orders/${selectedOrder}/tracking`)
      : request("/production/orders?limit=100");
  if (page === "workers") {
    const [allocations, workers, orders] = await Promise.all([
      request("/production/allocations"),
      request("/production/workforce"),
      request("/production/orders?limit=100"),
    ]);
    return { allocations, workers, orders: orders.orders };
  }
  if (page === "sales-orders") return request("/production/sales-orders");
  if (page === "products") return request("/production/products");
  if (page === "machines") return request("/production/machines");
  if (page === "materials")
    return selectedOrder
      ? request(`/production/orders/${selectedOrder}/material-consumption`)
      : request("/production/orders?limit=100");
  if (page === "complete") return request("/production/orders?limit=100");
  if (page === "inspections") return request("/quality/inspections?limit=100");
  if (page === "defects") {
    const [defects, inspections] = await Promise.all([
      request("/quality/defects?limit=100"),
      request("/quality/inspections?limit=100"),
    ]);
    return { ...defects, inspections: inspections.inspections };
  }
  if (page === "rework") {
    const [rework, defects, workers] = await Promise.all([
      request("/quality/rework"),
      request("/quality/defects?limit=100"),
      request("/production/workforce"),
    ]);
    return { rework, defects: defects.defects, workers };
  }
  if (page === "reports") {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, value]) => value)),
    );
    return request(`/quality/reports${query.size ? `?${query}` : ""}`);
  }
  if (page === "bom") {
    const [boms, stats] = await Promise.all([
      request("/production/bom"),
      request("/production/bom/stats"),
    ]);
    return { boms, stats };
  }
  return {};
}

export { request };
