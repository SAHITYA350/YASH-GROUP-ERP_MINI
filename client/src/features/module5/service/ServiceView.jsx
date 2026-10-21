// client/src/features/module5/service/ServiceView.jsx
import React, { useState, useMemo } from 'react';

export default function ServiceView({
  tickets,
  onOpenCreateTicket,
  onOpenAssignTask,
  onUpdateStatus,
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        t.ticketNo?.toLowerCase().includes(search.toLowerCase()) ||
        t.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.issue?.toLowerCase().includes(search.toLowerCase()) ||
        t.product?.name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tickets, search, statusFilter]);

  const openCount = tickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const waitingPartsCount = tickets.filter((t) => t.status === 'WAITING_PARTS').length;

  return (
    <div className="workspace-container">
      {/* PAGEHEAD */}
      <div className="pagehead">
        <div>
          <div className="eyebrow">MODULE 5 · SERVICE, COMPLAINT & WARRANTY</div>
          <h2>Service, Complaint & Warranty Management</h2>
          <p>
            Connected after-sales service and warranty lifecycle linked to original customers, products, serial numbers,
            installation test evidence, and field technician assignments.
          </p>
        </div>
        <div className="head-actions">
          <button type="button" className="btn" onClick={onOpenAssignTask}>
            ✓ Assign Task
          </button>
          <button type="button" className="btn primary" onClick={onOpenCreateTicket}>
            ＋ Raise Ticket
          </button>
        </div>
      </div>

      {/* FLOWBAR */}
      <div className="flowbar">
        <div className="flowstep">
          <div className="stepno">1</div>
          <div>
            <b>Raise Ticket</b>
            <small>Customer & product complaint</small>
          </div>
        </div>
        <div className="flowstep">
          <div className="stepno">2</div>
          <div>
            <b>Diagnose</b>
            <small>Field inspection visit</small>
          </div>
        </div>
        <div className="flowstep">
          <div className="stepno">3</div>
          <div>
            <b>Resolve</b>
            <small>Part replacement or tuning</small>
          </div>
        </div>
        <div className="flowstep">
          <div className="stepno">4</div>
          <div>
            <b>Close & Audit</b>
            <small>Sign-off & warranty register</small>
          </div>
        </div>
      </div>

      {/* 5 KPI METRICS */}
      <div className="metrics">
        <div className="metric" style={{ '--accent': '#2563eb' }}>
          <div className="label">OPEN TICKETS</div>
          <div className="value">{openCount}</div>
          <div className="foot">Needs field attention</div>
          <div className="progress">
            <i style={{ width: `${Math.min(openCount * 25, 100)}%`, background: '#2563eb' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#168456' }}>
          <div className="label">RESOLVED / CLOSED</div>
          <div className="value">{resolvedCount}</div>
          <div className="foot">Customer verified</div>
          <div className="progress">
            <i style={{ width: `${Math.min(resolvedCount * 25, 100)}%`, background: '#168456' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#7c3aed' }}>
          <div className="label">TOTAL REGISTERED</div>
          <div className="value">{tickets.length}</div>
          <div className="foot">Database ticket log</div>
          <div className="progress">
            <i style={{ width: `${Math.min(tickets.length * 20, 100)}%`, background: '#7c3aed' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#0ea5e9' }}>
          <div className="label">WARRANTY SLA</div>
          <div className="value">94%</div>
          <div className="foot">Met within standard SLA</div>
          <div className="progress">
            <i style={{ width: '94%', background: '#0ea5e9' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#b91c1c' }}>
          <div className="label">WAITING PARTS</div>
          <div className="value">{waitingPartsCount}</div>
          <div className="foot">Material dispatch pending</div>
          <div className="progress">
            <i style={{ width: waitingPartsCount > 0 ? '30%' : '5%', background: '#b91c1c' }}></i>
          </div>
        </div>
      </div>

      {/* EXPANSIVE FULL-WIDTH TICKET REGISTER */}
      <div className="card main-activity-card">
        <div className="cardhead workspace-toolbar-head">
          <div className="workspace-title-box">
            <h3>Service & Warranty Register</h3>
            <small>Live complaints and field service dispatch linked to products and customers</small>
          </div>
          <span className="status green">Controlled ERP Log</span>
        </div>

        <div className="toolbar spacious-toolbar">
          <div className="search-wrap">
            <input
              type="text"
              className="field search"
              placeholder="Search ticket number, customer, issue, product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-chips">
            <button
              type="button"
              className={`chip-filter ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All ({tickets.length})
            </button>
            <button
              type="button"
              className={`chip-filter ${statusFilter === 'OPEN' ? 'active' : ''}`}
              onClick={() => setStatusFilter('OPEN')}
            >
              Open ({tickets.filter((t) => t.status === 'OPEN').length})
            </button>
            <button
              type="button"
              className={`chip-filter ${statusFilter === 'IN_PROGRESS' ? 'active' : ''}`}
              onClick={() => setStatusFilter('IN_PROGRESS')}
            >
              In Progress ({tickets.filter((t) => t.status === 'IN_PROGRESS').length})
            </button>
            <button
              type="button"
              className={`chip-filter ${statusFilter === 'WAITING_PARTS' ? 'active' : ''}`}
              onClick={() => setStatusFilter('WAITING_PARTS')}
            >
              Waiting Parts ({waitingPartsCount})
            </button>
            <button
              type="button"
              className={`chip-filter ${statusFilter === 'RESOLVED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('RESOLVED')}
            >
              Resolved ({resolvedCount})
            </button>
          </div>
        </div>

        <div className="tablewrap expansive-table">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Ticket No</th>
                <th>Customer & Location</th>
                <th>Reported Issue</th>
                <th>Product Specification</th>
                <th>Assigned Technician</th>
                <th>Status</th>
                <th style={{ width: '140px', textAlign: 'right' }}>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
                    <div style={{ fontSize: '30px', marginBottom: '8px' }}>🛠️</div>
                    <b>No service tickets found matching your filter.</b>
                    <p style={{ margin: '4px 0 16px', fontSize: '12px' }}>
                      Click <b>＋ Raise Ticket</b> to register a customer claim or service request.
                    </p>
                    <button type="button" className="btn primary" onClick={onOpenCreateTicket}>
                      ＋ Raise Ticket
                    </button>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t.id} className="project-row">
                    <td>
                      <span className="code-pill">{t.ticketNo}</span>
                      {t.serialNumber && (
                        <span className="so-pill" title="Serial Number">
                          SN: {t.serialNumber}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="customer-info-cell">
                        <b>{t.customer?.name || 'Customer'}</b>
                        {t.customer?.city && <small>📍 {t.customer.city}</small>}
                      </div>
                    </td>
                    <td>
                      <div className="proj-title-cell">
                        <b>{t.issue}</b>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#173d31' }}>
                        {t.product?.name || 'Standard Earthing Unit'}
                      </span>
                    </td>
                    <td>
                      <div className="owner-cell">
                        <span className="owner-avatar">
                          {(t.assignedTo?.name || 'T').charAt(0).toUpperCase()}
                        </span>
                        <span>{t.assignedTo?.name || 'Field Technician'}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status ${
                          t.status === 'RESOLVED' || t.status === 'CLOSED'
                            ? 'green'
                            : t.status === 'IN_PROGRESS'
                            ? 'blue'
                            : t.status === 'WAITING_PARTS'
                            ? 'red'
                            : t.status === 'ASSIGNED'
                            ? 'amber'
                            : 'neutral'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <select
                        className="field mini-status-select"
                        value={t.status}
                        onChange={(e) => onUpdateStatus(t.id, e.target.value)}
                      >
                        <option value="OPEN">Open</option>
                        <option value="ASSIGNED">Assigned</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="WAITING_PARTS">Waiting Parts</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOWER SECTION: SERVICE ACTIONS & SLA COMPLIANCE */}
      <div className="lower-widgets-grid">
        <div className="card widget-card">
          <div className="cardhead">
            <div>
              <h3>Technician Field Service Checklist</h3>
              <small>Standard operating procedures for site maintenance</small>
            </div>
            <button type="button" className="btn sm" onClick={onOpenAssignTask}>
              ＋ Add Field Task
            </button>
          </div>
          <div className="cardbody">
            <div className="tasks-list-grid">
              <div className="todo-item-card">
                <input type="checkbox" className="check" defaultChecked />
                <div className="todo-details">
                  <b>Soil Resistivity Re-test</b>
                  <div className="todo-meta">
                    <span className="dept-pill">Service</span>
                    <span className="due-pill">Scheduled</span>
                  </div>
                </div>
                <span className="priority-badge high">HIGH</span>
              </div>

              <div className="todo-item-card">
                <input type="checkbox" className="check" />
                <div className="todo-details">
                  <b>Dispatch Replacement Terminal Clamps</b>
                  <div className="todo-meta">
                    <span className="dept-pill">Warehouse</span>
                    <span className="due-pill">Pending</span>
                  </div>
                </div>
                <span className="priority-badge medium">MEDIUM</span>
              </div>

              <div className="todo-item-card">
                <input type="checkbox" className="check" />
                <div className="todo-details">
                  <b>Inspect Earthing Pit Chamber Cover</b>
                  <div className="todo-meta">
                    <span className="dept-pill">Field Tech</span>
                    <span className="due-pill">Tomorrow</span>
                  </div>
                </div>
                <span className="priority-badge low">ROUTINE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card widget-card">
          <div className="cardhead">
            <div>
              <h3>Warranty Policy & SLA Compliance</h3>
              <small>Guarantee terms & service speed tracking</small>
            </div>
          </div>
          <div className="cardbody">
            <div className="audit-points-list">
              <div className="audit-item done">
                <span className="audit-ico">✓</span>
                <div>
                  <b>10-Year Pure Copper Bonded Guarantee</b>
                  <small>Covers electrode decomposition and core corrosion resistance</small>
                </div>
              </div>
              <div className="audit-item done">
                <span className="audit-ico">✓</span>
                <div>
                  <b>48-Hour Field Service Response SLA</b>
                  <small>Critical complaints visited and diagnosed within 48 hours of ticket logging</small>
                </div>
              </div>
              <div className="audit-item done">
                <span className="audit-ico">✓</span>
                <div>
                  <b>Serial Number Traceability</b>
                  <small>Each ticket references the manufacturer batch and initial commissioning test reading</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
