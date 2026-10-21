import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  User, 
  ChevronRight, 
  Info, 
  CalendarDays,
  ShieldAlert,
  FileText,
  X,
  RefreshCw,
  Check,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';

export default function LeaveManagement() {
  const [dashboard, setDashboard] = useState(null);
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // New Request Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [leaveType, setLeaveType] = useState('CASUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [calculatedDays, setCalculatedDays] = useState(1);
  const [empBalances, setEmpBalances] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Reject Modal State
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Details Modal State
  const [detailsItem, setDetailsItem] = useState(null);

  // Load Initial Data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, reqRes, empRes] = await Promise.all([
        api.getLeaveDashboard(),
        api.getLeaveRequests(),
        api.getEmployees(),
      ]);

      if (dashRes && dashRes.success) {
        setDashboard(dashRes.dashboard || null);
      }
      if (reqRes && reqRes.success) {
        setRequests(reqRes.requests || reqRes.data || []);
      }
      if (empRes && empRes.success) {
        const empList = empRes.employees || empRes.data || [];
        setEmployees(empList);
        if (empList.length > 0 && !selectedEmpId) {
          setSelectedEmpId(empList[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load leave data:', err);
      setError(err.message || 'Unable to connect to leave management service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update dynamic leave balance whenever selected employee changes in modal
  useEffect(() => {
    if (selectedEmpId) {
      api.getLeaveBalances(selectedEmpId)
        .then((res) => {
          if (res.success) setEmpBalances(res.balances);
        })
        .catch((e) => console.warn('Could not fetch balances:', e));
    }
  }, [selectedEmpId]);

  // Recalculate working days dynamically on date change
  useEffect(() => {
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e >= s) {
        let count = 0;
        const cur = new Date(s);
        while (cur <= e) {
          if (cur.getDay() !== 0) count++; // skip Sunday
          cur.setDate(cur.getDate() + 1);
        }
        setCalculatedDays(Math.max(1, count));
      } else {
        setCalculatedDays(0);
      }
    }
  }, [startDate, endDate]);

  const showToast = (message, type = 'success') => {
    setActionNotice({ message, type });
    setTimeout(() => setActionNotice(null), 4500);
  };

  // Submit Leave Request Handler
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedEmpId || !startDate || !endDate || !reason.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setFormError('End date cannot be prior to start date.');
      return;
    }

    if (empBalances && empBalances[leaveType]) {
      const available = empBalances[leaveType].available;
      if (calculatedDays > available) {
        setFormError(`Insufficient ${leaveType} balance. You requested ${calculatedDays} day(s), but only ${available} day(s) remain.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await api.createLeaveRequest({
        employeeId: selectedEmpId,
        leaveType,
        startDate,
        endDate,
        requestedDays: calculatedDays,
        reason: reason.trim(),
      });

      if (res.success) {
        showToast(res.message || 'Leave request submitted successfully.');
        setIsNewModalOpen(false);
        setReason('');
        setStartDate('');
        setEndDate('');
        loadData();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  // Approve Handler
  const handleApprove = async (id, reqId) => {
    try {
      const res = await api.approveLeaveRequest(id);
      if (res.success) {
        showToast(res.message || `Leave request ${reqId} approved successfully.`);
        loadData();
      }
    } catch (err) {
      alert(`Approval error: ${err.message}`);
    }
  };

  // Reject Submit Handler
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason || rejectReason.trim().length < 3) {
      setRejectError('A mandatory rejection reason is required (minimum 3 characters).');
      return;
    }

    setRejecting(true);
    setRejectError('');
    try {
      const res = await api.rejectLeaveRequest(rejectingItem.id, rejectReason.trim());
      if (res.success) {
        showToast(res.message || `Leave request ${rejectingItem.requestId} rejected.`, 'info');
        setRejectingItem(null);
        setRejectReason('');
        loadData();
      }
    } catch (err) {
      setRejectError(err.message || 'Failed to reject request');
    } finally {
      setRejecting(false);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    if (departmentFilter !== 'All' && r.department?.toLowerCase() !== departmentFilter.toLowerCase()) return false;
    if (typeFilter !== 'All' && r.leaveType !== typeFilter) return false;
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        r.requestId?.toLowerCase().includes(q) ||
        r.employeeName?.toLowerCase().includes(q) ||
        r.employeeCode?.toLowerCase().includes(q) ||
        r.reason?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="erp-page-container">
      {/* Action Notification Banner */}
      {actionNotice && (
        <div className={`action-toast-banner ${actionNotice.type}`}>
          <div className="toast-content">
            {actionNotice.type === 'success' ? <Check size={18} /> : <Info size={18} />}
            <span>{actionNotice.message}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="toast-close">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <div className="page-breadcrumb">
            <span>Workforce Management</span>
            <ChevronRight size={13} />
            <span className="current">Leave Management & Approvals</span>
          </div>
          <h1 className="page-main-heading">Leave Management</h1>
          <p className="page-sub-heading">
            Submit workforce leave requests, track real-time leave balances, and execute role-guarded manager approvals.
          </p>
        </div>

        <div className="page-header-actions">
          <button 
            className="btn-refresh" 
            onClick={loadData} 
            disabled={loading}
            title="Refresh leave registry"
          >
            <RefreshCw size={15} className={loading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>

          <button 
            className="btn-primary"
            onClick={() => {
              setFormError('');
              setIsNewModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-alert-card">
          <AlertCircle size={20} color="#dc2626" />
          <div className="error-text">
            <strong>Backend Connection Notice:</strong> {error}
          </div>
          <button className="btn-retry-small" onClick={loadData}>Retry</button>
        </div>
      )}

      {/* KPI Cards Row (Calculated from real backend records) */}
      <div className="kpi-cards-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap blue">
            <Calendar size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">TOTAL REQUESTS</span>
            <span className="kpi-val">{dashboard?.totalRequests ?? (loading ? '...' : 0)}</span>
            <span className="kpi-subtext">All historical submissions</span>
          </div>
        </div>

        <div className="kpi-card highlight-pending">
          <div className="kpi-icon-wrap amber">
            <Clock size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">PENDING APPROVAL</span>
            <span className="kpi-val amber-text">{dashboard?.pendingApprovals ?? (loading ? '...' : 0)}</span>
            <span className="kpi-subtext">Requires Manager Action</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap green">
            <CheckCircle2 size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">APPROVED LEAVES</span>
            <span className="kpi-val green-text">{dashboard?.approvedRequests ?? (loading ? '...' : 0)}</span>
            <span className="kpi-subtext">Balance deducted</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap red">
            <XCircle size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">REJECTED REQUESTS</span>
            <span className="kpi-val red-text">{dashboard?.rejectedRequests ?? (loading ? '...' : 0)}</span>
            <span className="kpi-subtext">No balance deducted</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap purple">
            <User size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">ON LEAVE TODAY</span>
            <span className="kpi-val purple-text">{dashboard?.onLeaveTodayCount ?? (loading ? '...' : 0)}</span>
            <span className="kpi-subtext">
              {dashboard?.employeesOnLeaveToday?.length > 0 
                ? dashboard.employeesOnLeaveToday.map(e => e.employeeName).join(', ')
                : 'Full workforce active'}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap slate">
            <CalendarDays size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">UPCOMING SCHEDULE</span>
            <span className="kpi-val">{dashboard?.upcomingSchedule?.length ?? (loading ? '...' : 0)}</span>
            <span className="kpi-subtext">Next 14 business days</span>
          </div>
        </div>
      </div>

      {/* Leave Balances Quick Reference Bar */}
      <div className="leave-balance-panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <ShieldAlert size={16} color="#2563eb" />
            <h3>Enterprise Leave Policy Entitlements</h3>
          </div>
          <span className="panel-tag">Annual Allocation Standards</span>
        </div>
        <div className="policy-cards-grid">
          <div className="policy-card">
            <div className="policy-type">
              <span className="dot casual"></span>
              <strong>Casual Leave (CL)</strong>
            </div>
            <span className="policy-val">12 Days / Year</span>
            <p>Personal necessities, short family functions, urgent domestic needs.</p>
          </div>

          <div className="policy-card">
            <div className="policy-type">
              <span className="dot sick"></span>
              <strong>Sick Leave (SL)</strong>
            </div>
            <span className="policy-val">10 Days / Year</span>
            <p>Illness, medical checkups, viral recovery. Doctor note required for &gt; 2 days.</p>
          </div>

          <div className="policy-card">
            <div className="policy-type">
              <span className="dot earned"></span>
              <strong>Earned Leave (EL)</strong>
            </div>
            <span className="policy-val">15 Days / Year</span>
            <p>Annual festival vacations, long planned travels. Minimum 7 days advance notice.</p>
          </div>
        </div>
      </div>

      {/* Main Request Registry Table Section */}
      <div className="table-wrapper-card">
        <div className="table-header-controls">
          <div className="table-title-area">
            <h2>Leave Request Registry</h2>
            <span className="counter-badge">{filteredRequests.length} Records</span>
          </div>

          {/* Search & Filter Bar */}
          <div className="filters-row">
            <div className="search-input-box">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by ID, employee, reason..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="clear-search" onClick={() => setSearch('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="select-filter-group">
              <select 
                value={departmentFilter} 
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Departments</option>
                <option value="Sales">Sales</option>
                <option value="Accounts">Accounts</option>
                <option value="Production">Production</option>
                <option value="Engineering">Engineering</option>
                <option value="Quality">Quality</option>
              </select>

              <select 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Leave Types</option>
                <option value="CASUAL">Casual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="EARNED">Earned Leave</option>
              </select>

              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Statuses</option>
                <option value="PENDING">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="table-responsive-container">
          <table className="erp-data-table">
            <thead>
              <tr>
                <th>REQUEST ID</th>
                <th>EMPLOYEE</th>
                <th>DEPARTMENT</th>
                <th>LEAVE TYPE</th>
                <th>DATES & DAYS</th>
                <th>REASON</th>
                <th>SUBMITTED</th>
                <th>STATUS</th>
                <th>DECISION / AUDIT</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="table-loading-cell">
                    <RefreshCw size={24} className="spinning" />
                    <span>Loading leave records from backend...</span>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="10" className="table-empty-cell">
                    <Info size={28} />
                    <p>No leave requests match the selected filters.</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isPending = req.status === 'PENDING';
                  const isApproved = req.status === 'APPROVED';
                  const isRejected = req.status === 'REJECTED';

                  return (
                    <tr key={req.id} className={isPending ? 'row-pending-highlight' : ''}>
                      <td>
                        <span className="req-id-pill">{req.requestId}</span>
                      </td>

                      <td>
                        <div className="employee-cell">
                          <div className="emp-avatar-sm">
                            {req.employeeName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="emp-name-stack">
                            <span className="emp-full-name">{req.employeeName}</span>
                            <span className="emp-code-sub">{req.employeeCode}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="dept-tag">{req.department}</span>
                      </td>

                      <td>
                        <span className={`leave-type-badge ${req.leaveType.toLowerCase()}`}>
                          {req.leaveType}
                        </span>
                      </td>

                      <td>
                        <div className="dates-cell">
                          <span className="date-range">{req.startDate} → {req.endDate}</span>
                          <span className="days-count">{req.requestedDays} working {req.requestedDays === 1 ? 'day' : 'days'}</span>
                        </div>
                      </td>

                      <td>
                        <span className="reason-text-cell" title={req.reason}>
                          {req.reason}
                        </span>
                      </td>

                      <td>
                        <span className="sub-date">
                          {new Date(req.submittedAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>

                      <td>
                        <span className={`status-pill ${req.status.toLowerCase()}`}>
                          <span className="status-dot"></span>
                          {req.status}
                        </span>
                      </td>

                      <td>
                        {isPending && (
                          <span className="awaiting-label">Awaiting Manager Review</span>
                        )}
                        {isApproved && (
                          <div className="decision-info">
                            <span className="approver-name">{req.approverName}</span>
                            <span className="decision-date">
                              {new Date(req.decidedAt).toLocaleDateString('en-IN', { month: 'short', day: '2-digit' })}
                            </span>
                          </div>
                        )}
                        {isRejected && (
                          <div className="decision-info rejected">
                            <span className="approver-name">{req.approverName}</span>
                            <span className="rejection-note" title={req.rejectionReason}>
                              {req.rejectionReason || 'Rejected'}
                            </span>
                          </div>
                        )}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions-group">
                          {isPending && (
                            <>
                              <button 
                                className="action-btn-approve" 
                                onClick={() => handleApprove(req.id, req.requestId)}
                                title="Approve Request & Deduct Balance"
                              >
                                <Check size={14} />
                                <span>Approve</span>
                              </button>

                              <button 
                                className="action-btn-reject" 
                                onClick={() => {
                                  setRejectingItem(req);
                                  setRejectReason('');
                                  setRejectError('');
                                }}
                                title="Reject Request with Reason"
                              >
                                <X size={14} />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          <button 
                            className="action-btn-details"
                            onClick={() => setDetailsItem(req)}
                            title="View Full Request & Balance Details"
                          >
                            <FileText size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================================
          MODAL 1: APPLY FOR LEAVE
      ====================================================================== */}
      {isNewModalOpen && (
        <div className="erp-modal-overlay">
          <div className="erp-modal-content">
            <div className="modal-header">
              <div className="modal-title-stack">
                <div className="modal-badge-icon">
                  <CalendarDays size={18} color="#2563eb" />
                </div>
                <div>
                  <h3>Apply for Workforce Leave</h3>
                  <p>Submit formal leave request for approval and balance verification</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setIsNewModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="modal-error-alert">
                    <AlertTriangle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Employee Selector */}
                <div className="form-group">
                  <label>Select Employee *</label>
                  <select 
                    value={selectedEmpId} 
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    required
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.fullName} ({e.employeeCode}) — {e.department}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Real-time Employee Balances Display */}
                {empBalances && (
                  <div className="balance-preview-box">
                    <span className="preview-heading">Available Leave Balances for Selected Employee:</span>
                    <div className="balance-chips-row">
                      <div className={`balance-chip ${leaveType === 'CASUAL' ? 'selected' : ''}`}>
                        <span className="chip-name">Casual:</span>
                        <strong>{empBalances.CASUAL?.available ?? 0} days</strong>
                      </div>
                      <div className={`balance-chip ${leaveType === 'SICK' ? 'selected' : ''}`}>
                        <span className="chip-name">Sick:</span>
                        <strong>{empBalances.SICK?.available ?? 0} days</strong>
                      </div>
                      <div className={`balance-chip ${leaveType === 'EARNED' ? 'selected' : ''}`}>
                        <span className="chip-name">Earned:</span>
                        <strong>{empBalances.EARNED?.available ?? 0} days</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Leave Type Selector */}
                <div className="form-group">
                  <label>Leave Type *</label>
                  <select 
                    value={leaveType} 
                    onChange={(e) => setLeaveType(e.target.value)}
                    required
                  >
                    <option value="CASUAL">Casual Leave (Personal / Urgent)</option>
                    <option value="SICK">Sick Leave (Medical / Illness)</option>
                    <option value="EARNED">Earned Leave (Annual Vacations)</option>
                  </select>
                </div>

                {/* Date Ranges */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>End Date *</label>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                {/* Dynamic Calculated Working Days Preview */}
                {startDate && endDate && (
                  <div className="calculated-days-indicator">
                    <Clock size={16} />
                    <span>
                      Requested Working Days: <strong>{calculatedDays} working day(s)</strong> (excludes Sundays)
                    </span>
                  </div>
                )}

                {/* Reason Textarea */}
                <div className="form-group">
                  <label>Reason for Leave *</label>
                  <textarea 
                    rows="3" 
                    placeholder="Provide specific reason for absence..." 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setIsNewModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: REJECT WITH MANDATORY REASON
      ====================================================================== */}
      {rejectingItem && (
        <div className="erp-modal-overlay">
          <div className="erp-modal-content small-modal">
            <div className="modal-header reject-header">
              <div className="modal-title-stack">
                <div className="modal-badge-icon red">
                  <XCircle size={18} color="#dc2626" />
                </div>
                <div>
                  <h3>Reject Leave Request</h3>
                  <p>{rejectingItem.requestId} · {rejectingItem.employeeName}</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setRejectingItem(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit}>
              <div className="modal-body">
                {rejectError && (
                  <div className="modal-error-alert">
                    <AlertTriangle size={16} />
                    <span>{rejectError}</span>
                  </div>
                )}

                <p className="reject-warning-text">
                  You are about to reject the leave request for <strong>{rejectingItem.requestedDays} day(s)</strong> from <strong>{rejectingItem.startDate}</strong> to <strong>{rejectingItem.endDate}</strong>. 
                  A mandatory reason is recorded in the system audit trail.
                </p>

                <div className="form-group">
                  <label>Mandatory Rejection Reason *</label>
                  <textarea 
                    rows="3" 
                    placeholder="State operational reason (e.g., project deadline, staffing shortage, conflicting shift)..." 
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setRejectingItem(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-reject-confirm"
                  disabled={rejecting}
                >
                  {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: REQUEST DETAILS & AUDIT TRAIL
      ====================================================================== */}
      {detailsItem && (
        <div className="erp-modal-overlay">
          <div className="erp-modal-content">
            <div className="modal-header">
              <div className="modal-title-stack">
                <div className="modal-badge-icon">
                  <FileText size={18} color="#2563eb" />
                </div>
                <div>
                  <h3>Leave Request Details</h3>
                  <p>{detailsItem.requestId} · {detailsItem.employeeName}</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setDetailsItem(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-field">
                  <span className="field-label">Employee</span>
                  <span className="field-value font-semibold">{detailsItem.employeeName} ({detailsItem.employeeCode})</span>
                </div>

                <div className="detail-field">
                  <span className="field-label">Department</span>
                  <span className="field-value">{detailsItem.department}</span>
                </div>

                <div className="detail-field">
                  <span className="field-label">Leave Type</span>
                  <span className={`leave-type-badge ${detailsItem.leaveType.toLowerCase()}`}>
                    {detailsItem.leaveType} LEAVE
                  </span>
                </div>

                <div className="detail-field">
                  <span className="field-label">Current Status</span>
                  <span className={`status-pill ${detailsItem.status.toLowerCase()}`}>
                    <span className="status-dot"></span>
                    {detailsItem.status}
                  </span>
                </div>

                <div className="detail-field">
                  <span className="field-label">Start Date</span>
                  <span className="field-value">{detailsItem.startDate}</span>
                </div>

                <div className="detail-field">
                  <span className="field-label">End Date</span>
                  <span className="field-value">{detailsItem.endDate}</span>
                </div>

                <div className="detail-field">
                  <span className="field-label">Working Days</span>
                  <span className="field-value font-semibold">{detailsItem.requestedDays} working day(s)</span>
                </div>

                <div className="detail-field">
                  <span className="field-label">Submitted On</span>
                  <span className="field-value">{new Date(detailsItem.submittedAt).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="detail-section-box">
                <span className="section-box-title">Submitted Reason:</span>
                <p className="section-box-content">{detailsItem.reason}</p>
              </div>

              {detailsItem.status !== 'PENDING' && (
                <div className="audit-trail-box">
                  <span className="section-box-title">Decision Audit Trail:</span>
                  <div className="audit-meta-row">
                    <span>Decided By: <strong>{detailsItem.approverName || 'Management Admin'}</strong> ({detailsItem.approverRole || 'ADMIN'})</span>
                    <span>Timestamp: <strong>{detailsItem.decidedAt ? new Date(detailsItem.decidedAt).toLocaleString('en-IN') : 'N/A'}</strong></span>
                  </div>
                  {detailsItem.rejectionReason && (
                    <div className="rejection-reason-box">
                      <strong>Rejection Note:</strong> {detailsItem.rejectionReason}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => setDetailsItem(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
