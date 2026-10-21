// client/src/components/layout/TopBar.jsx
import React from 'react';

export default function TopBar({
  activeTab,
  sidebarOpen,
  setSidebarOpen,
  onOpenTrace,
  onOpenMedia,
  onOpenTaskModal,
  onOpenAddModal,
}) {
  const titles = {
    vendors: {
      name: 'Vendor Management & Master Register',
      sub: 'Module 2 · Vendor Qualification, Rating & Master Data',
    },
    procurement: {
      name: 'Procurement, RFQ & Purchase Orders',
      sub: 'Module 2 · Material Requisitions & Supplier Contracts',
    },
    inventory: {
      name: 'Inventory, Warehouse & Goods Receipt (GRN)',
      sub: 'Module 2 · Stock Control, Gate Inward & Movements',
    },
    projects: {
      name: 'Project & Site Planning',
      sub: 'Module 5 · Operations & Field Engineering',
    },
    installation: {
      name: 'Installation & Commissioning',
      sub: 'Module 5 · Field Work Pack & Testing Console',
    },
    service: {
      name: 'Service, Complaint & Warranty',
      sub: 'Module 5 · After-Sales & Warranty Lifecycle',
    },
  };

  const current = titles[activeTab] || titles.projects;

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          type="button"
          className="mobile-menu"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle Navigation Menu"
          title="Toggle Navigation Menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
        <div className="crumb">
          <small>{current.sub}</small>
          <b>{current.name}</b>
        </div>
      </div>

      <div className="topactions">
        <button type="button" className="topbtn trace-btn" onClick={onOpenTrace}>
          <span className="btn-icon">🔍</span> Trace Job
        </button>
        <button type="button" className="topbtn media-btn" onClick={onOpenMedia}>
          <span className="btn-icon">📷</span> Media Library
        </button>
        <button type="button" className="topbtn task-btn" onClick={onOpenTaskModal}>
          <span className="btn-icon">✓</span> Assign Task
        </button>
        <button type="button" className="topbtn primary add-btn" onClick={onOpenAddModal}>
          <span className="btn-icon">＋</span> Quick Add
        </button>
      </div>
    </header>
  );
}
