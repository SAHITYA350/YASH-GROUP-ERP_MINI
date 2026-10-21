import React, { useEffect, useState } from "react";
import { api } from "../api";
import {
  Boxes,
  Cpu,
  Layers,
  CheckCircle2,
  FileCode,
  Video,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function DashboardView({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div className="pulse-dot" style={{ margin: "0 auto 16px", width: 14, height: 14 }} />
        <p style={{ color: "var(--slate-500)", fontSize: "0.9rem" }}>Loading Engineering Workspace data from PostgreSQL...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-banner rose">
        <span><strong>Error connecting to API:</strong> {error}</span>
        <button className="btn btn-sm btn-outline" onClick={fetchDashboard}>Retry</button>
      </div>
    );
  }

  const { kpis, categoryBreakdown, shortageAlerts, recentProducts, recentTasks, recentDrawings } = data;

  return (
    <div>
      {/* Shortage Alert Banner if shortages exist */}
      {shortageAlerts && shortageAlerts.length > 0 && (
        <div className="alert-banner rose">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AlertTriangle size={18} />
            <span>
              <strong>Component Shortage Alert:</strong> {shortageAlerts.length} components (e.g. {shortageAlerts[0]?.sku}) have available stock below reorder threshold!
            </span>
          </div>
          <button className="btn btn-sm btn-danger" onClick={() => onNavigate("bom-manager")}>
            Review in BOM Manager
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card emerald">
          <div className="kpi-header">
            <span className="kpi-label">Total Products</span>
            <div className="kpi-icon-wrap emerald"><Boxes size={18} /></div>
          </div>
          <div className="kpi-value">{kpis.totalProducts}</div>
          <div className="kpi-subtext">{kpis.manufacturedCount} In-House Manufactured</div>
        </div>

        <div className="kpi-card blue">
          <div className="kpi-header">
            <span className="kpi-label">Active BOMs</span>
            <div className="kpi-icon-wrap blue"><Layers size={18} /></div>
          </div>
          <div className="kpi-value">{kpis.activeBoms}</div>
          <div className="kpi-subtext">Released Production Revisions</div>
        </div>

        <div className="kpi-card amber">
          <div className="kpi-header">
            <span className="kpi-label">Open Eng. Tasks</span>
            <div className="kpi-icon-wrap amber"><Clock size={18} /></div>
          </div>
          <div className="kpi-value">{kpis.openTasks}</div>
          <div className="kpi-subtext">Design, Specs & Testing</div>
        </div>

        <div className="kpi-card purple">
          <div className="kpi-header">
            <span className="kpi-label">Drawings & CAD</span>
            <div className="kpi-icon-wrap purple"><FileCode size={18} /></div>
          </div>
          <div className="kpi-value">{kpis.drawingsCount}</div>
          <div className="kpi-subtext">Approved Technical Blueprints</div>
        </div>

        <div className="kpi-card rose">
          <div className="kpi-header">
            <span className="kpi-label">Training Library</span>
            <div className="kpi-icon-wrap rose"><Video size={18} /></div>
          </div>
          <div className="kpi-value">{kpis.trainingVideos}</div>
          <div className="kpi-subtext">SOPs & Installation Guides</div>
        </div>
      </div>

      {/* Layout Split: Left Category Breakdown & Recent Products, Right Tasks & Drawings */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24 }}>
        {/* Left Column */}
        <div>
          {/* Category Distribution */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><Boxes size={16} /> Product Portfolio by Family</span>
              <button className="btn btn-sm btn-outline" onClick={() => onNavigate("products")}>
                View All <ArrowRight size={14} />
              </button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product Category / Line</th>
                    <th>Type</th>
                    <th style={{ textAlign: "right" }}>Items Count</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryBreakdown.map((cat, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: "var(--slate-900)" }}>{cat.name}</td>
                      <td>
                        <span className={`badge ${cat.type === "FINISHED_GOOD" ? "badge-released" : "badge-draft"}`}>
                          {cat.type.replace("_", " ")}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>{cat.productCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Products */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><Cpu size={16} /> Recently Updated Products</span>
              <button className="btn btn-sm btn-outline" onClick={() => onNavigate("products")}>
                Manage Products
              </button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th style={{ textAlign: "right" }}>List Price</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProducts.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--primary)" }}>{p.sku}</td>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td style={{ color: "var(--slate-500)", fontSize: "0.78rem" }}>{p.category?.name}</td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>₹{Number(p.listPrice).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Engineering Tasks */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><Clock size={16} /> Engineering Action Center</span>
              <button className="btn btn-sm btn-outline" onClick={() => onNavigate("tasks")}>
                All Tasks <ArrowRight size={14} />
              </button>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentTasks.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: 12,
                    border: "1px solid var(--slate-200)",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--slate-50)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)" }}>{t.taskNo}</span>
                    <span className={`badge ${t.priority === "CRITICAL" ? "badge-critical" : t.priority === "HIGH" ? "badge-high" : "badge-medium"}`}>
                      {t.priority}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--slate-800)", marginBottom: 4 }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--slate-500)", display: "flex", justifyContent: "space-between" }}>
                    <span>Role: {t.roleTitle || "Engineer"}</span>
                    <span style={{ color: t.status === "COMPLETED" ? "var(--primary)" : "var(--amber-700)", fontWeight: 600 }}>
                      {t.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Released Drawings Register */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><FileCode size={16} /> Technical Drawings</span>
              <button className="btn btn-sm btn-outline" onClick={() => onNavigate("documents")}>
                Open Register
              </button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Drawing Title</th>
                    <th>Rev</th>
                    <th>Linked Product</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDrawings.map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600, color: "var(--slate-800)" }}>{d.title}</td>
                      <td><span className="badge badge-released">{d.revision || "R1"}</span></td>
                      <td style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>{d.product?.sku || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
