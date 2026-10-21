// client/src/components/layout/Sidebar.jsx
import React from 'react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  apiOnline,
  counts = {},
}) {
  const handleNavClick = (tab) => {
    setActiveTab(tab);
    // Auto close sidebar on mobile when navigating
    if (sidebarOpen && setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay show"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="logo">
            <span>YG</span>
          </div>
          <div className="brand-info">
            <h1>Yash ERP</h1>
            <small>Enterprise Control System</small>
          </div>
          {/* Close button on mobile inside sidebar */}
          <button 
            type="button" 
            className="sidebar-close-btn" 
            onClick={() => setSidebarOpen(false)}
            aria-label="Close Sidebar"
          >
            ✕
          </button>
        </div>

        {/* =========================================================
            MODULE 02 SECTION: VENDOR, PROCUREMENT & INVENTORY
           ========================================================= */}
        <div className="vtag">
          <div className="vtag-header">
            <span className="vtag-pulse"></span>
            <b>MODULE 02 · VENDOR & SUPPLY</b>
          </div>
          <span>Procurement · RFQ · PO · Inventory & GRN</span>
        </div>

        <div className="navgroup">
          <div className="navlabel">PROCUREMENT & INVENTORY</div>

          <button
            type="button"
            className={`navbtn ${activeTab === 'vendors' ? 'active' : ''}`}
            onClick={() => handleNavClick('vendors')}
          >
            <span className="navico">🏢</span>
            <div className="nav-text">
              <b>Vendor Management</b>
              <small>Master · rating · capability</small>
            </div>
            {counts.vendors !== undefined && (
              <span className="nav-badge">{counts.vendors}</span>
            )}
          </button>

          <button
            type="button"
            className={`navbtn ${activeTab === 'procurement' ? 'active' : ''}`}
            onClick={() => handleNavClick('procurement')}
          >
            <span className="navico">📋</span>
            <div className="nav-text">
              <b>Procurement & PO</b>
              <small>PR · RFQ · compare · release</small>
            </div>
            {counts.purchaseOrders !== undefined && (
              <span className="nav-badge">{counts.purchaseOrders}</span>
            )}
          </button>

          <button
            type="button"
            className={`navbtn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => handleNavClick('inventory')}
          >
            <span className="navico">📦</span>
            <div className="nav-text">
              <b>Inventory & Receipt</b>
              <small>GRN · stock · bin transfer</small>
            </div>
            {counts.inventory !== undefined && (
              <span className="nav-badge">{counts.inventory}</span>
            )}
          </button>
        </div>

        {/* =========================================================
            MODULE 05 SECTION: SITE & FIELD OPS
           ========================================================= */}
        <div className="vtag" style={{ marginTop: '16px' }}>
          <div className="vtag-header">
            <span className="vtag-pulse"></span>
            <b>MODULE 05 · SITE & FIELD OPS</b>
          </div>
          <span>Projects · Installation · Service</span>
        </div>

        <div className="navgroup">
          <div className="navlabel">FIELD & CLIENT OPERATIONS</div>

          <button
            type="button"
            className={`navbtn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => handleNavClick('projects')}
          >
            <span className="navico">⌂</span>
            <div className="nav-text">
              <b>Project & Site Planning</b>
              <small>Survey · timeline · team</small>
            </div>
            {counts.projects !== undefined && (
              <span className="nav-badge">{counts.projects}</span>
            )}
          </button>

          <button
            type="button"
            className={`navbtn ${activeTab === 'installation' ? 'active' : ''}`}
            onClick={() => handleNavClick('installation')}
          >
            <span className="navico">⚙</span>
            <div className="nav-text">
              <b>Installation & Commissioning</b>
              <small>Site work · test · proof</small>
            </div>
            {counts.installations !== undefined && (
              <span className="nav-badge">{counts.installations}</span>
            )}
          </button>

          <button
            type="button"
            className={`navbtn ${activeTab === 'service' ? 'active' : ''}`}
            onClick={() => handleNavClick('service')}
          >
            <span className="navico">⚒</span>
            <div className="nav-text">
              <b>Service & Warranty</b>
              <small>Complaint · warranty · visit</small>
            </div>
            {counts.service !== undefined && (
              <span className="nav-badge">{counts.service}</span>
            )}
          </button>
        </div>

        <div className="sidebar-footer">
          <div className={`connection-pill ${apiOnline ? 'online' : 'offline'}`}>
            <span className="connection-dot"></span>
            <span>{apiOnline ? 'PostgreSQL Active' : 'Backend Offline / Reconnecting'}</span>
          </div>
          <div className="db-info-pill">
            <small>Shared Database · Multi-Tier PERN</small>
          </div>
        </div>
      </aside>
    </>
  );
}
