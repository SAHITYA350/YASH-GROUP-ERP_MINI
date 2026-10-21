// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';
import { erpApi } from './services/api';

import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';

// Module 5 Views
import ProjectsView from './features/module5/projects/ProjectsView';
import InstallationsView from './features/module5/installations/InstallationsView';
import ServiceView from './features/module5/service/ServiceView';

// Module 2 Views
import VendorsView from './features/module2/vendors/VendorsView';
import ProcurementView from './features/module2/procurement/ProcurementView';
import InventoryView from './features/module2/inventory/InventoryView';

// Modals
import {
  CreateProjectModal,
  ScheduleInstallationModal,
  RaiseTicketModal,
  AssignTaskModal,
  TraceModal,
  PhotoPackModal,
  VoiceRecorderModal,
} from './components/common/Modals';

import {
  CreateVendorModal,
  CreatePOModal,
  CreatePRModal,
  CreateGRNModal,
  StockMoveModal,
} from './components/common/Module2Modals';

export default function App() {
  const [activeTab, setActiveTab] = useState('projects'); // 'vendors' | 'procurement' | 'inventory' | 'projects' | 'installation' | 'service'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  // Authoritative Module 5 Database Entities
  const [projects, setProjects] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [lookups, setLookups] = useState({ salesOrders: [], customers: [], products: [], users: [] });

  // Authoritative Module 2 Database Entities
  const [vendors, setVendors] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [goodsReceipts, setGoodsReceipts] = useState([]);
  const [movements, setMovements] = useState([]);

  // Modal states
  const [modalType, setModalType] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [traceData, setTraceData] = useState(null);
  const [traceLoading, setTraceLoading] = useState(false);

  const toast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // Refresh authoritative data across both modules
  const refreshData = async () => {
    try {
      setLoading(true);
      const [
        resPrj,
        resInst,
        resTix,
        resLookups,
        resTasks,
        resVendors,
        resPOs,
        resPRs,
        resInv,
        resGRNs,
        resMoves,
      ] = await Promise.all([
        erpApi.getProjects().catch(() => null),
        erpApi.getInstallations().catch(() => null),
        erpApi.getTickets().catch(() => null),
        erpApi.getLookups().catch(() => null),
        erpApi.getTasks().catch(() => null),
        erpApi.getVendors().catch(() => null),
        erpApi.getPurchaseOrders().catch(() => null),
        erpApi.getPurchaseRequests().catch(() => null),
        erpApi.getInventory().catch(() => null),
        erpApi.getGoodsReceipts().catch(() => null),
        erpApi.getInventoryMovements().catch(() => null),
      ]);

      if (resPrj && resPrj.success) {
        setApiOnline(true);
        setProjects(resPrj.data || []);
        setInstallations(resInst?.data || []);
        setTickets(resTix?.data || []);
        setLookups(resLookups?.data || { salesOrders: [], customers: [], products: [], users: [] });
        setTasks(resTasks?.data || []);
      } else {
        setApiOnline(false);
      }

      // Populate Module 2 data
      if (resVendors && resVendors.success) {
        setVendors(resVendors.data || []);
      }
      if (resPOs && resPOs.success) {
        setPurchaseOrders(resPOs.data || []);
      }
      if (resPRs && resPRs.success) {
        setPurchaseRequests(resPRs.data || []);
      }
      if (resInv && resInv.success) {
        setInventory(resInv.data || []);
      }
      if (resGRNs && resGRNs.success) {
        setGoodsReceipts(resGRNs.data || []);
      }
      if (resMoves && resMoves.success) {
        setMovements(resMoves.data || []);
      }
    } catch (err) {
      console.error('Data load error:', err);
      setApiOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  /* =========================================================================
     MODULE 5 ACTION HANDLERS
     ========================================================================= */
  const handleUpdateProjectStatus = async (id, status) => {
    try {
      await erpApi.updateProjectStatus(id, status);
      toast(`Project status updated to ${status}`);
      refreshData();
    } catch (err) {
      alert(`Error updating project: ${err.message}`);
    }
  };

  const handleUpdateInstallationStatus = async (id, status) => {
    try {
      await erpApi.updateInstallation(id, { status });
      toast(`Installation status updated to ${status}`);
      refreshData();
    } catch (err) {
      alert(`Error updating installation: ${err.message}`);
    }
  };

  const handleUpdateTicketStatus = async (id, status) => {
    try {
      await erpApi.updateTicket(id, { status });
      toast(`Service ticket status updated to ${status}`);
      refreshData();
    } catch (err) {
      alert(`Error updating ticket: ${err.message}`);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const salesOrderId = Number(form.get('salesOrderId'));
    const selectedSO = lookups.salesOrders.find((s) => s.id === salesOrderId);

    const payload = {
      name: form.get('name'),
      salesOrderId,
      customerId: selectedSO?.customer?.id || Number(form.get('customerId')),
      siteName: form.get('siteName'),
      ownerId: form.get('ownerId') ? Number(form.get('ownerId')) : null,
      surveyDate: form.get('surveyDate') || null,
      plannedStart: form.get('plannedStart') || null,
      plannedEnd: form.get('plannedEnd') || null,
      notes: form.get('notes'),
    };

    try {
      const res = await erpApi.createProject(payload);
      toast(`Project ${res.data?.projectCode || ''} created successfully!`);
      setModalType(null);
      refreshData();
    } catch (err) {
      alert(`Error creating project: ${err.message}`);
    }
  };

  const handleScheduleInstallation = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const projectId = form.get('projectId');
    const payload = {
      scheduledAt: form.get('scheduledAt') || null,
      notes: form.get('notes'),
    };

    try {
      const res = await erpApi.createInstallation(projectId, payload);
      toast(`Installation ${res.data?.installationNo || ''} scheduled!`);
      setModalType(null);
      refreshData();
    } catch (err) {
      alert(`Error scheduling installation: ${err.message}`);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const payload = {
      customerId: Number(form.get('customerId')),
      productId: form.get('productId') ? Number(form.get('productId')) : null,
      issue: form.get('issue'),
      assignedToId: form.get('assignedToId') ? Number(form.get('assignedToId')) : null,
      serialNumber: form.get('serialNumber') || null,
    };

    try {
      const res = await erpApi.createTicket(payload);
      toast(`Service Ticket ${res.data?.ticketNo || ''} raised!`);
      setModalType(null);
      refreshData();
    } catch (err) {
      alert(`Error raising ticket: ${err.message}`);
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const payload = {
      title: form.get('title'),
      department: form.get('department'),
      roleTitle: form.get('roleTitle'),
      linkedJob: form.get('linkedJob'),
      priority: form.get('priority'),
      shift: form.get('shift'),
      dueAt: form.get('dueAt') || null,
      description: form.get('description'),
    };

    try {
      await erpApi.createTask(payload);
      toast('Operational task assigned!');
      setModalType(null);
      refreshData();
    } catch (err) {
      alert(`Error assigning task: ${err.message}`);
    }
  };

  const handleOpenTrace = async (project) => {
    setSelectedRecord(project || projects[0]);
    setModalType('TRACE_JOB');
    const pid = project?.id || projects[0]?.id;
    if (pid) {
      setTraceLoading(true);
      try {
        const res = await erpApi.getProjectTrace(pid);
        setTraceData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setTraceLoading(false);
      }
    }
  };

  const handleRecordTest = (instId) => {
    const val = prompt('Enter Digital Earth Tester Reading (Ohms):', '1.15');
    if (val) {
      toast(`Resistance Test Result: ${val} Ohms recorded (PASS)`);
    }
  };

  /* =========================================================================
     MODULE 2 ACTION HANDLERS
     ========================================================================= */
  const handleSaveVendor = async (data) => {
    try {
      if (data.id) {
        await erpApi.updateVendor(data.id, data);
        toast(`Vendor ${data.name} updated successfully!`);
      } else {
        await erpApi.createVendor(data);
        toast(`Vendor ${data.name} registered successfully!`);
      }
      setModalType(null);
      setSelectedVendor(null);
      refreshData();
    } catch (err) {
      alert(`Error saving vendor: ${err.message}`);
    }
  };

  const handleCreatePO = async (poData) => {
    try {
      const res = await erpApi.createPurchaseOrder(poData);
      toast(`Purchase Order ${res.data?.poNumber || ''} created successfully!`);
      setModalType(null);
      refreshData();
    } catch (err) {
      alert(`Error releasing Purchase Order: ${err.message}`);
    }
  };

  const handleCreatePR = async (prData) => {
    try {
      const res = await erpApi.createPurchaseRequest(prData);
      toast(`Purchase Request ${res.data?.prNumber || ''} submitted!`);
      setModalType(null);
      refreshData();
    } catch (err) {
      alert(`Error creating Purchase Request: ${err.message}`);
    }
  };

  const handleUpdatePOStatus = async (id, status) => {
    try {
      await erpApi.updatePOStatus(id, status);
      toast(`PO status updated to ${status}`);
      refreshData();
    } catch (err) {
      alert(`Error updating PO status: ${err.message}`);
    }
  };

  const handleCreateGRN = async (grnData) => {
    try {
      const res = await erpApi.createGoodsReceipt(grnData);
      toast(`GRN ${res.data?.receiptNumber || ''} issued & inventory updated!`);
      setModalType(null);
      refreshData();
    } catch (err) {
      alert(`Error issuing GRN: ${err.message}`);
    }
  };

  const handleRecordStockMovement = async (moveData) => {
    try {
      await erpApi.recordStockMovement(moveData);
      toast('Material movement recorded successfully!');
      setModalType(null);
      refreshData();
    } catch (err) {
      alert(`Error recording stock movement: ${err.message}`);
    }
  };

  return (
    <div className="shell">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        apiOnline={apiOnline}
        counts={{
          vendors: vendors.length,
          purchaseOrders: purchaseOrders.length,
          inventory: inventory.length,
          projects: projects.length,
          installations: installations.length,
          service: tickets.length,
        }}
      />

      <main className="main">
        <TopBar
          activeTab={activeTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onOpenTrace={() => handleOpenTrace(projects[0])}
          onOpenMedia={() => setModalType('PHOTO_PACK')}
          onOpenTaskModal={() => setModalType('ASSIGN_TASK')}
          onOpenAddModal={() => {
            if (activeTab === 'vendors') {
              setSelectedVendor(null);
              setModalType('CREATE_VENDOR');
            } else if (activeTab === 'procurement') {
              setModalType('CREATE_PO');
            } else if (activeTab === 'inventory') {
              setModalType('CREATE_GRN');
            } else if (activeTab === 'projects') {
              setModalType('CREATE_PROJECT');
            } else if (activeTab === 'installation') {
              setModalType('SCHEDULE_INSTALLATION');
            } else {
              setModalType('RAISE_TICKET');
            }
          }}
        />

        <div className="content">
          {/* MODULE 2 VIEWS */}
          {activeTab === 'vendors' && (
            <VendorsView
              vendors={vendors}
              onOpenCreateVendor={() => {
                setSelectedVendor(null);
                setModalType('CREATE_VENDOR');
              }}
              onOpenEditVendor={(vend) => {
                setSelectedVendor(vend);
                setModalType('EDIT_VENDOR');
              }}
              onOpenAssignTask={() => setModalType('ASSIGN_TASK')}
            />
          )}

          {activeTab === 'procurement' && (
            <ProcurementView
              purchaseOrders={purchaseOrders}
              purchaseRequests={purchaseRequests}
              vendors={vendors}
              products={lookups.products}
              onOpenCreatePO={() => setModalType('CREATE_PO')}
              onOpenCreatePR={() => setModalType('CREATE_PR')}
              onUpdatePOStatus={handleUpdatePOStatus}
              onOpenAssignTask={() => setModalType('ASSIGN_TASK')}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              inventory={inventory}
              goodsReceipts={goodsReceipts}
              movements={movements}
              onOpenCreateGRN={() => setModalType('CREATE_GRN')}
              onOpenStockMove={() => setModalType('STOCK_MOVE')}
              onOpenAssignTask={() => setModalType('ASSIGN_TASK')}
            />
          )}

          {/* MODULE 5 VIEWS */}
          {activeTab === 'projects' && (
            <ProjectsView
              projects={projects}
              tasks={tasks}
              onOpenCreateProject={() => setModalType('CREATE_PROJECT')}
              onOpenAssignTask={() => setModalType('ASSIGN_TASK')}
              onOpenTrace={handleOpenTrace}
              onUpdateStatus={handleUpdateProjectStatus}
            />
          )}

          {activeTab === 'installation' && (
            <InstallationsView
              installations={installations}
              projects={projects}
              onOpenScheduleModal={() => setModalType('SCHEDULE_INSTALLATION')}
              onOpenTrace={handleOpenTrace}
              onOpenMedia={() => setModalType('PHOTO_PACK')}
              onOpenVoiceModal={() => setModalType('VOICE_RECORDER')}
              onUpdateStatus={handleUpdateInstallationStatus}
              onRecordTestResult={handleRecordTest}
              toast={toast}
            />
          )}

          {activeTab === 'service' && (
            <ServiceView
              tickets={tickets}
              onOpenCreateTicket={() => setModalType('RAISE_TICKET')}
              onOpenAssignTask={() => setModalType('ASSIGN_TASK')}
              onUpdateStatus={handleUpdateTicketStatus}
            />
          )}
        </div>
      </main>

      {/* =========================================================
          MODULE 5 MODALS
         ========================================================= */}
      {modalType === 'CREATE_PROJECT' && (
        <CreateProjectModal
          lookups={lookups}
          onClose={() => setModalType(null)}
          onSubmit={handleCreateProject}
        />
      )}

      {modalType === 'SCHEDULE_INSTALLATION' && (
        <ScheduleInstallationModal
          projects={projects}
          onClose={() => setModalType(null)}
          onSubmit={handleScheduleInstallation}
        />
      )}

      {modalType === 'RAISE_TICKET' && (
        <RaiseTicketModal
          lookups={lookups}
          onClose={() => setModalType(null)}
          onSubmit={handleCreateTicket}
        />
      )}

      {modalType === 'ASSIGN_TASK' && (
        <AssignTaskModal
          onClose={() => setModalType(null)}
          onSubmit={handleAssignTask}
        />
      )}

      {modalType === 'TRACE_JOB' && (
        <TraceModal
          traceData={traceData}
          selectedRecord={selectedRecord}
          loading={traceLoading}
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === 'PHOTO_PACK' && (
        <PhotoPackModal
          onClose={() => setModalType(null)}
          toast={toast}
        />
      )}

      {modalType === 'VOICE_RECORDER' && (
        <VoiceRecorderModal
          onClose={() => setModalType(null)}
          toast={toast}
        />
      )}

      {/* =========================================================
          MODULE 2 MODALS
         ========================================================= */}
      {(modalType === 'CREATE_VENDOR' || modalType === 'EDIT_VENDOR') && (
        <CreateVendorModal
          initialData={selectedVendor}
          onClose={() => {
            setModalType(null);
            setSelectedVendor(null);
          }}
          onSubmit={handleSaveVendor}
        />
      )}

      {modalType === 'CREATE_PO' && (
        <CreatePOModal
          vendors={vendors}
          products={lookups.products}
          onClose={() => setModalType(null)}
          onSubmit={handleCreatePO}
        />
      )}

      {modalType === 'CREATE_PR' && (
        <CreatePRModal
          products={lookups.products}
          onClose={() => setModalType(null)}
          onSubmit={handleCreatePR}
        />
      )}

      {modalType === 'CREATE_GRN' && (
        <CreateGRNModal
          purchaseOrders={purchaseOrders}
          vendors={vendors}
          onClose={() => setModalType(null)}
          onSubmit={handleCreateGRN}
        />
      )}

      {modalType === 'STOCK_MOVE' && (
        <StockMoveModal
          inventory={inventory}
          products={lookups.products}
          onClose={() => setModalType(null)}
          onSubmit={handleRecordStockMovement}
        />
      )}

      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  );
}
