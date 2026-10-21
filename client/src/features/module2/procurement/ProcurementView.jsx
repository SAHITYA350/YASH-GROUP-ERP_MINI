// client/src/features/module2/procurement/ProcurementView.jsx
import React, { useState, useMemo } from 'react';

export default function ProcurementView({
  purchaseOrders,
  purchaseRequests,
  vendors,
  products,
  onOpenCreatePO,
  onOpenCreatePR,
  onUpdatePOStatus,
  onOpenAssignTask,
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchSearch =
        po.poNumber?.toLowerCase().includes(search.toLowerCase()) ||
        po.vendor?.name?.toLowerCase().includes(search.toLowerCase()) ||
        po.notes?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || po.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [purchaseOrders, search, statusFilter]);

  const totalValue = purchaseOrders.reduce((sum, po) => sum + Number(po.total || 0), 0);
  const openCount = purchaseOrders.filter((po) => po.status === 'DRAFT' || po.status === 'SENT').length;
  const receivedCount = purchaseOrders.filter((po) => po.status === 'RECEIVED').length;

  return (
    <div className="workspace-container">
      {/* PAGEHEAD */}
      <div className="pagehead">
        <div>
          <div className="eyebrow">MODULE 2 · PROCUREMENT, RFQ & PURCHASE ORDER</div>
          <h2>Procurement & Purchase Order Console</h2>
          <p>
            Convert real material shortages into PRs, broadcast RFQs to qualified vendors, compare quotes,
            and release binding Purchase Orders tied back to sales demand and engineering BOMs.
          </p>
        </div>
        <div className="head-actions">
          <button type="button" className="btn" onClick={onOpenAssignTask}>
            ✓ Assign Task
          </button>
          <button type="button" className="btn" onClick={onOpenCreatePR}>
            ＋ New Material PR
          </button>
          <button type="button" className="btn primary" onClick={onOpenCreatePO}>
            ＋ Release Purchase Order
          </button>
        </div>
      </div>

      {/* FLOWBAR */}
      <div className="flowbar">
        <div className="flowstep">
          <div className="stepno">1</div>
          <div>
            <b>Material Need</b>
            <small>SO / BOM shortage</small>
          </div>
        </div>
        <div className="flowstep">
          <div className="stepno">2</div>
          <div>
            <b>RFQ Broadcast</b>
            <small>Approved vendors</small>
          </div>
        </div>
        <div className="flowstep">
          <div className="stepno">3</div>
          <div>
            <b>Compare & Select</b>
            <small>Price · lead · quality</small>
          </div>
        </div>
        <div className="flowstep">
          <div className="stepno">4</div>
          <div>
            <b>Release PO</b>
            <small>PO release & GRN track</small>
          </div>
        </div>
      </div>

      {/* 5 KPI METRICS */}
      <div className="metrics">
        <div className="metric" style={{ '--accent': '#2563eb' }}>
          <div className="label">PURCHASE ORDERS</div>
          <div className="value">{purchaseOrders.length}</div>
          <div className="foot">{openCount} active in procurement</div>
          <div className="progress">
            <i style={{ width: `${Math.min(purchaseOrders.length * 25, 100)}%`, background: '#2563eb' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#168456' }}>
          <div className="label">RECEIVED / FULFILLED</div>
          <div className="value">{receivedCount}</div>
          <div className="foot">Delivered & verified</div>
          <div className="progress">
            <i style={{ width: `${Math.min(receivedCount * 25, 100)}%`, background: '#168456' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#0ea5e9' }}>
          <div className="label">MATERIAL PRs</div>
          <div className="value">{purchaseRequests.length}</div>
          <div className="foot">Demand requests logged</div>
          <div className="progress">
            <i style={{ width: `${Math.min(purchaseRequests.length * 30, 100)}%`, background: '#0ea5e9' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#7c3aed' }}>
          <div className="label">QUALIFIED VENDORS</div>
          <div className="value">{vendors.length}</div>
          <div className="foot">Ready for bidding</div>
          <div className="progress">
            <i style={{ width: `${Math.min(vendors.length * 20, 100)}%`, background: '#7c3aed' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#f59e0b' }}>
          <div className="label">TOTAL PO VALUE</div>
          <div className="value">₹{totalValue > 0 ? (totalValue / 1000).toFixed(1) + 'k' : '0'}</div>
          <div className="foot">Committed material spend</div>
          <div className="progress">
            <i style={{ width: '70%', background: '#f59e0b' }}></i>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH PURCHASE ORDER REGISTER */}
      <div className="card main-activity-card">
        <div className="cardhead workspace-toolbar-head">
          <div className="workspace-title-box">
            <h3>Purchase Order (PO) Register</h3>
            <small>Authoritative purchase orders released to suppliers with tax breakdown and fulfillment tracking</small>
          </div>
          <span className="status green">Controlled Procurement Register</span>
        </div>

        <div className="toolbar spacious-toolbar">
          <div className="search-wrap">
            <input
              type="text"
              className="field search"
              placeholder="Search PO number, vendor name, notes..."
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
              All POs ({purchaseOrders.length})
            </button>
            <button
              type="button"
              className={`chip-filter ${statusFilter === 'DRAFT' ? 'active' : ''}`}
              onClick={() => setStatusFilter('DRAFT')}
            >
              Draft
            </button>
            <button
              type="button"
              className={`chip-filter ${statusFilter === 'SENT' ? 'active' : ''}`}
              onClick={() => setStatusFilter('SENT')}
            >
              Sent to Vendor
            </button>
            <button
              type="button"
              className={`chip-filter ${statusFilter === 'RECEIVED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('RECEIVED')}
            >
              Received ({receivedCount})
            </button>
          </div>
        </div>

        <div className="tablewrap expansive-table">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>PO Number</th>
                <th>Supplier / Vendor</th>
                <th>Order Date</th>
                <th>Items Ordered</th>
                <th>Tax Breakdown</th>
                <th>Grand Total</th>
                <th>Status</th>
                <th style={{ width: '150px', textAlign: 'right' }}>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
                    <b>No purchase orders found matching your filter.</b>
                    <p style={{ margin: '4px 0 16px', fontSize: '12px' }}>
                      Click <b>＋ Release Purchase Order</b> to issue a new commercial order to an approved vendor.
                    </p>
                    <button type="button" className="btn primary" onClick={onOpenCreatePO}>
                      ＋ Release Purchase Order
                    </button>
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po) => {
                  const dateStr = po.orderDate ? po.orderDate.slice(0, 10) : '—';
                  const itemsCount = po.items ? po.items.length : 0;
                  const totalFormatted = Number(po.total || 0).toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  });

                  return (
                    <tr key={po.id} className="project-row">
                      <td>
                        <span className="code-pill">{po.poNumber}</span>
                        {po.rfq?.rfqNo && <small className="so-pill">RFQ: {po.rfq.rfqNo}</small>}
                      </td>
                      <td>
                        <div className="proj-title-cell">
                          <b>{po.vendor?.name || 'Selected Vendor'}</b>
                          <small className="so-pill">📍 {po.vendor?.city || 'Vendor Location'}</small>
                        </div>
                      </td>
                      <td>
                        <div className="timeline-cell">
                          <span className="date-badge start">📅 {dateStr}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: '#173d31' }}>
                          {itemsCount > 0
                            ? `${itemsCount} material line items`
                            : po.notes || 'Bulk Raw Materials'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          <span>Subtotal: ₹{Number(po.subtotal || 0).toLocaleString('en-IN')}</span>
                          <br />
                          <small>GST: ₹{Number(po.taxAmount || 0).toLocaleString('en-IN')}</small>
                        </div>
                      </td>
                      <td>
                        <b style={{ color: '#0b7a4f', fontSize: '14px' }}>{totalFormatted}</b>
                      </td>
                      <td>
                        <span
                          className={`status ${
                            po.status === 'RECEIVED'
                              ? 'green'
                              : po.status === 'SENT' || po.status === 'APPROVED'
                              ? 'blue'
                              : po.status === 'CANCELLED'
                              ? 'red'
                              : 'neutral'
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <select
                          className="field mini-status-select"
                          value={po.status}
                          onChange={(e) => onUpdatePOStatus(po.id, e.target.value)}
                        >
                          <option value="DRAFT">Draft</option>
                          <option value="PENDING_APPROVAL">Pending Approval</option>
                          <option value="APPROVED">Approved</option>
                          <option value="SENT">Sent to Vendor</option>
                          <option value="PARTIALLY_RECEIVED">Partially Received</option>
                          <option value="RECEIVED">Received</option>
                          <option value="CLOSED">Closed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOWER SECTION: PURCHASE REQUESTS & AUDIT */}
      <div className="lower-widgets-grid">
        <div className="card widget-card">
          <div className="cardhead">
            <div>
              <h3>Material Purchase Requests (PR)</h3>
              <small>Demand triggered by Sales Orders & reorder thresholds</small>
            </div>
            <button type="button" className="btn sm" onClick={onOpenCreatePR}>
              ＋ Create PR
            </button>
          </div>
          <div className="cardbody">
            {purchaseRequests.length > 0 ? (
              <div className="tasks-list-grid">
                {purchaseRequests.slice(0, 5).map((pr) => (
                  <div className="todo-item-card" key={pr.id}>
                    <div className="todo-details">
                      <b>{pr.requestNo} · {pr.salesOrder?.orderNumber ? `SO: ${pr.salesOrder.orderNumber}` : 'Stock Replenishment'}</b>
                      <div className="todo-meta">
                        <span className="dept-pill">Status: {pr.status}</span>
                        {pr.items?.length > 0 && (
                          <span className="job-pill">{pr.items.length} items requested</span>
                        )}
                        {pr.requiredBy && (
                          <span className="due-pill">Required: {pr.requiredBy.slice(0, 10)}</span>
                        )}
                      </div>
                    </div>
                    <span className={`status ${pr.status === 'APPROVED' ? 'green' : 'amber'}`}>
                      {pr.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--muted)', fontSize: '12px', margin: '12px 0' }}>
                No active purchase requests logged. Use <b>＋ New Material PR</b> to record shortages.
              </p>
            )}
          </div>
        </div>

        <div className="card widget-card">
          <div className="cardhead">
            <div>
              <h3>Procurement Governance & 3-Way Match</h3>
              <small>Commercial audit & PO release controls</small>
            </div>
          </div>
          <div className="cardbody">
            <div className="delivery-stat-row">
              <span className="stat-label">PO Fulfillment Ratio</span>
              <b className="stat-value">{receivedCount} of {purchaseOrders.length} Received</b>
            </div>
            <div className="progress progress-tall">
              <i
                style={{
                  width: `${purchaseOrders.length > 0 ? (receivedCount / purchaseOrders.length) * 100 : 0}%`,
                  background: '#168456',
                }}
              ></i>
            </div>

            <div className="audit-points-list">
              <div className="audit-item done">
                <span className="audit-ico">✓</span>
                <div>
                  <b>Commercial 3-Way Matching</b>
                  <small>Purchase Order $\to$ Goods Receipt (GRN) $\to$ Vendor Bill matched on quantities and tax</small>
                </div>
              </div>
              <div className="audit-item done">
                <span className="audit-ico">✓</span>
                <div>
                  <b>Sales Order Demand Tracing</b>
                  <small>Raw material PRs link back to salesOrder.id for inventory reservation</small>
                </div>
              </div>
              <div className="audit-item done">
                <span className="audit-ico">✓</span>
                <div>
                  <b>Tax & GSTIN Breakdown</b>
                  <small>Calculates Base Amount, CGST, SGST, IGST with formal totals</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
