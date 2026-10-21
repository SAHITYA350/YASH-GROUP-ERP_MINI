import React from 'react';
import { 
  Users, 
  CheckSquare, 
  TrendingUp, 
  BarChart3, 
  GitBranch, 
  Folder, 
  CalendarCheck,
  Building2, 
  X,
  ChevronRight,
  Shield
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }) {
  const module7Items = [
    {
      id: 'employees',
      title: 'Employees & Payroll',
      subtitle: 'Attendance · Salary · Skills',
      icon: Users,
    },
    {
      id: 'leaves',
      title: 'Leave Management',
      subtitle: 'Requests · Approvals · Balances',
      icon: CalendarCheck,
    },
    {
      id: 'tasks',
      title: 'Tasks, Roles & Approvals',
      subtitle: 'Responsibility · Approvals',
      icon: CheckSquare,
    },
    {
      id: 'mis',
      title: 'Management MIS',
      subtitle: 'Owner KPIs · Alerts · Audit',
      icon: BarChart3,
    },
    {
      id: 'trace',
      title: 'Trace Job',
      subtitle: 'Job progress · Department status',
      icon: GitBranch,
    },
    {
      id: 'media',
      title: 'Media Library',
      subtitle: 'Documents · Images · Attachments',
      icon: Folder,
    },
  ];

  const handleSelect = (tabId) => {
    setActiveTab(tabId);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`erp-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-box">
            <Building2 size={20} color="#ffffff" />
          </div>
          <div className="brand-text">
            <span className="brand-name">YASH GROUP</span>
            <span className="brand-sub">Enterprise ERP</span>
          </div>
          {isOpen && (
            <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Content */}
        <div className="sidebar-scroll">
          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <span className="section-tag">MODULE 7</span>
              <span className="section-title">WORKFORCE, ADMIN & MIS</span>
            </div>

            <nav className="sidebar-nav-list">
              {module7Items.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelect(item.id)}
                  >
                    <div className="nav-item-icon">
                      <IconComponent size={19} />
                    </div>
                    <div className="nav-item-content">
                      <span className="nav-item-title">{item.title}</span>
                      <span className="nav-item-sub">{item.subtitle}</span>
                    </div>
                    {isActive && <ChevronRight size={15} className="nav-item-arrow" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Clean Enterprise Bottom Profile Card */}
        <div className="sidebar-user-footer">
          <div className="sidebar-user-card">
            <div className="user-avatar-badge">AD</div>
            <div className="user-text-meta">
              <span className="user-main-title">Management Demo</span>
              <span className="user-role-desc">HR & Enterprise Admin</span>
            </div>
            <Shield size={16} color="#2563eb" />
          </div>
        </div>
      </aside>
    </>
  );
}
