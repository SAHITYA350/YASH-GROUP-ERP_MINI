import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Stepper from '../components/Stepper';
import MetricCard from '../components/MetricCard';
import { Search, Plus, Edit3, CheckCircle, ExternalLink, Trash2, X, ArrowRight, ShieldAlert, AlertCircle } from 'lucide-react';

export default function TasksApprovals({ onOpenPerformance, onAssignNewTask, isAssignOpen, onCloseAssign }) {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({
    openTasks: 0,
    dueToday: 0,
    highCritical: 0,
    shopFloor: 0,
    onTimeCloseRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  // Edit Task modal state (Screenshot 4)
  const [editingTask, setEditingTask] = useState(null);

  // New task form state
  const [newTaskForm, setNewTaskForm] = useState({
    department: 'Sales',
    stakeholderName: '',
    roleTitle: 'Sales Executive',
    linkedJob: '',
    title: '',
    targetMetric: '',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    dueAt: '',
    shift: 'GENERAL',
    evidenceUrl: '',
    description: '',
  });

  const steps = [
    { title: 'Choose Stakeholder', sub: 'Department · role' },
    { title: 'Define Work', sub: 'Task · target · quantity' },
    { title: 'Set Control', sub: 'Priority · shift · due' },
    { title: 'Track / Close', sub: 'Status · evidence' },
  ];

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getTasks({ department: deptFilter, search });
      setTasks(res.data || []);
      if (res.summary) {
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.message || 'Failed to fetch tasks from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [deptFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTasks();
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTask) return;
    try {
      await api.updateTask(editingTask.id, editingTask);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.createTask(newTaskForm);
      if (onCloseAssign) onCloseAssign();
      setNewTaskForm({
        department: 'Sales',
        stakeholderName: '',
        roleTitle: 'Sales Executive',
        linkedJob: '',
        title: '',
        targetMetric: '',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueAt: '',
        shift: 'GENERAL',
        evidenceUrl: '',
        description: '',
      });
      fetchTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleQuickApprove = async (task) => {
    try {
      if (task.status === 'WAITING_APPROVAL') {
        await api.handleApproval(task.id, 'APPROVE');
      } else if (task.status === 'IN_PROGRESS' || task.status === 'OPEN' || task.status === 'DUE_TODAY') {
        await api.updateTask(task.id, { status: 'COMPLETED', completedAt: new Date().toISOString() });
      } else {
        await api.updateTask(task.id, { status: 'IN_PROGRESS' });
      }
      fetchTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTask = async (id, taskNo) => {
    if (!window.confirm(`Are you sure you want to delete task ${taskNo}? This will be recorded in the audit log.`)) {
      return;
    }
    try {
      await api.deleteTask(id);
      fetchTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'critical';
      case 'HIGH': return 'high';
      case 'MEDIUM': return 'medium';
      default: return 'low';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'COMPLETED': return 'completed';
      case 'WAITING_APPROVAL': return 'waiting-approval';
      case 'DUE_TODAY': return 'due-today';
      case 'IN_PROGRESS': return 'in-progress';
      default: return 'low';
    }
  };

  return (
    <div className="page-container">
      {/* Banner */}
      <div className="submodule-banner">
        <div className="banner-content">
          <div className="banner-kicker">MODULE 7 · WORKFORCE, ADMIN & MIS</div>
          <h2 className="banner-heading">Tasks, Roles & Approvals</h2>
          <p className="banner-description">
            Assign measurable daily work to Sales, Accounts, Procurement, Engineering, Production roles such as welder/cutter, QC, HR, Project Manager, Site Manager and Stores—always linked to a job or internal target.
          </p>
        </div>
        <div className="banner-actions">
          <button className="btn-primary" onClick={onAssignNewTask}>
            <Plus size={16} /> Assign New Task
          </button>
        </div>
      </div>

      {/* Stepper */}
      <Stepper steps={steps} />

      {error && (
        <div style={{
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          borderRadius: '0.5rem',
          padding: '0.875rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#9f1239'
        }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            <strong>Database Status:</strong> {error}
          </span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="metrics-grid">
        <MetricCard label="Open Tasks" value={summary.openTasks} sub="Across functions" accent="green" barWidth="75%" />
        <MetricCard label="Due Today" value={summary.dueToday} sub="Needs action" accent="orange" barWidth="50%" />
        <MetricCard label="High / Critical" value={summary.highCritical} sub="Priority queue" accent="red" barWidth="40%" />
        <MetricCard label="Shop Floor" value={summary.shopFloor} sub="Worker assignments" accent="green" barWidth="65%" />
        <MetricCard label="On-Time Close" value={`${summary.onTimeCloseRate}%`} sub="Current month" accent="green" barWidth={`${summary.onTimeCloseRate}%`} />
      </div>

      {/* Cross-functional Assignment Register */}
      <div className="panel-card content-full-width">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Cross-functional Assignment Register</h3>
            <p className="panel-subtitle">Click any task to edit assignment details or use the Action column controls</p>
          </div>
          <button className="btn-secondary" onClick={onOpenPerformance} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
            Open Performance →
          </button>
        </div>

        {/* Search & Filters */}
        <form className="table-controls" onSubmit={handleSearchSubmit}>
          <div className="search-box">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search task, stakeholder, role, SO..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="Sales">Sales</option>
            <option value="Accounts">Accounts</option>
            <option value="Production">Production</option>
            <option value="Engineering">Engineering</option>
            <option value="Quality">Quality</option>
          </select>
        </form>

        {/* Register Table with ACTION Column */}
        <div className="table-wrapper">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Task / Job</th>
                <th>Department</th>
                <th>Stakeholder / Role</th>
                <th>Task</th>
                <th>Target / Qty</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due</th>
                <th>Shift</th>
                <th style={{ textAlign: 'center', minWidth: '170px', background: '#e0f2fe', color: '#0369a1' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    Loading tasks from database...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No task records found in the database. Click "Assign New Task" above to create one.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                <tr
                  key={task.id}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    // Prevent row click if an action button was clicked
                    if (e.target.closest('.action-cell')) return;
                    setEditingTask({ ...task });
                  }}
                >
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{task.taskNo}</div>
                    <div style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 600 }}>{task.linkedJob}</div>
                  </td>
                  <td>{task.department}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{task.stakeholderName}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{task.roleTitle}</div>
                  </td>
                  <td style={{ maxWidth: '280px', fontWeight: 500 }}>
                    {task.title}
                  </td>
                  <td style={{ color: '#475569', fontWeight: 500 }}>{task.targetMetric}</td>
                  <td>
                    <span className={`status-pill ${getPriorityClass(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${getStatusClass(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{task.dueAt}</td>
                  <td>{task.shift}</td>
                  
                  {/* Dedicated Action Column per user requirement */}
                  <td className="action-cell" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <button
                        className="btn-table-action primary"
                        onClick={() => setEditingTask({ ...task })}
                        title="Edit Task Assignment (Screenshot 4)"
                      >
                        <Edit3 size={13} /> Edit
                      </button>

                      <button
                        className="btn-table-action"
                        onClick={() => handleQuickApprove(task)}
                        title={task.status === 'WAITING_APPROVAL' ? 'Approve Task' : 'Complete Task'}
                        style={{
                          background: task.status === 'WAITING_APPROVAL' ? '#ecfdf5' : '#f8fafc',
                          color: task.status === 'WAITING_APPROVAL' ? '#047857' : '#0284c7',
                          borderColor: task.status === 'WAITING_APPROVAL' ? '#a7f3d0' : '#bae6fd',
                        }}
                      >
                        <CheckCircle size={13} />
                        {task.status === 'WAITING_APPROVAL' ? 'Approve' : task.status === 'COMPLETED' ? 'Reopen' : 'Done'}
                      </button>

                      {task.evidenceUrl && (
                        <a
                          href={task.evidenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-table-action"
                          title="Open Evidence Document"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}

                      <button
                        className="btn-table-action danger"
                        onClick={() => handleDeleteTask(task.id, task.taskNo)}
                        title="Delete Task"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit Task • TSK-XXXX (Matching Screenshot 4 Exactly) */}
      {editingTask && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Edit Task · {editingTask.taskNo}</h3>
              <button className="modal-close-btn" onClick={() => setEditingTask(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                {/* Row 1: Department, Stakeholder, Role */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Department</label>
                    <select
                      className="form-select"
                      value={editingTask.department}
                      onChange={(e) => setEditingTask({ ...editingTask, department: e.target.value })}
                    >
                      <option value="Sales">Sales</option>
                      <option value="Accounts">Accounts</option>
                      <option value="Production">Production</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Quality">Quality</option>
                      <option value="Stores">Stores</option>
                    </select>
                    <span className="form-hint">DROPDOWN</span>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Stakeholder</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingTask.stakeholderName}
                      onChange={(e) => setEditingTask({ ...editingTask, stakeholderName: e.target.value })}
                    />
                    <span className="form-hint">TEXT</span>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      value={editingTask.roleTitle}
                      onChange={(e) => setEditingTask({ ...editingTask, roleTitle: e.target.value })}
                    >
                      <option value="Sales Executive">Sales Executive</option>
                      <option value="Accountant">Accountant</option>
                      <option value="Machine Operator">Machine Operator</option>
                      <option value="Production Supervisor">Production Supervisor</option>
                      <option value="Project Engineer">Project Engineer</option>
                      <option value="Quality Inspector">Quality Inspector</option>
                    </select>
                    <span className="form-hint">DROPDOWN</span>
                  </div>
                </div>

                {/* Row 2: Linked Job */}
                <div className="form-group">
                  <label className="form-label">Linked Job</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingTask.linkedJob || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, linkedJob: e.target.value })}
                    placeholder="e.g. SO-2026-118"
                  />
                  <span className="form-hint">DROPDOWN / TEXT</span>
                </div>

                {/* Row 3: Task Description */}
                <div className="form-group">
                  <label className="form-label">Task</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  />
                  <span className="form-hint">LONG TEXT</span>
                </div>

                {/* Row 4: Target/Quantity, Priority, Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Target / Quantity</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingTask.targetMetric || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, targetMetric: e.target.value })}
                    />
                    <span className="form-hint">TEXT</span>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      value={editingTask.priority}
                      onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                    >
                      <option value="CRITICAL">Critical</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                    <span className="form-hint">DROPDOWN</span>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={editingTask.status}
                      onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                    >
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DUE_TODAY">Due Today</option>
                      <option value="WAITING_APPROVAL">Waiting Approval</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="OPEN">Open</option>
                      <option value="BLOCKED">Blocked</option>
                    </select>
                    <span className="form-hint">DROPDOWN</span>
                  </div>
                </div>

                {/* Row 5: Due / Shift, Shift, Evidence / URL */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Due / Shift</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingTask.dueAt || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, dueAt: e.target.value })}
                    />
                    <span className="form-hint">TEXT</span>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Shift</label>
                    <select
                      className="form-select"
                      value={editingTask.shift || 'GENERAL'}
                      onChange={(e) => setEditingTask({ ...editingTask, shift: e.target.value })}
                    >
                      <option value="GENERAL">General</option>
                      <option value="SHIFT_A">Shift A</option>
                      <option value="SHIFT_B">Shift B</option>
                      <option value="SITE">Site</option>
                    </select>
                    <span className="form-hint">DROPDOWN</span>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Evidence / URL</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingTask.evidenceUrl || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, evidenceUrl: e.target.value })}
                      placeholder="https://"
                    />
                    <span className="form-hint">CLICKABLE URL</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditingTask(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign New Task */}
      {isAssignOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Assign New Cross-Functional Task</h3>
              <button className="modal-close-btn" onClick={onCloseAssign}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Department *</label>
                    <select
                      className="form-select"
                      value={newTaskForm.department}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, department: e.target.value })}
                    >
                      <option value="Sales">Sales</option>
                      <option value="Accounts">Accounts</option>
                      <option value="Production">Production</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Quality">Quality</option>
                      <option value="Stores">Stores</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Stakeholder *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={newTaskForm.stakeholderName}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, stakeholderName: e.target.value })}
                      placeholder="Enter stakeholder name"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      value={newTaskForm.roleTitle}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, roleTitle: e.target.value })}
                    >
                      <option value="Sales Executive">Sales Executive</option>
                      <option value="Accountant">Accountant</option>
                      <option value="Machine Operator">Machine Operator</option>
                      <option value="Production Supervisor">Production Supervisor</option>
                      <option value="Project Engineer">Project Engineer</option>
                      <option value="Quality Inspector">Quality Inspector</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Linked Job / Reference</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newTaskForm.linkedJob}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, linkedJob: e.target.value })}
                    placeholder="e.g. SO or WO reference (optional)"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Task Title / Specification *</label>
                  <textarea
                    rows={3}
                    required
                    className="form-textarea"
                    value={newTaskForm.title}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                    placeholder="Describe specific measurable daily task..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Target / Qty</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newTaskForm.targetMetric}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, targetMetric: e.target.value })}
                      placeholder="e.g. 1 call + note"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      value={newTaskForm.priority}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                    >
                      <option value="CRITICAL">Critical</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Due By</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newTaskForm.dueAt}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, dueAt: e.target.value })}
                      placeholder="e.g. Today 15:00"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Shift</label>
                    <select
                      className="form-select"
                      value={newTaskForm.shift}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, shift: e.target.value })}
                    >
                      <option value="GENERAL">General</option>
                      <option value="SHIFT_A">Shift A</option>
                      <option value="SHIFT_B">Shift B</option>
                      <option value="SITE">Site</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Evidence / URL</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newTaskForm.evidenceUrl}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, evidenceUrl: e.target.value })}
                      placeholder="https://"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={onCloseAssign}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
