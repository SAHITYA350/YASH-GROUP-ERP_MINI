import React from 'react';
import { Bell } from 'lucide-react';

export function Topbar() {
  return (
    <header className="top-navbar">
      {/* Left section: Module status indicator */}
      <div className="page-title-box">
        <div>
          <div style={{ fontSize: '0.76rem', color: 'var(--slate-500)', fontWeight: 500, marginBottom: '2px' }}>
            Commercial, Finance & Audit · Module 6
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)', letterSpacing: '-0.01em' }}>
            Yash Industrial Corp — Finance & Accounts
          </div>
        </div>
      </div>

      {/* Right: PostgreSQL Live Status & Desk Persona */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className="header-status-pill">
          <span className="pulse-dot" />
          <span>PostgreSQL Connected: Port 5000</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
          <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}>
            FINANCE_MANAGER
          </span>
          <span style={{ fontWeight: 700, color: '#064e3b' }}>CMA Amit Verma</span>
        </div>

        <button
          type="button"
          className="btn btn-ghost"
          style={{ padding: '0.45rem', borderRadius: '50%', color: 'var(--slate-500)' }}
          title="Finance Alerts"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}

export default Topbar;
