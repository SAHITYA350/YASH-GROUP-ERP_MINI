import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EmployeesPayroll from './pages/EmployeesPayroll';
import TasksApprovals from './pages/TasksApprovals';
import LeaveManagement from './pages/LeaveManagement';
import ManagementMIS from './pages/ManagementMIS';
import MediaLibrary from './pages/MediaLibrary';

function SafePage({ component: Component, title, ...props }) {
  try {
    return <Component {...props} />;
  } catch (error) {
    console.error(`Failed to render ${title}:`, error);
    return (
      <div className="page-container" style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '35vh',
        color: '#0f172a',
      }}>
        <div style={{
          maxWidth: '540px',
          padding: '1.5rem',
          borderRadius: '1rem',
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
        }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem', color: '#9a4d00' }}>
            {title} failed to load
          </div>
          <div style={{ fontSize: '0.875rem', color: '#7c2d12' }}>
            The app shell remained active, but this module could not render. The remaining modules continue to work normally.
          </div>
        </div>
      </div>
    );
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('employees');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);

  return (
    <div className="reference-app-shell">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="reference-main-layout">
        <Header
          activeTab={activeTab}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="reference-main-content">
          {activeTab === 'employees' && (
            <SafePage component={EmployeesPayroll} title="Employees & Payroll" onOpenAssignTask={() => {
              setActiveTab('tasks');
              setIsAssignTaskOpen(true);
            }} />
          )}

          {activeTab === 'leaves' && (
            <SafePage component={LeaveManagement} title="Leave Management" />
          )}

          {activeTab === 'tasks' && (
            <SafePage component={TasksApprovals} title="Tasks & Approvals"
              onOpenPerformance={() => setActiveTab('mis')}
              onAssignNewTask={() => setIsAssignTaskOpen(true)}
              isAssignOpen={isAssignTaskOpen}
              onCloseAssign={() => setIsAssignTaskOpen(false)}
            />
          )}

          {activeTab === 'mis' && (
            <SafePage component={ManagementMIS} title="Management MIS" defaultTab="dashboard" />
          )}

          {activeTab === 'trace' && (
            <SafePage component={ManagementMIS} title="Executive Job Matrix" defaultTab="matrix" />
          )}

          {activeTab === 'media' && (
            <SafePage component={MediaLibrary} title="Media Library" />
          )}
        </main>
      </div>
    </div>
  );
}
