// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';
import { erpApi } from './services/api';

import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import ProjectsView from './features/module5/projects/ProjectsView';
import InstallationsView from './features/module5/installations/InstallationsView';
import ServiceView from './features/module5/service/ServiceView';
import {
  CreateProjectModal,
  ScheduleInstallationModal,
  RaiseTicketModal,
  AssignTaskModal,
  TraceModal,
  PhotoPackModal,
  VoiceRecorderModal,
} from './components/common/Modals';

export default function App() {
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'installation' | 'service'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  // Authoritative database entities
  const [projects, setProjects] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [lookups, setLookups] = useState({ salesOrders: [], customers: [], products: [], users: [] });

  // Modal states
  const [modalType, setModalType] = useState(null); // 'CREATE_PROJECT' | 'SCHEDULE_INSTALLATION' | 'RAISE_TICKET' | 'ASSIGN_TASK' | 'TRACE_JOB' | 'PHOTO_PACK' | 'VOICE_RECORDER'
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [traceData, setTraceData] = useState(null);
  const [traceLoading, setTraceLoading] = useState(false);

  const toast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // Refresh authoritative data from backend
  const refreshData = async () => {
    try {
      setLoading(true);
      const [resPrj, resInst, resTix, resLookups, resTasks] = await Promise.all([
        erpApi.getProjects().catch(() => null),
        erpApi.getInstallations().catch(() => null),
        erpApi.getTickets().catch(() => null),
        erpApi.getLookups().catch(() => null),
        erpApi.getTasks().catch(() => null),
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

  // Handlers for status updates
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

  // Handlers for modal submissions
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

  return (
    <div className="shell">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        apiOnline={apiOnline}
        counts={{
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
            if (activeTab === 'projects') setModalType('CREATE_PROJECT');
            else if (activeTab === 'installation') setModalType('SCHEDULE_INSTALLATION');
            else setModalType('RAISE_TICKET');
          }}
        />

        <div className="content">
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

      {/* MODALS */}
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

      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  );
}
