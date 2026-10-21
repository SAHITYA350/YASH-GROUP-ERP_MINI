import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Calculator, TrendingUp, DollarSign, Sliders, ArrowRight, RefreshCw } from "lucide-react";

export default function CostingSimulationView({ initialBOMId }) {
  const [boms, setBoms] = useState([]);
  const [selectedBOMId, setSelectedBOMId] = useState(initialBOMId || "");
  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);

  // Simulation Controls
  const [materialAdjustmentPercent, setMaterialAdjustmentPercent] = useState(0);
  const [laborHourlyRate, setLaborHourlyRate] = useState(350);
  const [overheadPercent, setOverheadPercent] = useState(12);
  const [targetMarginPercent, setTargetMarginPercent] = useState(25);
  const [batchSize, setBatchSize] = useState(500);

  useEffect(() => {
    api.getBOMs().then((data) => {
      setBoms(data);
      if (data.length > 0 && !selectedBOMId) {
        setSelectedBOMId(data[0].id);
      }
    });
  }, []);

  const runSimulation = async () => {
    if (!selectedBOMId) return;
    try {
      setLoading(true);
      const res = await api.simulateBOMCost(selectedBOMId, {
        materialAdjustmentPercent,
        laborHourlyRate,
        overheadPercent,
        targetMarginPercent,
        batchSize,
      });
      setSimResult(res);
    } catch (err) {
      alert("Simulation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBOMId) {
      runSimulation();
    }
  }, [selectedBOMId, materialAdjustmentPercent, laborHourlyRate, overheadPercent, targetMarginPercent, batchSize]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--slate-900)" }}>
            Costing Engine & Price Sensitivity Simulation
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--slate-500)" }}>
            Authoritative server-side costing with dynamic raw material indexation, labor rates, and margin optimization
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            className="select"
            style={{ width: 320, fontWeight: 600 }}
            value={selectedBOMId}
            onChange={(e) => setSelectedBOMId(e.target.value)}
          >
            {boms.map((b) => (
              <option key={b.id} value={b.id}>
                {b.product?.sku} ({b.revision})
              </option>
            ))}
          </select>

          <button className="btn btn-outline" onClick={runSimulation}>
            <RefreshCw size={14} /> Re-Calculate
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24 }}>
        {/* Left: Simulation Sliders & Inputs */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><Sliders size={16} /> Cost Drivers & Parameters</span>
          </div>
          <div className="card-body">
            {/* Raw Material Fluctuation Slider */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label className="form-label">Material Price Fluctuation</label>
                <span style={{ fontWeight: 700, color: materialAdjustmentPercent > 0 ? "var(--rose-700)" : materialAdjustmentPercent < 0 ? "var(--primary)" : "var(--slate-800)" }}>
                  {materialAdjustmentPercent > 0 ? `+${materialAdjustmentPercent}%` : `${materialAdjustmentPercent}%`}
                </span>
              </div>
              <input
                type="range"
                min="-25"
                max="50"
                step="1"
                value={materialAdjustmentPercent}
                onChange={(e) => setMaterialAdjustmentPercent(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "var(--primary)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--slate-400)" }}>
                <span>-25% (Deflation)</span>
                <span>0% Base</span>
                <span>+50% (Copper Spike)</span>
              </div>
            </div>

            {/* Labor Hourly Rate */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label className="form-label">Shopfloor Labor Rate</label>
                <span style={{ fontWeight: 700 }}>₹{laborHourlyRate} / hour</span>
              </div>
              <input
                type="range"
                min="200"
                max="800"
                step="25"
                value={laborHourlyRate}
                onChange={(e) => setLaborHourlyRate(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "var(--primary)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--slate-400)" }}>
                <span>₹200/hr</span>
                <span>₹350/hr Standard</span>
                <span>₹800/hr High</span>
              </div>
            </div>

            {/* Factory Overhead */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label className="form-label">Factory Overhead Allocation</label>
                <span style={{ fontWeight: 700 }}>{overheadPercent}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={overheadPercent}
                onChange={(e) => setOverheadPercent(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "var(--primary)" }}
              />
            </div>

            {/* Target Margin % */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label className="form-label">Target Commercial Margin</label>
                <span style={{ fontWeight: 700, color: "var(--primary)" }}>{targetMarginPercent}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={targetMarginPercent}
                onChange={(e) => setTargetMarginPercent(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "var(--primary)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--slate-400)" }}>
                <span>5% Min</span>
                <span>25% Target</span>
                <span>50% Premium</span>
              </div>
            </div>

            {/* Production Batch Size */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Batch Production Quantity (Units)</label>
              <input
                type="number"
                className="input"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value, 10) || 1)}
              />
            </div>
          </div>
        </div>

        {/* Right: Authoritative Simulation Breakdown */}
        {simResult ? (
          <div>
            {/* Top Cards: Unit Cost, Target Price, Unit Margin, Batch Total */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.2fr", gap: 14, marginBottom: 20 }}>
              <div style={{ padding: 14, backgroundColor: "#fff", border: "1px solid var(--slate-200)", borderRadius: 10, boxShadow: "var(--shadow-sm)" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--slate-500)", fontWeight: 700 }}>SIMULATED UNIT COST</div>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--slate-900)", marginTop: 4 }}>
                  ₹{simResult.costBreakdown.totalUnitCost.toFixed(2)}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--slate-400)", marginTop: 2 }}>
                  Material: ₹{simResult.costBreakdown.simulatedMaterialCost.toFixed(2)}
                </div>
              </div>

              <div style={{ padding: 14, backgroundColor: "#fff", border: "1px solid var(--slate-200)", borderRadius: 10, boxShadow: "var(--shadow-sm)" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--slate-500)", fontWeight: 700 }}>RECOMMENDED SELLING PRICE</div>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--primary)", marginTop: 4 }}>
                  ₹{simResult.commercials.sellingPrice.toFixed(2)}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--slate-400)", marginTop: 2 }}>
                  Markup: +{simResult.commercials.markupPercent}%
                </div>
              </div>

              <div style={{ padding: 14, backgroundColor: "var(--primary-light)", border: "1px solid rgba(5, 150, 105, 0.3)", borderRadius: 10 }}>
                <div style={{ fontSize: "0.72rem", color: "var(--primary-hover)", fontWeight: 700 }}>GROSS MARGIN %</div>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--primary)", marginTop: 4 }}>
                  {simResult.commercials.marginPercent}%
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--primary-hover)", marginTop: 2 }}>
                  Profit: ₹{simResult.commercials.profitPerUnit.toFixed(2)} / unit
                </div>
              </div>

              <div style={{ padding: 14, backgroundColor: "#fff", border: "1px solid var(--slate-200)", borderRadius: 10, boxShadow: "var(--shadow-sm)" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--slate-500)", fontWeight: 700 }}>BATCH VALUE ({batchSize} Units)</div>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--slate-900)", marginTop: 4 }}>
                  ₹{(simResult.costBreakdown.batchTotalCost).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--slate-400)", marginTop: 2 }}>
                  Gross Revenue: ₹{(simResult.commercials.sellingPrice * batchSize).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>

            {/* Component Level Price Sensitivity Table */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Component-Level Cost Impact Snapshot</span>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Component SKU</th>
                      <th>Material Name</th>
                      <th style={{ textAlign: "right" }}>Costed Gross Qty</th>
                      <th style={{ textAlign: "right" }}>Market Unit Rate</th>
                      <th style={{ textAlign: "right" }}>Extended Baseline Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simResult.itemCostDetails.map((it, idx) => (
                      <tr key={idx}>
                        <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--primary)" }}>{it.sku}</td>
                        <td style={{ fontWeight: 500 }}>{it.name}</td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>{it.grossQuantity.toFixed(3)}</td>
                        <td style={{ textAlign: "right" }}>₹{it.unitRate.toFixed(2)}</td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>₹{it.lineCost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            Running cost calculations...
          </div>
        )}
      </div>
    </div>
  );
}
