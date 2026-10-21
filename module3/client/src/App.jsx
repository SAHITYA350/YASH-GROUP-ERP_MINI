import React, { useState } from "react";
import DashboardView from "./components/DashboardView";
import ProductsView from "./components/ProductsView";
import SpecificationsView from "./components/SpecificationsView";
import BOMManagerView from "./components/BOMManagerView";
import CostingSimulationView from "./components/CostingSimulationView";
import DocumentsView from "./components/DocumentsView";
import TrainingLibraryView from "./components/TrainingLibraryView";
import TaskCenterView from "./components/TaskCenterView";
import TraceabilityView from "./components/TraceabilityView";
import ReportsView from "./components/ReportsView";

import {
  LayoutDashboard,
  Boxes,
  FileCheck2,
  Layers,
  Calculator,
  FileCode,
  GraduationCap,
  CheckSquare,
  Network,
  FileSpreadsheet,
  Cpu,
  ShieldCheck,
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [traceSku, setTraceSku] = useState("YEC-CBR-172-3000");
  const [simBOMId, setSimBOMId] = useState(null);

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Engineering Dashboard";
      case "products":
        return "Product Master & Catalog";
      case "specifications":
        return "Technical Specifications & Standards";
      case "bom-manager":
        return "Bill of Materials (BOM / BOQ)";
      case "costing-simulation":
        return "Costing Engine & Sensitivity Simulation";
      case "documents":
        return "Drawings & Technical Documents";
      case "training":
        return "Engineering Training Library";
      case "tasks":
        return "Engineering Task & Action Center";
      case "traceability":
        return "End-to-End Traceability Explorer";
      case "reports":
        return "Engineering Reports & Exports";
      default:
        return "Product & Engineering Workspace";
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div>
            <div style={{ color: "#34d399", fontSize: "0.76rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              YASH EARTHING
            </div>
            <div style={{ color: "#ffffff", fontSize: "1.2rem", fontWeight: 800, marginTop: "2px" }}>
              Engineering ERP
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Core Overview</div>
          <a
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={17} />
            <span>Dashboard</span>
          </a>

          <div className="nav-section-label">Product Engineering</div>
          <a
            className={`nav-item ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <Boxes size={17} />
            <span>Product Master</span>
          </a>
          <a
            className={`nav-item ${activeTab === "specifications" ? "active" : ""}`}
            onClick={() => setActiveTab("specifications")}
          >
            <FileCheck2 size={17} />
            <span>Specifications</span>
          </a>
          <a
            className={`nav-item ${activeTab === "bom-manager" ? "active" : ""}`}
            onClick={() => setActiveTab("bom-manager")}
          >
            <Layers size={17} />
            <span>BOM / BOQ Manager</span>
          </a>
          <a
            className={`nav-item ${activeTab === "costing-simulation" ? "active" : ""}`}
            onClick={() => setActiveTab("costing-simulation")}
          >
            <Calculator size={17} />
            <span>Costing & Simulation</span>
          </a>

          <div className="nav-section-label">Documentation & Training</div>
          <a
            className={`nav-item ${activeTab === "documents" ? "active" : ""}`}
            onClick={() => setActiveTab("documents")}
          >
            <FileCode size={17} />
            <span>Drawings & CAD</span>
          </a>
          <a
            className={`nav-item ${activeTab === "training" ? "active" : ""}`}
            onClick={() => setActiveTab("training")}
          >
            <GraduationCap size={17} />
            <span>Training Library</span>
          </a>

          <div className="nav-section-label">Quality & Traceability</div>
          <a
            className={`nav-item ${activeTab === "tasks" ? "active" : ""}`}
            onClick={() => setActiveTab("tasks")}
          >
            <CheckSquare size={17} />
            <span>Task Center</span>
          </a>
          <a
            className={`nav-item ${activeTab === "traceability" ? "active" : ""}`}
            onClick={() => setActiveTab("traceability")}
          >
            <Network size={17} />
            <span>Traceability</span>
          </a>
          <a
            className={`nav-item ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            <FileSpreadsheet size={17} />
            <span>Audit Reports</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--sidebar-text-muted)", fontSize: "0.75rem" }}>
            <Cpu size={14} color="#34d399" />
            <span>Module 3: R&D & Engineering</span>
          </div>
          <div style={{ fontSize: "0.7rem", color: "#6ee7b7" }}>UL 467 • IEC 62561 • ISO 9001</div>
          <a
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 10,
              paddingTop: 10,
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#a7f3d0",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}
          >
            <span>⮐ Sign out</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Navbar */}
        <header className="top-navbar">
          <div className="page-title-box">
            <div>
              <div style={{ fontSize: "0.76rem", color: "var(--slate-500)", fontWeight: 500, marginBottom: "2px" }}>
                Product, R&D & Engineering · Module 3
              </div>
              <h1 className="page-title">{getPageTitle()}</h1>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="header-status-pill">
              <span className="pulse-dot" />
              <span>PostgreSQL Connected: Port 5003</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem" }}>
              <span style={{ backgroundColor: "#f1f5f9", color: "#475569", padding: "3px 8px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: 700 }}>
                ENGINEERING_MANAGER
              </span>
              <span style={{ fontWeight: 700, color: "#064e3b" }}>Er. Rajesh Sharma</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="content-body">
          {activeTab === "dashboard" && <DashboardView onNavigate={(tab) => setActiveTab(tab)} />}
          {activeTab === "products" && (
            <ProductsView
              onSelectProductForTrace={(sku) => {
                setTraceSku(sku);
                setActiveTab("traceability");
              }}
            />
          )}
          {activeTab === "specifications" && <SpecificationsView />}
          {activeTab === "bom-manager" && (
            <BOMManagerView
              onSelectForCostSimulation={(bomId) => {
                setSimBOMId(bomId);
                setActiveTab("costing-simulation");
              }}
            />
          )}
          {activeTab === "costing-simulation" && <CostingSimulationView initialBOMId={simBOMId} />}
          {activeTab === "documents" && <DocumentsView />}
          {activeTab === "training" && <TrainingLibraryView />}
          {activeTab === "tasks" && <TaskCenterView />}
          {activeTab === "traceability" && <TraceabilityView initialSku={traceSku} />}
          {activeTab === "reports" && <ReportsView />}
        </div>
      </main>
    </div>
  );
}
