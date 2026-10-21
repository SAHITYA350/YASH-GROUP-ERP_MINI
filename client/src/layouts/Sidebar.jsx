import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FileText,
  CreditCard,
  Receipt,
  PieChart,
  BarChart3,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div>
          <div style={{ color: '#34d399', fontSize: '0.76rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            YASH EARTHING
          </div>
          <div style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>
            Finance ERP
          </div>
        </div>
      </div>

      {/* Navigation Links - Pure Finance & Commercial */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Core Overview</div>
        <NavLink
          to="/finance/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <PieChart size={17} />
          <span>Finance Dashboard</span>
        </NavLink>

        <div className="nav-section-label">Billing & Receivables</div>
        <NavLink
          to="/finance/invoices"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <FileText size={17} />
          <span>Invoices & Billing</span>
        </NavLink>

        <NavLink
          to="/finance/receivables"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <CreditCard size={17} />
          <span>Receivables & Ageing</span>
        </NavLink>

        <NavLink
          to="/finance/payments"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Receipt size={17} />
          <span>Payments Received</span>
        </NavLink>

        <div className="nav-section-label">Payables & Costing</div>
        <NavLink
          to="/finance/vendor-bills"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Layers size={17} />
          <span>Vendor Bills & Payables</span>
        </NavLink>

        <NavLink
          to="/finance/expenses"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <CreditCard size={17} />
          <span>Direct Expenses</span>
        </NavLink>

        <NavLink
          to="/finance/costing"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <BarChart3 size={17} />
          <span>Job Costing & Profit</span>
        </NavLink>

        <div className="nav-section-label">Audit & MIS</div>
        <NavLink
          to="/finance/reports"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <FileSpreadsheet size={17} />
          <span>MIS & Audit Reports</span>
        </NavLink>
      </nav>

      {/* Workspace Context Footer */}
      <div className="sidebar-footer">
        <div style={{ fontWeight: 700, color: '#a7f3d0' }}>
          @ Module 6: Commercial & Finance
        </div>
        <div style={{ fontSize: '0.7rem', color: '#6ee7b7', opacity: 0.8 }}>
          GST Compliant · Audit Ready · ISO 9001
        </div>
        <a
          onClick={() => alert('Signing out of Finance Desk')}
          style={{
            marginTop: '8px',
            padding: '6px 10px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            color: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          <span>⮐ Sign out</span>
        </a>
      </div>
    </aside>
  );
}

export default Sidebar;
