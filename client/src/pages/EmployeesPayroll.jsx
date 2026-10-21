import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Stepper from '../components/Stepper';
import MetricCard from '../components/MetricCard';
import { Search, Download, Plus, CheckSquare, Edit3, Eye, DollarSign, X, AlertCircle } from 'lucide-react';

export default function EmployeesPayroll({ onOpenAssignTask }) {
  const [employees, setEmployees] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [viewingPerfEmp, setViewingPerfEmp] = useState(null);
  const [showPayrollDrawer, setShowPayrollDrawer] = useState(false);
  const [payrollData, setPayrollData] = useState([]);

  // Form state for new employee
  const [newEmpForm, setNewEmpForm] = useState({
    fullName: '',
    department: 'Sales',
    designation: '',
    salary: 0,
    employmentType: 'Full-time',
    shift: 'General',
    currentWork: '',
  });

  const steps = [
    { title: 'Employee', sub: 'Role + skill' },
    { title: 'Attendance', sub: 'Shift + overtime' },
    { title: 'Work / Target', sub: 'Task + output' },
    { title: 'Payroll', sub: 'Salary + performance' },
  ];

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getEmployees({ department: deptFilter, search });
      setEmployees(res.data || res.employees || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err.message || 'Failed to connect to database for workforce records');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodos = async () => {
    try {
      const res = await api.getTodos();
      setTodos(res.data);
    } catch (err) {
      console.error('Error fetching todos:', err);
    }
  };

  const fetchPayroll = async () => {
    try {
      const res = await api.getPayroll();
      setPayrollData(res.data);
    } catch (err) {
      console.error('Error fetching payroll:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchTodos();
    fetchPayroll();
  }, [deptFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const handleToggleTodo = async (id) => {
    try {
      await api.toggleTodo(id);
      fetchTodos();
    } catch (err) {
      console.error('Error toggling todo:', err);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setModalError(null);
    try {
      await api.createEmployee(newEmpForm);
      setShowAddModal(false);
      setNewEmpForm({
        fullName: '',
        department: 'Sales',
        designation: '',
        salary: 0,
        employmentType: 'Full-time',
        shift: 'General',
        currentWork: '',
      });
      fetchEmployees();
      fetchPayroll();
    } catch (err) {
      setModalError(err.message || 'Failed to save employee to database');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!editingEmp) return;
    try {
      await api.updateEmployee(editingEmp.id, editingEmp);
      setEditingEmp(null);
      fetchEmployees();
      fetchPayroll();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['EmployeeCode,Name,Department,Designation,Attendance,Salary,CurrentWork']
        .concat(
          employees.map(
            (e) =>
              `${e.employeeCode},"${e.fullName}",${e.department},${e.designation},${e.attendanceRate}%,₹${e.salary},"${e.currentWork}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Employees_Payroll_Register.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePayrollApprove = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'APPROVED' ? 'PAID' : 'APPROVED';
      await api.updatePayrollStatus(id, nextStatus);
      fetchPayroll();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="page-container">
      {/* Banner */}
      <div className="submodule-banner">
        <div className="banner-content">
          <div className="banner-kicker">MODULE 7 · WORKFORCE, ADMIN & MIS</div>
          <h2 className="banner-heading">Employees, Attendance & Payroll</h2>
          <p className="banner-description">
            One workforce register for role, department, attendance, task completion, target achievement, quality, salary and the employee's current operational responsibility.
          </p>
        </div>
        <div className="banner-actions">
          <button className="btn-secondary" onClick={onOpenAssignTask}>
            <CheckSquare size={16} /> Assign Task
          </button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add New
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

      {/* Metric Cards Grid - Derived strictly from database records */}
      <div className="metrics-grid">
        <MetricCard 
          label="Employees" 
          value={employees.length.toString()} 
          sub={employees.length > 0 ? "Active workforce" : "No records found"} 
          accent="green" 
          barWidth={employees.length > 0 ? "100%" : "0%"} 
        />
        <MetricCard 
          label="Present" 
          value={employees.filter(e => e.todayAttendance === 'Present').length.toString()} 
          sub={employees.length > 0 ? `${Math.round((employees.filter(e => e.todayAttendance === 'Present').length / employees.length) * 100)}% active` : "0%"} 
          accent="green" 
          barWidth={employees.length > 0 ? `${Math.round((employees.filter(e => e.todayAttendance === 'Present').length / employees.length) * 100)}%` : "0%"} 
        />
        <MetricCard 
          label="Avg Task" 
          value={employees.length > 0 ? `${Math.round(employees.reduce((acc, e) => acc + (Number(e.taskCompletionRate) || 0), 0) / employees.length)}%` : "0%"} 
          sub="Completion rate" 
          accent="green" 
          barWidth={employees.length > 0 ? `${Math.round(employees.reduce((acc, e) => acc + (Number(e.taskCompletionRate) || 0), 0) / employees.length)}%` : "0%"} 
        />
        <MetricCard 
          label="Training Needed" 
          value={employees.filter(e => (Number(e.qualityScore) || 0) < 80).length.toString()} 
          sub="Quality score < 80%" 
          accent="orange" 
          barWidth={employees.length > 0 ? `${Math.round((employees.filter(e => (Number(e.qualityScore) || 0) < 80).length / employees.length) * 100)}%` : "0%"} 
        />
        <div style={{ cursor: 'pointer' }} onClick={() => setShowPayrollDrawer(true)} title="View Payroll Register">
          <MetricCard 
            label="Payroll" 
            value={payrollData.length > 0 ? `${payrollData.length} Records` : '₹0'} 
            sub={payrollData.length > 0 ? 'Month to date (Click to view)' : 'No payroll processed'} 
            accent="purple" 
            barWidth={payrollData.length > 0 ? "100%" : "0%"} 
          />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="content-layout">
        {/* Left: Register Table */}
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Employees, Attendance & Payroll Register</h3>
              <p className="panel-subtitle">Operational data is view-only until Edit is selected</p>
            </div>
            <span className="status-pill in-progress">Controlled register</span>
          </div>

          {/* Search & Controls */}
          <form className="table-controls" onSubmit={handleSearchSubmit}>
            <div className="search-box">
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search record, customer, SO, owner..."
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

            <button type="button" className="btn-secondary" onClick={handleExport}>
              <Download size={14} /> Export
            </button>
          </form>

          {/* Table */}
          <div className="table-wrapper">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Name</th>
                  <th>Dept</th>
                  <th>Role</th>
                  <th>Today</th>
                  <th>Attendance</th>
                  <th>Task %</th>
                  <th>Target %</th>
                  <th>Quality %</th>
                  <th>Salary</th>
                  <th>Current Work</th>
                  <th>Performance</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={13} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                      Loading workforce records from database...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={13} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                      No employee records found in the database. Use "Add New" above to register workforce members.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => {
                  const initials = emp.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={emp.id}>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{emp.employeeCode}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span className="emp-avatar-pill">{initials}</span>
                          <span style={{ fontWeight: 600 }}>{emp.fullName}</span>
                        </div>
                      </td>
                      <td>{emp.department}</td>
                      <td style={{ color: '#475569' }}>{emp.designation}</td>
                      <td>
                        <span className={`status-pill ${emp.todayAttendance === 'Present' ? 'present' : 'absent'}`}>
                          {emp.todayAttendance}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{emp.attendanceRate}%</td>
                      <td>{emp.taskCompletionRate}%</td>
                      <td>{emp.targetAchievementRate}%</td>
                      <td>{emp.qualityScore}%</td>
                      <td style={{ fontWeight: 700, color: '#047857' }}>₹{emp.salary.toLocaleString('en-IN')}</td>
                      <td style={{ maxWidth: '170px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {emp.currentWork}
                      </td>
                      <td>
                        <button
                          className="btn-table-action"
                          onClick={() => setViewingPerfEmp(emp)}
                          title="Open performance scorecard"
                        >
                          Dashboard
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn-table-action primary"
                          onClick={() => setEditingEmp({ ...emp })}
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar: HR Daily To-do & Target / Achievement */}
        <div>
          {/* HR Daily To-do Card */}
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3 className="panel-title">HR Daily To-do</h3>
                <p className="panel-subtitle">Daily operational To-do and next actions</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {todos.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem', padding: '1.5rem 0.5rem' }}>
                  No pending daily HR actions.
                </p>
              ) : (
                todos.map((todo) => (
                <div
                  key={todo.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: '#f8fafc',
                    borderRadius: '0.5rem',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleTodo(todo.id)}
                    style={{ marginTop: '0.25rem', cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          color: todo.completed ? '#94a3b8' : '#0f172a',
                        }}
                      >
                        {todo.title}
                      </span>
                      <span className={`status-pill ${todo.urgency === 'warning' ? 'due-today' : 'low'}`}>
                        {todo.tag}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                      {todo.description}
                    </p>
                  </div>
                </div>
              )))}
            </div>
          </div>

          {/* Target / Achievement Card */}
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3 className="panel-title">Target / Achievement</h3>
                <p className="panel-subtitle">Daily · weekly · monthly alignment</p>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                <span>Attendance %</span>
                <span style={{ color: '#047857' }}>90/95</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: '94.7%', height: '100%', background: '#047857', borderRadius: '9999px' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
              <span>Daily achievement: <strong>95%</strong></span>
              <span>Weekly: <strong>99%</strong> · Monthly: <strong>92%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add New Employee */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Register New Employee</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateEmployee}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={newEmpForm.fullName}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, fullName: e.target.value })}
                    placeholder="e.g. Ramesh Patel"
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      className="form-select"
                      value={newEmpForm.department}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, department: e.target.value })}
                    >
                      <option value="Sales">Sales</option>
                      <option value="Accounts">Accounts</option>
                      <option value="Production">Production</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Quality">Quality</option>
                      <option value="Dispatch">Dispatch</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newEmpForm.designation}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, designation: e.target.value })}
                      placeholder="e.g. Senior Technician"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Monthly Salary (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newEmpForm.salary}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, salary: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shift</label>
                    <select
                      className="form-select"
                      value={newEmpForm.shift}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, shift: e.target.value })}
                    >
                      <option value="General">General (09:30 - 18:30)</option>
                      <option value="Shift_A">Shift A (Morning)</option>
                      <option value="Shift_B">Shift B (Evening)</option>
                      <option value="Site">Site / Field</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Operational Assignment</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newEmpForm.currentWork}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, currentWork: e.target.value })}
                    placeholder="e.g. CNC setup + cutting"
                  />
                </div>

                {modalError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                    <strong>Error:</strong> {modalError}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving Employee...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Employee */}
      {editingEmp && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Edit Employee · {editingEmp.employeeCode}</h3>
              <button className="modal-close-btn" onClick={() => setEditingEmp(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateEmployee}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingEmp.fullName}
                    onChange={(e) => setEditingEmp({ ...editingEmp, fullName: e.target.value })}
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      className="form-select"
                      value={editingEmp.department}
                      onChange={(e) => setEditingEmp({ ...editingEmp, department: e.target.value })}
                    >
                      <option value="Sales">Sales</option>
                      <option value="Accounts">Accounts</option>
                      <option value="Production">Production</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Quality">Quality</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingEmp.designation}
                      onChange={(e) => setEditingEmp({ ...editingEmp, designation: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Monthly Salary (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={editingEmp.salary}
                      onChange={(e) => setEditingEmp({ ...editingEmp, salary: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Today Attendance</label>
                    <select
                      className="form-select"
                      value={editingEmp.todayAttendance}
                      onChange={(e) => setEditingEmp({ ...editingEmp, todayAttendance: e.target.value })}
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Current Operational Responsibility</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingEmp.currentWork || ''}
                    onChange={(e) => setEditingEmp({ ...editingEmp, currentWork: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditingEmp(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Employee Performance Dashboard */}
      {viewingPerfEmp && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Performance Scorecard · {viewingPerfEmp.fullName} ({viewingPerfEmp.employeeCode})</h3>
              <button className="modal-close-btn" onClick={() => setViewingPerfEmp(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>ATTENDANCE</span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857' }}>{viewingPerfEmp.attendanceRate}%</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>TASK VELOCITY</span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>{viewingPerfEmp.taskCompletionRate}%</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>TARGET</span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>{viewingPerfEmp.targetAchievementRate}%</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>QUALITY SCORE</span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7c3aed' }}>{viewingPerfEmp.qualityScore}%</p>
                </div>
              </div>

              <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #a7f3d0', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>Current Operational Assignment</span>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#064e3b', marginTop: '0.25rem' }}>
                  {viewingPerfEmp.currentWork || 'Standard operational duty'}
                </p>
              </div>

              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Department: <strong>{viewingPerfEmp.department}</strong> · Role: <strong>{viewingPerfEmp.designation}</strong> · Base Salary: <strong>₹{viewingPerfEmp.salary.toLocaleString('en-IN')}</strong>
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setViewingPerfEmp(null)}>
                Close Scorecard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer / Modal: Payroll Register & Calculation Preview */}
      {showPayrollDrawer && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '850px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Payroll Calculation Preview · October 2026</h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Computed pro-rated net pay based on active base salary, working days, and attendance deductions.
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowPayrollDrawer(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#92400e' }}>
                <strong>Data Safety Notice:</strong> These figures represent calculated salary previews. Salary is only marked as paid upon authorized disbursement and audit verification.
              </div>

              <div className="table-wrapper">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Name</th>
                      <th>Base Salary</th>
                      <th>Attendance Days</th>
                      <th>Deduction</th>
                      <th>Overtime</th>
                      <th>Net Pay</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollData.map((pr) => (
                      <tr key={pr.id}>
                        <td style={{ fontWeight: 700 }}>{pr.employeeCode}</td>
                        <td style={{ fontWeight: 600 }}>{pr.fullName}</td>
                        <td>₹{pr.baseSalary.toLocaleString('en-IN')}</td>
                        <td>{pr.presentDays} / {pr.workingDays}</td>
                        <td style={{ color: '#dc2626' }}>-₹{pr.attendanceDeduction.toLocaleString('en-IN')}</td>
                        <td style={{ color: '#047857' }}>+₹{pr.overtimePay.toLocaleString('en-IN')} ({pr.overtimeHours}h)</td>
                        <td style={{ fontWeight: 700, color: '#047857' }}>₹{pr.netSalary.toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`status-pill ${pr.status === 'PAID' ? 'completed' : pr.status === 'APPROVED' ? 'present' : 'waiting-approval'}`}>
                            {pr.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-table-action primary"
                            onClick={() => handlePayrollApprove(pr.id, pr.status)}
                          >
                            {pr.status === 'PAID' ? 'Marked Paid' : pr.status === 'APPROVED' ? 'Disburse' : 'Approve'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPayrollDrawer(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
