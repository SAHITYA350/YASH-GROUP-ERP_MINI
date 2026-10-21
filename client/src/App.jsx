import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';

// Feature Modules: Custom Hooks
import { useModule5 } from './features/module5/useModule5';
import { useModule2 } from './features/module2/useModule2';

// Feature Modules: Module 1 Pages (Sales & CRM)
import CustomersPage from './pages/CustomersPage';
import EnquiriesPage from './pages/EnquiriesPage';
import QuotationsPage from './pages/QuotationsPage';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import AccessManagementPage from './pages/AccessManagementPage';

// Feature Modules: Module 2 Views (Vendor, Procurement & Inventory)
import VendorsView from './features/module2/vendors/VendorsView';
import ProcurementView from './features/module2/procurement/ProcurementView';
import InventoryView from './features/module2/inventory/InventoryView';

// Feature Modules: Module 5 Views (Site, Projects & Service)
import ProjectsView from './features/module5/projects/ProjectsView';
import InstallationsView from './features/module5/installations/InstallationsView';
import ServiceView from './features/module5/service/ServiceView';

// Feature Modules: Module 6 Pages (Finance & Accounts)
import FinanceDashboard from './modules/finance/pages/FinanceDashboard';
import FinanceInvoicesPage from './modules/finance/pages/InvoicesPage';
import InvoiceDetailsPage from './modules/finance/pages/InvoiceDetailsPage';
import ReceivablesPage from './modules/finance/pages/ReceivablesPage';
import PaymentsPage from './modules/finance/pages/PaymentsPage';
import VendorBillsPage from './modules/finance/pages/VendorBillsPage';
import ExpensesPage from './modules/finance/pages/ExpensesPage';
import CostingPage from './modules/finance/pages/CostingPage';
import FinanceReportsPage from './modules/finance/pages/FinanceReportsPage';

// Feature Modules: Module 7 Pages (Workforce & HR MIS)
import EmployeesPayroll from './pages/EmployeesPayroll';
import TasksApprovals from './pages/TasksApprovals';
import LeaveManagement from './pages/LeaveManagement';
import ManagementMIS from './pages/ManagementMIS';
import MediaLibrary from './pages/MediaLibrary';

// Modal Containers
import Module5ModalContainer from './features/module5/Module5ModalContainer';
import Module2ModalContainer from './features/module2/Module2ModalContainer';

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
            {title} is loading or unavailable
          </div>
          <div style={{ fontSize: '0.875rem', color: '#7c2d12' }}>
            The enterprise ERP shell remains active. Other feature modules and workflows continue to operate normally.
          </div>
        </div>
      </div>
    );
  }
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Map URL paths to active tab identifiers
  const getTabFromPath = (pathname) => {
    if (pathname.includes('/sales/customers')) return 'customers';
    if (pathname.includes('/sales/enquiries')) return 'enquiries';
    if (pathname.includes('/sales/quotations')) return 'quotations';
    if (pathname.includes('/sales/orders')) return 'orders';
    if (pathname.includes('/sales/products')) return 'products';
    if (pathname.includes('/sales/access')) return 'access';

    if (pathname.includes('/procurement/vendors')) return 'vendors';
    if (pathname.includes('/procurement/orders')) return 'procurement';
    if (pathname.includes('/procurement/inventory')) return 'inventory';

    if (pathname.includes('/operations/projects')) return 'projects';
    if (pathname.includes('/operations/installations')) return 'installation';
    if (pathname.includes('/operations/service')) return 'service';

    if (pathname.includes('/finance/dashboard')) return 'finance-dashboard';
    if (pathname.includes('/finance/invoices')) return 'finance-invoices';
    if (pathname.includes('/finance/receivables')) return 'finance-receivables';
    if (pathname.includes('/finance/payments')) return 'finance-payments';
    if (pathname.includes('/finance/vendor-bills')) return 'finance-bills';
    if (pathname.includes('/finance/expenses')) return 'finance-expenses';
    if (pathname.includes('/finance/costing')) return 'finance-costing';
    if (pathname.includes('/finance/reports')) return 'finance-reports';

    if (pathname.includes('/workforce/employees')) return 'employees';
    if (pathname.includes('/workforce/leaves')) return 'leaves';
    if (pathname.includes('/workforce/tasks')) return 'tasks';
    if (pathname.includes('/workforce/mis')) return 'mis';
    if (pathname.includes('/workforce/matrix')) return 'trace';
    if (pathname.includes('/workforce/media')) return 'media';

    return 'projects';
  };

  const [activeTab, setActiveTab] = useState(() => getTabFromPath(location.pathname));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const toast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // Modular Custom Hooks for Module 5 & Module 2
  const { state: m5State, actions: m5Actions } = useModule5(toast);
  const { state: m2State, actions: m2Actions } = useModule2(toast);

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
        navigate('/workforce/tasks');
        setIsAssignTaskOpen(true);
      },
      tasks: () => setIsAssignTaskOpen(true),
      'finance-invoices': () => navigate('/finance/invoices'),
      'finance-expenses': () => navigate('/finance/expenses'),
    };
    if (map[activeTab]) {
      map[activeTab]();
    } else {
      setModalType('CREATE_PROJECT');
    }
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
          <Routes>
            {/* Default Landing Route */}
            <Route path="/" element={<Navigate to="/operations/projects" replace />} />

            {/* =========================================================
                MODULE 1: SALES & CLIENT MANAGEMENT
               ========================================================= */}
            <Route path="/sales/customers" element={<SafePage component={CustomersPage} title="Customers" />} />
            <Route path="/sales/enquiries" element={<SafePage component={EnquiriesPage} title="Enquiries" />} />
            <Route path="/sales/quotations" element={<SafePage component={QuotationsPage} title="Quotations" />} />
            <Route path="/sales/orders" element={<SafePage component={OrdersPage} title="Orders" />} />
            <Route path="/sales/products" element={<SafePage component={ProductsPage} title="Products" />} />
            <Route path="/sales/access" element={<SafePage component={AccessManagementPage} title="Access Management" />} />

            {/* Backwards-compatible Module 1 aliases */}
            <Route path="/customers" element={<Navigate to="/sales/customers" replace />} />
            <Route path="/enquiries" element={<Navigate to="/sales/enquiries" replace />} />
            <Route path="/quotations" element={<Navigate to="/sales/quotations" replace />} />
            <Route path="/orders" element={<Navigate to="/sales/orders" replace />} />
            <Route path="/products" element={<Navigate to="/sales/products" replace />} />
            <Route path="/access" element={<Navigate to="/sales/access" replace />} />

            {/* =========================================================
                MODULE 2: VENDOR, PROCUREMENT & INVENTORY
               ========================================================= */}
            <Route
              path="/procurement/vendors"
              element={
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
              }
            />
            <Route
              path="/procurement/orders"
              element={
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
              }
            />
            <Route
              path="/procurement/inventory"
              element={
                <InventoryView
                  inventory={m2State.inventory}
                  goodsReceipts={m2State.goodsReceipts}
                  movements={m2State.movements}
                  onOpenCreateGRN={() => setModalType('CREATE_GRN')}
                  onOpenStockMove={() => setModalType('STOCK_MOVE')}
                  onOpenAssignTask={() => setModalType('ASSIGN_TASK')}
                />
              }
            />

            {/* Backwards-compatible Module 2 aliases */}
            <Route path="/vendors" element={<Navigate to="/procurement/vendors" replace />} />
            <Route path="/procurement" element={<Navigate to="/procurement/orders" replace />} />
            <Route path="/inventory" element={<Navigate to="/procurement/inventory" replace />} />

            {/* =========================================================
                MODULE 5: SITE & FIELD OPS
               ========================================================= */}
            <Route
              path="/operations/projects"
              element={
                <ProjectsView
                  projects={m5State.projects}
                  tasks={m5State.tasks}
                  onOpenCreateProject={() => setModalType('CREATE_PROJECT')}
                  onOpenAssignTask={() => setModalType('ASSIGN_TASK')}
                  onOpenTrace={(p) => m5Actions.handleOpenTrace(p, () => setModalType('TRACE_JOB'))}
                  onUpdateStatus={m5Actions.handleUpdateProjectStatus}
                />
              }
            />
            <Route
              path="/operations/installations"
              element={
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
              }
            />
            <Route
              path="/operations/service"
              element={
                <ServiceView
                  tickets={m5State.tickets}
                  onOpenCreateTicket={() => setModalType('RAISE_TICKET')}
                  onOpenAssignTask={() => setModalType('ASSIGN_TASK')}
                  onUpdateStatus={m5Actions.handleUpdateTicketStatus}
                />
              }
            />

            {/* Backwards-compatible Module 5 aliases */}
            <Route path="/projects" element={<Navigate to="/operations/projects" replace />} />
            <Route path="/installation" element={<Navigate to="/operations/installations" replace />} />
            <Route path="/service" element={<Navigate to="/operations/service" replace />} />

            {/* =========================================================
                MODULE 6: FINANCE & COMMERCIAL DESK
               ========================================================= */}
            <Route path="/finance/dashboard" element={<SafePage component={FinanceDashboard} title="Finance Dashboard" />} />
            <Route path="/finance/invoices" element={<SafePage component={FinanceInvoicesPage} title="Invoices" />} />
            <Route path="/finance/invoices/:id" element={<SafePage component={InvoiceDetailsPage} title="Invoice Details" />} />
            <Route path="/finance/receivables" element={<SafePage component={ReceivablesPage} title="Receivables" />} />
            <Route path="/finance/payments" element={<SafePage component={PaymentsPage} title="Payments" />} />
            <Route path="/finance/vendor-bills" element={<SafePage component={VendorBillsPage} title="Vendor Bills" />} />
            <Route path="/finance/expenses" element={<SafePage component={ExpensesPage} title="Expenses" />} />
            <Route path="/finance/costing" element={<SafePage component={CostingPage} title="Job Costing" />} />
            <Route path="/finance/reports" element={<SafePage component={FinanceReportsPage} title="Finance Reports" />} />

            {/* Backwards-compatible Module 6 aliases */}
            <Route path="/finance" element={<Navigate to="/finance/dashboard" replace />} />
            <Route path="/invoices" element={<Navigate to="/finance/invoices" replace />} />
            <Route path="/receivables" element={<Navigate to="/finance/receivables" replace />} />
            <Route path="/payments" element={<Navigate to="/finance/payments" replace />} />
            <Route path="/expenses" element={<Navigate to="/finance/expenses" replace />} />
            <Route path="/costing" element={<Navigate to="/finance/costing" replace />} />

            {/* =========================================================
                MODULE 7: WORKFORCE & MIS
               ========================================================= */}
            <Route
              path="/workforce/employees"
              element={
                <SafePage
                  component={EmployeesPayroll}
                  title="Employees & Payroll"
                  onOpenAssignTask={() => {
                    navigate('/workforce/tasks');
                    setIsAssignTaskOpen(true);
                  }}
                />
              }
            />
            <Route
              path="/workforce/leaves"
              element={<SafePage component={LeaveManagement} title="Leave Management" />}
            />
            <Route
              path="/workforce/tasks"
              element={
                <SafePage
                  component={TasksApprovals}
                  title="Tasks & Approvals"
                  onOpenPerformance={() => navigate('/workforce/mis')}
                  onAssignNewTask={() => setIsAssignTaskOpen(true)}
                  isAssignOpen={isAssignTaskOpen}
                  onCloseAssign={() => setIsAssignTaskOpen(false)}
                />
              }
            />
            <Route
              path="/workforce/mis"
              element={<SafePage component={ManagementMIS} title="Management MIS" defaultTab="dashboard" />}
            />
            <Route
              path="/workforce/matrix"
              element={<SafePage component={ManagementMIS} title="Executive Job Matrix" defaultTab="matrix" />}
            />
            <Route
              path="/workforce/media"
              element={<SafePage component={MediaLibrary} title="Media Library" />}
            />

            {/* Backwards-compatible Module 7 aliases */}
            <Route path="/employees" element={<Navigate to="/workforce/employees" replace />} />
            <Route path="/leaves" element={<Navigate to="/workforce/leaves" replace />} />
            <Route path="/tasks" element={<Navigate to="/workforce/tasks" replace />} />
            <Route path="/mis" element={<Navigate to="/workforce/mis" replace />} />
            <Route path="/trace" element={<Navigate to="/workforce/matrix" replace />} />
            <Route path="/media" element={<Navigate to="/workforce/media" replace />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/operations/projects" replace />} />
          </Routes>
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
