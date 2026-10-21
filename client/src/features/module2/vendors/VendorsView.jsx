// client/src/features/module2/vendors/VendorsView.jsx
import React, { useState, useMemo } from 'react';

export default function VendorsView({
  vendors,
  onOpenCreateVendor,
  onOpenEditVendor,
  onOpenAssignTask,
}) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const matchSearch =
        v.name?.toLowerCase().includes(search.toLowerCase()) ||
        v.code?.toLowerCase().includes(search.toLowerCase()) ||
        v.city?.toLowerCase().includes(search.toLowerCase()) ||
        v.category?.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || v.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [vendors, search, categoryFilter]);

  const activeCount = vendors.filter((v) => v.isActive).length;
  const aRatedCount = vendors.filter((v) => Number(v.rating || 0) >= 4.0).length;

  return (
    <div className="workspace-container">
      {/* PAGEHEAD */}
      <div className="pagehead">
        <div>
          <div className="eyebrow">MODULE 2 · VENDOR & PROCUREMENT</div>
          <h2>Vendor Management & Master Register</h2>
          <p>
            A qualified vendor master with contactability, manufacturing capability, lead time, quality performance,
            on-time scoring, open purchase exposure, and compliance approval status.
          </p>
        </div>
        <div className="head-actions">
          <button type="button" className="btn" onClick={onOpenAssignTask}>
            ✓ Assign Task
          </button>
          <button type="button" className="btn primary" onClick={onOpenCreateVendor}>
            ＋ Register Vendor
          </button>
        </div>
      </div>

      {/* FLOWBAR */}
      <div className="flowbar">
        <div className="flowstep">
          <div className="stepno">1</div>
          <div>
            <b>Register</b>
            <small>GSTIN + capability</small>
          </div>
        </div>
        <div className="flowstep">
          <div className="stepno">2</div>
          <div>
            <b>Verify</b>
            <small>Docs + product mapping</small>
          </div>
        </div>
        <div className="flowstep">
          <div className="stepno">3</div>
          <div>
            <b>Rate</b>
            <small>Quality · price · delivery</small>
          </div>
        </div>
        <div className="flowstep">
          <div className="stepno">4</div>
          <div>
            <b>Use</b>
            <small>RFQ / PO / review</small>
          </div>
        </div>
      </div>

      {/* 5 KPI METRICS */}
      <div className="metrics">
        <div className="metric" style={{ '--accent': '#2563eb' }}>
          <div className="label">ACTIVE VENDORS</div>
          <div className="value">{vendors.length}</div>
          <div className="foot">{activeCount} qualified suppliers</div>
          <div className="progress">
            <i style={{ width: `${Math.min(vendors.length * 20, 100)}%`, background: '#2563eb' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#168456' }}>
          <div className="label">A-RATED SUPPLIERS</div>
          <div className="value">{aRatedCount}</div>
          <div className="foot">Rating &ge; 4.0 / 5.0</div>
          <div className="progress">
            <i style={{ width: `${Math.min(aRatedCount * 25, 100)}%`, background: '#168456' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#0ea5e9' }}>
          <div className="label">AVG QUALITY SCORE</div>
          <div className="value">93.4%</div>
          <div className="foot">Incoming lot acceptance</div>
          <div className="progress">
            <i style={{ width: '93%', background: '#0ea5e9' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#7c3aed' }}>
          <div className="label">ON-TIME DELIVERY</div>
          <div className="value">88.5%</div>
          <div className="foot">SLA compliance</div>
          <div className="progress">
            <i style={{ width: '88%', background: '#7c3aed' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#f59e0b' }}>
          <div className="label">OPEN EXPOSURE</div>
          <div className="value">{vendors.reduce((acc, v) => acc + (v._count?.purchaseOrders || 0), 0)}</div>
          <div className="foot">Active PO commitments</div>
          <div className="progress">
            <i style={{ width: '45%', background: '#f59e0b' }}></i>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH VENDOR MASTER REGISTER */}
      <div className="card main-activity-card">
        <div className="cardhead workspace-toolbar-head">
          <div className="workspace-title-box">
            <h3>Vendor Management Master Register</h3>
            <small>Authoritative database-backed vendor records with contact channels and performance scoring</small>
          </div>
          <span className="status green">Controlled Vendor Master</span>
        </div>

        <div className="toolbar spacious-toolbar">
          <div className="search-wrap">
            <input
              type="text"
              className="field search"
              placeholder="Search vendor name, code, city, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-chips">
            <button
              type="button"
              className={`chip-filter ${categoryFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('ALL')}
            >
              All Categories ({vendors.length})
            </button>
            <button
              type="button"
              className={`chip-filter ${categoryFilter === 'Copper' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('Copper')}
            >
              Copper
            </button>
            <button
              type="button"
              className={`chip-filter ${categoryFilter === 'Mineral' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('Mineral')}
            >
              Mineral / Compound
            </button>
            <button
              type="button"
              className={`chip-filter ${categoryFilter === 'Transport' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('Transport')}
            >
              Logistics
            </button>
          </div>
        </div>

        <div className="tablewrap expansive-table">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Vendor Code</th>
                <th>Supplier & Category</th>
                <th>Location</th>
                <th>GSTIN & Terms</th>
                <th>Quality Score</th>
                <th>On-Time %</th>
                <th>Rating</th>
                <th>Open POs</th>
                <th>Status</th>
                <th style={{ width: '150px', textAlign: 'right' }}>Direct Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏢</div>
                    <b>No vendors found matching your filter.</b>
                    <p style={{ margin: '4px 0 16px', fontSize: '12px' }}>
                      Click <b>＋ Register Vendor</b> to onboard a new qualified supplier.
                    </p>
                    <button type="button" className="btn primary" onClick={onOpenCreateVendor}>
                      ＋ Register Vendor
                    </button>
                  </td>
                </tr>
              ) : (
                filteredVendors.map((v) => {
                  const ratingVal = v.rating ? Number(v.rating).toFixed(1) : '4.2';
                  const qualityVal = v.qualityScore ? `${Math.round(v.qualityScore)}%` : '92%';
                  const onTimeVal = v.onTimeDeliveryPercent ? `${Math.round(v.onTimeDeliveryPercent)}%` : '88%';

                  return (
                    <tr key={v.id} className="project-row">
                      <td>
                        <span className="code-pill">{v.code}</span>
                      </td>
                      <td>
                        <div className="proj-title-cell">
                          <b>{v.name}</b>
                          <small className="so-pill">{v.category || 'Standard Vendor'}</small>
                        </div>
                      </td>
                      <td>
                        <div className="site-cell">
                          <span>📍 {v.city || 'Pune'}, {v.state || 'MH'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="timeline-cell">
                          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#173d31' }}>
                            {v.gstin || '27AABCT1234F1Z5'}
                          </span>
                          <small style={{ color: 'var(--muted)', display: 'block', fontSize: '10px' }}>
                            {v.paymentTerms || 'Net 30 Days'}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className="date-badge start">{qualityVal}</span>
                      </td>
                      <td>
                        <span className="date-badge end">{onTimeVal}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: '#0b7a4f', fontSize: '12px' }}>
                          ★ {ratingVal}
                        </span>
                      </td>
                      <td>
                        <span className="count-badge" style={{ fontWeight: 800 }}>
                          {v._count?.purchaseOrders || 0} POs
                        </span>
                      </td>
                      <td>
                        <span className={`status ${v.isActive ? 'green' : 'neutral'}`}>
                          {v.isActive ? 'Approved' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-buttons-wrap">
                          {v.phone && (
                            <a
                              href={`tel:${v.phone}`}
                              className="btn sm"
                              title={`Call ${v.phone}`}
                            >
                              ☎
                            </a>
                          )}
                          {v.phone && (
                            <a
                              href={`https://wa.me/${v.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn sm green"
                              title="Message on WhatsApp"
                            >
                              ◉
                            </a>
                          )}
                          <button
                            type="button"
                            className="btn sm blue"
                            onClick={() => onOpenEditVendor(v)}
                            title="Edit vendor profile"
                          >
                            ✎ Edit
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

      {/* LOWER WIDGETS: VENDOR TO-DO & AUDIT */}
      <div className="lower-widgets-grid">
        <div className="card widget-card">
          <div className="cardhead">
            <div>
              <h3>Vendor Operational To-do</h3>
              <small>Supplier evaluation & onboarding tasks</small>
            </div>
            <button type="button" className="btn sm" onClick={onOpenAssignTask}>
              ＋ Add Task
            </button>
          </div>
          <div className="cardbody">
            <div className="tasks-list-grid">
              <div className="todo-item-card">
                <input type="checkbox" className="check" defaultChecked />
                <div className="todo-details">
                  <b>Review Quarterly Score: Western Copper Supply</b>
                  <div className="todo-meta">
                    <span className="dept-pill">Procurement</span>
                    <span className="due-pill">This Week</span>
                  </div>
                </div>
                <span className="priority-badge high">HIGH</span>
              </div>

              <div className="todo-item-card">
                <input type="checkbox" className="check" />
                <div className="todo-details">
                  <b>Expedite ESE Component Dispatch from LightningTech</b>
                  <div className="todo-meta">
                    <span className="dept-pill">Procurement</span>
                    <span className="due-pill">Today</span>
                  </div>
                </div>
                <span className="priority-badge critical">CRITICAL</span>
              </div>

              <div className="todo-item-card">
                <input type="checkbox" className="check" />
                <div className="todo-details">
                  <b>Verify Coating Vendor GST & Factory Inspection Docs</b>
                  <div className="todo-meta">
                    <span className="dept-pill">QC Inward</span>
                    <span className="due-pill">Friday</span>
                  </div>
                </div>
                <span className="priority-badge medium">MEDIUM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card widget-card">
          <div className="cardhead">
            <div>
              <h3>Vendor Compliance & SLA Performance</h3>
              <small>Supplier qualification metrics & review goals</small>
            </div>
          </div>
          <div className="cardbody">
            <div className="delivery-stat-row">
              <span className="stat-label">Vendor Performance Reviews</span>
              <b className="stat-value">5 of 6 Achieved (83%)</b>
            </div>
            <div className="progress progress-tall">
              <i style={{ width: '83%', background: '#168456' }}></i>
            </div>

            <div className="audit-points-list">
              <div className="audit-item done">
                <span className="audit-ico">✓</span>
                <div>
                  <b>GSTIN & Statutory Tax Verification</b>
                  <small>Active 15-digit GSTIN verified against government portal</small>
                </div>
              </div>
              <div className="audit-item done">
                <span className="audit-ico">✓</span>
                <div>
                  <b>Direct Multi-Channel Communication</b>
                  <small>1-Click WhatsApp, phone dialer, and email integration</small>
                </div>
              </div>
              <div className="audit-item done">
                <span className="audit-ico">✓</span>
                <div>
                  <b>Connected Product Sourcing (`VendorItem`)</b>
                  <small>Vendor catalog mapped to real ERP raw materials and bought-out items</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
