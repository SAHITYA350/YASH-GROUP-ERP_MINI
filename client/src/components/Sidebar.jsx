import React from 'react';
import { 
  LayoutDashboard,
  Users, 
  CheckSquare, 
  BarChart3, 
  Briefcase,
  GitBranch, 
  Folder, 
  CalendarDays,
  LogOut,
  X
} from 'lucide-react';
import { api } from '../services/api';

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }) {
  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'employees',
      title: 'Employees & Payroll',
      icon: Users,
    },
    {
      id: 'leaves',
      title: 'Leave Management',
      icon: CalendarDays,
    },
    {
      id: 'tasks',
      title: 'Tasks & Approvals',
      icon: CheckSquare,
    },
    {
      id: 'mis',
      title: 'Management MIS',
      icon: BarChart3,
    },
    {
      id: 'trace',
      title: 'Executive Job Matrix',
      icon: Briefcase,
    },
    {
      id: 'media',
      title: 'Media Library',
      icon: Folder,
    },
  ];

  const handleSelect = (tabId) => {
    setActiveTab(tabId);
    if (onClose) onClose();
  };

  const handleSignOut = () => {
    try {
      if (api.logout) api.logout();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('erp_token');
    window.location.reload();
  };

  return (
    <>
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`reference-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header matching reference screenshot */}
        <div className="reference-sidebar-brand">
          <div className="reference-brand-subtitle">YASH EARTHING</div>
          <div className="reference-brand-title">Workforce ERP</div>
          {isOpen && (
            <button className="reference-sidebar-close" onClick={onClose} aria-label="Close sidebar">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation List matching reference screenshot */}
        <nav className="reference-sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                className={`reference-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelect(item.id)}
              >
                <Icon size={17} className="reference-nav-icon" />
                <span className="reference-nav-label">{item.title}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Sign Out matching reference screenshot */}
        <div className="reference-sidebar-footer">
          <button className="reference-signout-btn" onClick={handleSignOut}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
