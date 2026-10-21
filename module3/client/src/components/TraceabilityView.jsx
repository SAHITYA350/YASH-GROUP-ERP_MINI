import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Search, GitCommit, CheckCircle2, Factory, FileText, ShoppingCart, Briefcase, AlertCircle, ArrowRight } from "lucide-react";

export default function TraceabilityView({ initialSku }) {
  const [skuQuery, setSkuQuery] = useState(initialSku || "YEC-CBR-172-3000");
  const [traceData, setTraceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTraceability = async (sku) => {
    if (!sku) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.getTraceability(sku);
      setTraceData(res);
    } catch (err) {
      setError(err.message);
      setTraceData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraceability(skuQuery);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTraceability(skuQuery);
  };

  const getStageIcon = (stage) => {
    switch (stage) {
      case "PRODUCT_DEFINITION":
        return <FileText size={14} color="var(--primary)" />;
      case "SPECIFICATION_RELEASE":
        return <CheckCircle2 size={14} color="var(--blue-700)" />;
      case "BOM_ENGINEERING":
        return <GitCommit size={14} color="var(--purple-700)" />;
      case "COMMERCIAL_ORDER":
        return <ShoppingCart size={14} color="var(--amber-700)" />;
      case "PLANT_PRODUCTION":
        return <Factory size={14} color="var(--rose-700)" />;
      case "EPC_SITE_PROJECT":
        return <Briefcase size={14} color="var(--primary)" />;
      default:
        return <CheckCircle2 size={14} />;
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--slate-900)" }}>
            End-to-End Product & Project Traceability Explorer
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--slate-500)" }}>
            Complete audit trail linking Product Design → Engineering Specs → BOMs → Commercial Orders → Work Orders → EPC Sites
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            className="input"
            style={{ width: 260, fontFamily: "monospace", fontWeight: 700 }}
            placeholder="Enter Product SKU..."
            value={skuQuery}
            onChange={(e) => setSkuQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            <Search size={15} /> Trace Chain
          </button>
        </form>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--slate-400)" }}>
          <div className="pulse-dot" style={{ margin: "0 auto 16px", width: 14, height: 14 }} />
          Tracing relational records across ERP modules in PostgreSQL...
        </div>
      )}

      {error && (
        <div className="alert-banner rose">
          <span><strong>Trace Error:</strong> {error}</span>
        </div>
      )}

      {traceData && (
        <div>
          {/* Top Product Summary */}
          <div className="card" style={{ marginBottom: 20, backgroundColor: "#fff" }}>
            <div className="card-body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <span style={{ fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 700, color: "var(--primary)" }}>
                  {traceData.product.sku}
                </span>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--slate-900)", marginTop: 2 }}>
                  {traceData.product.name}
                </h3>
                <span style={{ fontSize: "0.8rem", color: "var(--slate-500)" }}>
                  {traceData.product.category} • List: ₹{Number(traceData.product.listPrice).toLocaleString("en-IN")} • Drawing: {traceData.product.drawingId || "N/A"}
                </span>
              </div>

              {traceData.product.stock && (
                <div style={{ display: "flex", gap: 14, backgroundColor: "var(--slate-50)", padding: "10px 16px", borderRadius: 8, border: "1px solid var(--slate-200)" }}>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--slate-400)", fontWeight: 600 }}>PHYSICAL STOCK</div>
                    <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--slate-800)" }}>{traceData.product.stock.physical} {traceData.product.unitOfMeasure}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--slate-400)", fontWeight: 600 }}>COMMITTED / RESERVED</div>
                    <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--amber-700)" }}>{traceData.product.stock.reserved}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--slate-400)", fontWeight: 600 }}>AVAILABLE FOR DISPATCH</div>
                    <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--primary)" }}>{traceData.product.stock.available}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Visual Lifecycle Pipeline Diagram */}
          <div className="card" style={{ marginBottom: 24, padding: "20px 24px" }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--slate-700)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 16 }}>
              Module 3 Cross-Functional Traceability Pipeline
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, alignItems: "center" }}>
              <div style={{ padding: 12, backgroundColor: "var(--primary-light)", border: "1px solid rgba(5, 150, 105, 0.3)", borderRadius: 8, textAlign: "center" }}>
                <FileText size={18} color="var(--primary)" style={{ margin: "0 auto 4px" }} />
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--slate-900)" }}>1. Product Master</div>
                <div style={{ fontSize: "0.68rem", color: "var(--primary)" }}>Defined & Active</div>
              </div>

              <div style={{ padding: 12, backgroundColor: "var(--blue-100)", border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: 8, textAlign: "center" }}>
                <CheckCircle2 size={18} color="var(--blue-700)" style={{ margin: "0 auto 4px" }} />
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--slate-900)" }}>2. Technical Spec</div>
                <div style={{ fontSize: "0.68rem", color: "var(--blue-700)" }}>{traceData.specifications?.length || 0} Revisions</div>
              </div>

              <div style={{ padding: 12, backgroundColor: "var(--purple-100)", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: 8, textAlign: "center" }}>
                <GitCommit size={18} color="var(--purple-700)" style={{ margin: "0 auto 4px" }} />
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--slate-900)" }}>3. Production BOM</div>
                <div style={{ fontSize: "0.68rem", color: "var(--purple-700)" }}>{traceData.boms?.length || 0} Revisions</div>
              </div>

              <div style={{ padding: 12, backgroundColor: "var(--amber-100)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: 8, textAlign: "center" }}>
                <ShoppingCart size={18} color="var(--amber-700)" style={{ margin: "0 auto 4px" }} />
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--slate-900)" }}>4. Commercial Order</div>
                <div style={{ fontSize: "0.68rem", color: "var(--amber-700)" }}>{traceData.salesOrders?.length || 0} Sales Orders</div>
              </div>

              <div style={{ padding: 12, backgroundColor: "var(--rose-100)", border: "1px solid rgba(244, 63, 94, 0.3)", borderRadius: 8, textAlign: "center" }}>
                <Factory size={18} color="var(--rose-700)" style={{ margin: "0 auto 4px" }} />
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--slate-900)" }}>5. Work Orders</div>
                <div style={{ fontSize: "0.68rem", color: "var(--rose-700)" }}>{traceData.workOrders?.length || 0} Batches</div>
              </div>

              <div style={{ padding: 12, backgroundColor: "var(--slate-100)", border: "1px solid var(--slate-300)", borderRadius: 8, textAlign: "center" }}>
                <Briefcase size={18} color="var(--slate-700)" style={{ margin: "0 auto 4px" }} />
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--slate-900)" }}>6. EPC Site Project</div>
                <div style={{ fontSize: "0.68rem", color: "var(--slate-600)" }}>Commissioned</div>
              </div>
            </div>
          </div>

          {/* Chronological Lifecycle Timeline */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Chronological Lifecycle Audit Timeline</span>
            </div>
            <div className="card-body">
              <div className="timeline">
                {traceData.timeline.map((event, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-dot">
                      {getStageIcon(event.stage)}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="timeline-title">{event.title}</span>
                      <span className="badge badge-draft">{event.status}</span>
                    </div>
                    <div className="timeline-date">{new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    <div className="timeline-desc">{event.details}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
