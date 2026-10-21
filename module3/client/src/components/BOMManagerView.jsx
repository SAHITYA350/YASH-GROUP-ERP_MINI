import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Layers, Plus, Search, GitBranch, AlertTriangle, Calculator, Clock, Eye, X, ChevronRight } from "lucide-react";

export default function BOMManagerView({ onSelectForCostSimulation }) {
  const [boms, setBoms] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBOM, setSelectedBOM] = useState(null);

  // Explosion modal
  const [showExplosionModal, setShowExplosionModal] = useState(false);
  const [explosionData, setExplosionData] = useState(null);
  const [explosionBatchQty, setExplosionBatchQty] = useState(100);
  const [explosionLoading, setExplosionLoading] = useState(false);

  // Shortage modal
  const [showShortageModal, setShowShortageModal] = useState(false);
  const [shortageData, setShortageData] = useState(null);
  const [shortageOrderQty, setShortageOrderQty] = useState(250);
  const [shortageLoading, setShortageLoading] = useState(false);

  // Create BOM modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBOMData, setNewBOMData] = useState({
    productId: "",
    revision: "BOM-R1",
    notes: "",
    items: [{ componentProductId: "", quantity: 1, scrapPercent: 0 }],
    operations: [{ sequence: 10, name: "Cutting & Preparation", workCenter: "Shop 1", standardMinutes: 5, instructions: "" }],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [bomList, prodList] = await Promise.all([
        api.getBOMs(),
        api.getProducts({ limit: 100 }),
      ]);
      setBoms(bomList);
      setProducts(prodList.products);
      if (bomList.length > 0 && !selectedBOM) {
        setSelectedBOM(bomList[0]);
      }
    } catch (err) {
      alert("Error loading BOMs: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectBOM = async (id) => {
    try {
      const full = await api.getBOM(id);
      setSelectedBOM(full);
    } catch (err) {
      alert("Error fetching BOM details: " + err.message);
    }
  };

  const handleRunExplosion = async (bomId) => {
    try {
      setExplosionLoading(true);
      setShowExplosionModal(true);
      const res = await api.explodeBOM(bomId, explosionBatchQty);
      setExplosionData(res);
    } catch (err) {
      alert("BOM explosion failed: " + err.message);
    } finally {
      setExplosionLoading(false);
    }
  };

  const handleCheckShortages = async (bomId) => {
    try {
      setShortageLoading(true);
      setShowShortageModal(true);
      const res = await api.getBOMShortages(bomId, shortageOrderQty);
      setShortageData(res);
    } catch (err) {
      alert("Shortage check failed: " + err.message);
    } finally {
      setShortageLoading(false);
    }
  };

  const addComponentRow = () => {
    setNewBOMData({
      ...newBOMData,
      items: [...newBOMData.items, { componentProductId: "", quantity: 1, scrapPercent: 0 }],
    });
  };

  const addOperationRow = () => {
    const nextSeq = (newBOMData.operations.length + 1) * 10;
    setNewBOMData({
      ...newBOMData,
      operations: [...newBOMData.operations, { sequence: nextSeq, name: "", workCenter: "", standardMinutes: 5, instructions: "" }],
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createBOM(newBOMData);
      alert("BOM revision created successfully!");
      setShowCreateModal(false);
      loadData();
    } catch (err) {
      alert("Error creating BOM: " + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--slate-900)" }}>Bill of Materials & BOQ Workspace</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--slate-500)" }}>Multi-level assembly hierarchies, operation routing, component shortages, and cost rollups</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> New BOM Revision
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>
        {/* Left List of BOMs */}
        <div className="card" style={{ height: "fit-content" }}>
          <div className="card-header">
            <span className="card-title"><Layers size={16} /> Production BOMs</span>
          </div>
          <div className="card-body" style={{ padding: 8 }}>
            {loading ? (
              <p style={{ padding: 16, fontSize: "0.8rem", color: "var(--slate-400)" }}>Loading BOMs...</p>
            ) : boms.length === 0 ? (
              <p style={{ padding: 16, fontSize: "0.8rem", color: "var(--slate-400)" }}>No BOMs found.</p>
            ) : (
              boms.map((b) => {
                const isSelected = selectedBOM?.id === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBOM(b.id)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "var(--radius-md)",
                      marginBottom: 6,
                      cursor: "pointer",
                      backgroundColor: isSelected ? "var(--primary-light)" : "var(--slate-50)",
                      border: isSelected ? "1px solid var(--primary)" : "1px solid var(--slate-200)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.85rem", color: isSelected ? "var(--primary)" : "var(--slate-900)" }}>
                        {b.revision}
                      </span>
                      <span className={`badge ${b.status === "RELEASED" ? "badge-released" : "badge-draft"}`}>
                        {b.status}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--slate-800)", marginTop: 2 }}>
                      {b.product?.sku}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--slate-500)", marginTop: 2 }}>
                      {b.items?.length || 0} Components • {b.operations?.length || 0} Operations
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right BOM Details Panel */}
        {selectedBOM ? (
          <div>
            {/* Header Card */}
            <div className="card">
              <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 700, color: "var(--primary)" }}>
                    {selectedBOM.product?.sku}
                  </span>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--slate-900)" }}>
                    {selectedBOM.product?.name} ({selectedBOM.revision})
                  </h3>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleCheckShortages(selectedBOM.id)}
                  >
                    <AlertTriangle size={15} color="var(--amber-700)" /> Check Shortage
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleRunExplosion(selectedBOM.id)}
                  >
                    <GitBranch size={15} /> Explode Multi-Level
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => onSelectForCostSimulation(selectedBOM.id)}
                  >
                    <Calculator size={15} /> Simulate Cost
                  </button>
                </div>
              </div>
              <div className="card-body">
                {selectedBOM.notes && (
                  <p style={{ fontSize: "0.82rem", color: "var(--slate-600)", marginBottom: 16, backgroundColor: "var(--slate-50)", padding: 10, borderRadius: 6, border: "1px solid var(--slate-200)" }}>
                    <strong>Engineering Notes:</strong> {selectedBOM.notes}
                  </p>
                )}

                {/* Cost Summary Bar */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.2fr", gap: 14, marginBottom: 20 }}>
                  <div style={{ padding: 12, backgroundColor: "var(--slate-50)", borderRadius: 8, border: "1px solid var(--slate-200)" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--slate-500)", fontWeight: 700 }}>MATERIAL COST</div>
                    <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--slate-900)", marginTop: 2 }}>
                      ₹{Number(selectedBOM.materialCost).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div style={{ padding: 12, backgroundColor: "var(--slate-50)", borderRadius: 8, border: "1px solid var(--slate-200)" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--slate-500)", fontWeight: 700 }}>LABOR / PROCESS COST</div>
                    <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--slate-900)", marginTop: 2 }}>
                      ₹{Number(selectedBOM.laborCost).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div style={{ padding: 12, backgroundColor: "var(--slate-50)", borderRadius: 8, border: "1px solid var(--slate-200)" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--slate-500)", fontWeight: 700 }}>OVERHEAD ALLOCATION</div>
                    <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--slate-900)", marginTop: 2 }}>
                      ₹{Number(selectedBOM.overheadCost).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div style={{ padding: 12, backgroundColor: "var(--primary-light)", borderRadius: 8, border: "1px solid rgba(5, 150, 105, 0.3)" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--primary-hover)", fontWeight: 700 }}>TOTAL ESTIMATED UNIT COST</div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--primary)", marginTop: 2 }}>
                      ₹{(Number(selectedBOM.materialCost) + Number(selectedBOM.laborCost) + Number(selectedBOM.overheadCost)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Components Table */}
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--slate-900)", marginBottom: 10 }}>
                  Bill of Material Component Lines ({selectedBOM.items?.length || 0})
                </h4>
                <div className="data-table-wrapper" style={{ marginBottom: 24 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Component SKU</th>
                        <th>Description / Material</th>
                        <th style={{ textAlign: "right" }}>Qty / Assembly</th>
                        <th style={{ textAlign: "right" }}>Scrap %</th>
                        <th>UOM</th>
                        <th style={{ textAlign: "right" }}>Unit Rate (₹)</th>
                        <th style={{ textAlign: "right" }}>Extended Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBOM.items?.length === 0 ? (
                        <tr><td colSpan="8" style={{ textAlign: "center", padding: 20 }}>No components added yet.</td></tr>
                      ) : (
                        selectedBOM.items.map((it, idx) => {
                          const unitCost = Number(it.component?.listPrice || 0);
                          const grossQty = Number(it.quantity) * (1 + Number(it.scrapPercent) / 100);
                          const extended = grossQty * unitCost;
                          return (
                            <tr key={it.id}>
                              <td>{idx + 1}</td>
                              <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--primary)" }}>{it.component?.sku}</td>
                              <td style={{ fontWeight: 500 }}>{it.component?.name}</td>
                              <td style={{ textAlign: "right", fontWeight: 700 }}>{Number(it.quantity)}</td>
                              <td style={{ textAlign: "right", color: "var(--rose-700)" }}>{Number(it.scrapPercent)}%</td>
                              <td>{it.component?.unitOfMeasure}</td>
                              <td style={{ textAlign: "right" }}>₹{unitCost.toFixed(2)}</td>
                              <td style={{ textAlign: "right", fontWeight: 700 }}>₹{extended.toFixed(2)}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Operations Table */}
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--slate-900)", marginBottom: 10 }}>
                  Manufacturing Routing & Work Centers ({selectedBOM.operations?.length || 0})
                </h4>
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: 60 }}>Seq</th>
                        <th>Operation Name</th>
                        <th>Work Center</th>
                        <th style={{ textAlign: "right" }}>Standard Time (Mins)</th>
                        <th>Standard Operating Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBOM.operations?.length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: "center", padding: 20 }}>No routing operations defined.</td></tr>
                      ) : (
                        selectedBOM.operations.map((op) => (
                          <tr key={op.id}>
                            <td style={{ fontWeight: 700, color: "var(--primary)" }}>{op.sequence}</td>
                            <td style={{ fontWeight: 600 }}>{op.name}</td>
                            <td><span className="badge badge-draft">{op.workCenter || "General"}</span></td>
                            <td style={{ textAlign: "right", fontWeight: 700 }}>{Number(op.standardMinutes)} min</td>
                            <td style={{ fontSize: "0.78rem", color: "var(--slate-600)" }}>{op.instructions || "-"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--slate-400)" }}>
            Select a BOM revision to inspect components and operations.
          </div>
        )}
      </div>

      {/* MULTI-LEVEL EXPLOSION MODAL */}
      {showExplosionModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 900 }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Recursive Multi-Level BOM Explosion</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>
                  {explosionData?.rootProduct?.sku} • Batch Quantity: {explosionBatchQty}
                </span>
              </div>
              <button onClick={() => setShowExplosionModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Batch Demand Quantity:</label>
                <input
                  type="number"
                  className="input"
                  style={{ width: 120 }}
                  value={explosionBatchQty}
                  onChange={(e) => setExplosionBatchQty(parseInt(e.target.value, 10) || 1)}
                />
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleRunExplosion(selectedBOM.id)}
                >
                  Recalculate Explosion
                </button>
              </div>

              {explosionLoading ? (
                <p style={{ textAlign: "center", padding: 30 }}>Exploding assembly hierarchy and evaluating circular dependencies...</p>
              ) : explosionData?.explosion?.lines ? (
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Lvl</th>
                        <th>Component SKU</th>
                        <th>Name</th>
                        <th style={{ textAlign: "right" }}>Gross Qty</th>
                        <th>UOM</th>
                        <th style={{ textAlign: "right" }}>Stock Available</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Extended Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {explosionData.explosion.lines.map((l, idx) => (
                        <tr key={idx} style={{ backgroundColor: l.isShortage ? "var(--rose-100)" : "transparent" }}>
                          <td style={{ fontWeight: 700, color: "var(--slate-500)" }}>L{l.level}</td>
                          <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--primary)" }}>{l.sku}</td>
                          <td style={{ fontWeight: 500 }}>{l.name}</td>
                          <td style={{ textAlign: "right", fontWeight: 700 }}>{l.requiredGrossQuantity.toFixed(2)}</td>
                          <td>{l.unitOfMeasure}</td>
                          <td style={{ textAlign: "right", fontWeight: 600 }}>{l.availableStock}</td>
                          <td>
                            {l.isShortage ? (
                              <span className="badge badge-critical">Shortage!</span>
                            ) : (
                              <span className="badge badge-released">Sufficient</span>
                            )}
                          </td>
                          <td style={{ textAlign: "right", fontWeight: 700 }}>₹{l.extendedCost.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No explosion data available.</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowExplosionModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* SHORTAGE CHECK MODAL */}
      {showShortageModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 850 }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Production Order Stock Shortage Detector</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>Available Stock = On-Hand Stock − Reserved Commitments</span>
              </div>
              <button onClick={() => setShowShortageModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Order Demand Units:</label>
                <input
                  type="number"
                  className="input"
                  style={{ width: 120 }}
                  value={shortageOrderQty}
                  onChange={(e) => setShortageOrderQty(parseInt(e.target.value, 10) || 1)}
                />
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleCheckShortages(selectedBOM.id)}
                >
                  Verify Shortages
                </button>
              </div>

              {shortageLoading ? (
                <p style={{ textAlign: "center", padding: 30 }}>Comparing BOM requirements against warehouse inventory records...</p>
              ) : shortageData?.items ? (
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Component SKU</th>
                        <th>Material</th>
                        <th style={{ textAlign: "right" }}>Demand Qty</th>
                        <th style={{ textAlign: "right" }}>On-Hand</th>
                        <th style={{ textAlign: "right" }}>Reserved</th>
                        <th style={{ textAlign: "right" }}>Available</th>
                        <th style={{ textAlign: "right" }}>Shortage Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shortageData.items.map((s, idx) => (
                        <tr key={idx} style={{ backgroundColor: s.isShortage ? "var(--rose-100)" : "transparent" }}>
                          <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--primary)" }}>{s.sku}</td>
                          <td>{s.name}</td>
                          <td style={{ textAlign: "right", fontWeight: 700 }}>{s.requiredForOrder.toFixed(2)} {s.unitOfMeasure}</td>
                          <td style={{ textAlign: "right" }}>{s.physicalStock}</td>
                          <td style={{ textAlign: "right" }}>{s.reservedStock}</td>
                          <td style={{ textAlign: "right", fontWeight: 600 }}>{s.availableStock}</td>
                          <td style={{ textAlign: "right", fontWeight: 800, color: s.isShortage ? "var(--rose-700)" : "var(--primary)" }}>
                            {s.isShortage ? `-${s.shortageQuantity.toFixed(2)} ${s.unitOfMeasure}` : "0"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No shortage data.</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowShortageModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW BOM MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 850 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Create New Bill of Materials Revision</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Parent Manufactured Product *</label>
                    <select
                      className="select"
                      required
                      value={newBOMData.productId}
                      onChange={(e) => setNewBOMData({ ...newBOMData, productId: e.target.value })}
                    >
                      <option value="">Select Manufactured Product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">BOM Revision Identifier *</label>
                    <input
                      type="text"
                      className="input"
                      required
                      placeholder="e.g. BOM-CBR-172-R4"
                      value={newBOMData.revision}
                      onChange={(e) => setNewBOMData({ ...newBOMData, revision: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Revision Scope & Notes</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Optimized electroplating bath formula with lower scrap allowance."
                    value={newBOMData.notes}
                    onChange={(e) => setNewBOMData({ ...newBOMData, notes: e.target.value })}
                  />
                </div>

                {/* Component Lines Editor */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 8 }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--slate-800)" }}>Component / Raw Material Lines</h4>
                  <button type="button" className="btn btn-sm btn-outline" onClick={addComponentRow}>
                    <Plus size={12} /> Add Component
                  </button>
                </div>

                {newBOMData.items.map((it, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10, marginBottom: 8 }}>
                    <select
                      className="select"
                      required
                      value={it.componentProductId}
                      onChange={(e) => {
                        const updated = [...newBOMData.items];
                        updated[idx].componentProductId = e.target.value;
                        setNewBOMData({ ...newBOMData, items: updated });
                      }}
                    >
                      <option value="">Select Component / Raw Material</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      step="0.001"
                      className="input"
                      placeholder="Qty / Unit"
                      required
                      value={it.quantity}
                      onChange={(e) => {
                        const updated = [...newBOMData.items];
                        updated[idx].quantity = e.target.value;
                        setNewBOMData({ ...newBOMData, items: updated });
                      }}
                    />

                    <input
                      type="number"
                      step="0.1"
                      className="input"
                      placeholder="Scrap %"
                      value={it.scrapPercent}
                      onChange={(e) => {
                        const updated = [...newBOMData.items];
                        updated[idx].scrapPercent = e.target.value;
                        setNewBOMData({ ...newBOMData, items: updated });
                      }}
                    />
                  </div>
                ))}

                {/* Operations Editor */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, marginBottom: 8 }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--slate-800)" }}>Manufacturing Operations Routing</h4>
                  <button type="button" className="btn btn-sm btn-outline" onClick={addOperationRow}>
                    <Plus size={12} /> Add Operation
                  </button>
                </div>

                {newBOMData.operations.map((op, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "60px 1.5fr 1fr 80px", gap: 10, marginBottom: 8 }}>
                    <input
                      type="number"
                      className="input"
                      value={op.sequence}
                      onChange={(e) => {
                        const updated = [...newBOMData.operations];
                        updated[idx].sequence = e.target.value;
                        setNewBOMData({ ...newBOMData, operations: updated });
                      }}
                    />
                    <input
                      type="text"
                      className="input"
                      placeholder="Operation Name"
                      required
                      value={op.name}
                      onChange={(e) => {
                        const updated = [...newBOMData.operations];
                        updated[idx].name = e.target.value;
                        setNewBOMData({ ...newBOMData, operations: updated });
                      }}
                    />
                    <input
                      type="text"
                      className="input"
                      placeholder="Work Center"
                      value={op.workCenter}
                      onChange={(e) => {
                        const updated = [...newBOMData.operations];
                        updated[idx].workCenter = e.target.value;
                        setNewBOMData({ ...newBOMData, operations: updated });
                      }}
                    />
                    <input
                      type="number"
                      className="input"
                      placeholder="Mins"
                      value={op.standardMinutes}
                      onChange={(e) => {
                        const updated = [...newBOMData.operations];
                        updated[idx].standardMinutes = e.target.value;
                        setNewBOMData({ ...newBOMData, operations: updated });
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create BOM & Rollup Cost</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
