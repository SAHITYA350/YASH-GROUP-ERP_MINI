import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Download, FileSpreadsheet, Printer, Layers, Boxes } from "lucide-react";

export default function ReportsView() {
  const [activeTab, setActiveTab] = useState("products");
  const [productReport, setProductReport] = useState([]);
  const [bomReport, setBomReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getProductSummaryReport(),
      api.getBOMCostingReport(),
    ]).then(([prods, boms]) => {
      setProductReport(prods);
      setBomReport(boms);
      setLoading(false);
    });
  }, []);

  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(","));

    for (const row of data) {
      const values = headers.map((header) => {
        const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : "";
        const escaped = val.replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--slate-900)" }}>
            Engineering Reports & Audit Exports
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--slate-500)" }}>
            Exportable tabular registers for manufacturing planning, ERP audits, and BOM cost variance
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-outline"
            onClick={() => window.print()}
          >
            <Printer size={15} /> Print Report
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (activeTab === "products") {
                downloadCSV(productReport, `YASH_Product_Master_Export_${new Date().toISOString().slice(0, 10)}.csv`);
              } else {
                downloadCSV(bomReport, `YASH_BOM_Costing_Report_${new Date().toISOString().slice(0, 10)}.csv`);
              }
            }}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          <Boxes size={15} /> Product Master Catalog ({productReport.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "boms" ? "active" : ""}`}
          onClick={() => setActiveTab("boms")}
        >
          <Layers size={15} /> BOM Costing & Margins ({bomReport.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--slate-400)" }}>Generating tabular report from PostgreSQL...</div>
      ) : activeTab === "products" ? (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <div className="data-table-wrapper" style={{ border: "none" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>HSN</th>
                    <th>GST %</th>
                    <th style={{ textAlign: "right" }}>List Price</th>
                    <th>Physical Stock</th>
                    <th>Available</th>
                    <th>Mfg Type</th>
                  </tr>
                </thead>
                <tbody>
                  {productReport.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--primary)" }}>{p.sku}</td>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td style={{ fontSize: "0.78rem" }}>{p.category}</td>
                      <td style={{ fontFamily: "monospace" }}>{p.hsnCode}</td>
                      <td>{p.gstPercent}%</td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>₹{p.listPrice.toFixed(2)}</td>
                      <td style={{ textAlign: "right" }}>{p.physicalStock} {p.unitOfMeasure}</td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "var(--primary)" }}>{p.availableStock}</td>
                      <td><span className={`badge ${p.isManufactured === "YES" ? "badge-released" : "badge-draft"}`}>{p.isManufactured}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <div className="data-table-wrapper" style={{ border: "none" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>BOM Rev</th>
                    <th>Product SKU</th>
                    <th>Product Name</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Material (₹)</th>
                    <th style={{ textAlign: "right" }}>Labor (₹)</th>
                    <th style={{ textAlign: "right" }}>Overhead (₹)</th>
                    <th style={{ textAlign: "right" }}>Total Cost (₹)</th>
                    <th style={{ textAlign: "right" }}>Selling Price</th>
                    <th style={{ textAlign: "right" }}>Margin %</th>
                  </tr>
                </thead>
                <tbody>
                  {bomReport.map((b) => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 700, color: "var(--primary)" }}>{b.bomRevision}</td>
                      <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{b.productSku}</td>
                      <td style={{ fontWeight: 500 }}>{b.productName}</td>
                      <td><span className="badge badge-released">{b.status}</span></td>
                      <td style={{ textAlign: "right" }}>₹{b.materialCost.toFixed(2)}</td>
                      <td style={{ textAlign: "right" }}>₹{b.laborCost.toFixed(2)}</td>
                      <td style={{ textAlign: "right" }}>₹{b.overheadCost.toFixed(2)}</td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "var(--slate-900)" }}>₹{b.totalCost.toFixed(2)}</td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>₹{b.sellingPrice.toFixed(2)}</td>
                      <td style={{ textAlign: "right", fontWeight: 800, color: "var(--primary)" }}>{b.marginPercent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
