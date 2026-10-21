import React from 'react';
import { Menu } from 'lucide-react';

export default function Header({ activeTab, onToggleMobileMenu }) {
  const titles = {
    employees: 'Employees, Attendance & Payroll',
    leaves: 'Leave Management',
    tasks: 'Tasks & Approvals',
    mis: 'Management MIS',
    trace: 'Executive Job Matrix',
    media: 'Media Library',
  };

  const currentTitle = titles[activeTab] || 'Workforce Register';

  return (
    <header className="reference-header">
      <div className="reference-header-left">
        <button
          className="mobile-menu-trigger"
          onClick={onToggleMobileMenu}
          aria-label="Open sidebar menu"
        >
          <Menu size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="reference-header-breadcrumb">
            Module 7 · Workforce & Admin
          </span>
          <span style={{ color: '#cbd5e1' }}>/</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
            {currentTitle}
          </span>
        </div>
      </div>

      <div className="reference-header-right">
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          padding: '0.25rem 0.65rem',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#065f46'
        }}>
          <span style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 6px #10b981'
          }}></span>
          PostgreSQL Connected
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#0f766e',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            EA
          </div>
          <span className="reference-header-user">ERP Test Admin</span>
        </div>
      </div>
    </header>
  );
}
