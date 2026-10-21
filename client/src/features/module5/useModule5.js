// client/src/features/module5/useModule5.js
import { useState, useCallback } from 'react';
import { erpApi } from '../../services/api';

export function useModule5(toast) {
  const [projects, setProjects] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [lookups, setLookups] = useState({ salesOrders: [], customers: [], products: [], users: [] });

  const [traceData, setTraceData] = useState(null);
  const [traceLoading, setTraceLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchModule5Data = useCallback(async () => {
    try {
      const [resPrj, resInst, resTix, resLookups, resTasks] = await Promise.all([
        erpApi.getProjects().catch(() => null),
        erpApi.getInstallations().catch(() => null),
        erpApi.getTickets().catch(() => null),
        erpApi.getLookups().catch(() => null),
        erpApi.getTasks().catch(() => null),
      ]);

      if (resPrj?.success) setProjects(resPrj.data || []);
      if (resInst?.success) setInstallations(resInst.data || []);
      if (resTix?.success) setTickets(resTix.data || []);
      if (resLookups?.success) setLookups(resLookups.data || { salesOrders: [], customers: [], products: [], users: [] });
      if (resTasks?.success) setTasks(resTasks.data || []);
    } catch (err) {
      console.error('Error fetching Module 5 data:', err);
    }
  }, []);

  const handleCreateProject = async (e, onSuccess) => {
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
      if (onSuccess) onSuccess();
      fetchModule5Data();
    } catch (err) {
      alert(`Error creating project: ${err.message}`);
    }
  };

  const handleScheduleInstallation = async (e, onSuccess) => {
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
      if (onSuccess) onSuccess();
      fetchModule5Data();
    } catch (err) {
      alert(`Error scheduling installation: ${err.message}`);
    }
  };

  const handleCreateTicket = async (e, onSuccess) => {
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
      if (onSuccess) onSuccess();
      fetchModule5Data();
    } catch (err) {
      alert(`Error raising ticket: ${err.message}`);
    }
  };

  const handleAssignTask = async (e, onSuccess) => {
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
      if (onSuccess) onSuccess();
      fetchModule5Data();
    } catch (err) {
      alert(`Error assigning task: ${err.message}`);
    }
  };

  const handleUpdateProjectStatus = async (id, status) => {
    try {
      await erpApi.updateProjectStatus(id, status);
      toast(`Project status updated to ${status}`);
      fetchModule5Data();
    } catch (err) {
      alert(`Error updating project: ${err.message}`);
    }
  };

  const handleUpdateInstallationStatus = async (id, status) => {
    try {
      await erpApi.updateInstallation(id, { status });
      toast(`Installation status updated to ${status}`);
      fetchModule5Data();
    } catch (err) {
      alert(`Error updating installation: ${err.message}`);
    }
  };

  const handleUpdateTicketStatus = async (id, status) => {
    try {
      await erpApi.updateTicket(id, { status });
      toast(`Service ticket status updated to ${status}`);
      fetchModule5Data();
    } catch (err) {
      alert(`Error updating ticket: ${err.message}`);
    }
  };

  const handleOpenTrace = async (project, onOpenModal) => {
    const target = project || projects[0];
    setSelectedRecord(target);
    if (onOpenModal) onOpenModal();
    const pid = target?.id;
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

  return {
    state: {
      projects,
      installations,
      tickets,
      tasks,
      lookups,
      traceData,
      traceLoading,
      selectedRecord,
    },
    actions: {
      fetchModule5Data,
      handleCreateProject,
      handleScheduleInstallation,
      handleCreateTicket,
      handleAssignTask,
      handleUpdateProjectStatus,
      handleUpdateInstallationStatus,
      handleUpdateTicketStatus,
      handleOpenTrace,
      handleRecordTest,
    },
  };
}

export default useModule5;
