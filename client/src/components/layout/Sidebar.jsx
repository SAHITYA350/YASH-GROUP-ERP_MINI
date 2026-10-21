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

        <div className="vtag">
          <div className="vtag-header">
            <span className="vtag-pulse"></span>
            <b>MODULE 05 · SITE & FIELD OPS</b>
          </div>
          <span>Projects · Installation · Commissioning · Service & Warranty</span>
        </div>

        <div className="navgroup">
          <div className="navlabel">OPERATIONAL WORKFLOW</div>

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
