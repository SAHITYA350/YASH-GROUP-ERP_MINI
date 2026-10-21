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
    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
    textDecoration: 'none',
    transition: 'all var(--transition-fast)',
  });

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        minWidth: 'var(--sidebar-width)',
        height: '100vh',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        userSelect: 'none',
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
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.1rem',
            boxShadow: '0 2px 4px rgba(37,99,235,0.3)',
          }}
        >
          Y
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em', color: 'var(--text-main)' }}>
            YASH GROUP ERP
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
          gap: '0.25rem',
          overflowY: 'auto',
          flex: 1,
        }}
      >
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-subtle)', padding: '0.5rem 0.75rem 0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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

        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-subtle)', padding: '0.75rem 0.75rem 0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-alt)',
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
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
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
              fontWeight: 600,
              color: 'var(--text-main)',
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
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontWeight: 500,
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
