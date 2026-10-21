// client/src/features/module2/inventory/InventoryView.jsx
import React, { useState, useMemo } from 'react';

export default function InventoryView({
  inventory,
  goodsReceipts,
  movements,
  onOpenCreateGRN,
  onOpenStockMove,
  onOpenAssignTask,
}) {
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [viewTab, setViewTab] = useState('stock'); // 'stock' | 'grn' | 'movements'

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchSearch =
        item.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.product?.sku?.toLowerCase().includes(search.toLowerCase()) ||
        item.warehouseLocation?.toLowerCase().includes(search.toLowerCase());
      const matchLoc = locationFilter === 'ALL' || item.warehouseLocation === locationFilter;
      return matchSearch && matchLoc;
    });
  }, [inventory, search, locationFilter]);

  const lowStockCount = inventory.filter(
    (i) => Number(i.physicalQuantity || 0) <= Number(i.reorderLevel || 10)
  ).length;

  const totalPhysicalUnits = inventory.reduce((sum, i) => sum + Number(i.physicalQuantity || 0), 0);
  const totalReservedUnits = inventory.reduce((sum, i) => sum + Number(i.reservedQuantity || 0), 0);

  return (
    <div className="workspace-container">
      {/* PAGEHEAD */}
      <div className="pagehead">
        <div>
          <div className="eyebrow">MODULE 2 · INVENTORY & MATERIAL MOVEMENT</div>
          <h2>Inventory, Warehouse & Goods Receipt (GRN)</h2>
          <p>
            Control raw materials, WIP, finished goods, warehouse bin locations, reservations against confirmed jobs,
            incoming factory QC receipts (GRN), and full stock movement audits.
          </p>
        </div>
        <div className="head-actions">
          <button type="button" className="btn" onClick={onOpenAssignTask}>
            ✓ Assign Task
          </button>
          <button type="button" className="btn" onClick={onOpenStockMove}>
            ⇄ Move / Issue Material
          </button>
          <button type="button" className="btn primary" onClick={onOpenCreateGRN}>
            ＋ Gate Inward / GRN
          </button>
        </div>
      </div>

      {/* FLOWBAR */}
      <div className="flowbar">
        <div className="flowstep">
          <div className="stepno">1</div>
          <div>
            <b>Receive (GRN)</b>
            <small>Gate inward + QC check</small>
          </div>
        </div>
        <div className="flowstep">
          <div className="stepno">2</div>
          <div>
            <b>Store / Reserve</b>
            <small>Warehouse bin + Job reserve</small>
          </div>
        </div>
        <div className="flowstep">
          <div className="stepno">3</div>
          <div>
            <b>Move & Issue</b>
            <small>Work order / site transfer</small>
          </div>
        </div>
        <div className="flowstep">
          <div className="stepno">4</div>
          <div>
            <b>Reconcile</b>
            <small>Physical vs reserved balance</small>
          </div>
        </div>
      </div>

      {/* 5 KPI METRICS */}
      <div className="metrics">
        <div className="metric" style={{ '--accent': '#2563eb' }}>
          <div className="label">TOTAL STOCK ITEMS</div>
          <div className="value">{inventory.length}</div>
          <div className="foot">Active managed SKUs</div>
          <div className="progress">
            <i style={{ width: `${Math.min(inventory.length * 20, 100)}%`, background: '#2563eb' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#168456' }}>
          <div className="label">PHYSICAL QUANTITY</div>
          <div className="value">{totalPhysicalUnits.toLocaleString()}</div>
          <div className="foot">Total units on-hand</div>
          <div className="progress">
            <i style={{ width: '85%', background: '#168456' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#7c3aed' }}>
          <div className="label">RESERVED STOCK</div>
          <div className="value">{totalReservedUnits.toLocaleString()}</div>
          <div className="foot">Committed to jobs</div>
          <div className="progress">
            <i style={{ width: `${totalPhysicalUnits > 0 ? (totalReservedUnits / totalPhysicalUnits) * 100 : 0}%`, background: '#7c3aed' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#0ea5e9' }}>
          <div className="label">GOODS RECEIPTS</div>
          <div className="value">{goodsReceipts.length}</div>
          <div className="foot">PO Inward lots (GRN)</div>
          <div className="progress">
            <i style={{ width: `${Math.min(goodsReceipts.length * 25, 100)}%`, background: '#0ea5e9' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#b91c1c' }}>
          <div className="label">LOW STOCK WARNINGS</div>
          <div className="value">{lowStockCount}</div>
          <div className="foot">At or below reorder level</div>
          <div className="progress">
            <i style={{ width: lowStockCount > 0 ? '45%' : '5%', background: '#b91c1c' }}></i>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH INVENTORY CONSOLE */}
      <div className="card main-activity-card">
        <div className="cardhead workspace-toolbar-head">
          <div className="workspace-title-box">
            <h3>Inventory & Material Movement Management</h3>
            <small>Real-time physical stock ledger, incoming goods receipts (GRN), and movement audit trails</small>
          </div>

          <div className="view-mode-tabs">
            <button
              type="button"
              className={`view-tab-btn ${viewTab === 'stock' ? 'active' : ''}`}
              onClick={() => setViewTab('stock')}
            >
              <span className="tab-icon">📦</span> Live Stock Ledger
            </button>
            <button
              type="button"
              className={`view-tab-btn ${viewTab === 'grn' ? 'active' : ''}`}
              onClick={() => setViewTab('grn')}
            >
              <span className="tab-icon">📑</span> Goods Receipts (GRN)
            </button>
            <button
              type="button"
              className={`view-tab-btn ${viewTab === 'movements' ? 'active' : ''}`}
              onClick={() => setViewTab('movements')}
            >
              <span className="tab-icon">🔄</span> Movements Audit
            </button>
          </div>
        </div>

        {/* 1. LIVE STOCK LEDGER */}
        {viewTab === 'stock' && (
          <div>
            <div className="toolbar spacious-toolbar">
              <div className="search-wrap">
                <input
                  type="text"
                  className="field search"
                  placeholder="Search material name, SKU, warehouse location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="filter-chips">
                <button
                  type="button"
                  className={`chip-filter ${locationFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setLocationFilter('ALL')}
                >
                  All Warehouses ({inventory.length})
                </button>
                <button
                  type="button"
                  className={`chip-filter ${locationFilter === 'Central Finished & Raw Stores' ? 'active' : ''}`}
                  onClick={() => setLocationFilter('Central Finished & Raw Stores')}
                >
                  Central Stores
                </button>
                <button
                  type="button"
                  className={`chip-filter ${locationFilter === 'RM Store' ? 'active' : ''}`}
                  onClick={() => setLocationFilter('RM Store')}
                >
                  RM Store
                </button>
              </div>
            </div>

            <div className="tablewrap expansive-table">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '130px' }}>Material SKU</th>
                    <th>Product & Description</th>
                    <th>Warehouse Location</th>
                    <th>On-Hand Stock</th>
                    <th>Reserved Stock</th>
                    <th>Available to Issue</th>
                    <th>Reorder Level</th>
                    <th>Stock Status</th>
                    <th style={{ width: '150px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
                        <b>No inventory items found matching your filter.</b>
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => {
                      const phys = Number(item.physicalQuantity || 0);
                      const res = Number(item.reservedQuantity || 0);
                      const avail = Math.max(0, phys - res);
                      const reorder = Number(item.reorderLevel || 10);
                      const isLow = phys <= reorder;

                      return (
                        <tr key={item.id} className="project-row">
                          <td>
                            <span className="code-pill">{item.product?.sku}</span>
                          </td>
                          <td>
                            <div className="proj-title-cell">
                              <b>{item.product?.name}</b>
                              <small className="so-pill">UOM: {item.product?.unitOfMeasure || 'PCS'}</small>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '12px', color: '#173d31' }}>
                              📍 {item.warehouseLocation || 'Central Store'}
                            </span>
                          </td>
                          <td>
                            <b style={{ fontSize: '13px', color: '#173d31' }}>
                              {phys} {item.product?.unitOfMeasure || ''}
                            </b>
                          </td>
                          <td>
                            <span className="date-badge end">
                              {res} {item.product?.unitOfMeasure || ''}
                            </span>
                          </td>
                          <td>
                            <b style={{ color: '#0b7a4f', fontSize: '13px' }}>
                              {avail} {item.product?.unitOfMeasure || ''}
                            </b>
                          </td>
                          <td>
                            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                              {reorder} {item.product?.unitOfMeasure || ''}
                            </span>
                          </td>
                          <td>
                            <span className={`status ${isLow ? 'red' : 'green'}`}>
                              {isLow ? 'Low Stock' : 'Optimal'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="action-buttons-wrap">
                              <button
                                type="button"
                                className="btn sm blue"
                                onClick={onOpenStockMove}
                                title="Issue material to production or site"
                              >
                                Move / Issue
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
        )}

        {/* 2. GOODS RECEIPTS (GRN) */}
        {viewTab === 'grn' && (
          <div className="tablewrap expansive-table" style={{ padding: '16px 24px' }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '130px' }}>GRN Number</th>
                  <th>PO Reference</th>
                  <th>Vendor / Supplier</th>
                  <th>Received Date</th>
                  <th>Inspection Status</th>
                  <th>Line Items Inwarded</th>
                </tr>
              </thead>
              <tbody>
                {goodsReceipts.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                      No Goods Receipts logged yet. Click <b>＋ Gate Inward / GRN</b> to receive a shipment against a PO.
                    </td>
                  </tr>
                ) : (
                  goodsReceipts.map((grn) => (
                    <tr key={grn.id} className="project-row">
                      <td>
                        <span className="code-pill">{grn.grnNumber}</span>
                      </td>
                      <td>
                        <b>{grn.purchaseOrder?.poNumber || `PO #${grn.purchaseOrderId}`}</b>
                      </td>
                      <td>
                        <span>{grn.purchaseOrder?.vendor?.name || 'Approved Supplier'}</span>
                      </td>
                      <td>
                        <span className="date-badge start">
                          📅 {grn.receivedAt ? grn.receivedAt.slice(0, 10) : '—'}
                        </span>
                      </td>
                      <td>
                        <span className={`status ${grn.status === 'ACCEPTED' || grn.status === 'RECEIVED' ? 'green' : 'amber'}`}>
                          {grn.status}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px' }}>
                          {grn.items ? `${grn.items.length} items verified` : 'Lot Verified'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. STOCK MOVEMENTS AUDIT */}
        {viewTab === 'movements' && (
          <div className="tablewrap expansive-table" style={{ padding: '16px 24px' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Material</th>
                  <th>Movement Type</th>
                  <th>Quantity</th>
                  <th>Reference</th>
                  <th>Location</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                      No stock movement audit records logged yet.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m.id} className="project-row">
                      <td>
                        <small>{m.createdAt ? m.createdAt.slice(0, 19).replace('T', ' ') : '—'}</small>
                      </td>
                      <td>
                        <b>{m.product?.name || `Product #${m.productId}`}</b>
                        {m.product?.sku && <small className="so-pill">{m.product.sku}</small>}
                      </td>
                      <td>
                        <span className={`status ${m.movementType.includes('IN') ? 'green' : 'blue'}`}>
                          {m.movementType}
                        </span>
                      </td>
                      <td>
                        <b>{Number(m.quantity || 0)}</b>
                      </td>
                      <td>
                        <span>{m.referenceType}: #{m.referenceId || m.salesOrder?.orderNumber || '—'}</span>
                      </td>
                      <td>
                        <span>{m.locationCode || 'Central Store'}</span>
                      </td>
                      <td>
                        <small>{m.notes || 'Routine stock ledger movement'}</small>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LOWER WIDGETS */}
      <div className="lower-widgets-grid">
        <div className="card widget-card">
          <div className="cardhead">
            <div>
              <h3>Stores Daily To-do</h3>
              <small>Daily material inward, QC inspections and transfers</small>
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
                  <b>Receive Copper Lot: PO-linked GRN</b>
                  <div className="todo-meta">
                    <span className="dept-pill">Factory Gate</span>
                    <span className="due-pill">10:00 AM</span>
                  </div>
                </div>
                <span className="priority-badge high">HIGH</span>
              </div>

              <div className="todo-item-card">
                <input type="checkbox" className="check" />
                <div className="todo-details">
                  <b>Issue High Tensile Steel Core Rod to Production</b>
                  <div className="todo-meta">
                    <span className="dept-pill">RM Store</span>
                    <span className="due-pill">11:30 AM</span>
                  </div>
                </div>
                <span className="priority-badge medium">MEDIUM</span>
              </div>

              <div className="todo-item-card">
                <input type="checkbox" className="check" />
                <div className="todo-details">
                  <b>Transfer Site Earthing Materials to Project Buffer</b>
                  <div className="todo-meta">
                    <span className="dept-pill">Dispatch</span>
                    <span className="due-pill">03:00 PM</span>
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
              <h3>Inventory Reconciliation & Accuracy</h3>
              <small>Physical vs perpetual inventory audit</small>
            </div>
          </div>
          <div className="cardbody">
            <div className="delivery-stat-row">
              <span className="stat-label">Material Movement Fulfillment</span>
              <b className="stat-value">29 of 35 Moves Completed (83%)</b>
            </div>
            <div className="progress progress-tall">
              <i style={{ width: '83%', background: '#168456' }}></i>
            </div>

            <div className="audit-points-list">
              <div className="audit-item done">
                <span className="audit-ico">✓</span>
                <div>
                  <b>Real-time Dual Stock Verification</b>
                  <small>Tracks both on-hand Physical Quantity and Reserved Quantity against confirmed jobs</small>
                </div>
              </div>
              <div className="audit-item done">
                <span className="audit-ico">✓</span>
                <div>
                  <b>Automated Reorder Threshold Alerts</b>
                  <small>Flags Low Stock items when available balance drops below defined safety stock</small>
                </div>
              </div>
              <div className="audit-item done">
                <span className="audit-ico">✓</span>
                <div>
                  <b>Gate Inward QC Acceptance</b>
                  <small>Captures Accepted vs Rejected quantities with batch numbers before updating physical inventory</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
