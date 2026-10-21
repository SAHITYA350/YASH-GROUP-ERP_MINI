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
    <div className="reference-app-shell">
      {/* Left Dark Teal Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Layout Area */}
      <div className="reference-main-layout">
        <Header
          activeTab={activeTab}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="reference-main-content">
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
      </div>
    </div>
  );
}
