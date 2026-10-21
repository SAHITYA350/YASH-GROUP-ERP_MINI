// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';

// Feature Modules: Custom Hooks
import { useModule5 } from './features/module5/useModule5';
import { useModule2 } from './features/module2/useModule2';

// Feature Modules: Views
import ProjectsView from './features/module5/projects/ProjectsView';
import InstallationsView from './features/module5/installations/InstallationsView';
import ServiceView from './features/module5/service/ServiceView';
import VendorsView from './features/module2/vendors/VendorsView';
import ProcurementView from './features/module2/procurement/ProcurementView';
import InventoryView from './features/module2/inventory/InventoryView';

// Feature Modules: Modal Containers
import Module5ModalContainer from './features/module5/Module5ModalContainer';
import Module2ModalContainer from './features/module2/Module2ModalContainer';

export default function App() {
  const [activeTab, setActiveTab] = useState('projects');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

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
          onOpenTaskModal={() => setModalType('ASSIGN_TASK')}
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
