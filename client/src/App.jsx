<<<<<<< HEAD
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
=======
import React, { useState, useEffect } from 'react';
import './App.css';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';

// Feature Modules: Custom Hooks
import { useModule5 } from './features/module5/useModule5';
import { useModule2 } from './features/module2/useModule2';

// Feature Modules: Views (Module 2 & Module 5)
import ProjectsView from './features/module5/projects/ProjectsView';
import InstallationsView from './features/module5/installations/InstallationsView';
import ServiceView from './features/module5/service/ServiceView';
import VendorsView from './features/module2/vendors/VendorsView';
import ProcurementView from './features/module2/procurement/ProcurementView';
import InventoryView from './features/module2/inventory/InventoryView';

// Feature Modules: Modal Containers
import Module5ModalContainer from './features/module5/Module5ModalContainer';
import Module2ModalContainer from './features/module2/Module2ModalContainer';

// Feature Modules: Module 7 Pages
import EmployeesPayroll from './pages/EmployeesPayroll';
import TasksApprovals from './pages/TasksApprovals';
import LeaveManagement from './pages/LeaveManagement';
import ManagementMIS from './pages/ManagementMIS';
import MediaLibrary from './pages/MediaLibrary';

function SafePage({ component: Component, title, ...props }) {
  try {
    return <Component {...props} />;
  } catch (error) {
    console.error(`Failed to render ${title}:`, error);
    return (
      <div className="page-container" style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '35vh',
        color: '#0f172a',
      }}>
        <div style={{
          maxWidth: '540px',
          padding: '1.5rem',
          borderRadius: '1rem',
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
        }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem', color: '#9a4d00' }}>
            {title} failed to load
          </div>
          <div style={{ fontSize: '0.875rem', color: '#7c2d12' }}>
            The app shell remained active, but this module could not render. The remaining modules continue to work normally.
          </div>
        </div>
      </div>
    );
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('projects');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);

  const toast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // Modular Custom Hooks (Separation of Concerns)
  const { state: m5State, actions: m5Actions } = useModule5(toast);
  const { state: m2State, actions: m2Actions } = useModule2(toast);

  // Initial Authoritative Load
  useEffect(() => {
    m5Actions.fetchModule5Data();
    m2Actions.fetchModule2Data();
  }, []);

  const handleQuickAdd = () => {
    const map = {
      vendors: () => {
        m2State.setSelectedVendor(null);
        setModalType('CREATE_VENDOR');
      },
      procurement: () => setModalType('CREATE_PO'),
      inventory: () => setModalType('CREATE_GRN'),
      projects: () => setModalType('CREATE_PROJECT'),
      installation: () => setModalType('SCHEDULE_INSTALLATION'),
      service: () => setModalType('RAISE_TICKET'),
      employees: () => {
        setActiveTab('tasks');
        setIsAssignTaskOpen(true);
      },
      tasks: () => setIsAssignTaskOpen(true),
    };
    if (map[activeTab]) map[activeTab]();
  };

  return (
    <div className="shell">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        apiOnline={true}
        counts={{
          vendors: m2State.vendors.length,
          purchaseOrders: m2State.purchaseOrders.length,
          inventory: m2State.inventory.length,
          projects: m5State.projects.length,
          installations: m5State.installations.length,
          service: m5State.tickets.length,
        }}
      />

      <main className="main">
        <TopBar
          activeTab={activeTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onOpenTrace={() => m5Actions.handleOpenTrace(null, () => setModalType('TRACE_JOB'))}
          onOpenMedia={() => setModalType('PHOTO_PACK')}
          onOpenTaskModal={() => {
            if (activeTab === 'tasks' || activeTab === 'employees' || activeTab === 'mis') {
              setIsAssignTaskOpen(true);
            } else {
              setModalType('ASSIGN_TASK');
            }
          }}
          onOpenAddModal={handleQuickAdd}
        />

        <div className="content">
          {/* ==========================================
              MODULE 2: VENDOR, PROCUREMENT & INVENTORY
             ========================================== */}
          {activeTab === 'vendors' && (
            <VendorsView
              vendors={m2State.vendors}
              onOpenCreateVendor={() => {
                m2State.setSelectedVendor(null);
                setModalType('CREATE_VENDOR');
              }}
              onOpenEditVendor={(vend) => {
                m2State.setSelectedVendor(vend);
                setModalType('EDIT_VENDOR');
              }}
              onOpenAssignTask={() => setModalType('ASSIGN_TASK')}
            />
          )}

          {activeTab === 'procurement' && (
            <ProcurementView
              purchaseOrders={m2State.purchaseOrders}
              purchaseRequests={m2State.purchaseRequests}
              vendors={m2State.vendors}
              products={m5State.lookups.products}
              onOpenCreatePO={() => setModalType('CREATE_PO')}
              onOpenCreatePR={() => setModalType('CREATE_PR')}
              onUpdatePOStatus={m2Actions.handleUpdatePOStatus}
              onOpenAssignTask={() => setModalType('ASSIGN_TASK')}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              inventory={m2State.inventory}
              goodsReceipts={m2State.goodsReceipts}
              movements={m2State.movements}
              onOpenCreateGRN={() => setModalType('CREATE_GRN')}
              onOpenStockMove={() => setModalType('STOCK_MOVE')}
              onOpenAssignTask={() => setModalType('ASSIGN_TASK')}
            />
          )}

          {/* ==========================================
              MODULE 5: SITE & FIELD OPS
             ========================================== */}
          {activeTab === 'projects' && (
            <ProjectsView
              projects={m5State.projects}
              tasks={m5State.tasks}
              onOpenCreateProject={() => setModalType('CREATE_PROJECT')}
              onOpenAssignTask={() => setModalType('ASSIGN_TASK')}
              onOpenTrace={(p) => m5Actions.handleOpenTrace(p, () => setModalType('TRACE_JOB'))}
              onUpdateStatus={m5Actions.handleUpdateProjectStatus}
            />
          )}

          {activeTab === 'installation' && (
            <InstallationsView
              installations={m5State.installations}
              projects={m5State.projects}
              onOpenScheduleModal={() => setModalType('SCHEDULE_INSTALLATION')}
              onOpenTrace={(p) => m5Actions.handleOpenTrace(p, () => setModalType('TRACE_JOB'))}
              onOpenMedia={() => setModalType('PHOTO_PACK')}
              onOpenVoiceModal={() => setModalType('VOICE_RECORDER')}
              onUpdateStatus={m5Actions.handleUpdateInstallationStatus}
              onRecordTestResult={m5Actions.handleRecordTest}
              toast={toast}
            />
          )}

          {activeTab === 'service' && (
            <ServiceView
              tickets={m5State.tickets}
              onOpenCreateTicket={() => setModalType('RAISE_TICKET')}
              onOpenAssignTask={() => setModalType('ASSIGN_TASK')}
              onUpdateStatus={m5Actions.handleUpdateTicketStatus}
            />
          )}

          {/* ==========================================
              MODULE 7: WORKFORCE & MIS
             ========================================== */}
          {activeTab === 'employees' && (
            <SafePage
              component={EmployeesPayroll}
              title="Employees & Payroll"
              onOpenAssignTask={() => {
                setActiveTab('tasks');
                setIsAssignTaskOpen(true);
              }}
            />
          )}

          {activeTab === 'leaves' && (
            <SafePage
              component={LeaveManagement}
              title="Leave Management"
            />
          )}

          {activeTab === 'tasks' && (
            <SafePage
              component={TasksApprovals}
              title="Tasks & Approvals"
              onOpenPerformance={() => setActiveTab('mis')}
              onAssignNewTask={() => setIsAssignTaskOpen(true)}
              isAssignOpen={isAssignTaskOpen}
              onCloseAssign={() => setIsAssignTaskOpen(false)}
            />
          )}

          {activeTab === 'mis' && (
            <SafePage
              component={ManagementMIS}
              title="Management MIS"
              defaultTab="dashboard"
            />
          )}

          {activeTab === 'trace' && (
            <SafePage
              component={ManagementMIS}
              title="Executive Job Matrix"
              defaultTab="matrix"
            />
          )}

          {activeTab === 'media' && (
            <SafePage
              component={MediaLibrary}
              title="Media Library"
            />
          )}
        </div>
      </main>

      {/* MODAL CONTAINERS (Separated by Feature Module) */}
      <Module5ModalContainer
        modalType={modalType}
        onClose={() => setModalType(null)}
        module5State={m5State}
        module5Actions={m5Actions}
        toast={toast}
      />

      <Module2ModalContainer
        modalType={modalType}
        onClose={() => setModalType(null)}
        module2State={m2State}
        module2Actions={m2Actions}
        lookups={m5State.lookups}
      />

      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  );
}
>>>>>>> origin/dev
