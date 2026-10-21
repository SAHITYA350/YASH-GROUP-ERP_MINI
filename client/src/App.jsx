import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EmployeesPayroll from './pages/EmployeesPayroll';
import TasksApprovals from './pages/TasksApprovals';
import LeaveManagement from './pages/LeaveManagement';
import ManagementMIS from './pages/ManagementMIS';
import MediaLibrary from './pages/MediaLibrary';

export default function App() {
  const [activeTab, setActiveTab] = useState('employees');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);

  return (
    <div className="app-shell">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="app-main-layout">
        <Header
          activeTab={activeTab}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onQuickAdd={() => {
            setActiveTab('tasks');
            setIsAssignTaskOpen(true);
          }}
        />

        <main style={{ flex: 1, minWidth: 0 }}>
          {activeTab === 'employees' && (
            <EmployeesPayroll
              onOpenAssignTask={() => {
                setActiveTab('tasks');
                setIsAssignTaskOpen(true);
              }}
            />
          )}

          {activeTab === 'leaves' && (
            <LeaveManagement />
          )}

          {activeTab === 'tasks' && (
            <TasksApprovals
              onOpenPerformance={() => setActiveTab('mis')}
              onAssignNewTask={() => setIsAssignTaskOpen(true)}
              isAssignOpen={isAssignTaskOpen}
              onCloseAssign={() => setIsAssignTaskOpen(false)}
            />
          )}

          {activeTab === 'mis' && (
            <ManagementMIS defaultTab="dashboard" />
          )}

          {activeTab === 'trace' && (
            <ManagementMIS defaultTab="matrix" />
          )}

          {activeTab === 'media' && (
            <MediaLibrary />
          )}
        </main>

        <footer
          style={{
            borderTop: '1px solid #e2e8f0',
            background: '#ffffff',
            padding: '1rem 1.75rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#64748b',
          }}
        >
          YASH Group ERP Mini · Module 7: Workforce, Admin, Attendance, Payroll, Tasks & MIS · Production Ready
        </footer>
      </div>
    </div>
  );
}
