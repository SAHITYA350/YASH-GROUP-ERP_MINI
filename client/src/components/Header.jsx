import React, { useState } from 'react';
import { Menu, PlusCircle, UserCheck } from 'lucide-react';

export default function Header({ activeTab, onToggleMobileMenu, onQuickAdd }) {
  const [activeRole, setActiveRole] = useState(localStorage.getItem('erp_active_role') || 'ADMIN');
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles = [
    { key: 'ADMIN', label: 'Admin (Full Access)' },
    { key: 'HR_MANAGER', label: 'HR Manager' },
    { key: 'SALES_MANAGER', label: 'Sales Manager' },
    { key: 'PRODUCTION_MANAGER', label: 'Production Manager' },
  ];

  const handleRoleSelect = (roleKey) => {
    setActiveRole(roleKey);
    localStorage.setItem('erp_active_role', roleKey);
    setShowRoleMenu(false);
  };

  const getSubTitle = () => {
    switch (activeTab) {
      case 'employees': return 'Employees & Payroll';
      case 'tasks': return 'Tasks, Roles & Approvals';
      case 'performance': return 'Performance & Targets';
      case 'mis': return 'Management MIS & Audit';
      case 'trace': return 'Executive Job Matrix';
      case 'media': return 'Media & Document Library';
      default: return 'Workforce Management';
    }
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          className="mobile-menu-trigger"
          onClick={onToggleMobileMenu}
          aria-label="Open sidebar menu"
        >
          <Menu size={20} />
        </button>
        <div className="header-titles">
          <span className="module-tag">Module 7 · Workforce, Admin & MIS</span>
          <h1 className="header-title">{getSubTitle()}</h1>
        </div>
      </div>

      <div className="header-right">
        <button
          className="btn-quick-add"
          onClick={onQuickAdd}
          title="Create new task or record"
        >
          <PlusCircle size={15} /> Quick Add
        </button>

        <div style={{ position: 'relative' }}>
          <div
            className="user-badge-container"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            style={{ cursor: 'pointer' }}
            title="Click to switch role context"
          >
            <div className="avatar-circle">AD</div>
            <div className="user-info">
              <span className="user-name">Management</span>
              <span className="user-role-label">{activeRole} · Enterprise Demo</span>
            </div>
          </div>

          {showRoleMenu && (
            <div className="role-dropdown-menu">
              <div className="role-dropdown-title">
                Switch Role Context
              </div>
              {roles.map((r) => (
                <button
                  key={r.key}
                  onClick={() => handleRoleSelect(r.key)}
                  className={`role-dropdown-item ${activeRole === r.key ? 'active' : ''}`}
                >
                  <UserCheck size={14} /> {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
