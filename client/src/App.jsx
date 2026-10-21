import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import { request } from "./api/client";
import { fetchPageData } from "./api/erpApi";
import { modalTitles } from "./constants/navigation";
import AppLayout from "./components/layout/AppLayout";
import EntityModal from "./components/forms/EntityModal";
import {
  Dashboard,
  OrderList,
  OrderDetails,
  Planning,
  Tracking,
  Workers,
  Machines,
  Materials,
  Completion,
} from "./components/pages/ProductionPages";
import {
  Inspections,
  Defects,
  Rework,
  QualityReports,
  BomList,
} from "./components/pages/QualityPages";

function App() {
  const [page, setPage] = useState("dashboard");
  const [data, setData] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState("");
  const [selectedOrder, setSelectedOrder] = useState("");
  const [editingOrder, setEditingOrder] = useState(null);
  const [ordersCache, setOrdersCache] = useState([]);
  const [filters, setFilters] = useState({ status: "", query: "" });

  const load = useCallback(
    async (target = page, params = {}) => {
      setError("");
      try {
        const result = await fetchPageData(target, selectedOrder, params);
        if (Array.isArray(result?.orders)) setOrdersCache(result.orders);
        setData((current) => ({ ...current, [target]: result }));
      } catch (e) {
        setData((current) => ({ ...current, [target]: null }));
        setError(
          e.message.includes("Failed to fetch") || e.message === "Network Error"
            ? "API is offline. Start the server and configure its database to load live ERP records."
            : e.message,
        );
      }
    },
    [page, selectedOrder],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void load(page);
    }, 0);
    return () => clearTimeout(timer);
  }, [load, page]);
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 3600);
    return () => clearTimeout(timer);
  }, [notice]);

  async function save(
    path,
    body,
    method = "POST",
    success = "Saved successfully.",
  ) {
    setBusy(true);
    try {
      await request(path, { method, body });
      setNotice(success);
      setModal("");
      await load(page);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  const current = data[page];
  const filteredOrders = useMemo(() => {
    const orders = Array.isArray(current?.orders) ? current.orders : [];
    return orders.filter(
      (order) =>
        (!filters.status || order.status === filters.status) &&
        (!filters.query ||
          `${order.workOrderNo} ${order.salesOrder?.orderNumber || ""} ${order.salesOrder?.customer?.name || ""}`
            .toLowerCase()
            .includes(filters.query.toLowerCase())),
    );
  }, [current, filters]);

  const orderOptions = (
    ordersCache.length
      ? ordersCache
      : data.orders?.orders || data["work-orders"]?.orders || []
  ).map((order) => ({
    value: order.id,
    label: `${order.workOrderNo} · ${order.salesOrder?.orderNumber || "Sales order"}`,
  }));
  return (
    <AppLayout
      page={page}
      onNavigate={(target) => {
        setPage(target);
        setError("");
      }}
      pendingInspections={data.dashboard?.quality?.byStatus?.PENDING || 0}
      error={error}
      notice={notice}
      onRetry={() => load(page)}
      onDismissError={() => setError("")}
      onDismissNotice={() => setNotice("")}
      onNotify={() => setNotice("You are all caught up.")}
      overlay={
        <EntityModal
          modal={modal}
          modalTitle={modalTitles[modal]}
          busy={busy}
          save={save}
          data={data}
          orderOptions={orderOptions}
          selectedOrder={selectedOrder}
          setError={setError}
          setModal={setModal}
          editingOrder={editingOrder}
        />
      }
    >
          {page === "dashboard" && (
            <Dashboard
              data={current}
              onNavigate={setPage}
              onRefresh={() => load("dashboard")}
            />
          )}
          {(page === "orders" || page === "work-orders") && (
            <OrderList
              page={page}
              result={current}
              orders={filteredOrders}
              filters={filters}
              setFilters={setFilters}
              onCreate={() => {
                load("orders");
                load("sales-orders");
                setModal("order");
              }}
              onSelect={(id) => {
                setSelectedOrder(String(id));
                setPage("order-detail");
              }}
              onEdit={(order) => {
                setEditingOrder(order);
                setModal("editOrder");
              }}
              onTrack={(id) => {
                setSelectedOrder(String(id));
                setPage("tracking");
              }}
              onComplete={(id) =>
                save(
                  `/production/orders/${id}`,
                  { status: "COMPLETED" },
                  "PATCH",
                  "Work order completed and goods received into inventory.",
                )
              }
            />
          )}
          {page === "order-detail" && (
            <OrderDetails
              result={current}
              onBack={() => setPage("orders")}
              onTrack={() => setPage("tracking")}
            />
          )}
          {page === "planning" && (
            <Planning
              result={current}
              onRefresh={(range) => load("planning", range)}
              onCreate={() => {
                load("orders");
                load("sales-orders");
                setModal("order");
              }}
              onUpdate={(id, payload) =>
                save(
                  `/production/orders/${id}`,
                  payload,
                  "PATCH",
                  "Production plan updated.",
                )
              }
              onApprovalAction={(id, action, notes) =>
                save(
                  `/production/orders/${id}/plan-approval`,
                  { action, notes },
                  "PATCH",
                  "Plan approval updated.",
                )
              }
            />
          )}
          {page === "tracking" && (
            <Tracking
              result={current}
              orders={current?.orders || data.orders?.orders || []}
              selected={selectedOrder}
              setSelected={setSelectedOrder}
              onTrack={() => {
                load("machines");
                setModal("tracking");
              }}
              onAssignMachine={() => {
                load("machines");
                setModal("assignMachine");
              }}
              onOperationStatus={(id, status) =>
                save(
                  `/production/operations/${id}`,
                  { status },
                  "PATCH",
                  "Operation status updated.",
                )
              }
              onRefresh={() => load("tracking")}
            />
          )}
          {page === "workers" && (
            <Workers
              result={current}
              workers={current?.workers || []}
              orders={current?.orders || []}
              onAllocate={() => setModal("worker")}
              onRefresh={() => load("workers")}
              onRemove={(id) =>
                save(
                  `/production/allocations/${id}`,
                  null,
                  "DELETE",
                  "Worker allocation removed.",
                )
              }
            />
          )}
          {page === "machines" && (
            <Machines
              result={current}
              onAdd={() => setModal("machine")}
              onRefresh={() => load("machines")}
              onUpdate={(id, status) =>
                save(
                  `/production/machines/${id}`,
                  { status },
                  "PATCH",
                  "Machine status updated.",
                )
              }
            />
          )}
          {page === "materials" && (
            <Materials
              result={current}
              orders={current?.orders || data.orders?.orders || []}
              selected={selectedOrder}
              setSelected={setSelectedOrder}
              onConsume={() => setModal("consumption")}
              onRefresh={() => load("materials")}
            />
          )}
          {page === "complete" && (
            <Completion
              orders={current?.orders || []}
              onComplete={(id) =>
                save(
                  `/production/orders/${id}`,
                  { status: "COMPLETED" },
                  "PATCH",
                  "Work order completed and good quantity moved into finished goods stock.",
                )
              }
              onOpenTracking={(id) => {
                setSelectedOrder(String(id));
                setPage("tracking");
              }}
            />
          )}
          {page === "inspections" && (
            <Inspections
              result={current}
              onAdd={() => {
                load("orders");
                setModal("inspection");
              }}
              onRelease={(id) =>
                save(
                  `/quality/inspections/${id}`,
                  { status: "RELEASED" },
                  "PATCH",
                  "Inspection released.",
                )
              }
            />
          )}
          {page === "defects" && (
            <Defects
              result={current}
              inspections={current?.inspections || []}
              onAdd={() => {
                load("inspections");
                setModal("defect");
              }}
              onUpdate={(id, status) =>
                save(
                  `/quality/defects/${id}`,
                  { status },
                  "PATCH",
                  "Defect status updated.",
                )
              }
            />
          )}
          {page === "rework" && (
            <Rework
              result={current}
              defects={current?.defects || []}
              workers={current?.workers || []}
              onAdd={() => setModal("rework")}
              onUpdate={(id, status) =>
                save(
                  `/quality/rework/${id}`,
                  { status },
                  "PATCH",
                  "Rework order updated.",
                )
              }
            />
          )}
          {page === "reports" && (
            <QualityReports
              result={current}
              onRefresh={(range) => load("reports", range)}
            />
          )}
          {page === "bom" && (
            <BomList
              result={current}
              onAdd={() => {
                load("products");
                setModal("bom");
              }}
              onRefresh={() => load("bom")}
              onUpdate={(id, status) =>
                save(
                  `/production/bom/${id}`,
                  { status },
                  "PATCH",
                  "BOM status updated.",
                )
              }
            />
          )}
    </AppLayout>
  );
}

export default App;
