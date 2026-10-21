import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function WorkforceDashboard({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalWorkforce: 0,
    presentToday: 0,
    pendingLeaves: 0,
    activeTasks: 0,
    pendingApprovals: 0,
    completedTasks: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [empRes, taskRes, leaveRes, auditRes] = await Promise.allSettled([
          api.getEmployees(),
          api.getTasks(),
          api.getLeaveRequests(),
          api.getAuditLogs ? api.getAuditLogs() : Promise.resolve({ data: [] }),
        ]);

        const employees = empRes.status === 'fulfilled' && empRes.value?.success
          ? (empRes.value.employees || empRes.value.data || [])
          : [];

        const tasks = taskRes.status === 'fulfilled' && taskRes.value?.success
          ? (taskRes.value.tasks || taskRes.value.data || [])
          : [];

        const leaves = leaveRes.status === 'fulfilled' && leaveRes.value?.success
          ? (leaveRes.value.requests || leaveRes.value.data || [])
          : [];

        const audits = auditRes.status === 'fulfilled' && auditRes.value?.success
          ? (auditRes.value.logs || auditRes.value.data || [])
          : [];

        const presentCount = employees.filter((e) => e.todayAttendance === 'Present').length;
        const pendingLeavesCount = leaves.filter((l) => l.status === 'PENDING').length;
        const activeTasksCount = tasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'REJECTED').length;
        const pendingApprovalsCount = tasks.filter((t) => t.status === 'WAITING_APPROVAL').length;
        const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;

        setMetrics({
          totalWorkforce: employees.length,
          presentToday: presentCount,
          pendingLeaves: pendingLeavesCount,
          activeTasks: activeTasksCount,
          pendingApprovals: pendingApprovalsCount,
          completedTasks: completedTasksCount,
        });

        // Build authentic recent activity feed from verified events
        const events = [];

        leaves.slice(0, 3).forEach((l) => {
          events.push({
            id: `leave-${l.id}`,
            title: `LEAVE REQUEST ${l.status}`,
            meta: `${l.employeeName || 'Staff'} (${l.employeeCode || 'EMP'}) · ${l.leaveType} · ${l.requestedDays} day(s)`,
            time: l.submittedAt || l.appliedAt || new Date().toISOString(),
          });
        });

        tasks.slice(0, 3).forEach((t) => {
          events.push({
            id: `task-${t.id}`,
            title: `TASK ${t.status?.replace('_', ' ')}`,
            meta: `${t.title} · ${t.assignedToName || t.department || 'Workforce'}`,
            time: t.createdAt || new Date().toISOString(),
          });
        });

        audits.slice(0, 2).forEach((a) => {
          events.push({
            id: `audit-${a.id}`,
            title: `AUDIT ${a.action?.toUpperCase() || 'EVENT'}`,
            meta: `${a.userName || 'System'} · ${a.entityType || 'Entity'}`,
            time: a.createdAt || new Date().toISOString(),
          });
        });

        setRecentActivities(events.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const kpis = [
    { label: 'Total workforce', value: metrics.totalWorkforce, tab: 'employees' },
    { label: 'Present today', value: metrics.presentToday, tab: 'employees' },
    { label: 'Pending leave requests', value: metrics.pendingLeaves, tab: 'leaves' },
    { label: 'Active tasks', value: metrics.activeTasks, tab: 'tasks' },
    { label: 'Pending approvals', value: metrics.pendingApprovals, tab: 'tasks' },
    { label: 'Completed tasks', value: metrics.completedTasks, tab: 'tasks' },
  ];

  return (
    <div className="reference-dashboard-container">
      {/* Dashboard Top Header */}
      <div className="reference-dashboard-heading">
        <h1 className="reference-dashboard-title">Workforce dashboard</h1>
        <p className="reference-dashboard-subtitle">Live data from your workforce workspace</p>
      </div>

      {/* 2x3 KPI Grid matching reference screenshot */}
      <div className="reference-kpi-grid">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="reference-kpi-card"
            onClick={() => onNavigate && onNavigate(kpi.tab)}
            title="Click to view details"
          >
            <div className="reference-kpi-label">{kpi.label}</div>
            <div className="reference-kpi-value">{loading ? '—' : kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section matching reference screenshot */}
      <div className="reference-activity-card">
        <div className="reference-activity-header">
          Recent workforce activity
        </div>

        <div className="reference-activity-list">
          {recentActivities.length === 0 ? (
            <div className="reference-activity-empty">
              {loading ? 'Loading recent activities...' : 'No recent workforce activities recorded.'}
            </div>
          ) : (
            recentActivities.map((act) => (
              <div key={act.id} className="reference-activity-item">
                <div className="reference-activity-title">{act.title}</div>
                <div className="reference-activity-meta">
                  <span>{act.meta}</span>
                  <span className="reference-activity-divider">·</span>
                  <span>
                    {new Date(act.time).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}{' '}
                    {new Date(act.time).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
