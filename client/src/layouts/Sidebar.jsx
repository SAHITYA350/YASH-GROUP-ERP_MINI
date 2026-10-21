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
  Building2,
  ShieldCheck,
} from 'lucide-react';

export function Sidebar() {
  const navItemStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.65rem 0.9rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    fontWeight: isActive ? 600 : 500,
    color: isActive ? '#fff' : 'var(--sidebar-text)',
    backgroundColor: isActive ? 'var(--sidebar-active)' : 'transparent',
    textDecoration: 'none',
    transition: 'all var(--transition-fast)',
    boxShadow: isActive ? '0 2px 8px rgba(14, 112, 84, 0.4)' : 'none',
  });

  return (
    <aside
      className="sidebar"
      style={{
        width: 'var(--sidebar-width)',
        minWidth: 'var(--sidebar-width)',
        height: '100vh',
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        userSelect: 'none',
        color: '#fff',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 'var(--topbar-height)',
          padding: '0 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid var(--sidebar-border)',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #0e7054 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.1rem',
            boxShadow: '0 4px 10px rgba(14, 112, 84, 0.4)',
          }}
        >
          Y
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em', color: '#fff' }}>
            YASH GROUP ERP
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--sidebar-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Module 6: Finance & Commercial
          </div>
        </div>
      </div>

      {/* Navigation Links - Pure Finance & Commercial */}
      <div
        style={{
          padding: '1rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.3rem',
          overflowY: 'auto',
          flex: 1,
        }}
      >
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--sidebar-text-muted)', padding: '0.5rem 0.75rem 0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.9 }}>
          Finance Operations
        </div>

        <NavLink to="/finance/dashboard" style={navItemStyle}>
          <PieChart size={18} />
          <span>Finance Dashboard</span>
        </NavLink>

        <NavLink to="/finance/invoices" style={navItemStyle}>
          <FileText size={18} />
          <span>Invoices & Billing</span>
        </NavLink>

        <NavLink to="/finance/receivables" style={navItemStyle}>
          <CreditCard size={18} />
          <span>Receivables & Ageing</span>
        </NavLink>

        <NavLink to="/finance/payments" style={navItemStyle}>
          <Receipt size={18} />
          <span>Payments Received</span>
        </NavLink>

        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--sidebar-text-muted)', padding: '0.75rem 0.75rem 0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.9 }}>
          Payables & Costing
        </div>

        <NavLink to="/finance/vendor-bills" style={navItemStyle}>
          <Layers size={18} />
          <span>Vendor Bills & Payables</span>
        </NavLink>

        <NavLink to="/finance/expenses" style={navItemStyle}>
          <CreditCard size={18} />
          <span>Direct Expenses</span>
        </NavLink>

        <NavLink to="/finance/costing" style={navItemStyle}>
          <BarChart3 size={18} />
          <span>Job Costing & Profit</span>
        </NavLink>

        <NavLink to="/finance/reports" style={navItemStyle}>
          <FileSpreadsheet size={18} />
          <span>MIS & Audit Reports</span>
        </NavLink>
      </div>

      {/* Workspace Context Footer */}
      <div
        style={{
          padding: '0.85rem 1rem',
          borderTop: '1px solid var(--sidebar-border)',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(14, 112, 84, 0.25)',
            color: 'var(--sidebar-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Building2 size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '0.825rem',
              fontWeight: 700,
              color: '#fff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Yash Industrial Corp
          </div>
          <div
            style={{
              fontSize: '0.7rem',
              color: 'var(--sidebar-text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={12} />
            Finance & Accounts Desk
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
