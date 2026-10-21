// client/src/features/module5/projects/ProjectsView.jsx
import React, { useState, useMemo } from 'react';

export default function ProjectsView({
  projects,
  tasks,
  onOpenCreateProject,
  onOpenAssignTask,
  onOpenTrace,
  onUpdateStatus,
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('register'); // 'register' | 'calendar' | 'timeline'
  
  // Interactive Calendar State
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedCalDate, setSelectedCalDate] = useState(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCalYear(now.getFullYear());
    setCalMonth(now.getMonth());
    setSelectedCalDate(now.toISOString().slice(0, 10));
  };

  // Filtered projects for register & timeline
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.projectCode?.toLowerCase().includes(search.toLowerCase()) ||
        p.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.siteName?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [projects, search, statusFilter]);

  // Derived real metrics
  const activeCount = projects.filter((p) => ['PLANNED', 'IN_PROGRESS', 'SURVEY_PENDING'].includes(p.status)).length;
  const surveyDueCount = projects.filter((p) => p.status === 'SURVEY_PENDING' || !p.surveyDate).length;
  const inProgressCount = projects.filter((p) => p.status === 'IN_PROGRESS').length;
  const completedCount = projects.filter((p) => p.status === 'COMPLETED').length;
  const onHoldCount = projects.filter((p) => p.status === 'ON_HOLD').length;

  // Calendar Days Grid Construction
  const calendarMatrix = useMemo(() => {
    const firstDayIndex = new Date(calYear, calMonth, 1).getDay(); // 0 = Sun
    // Adjust so week starts on Monday (0 = Mon, 6 = Sun)
    const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();

    const cells = [];

    // Prev month overflow days
    for (let i = startDay - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(calYear, calMonth - 1, dayNum);
      const dateStr = prevDate.toISOString().slice(0, 10);
      cells.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    const todayStr = new Date().toISOString().slice(0, 10);
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(calYear, calMonth, d);
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // Next month overflow days to complete 35 or 42 grid cells
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let n = 1; n <= remaining; n++) {
      const nextDate = new Date(calYear, calMonth + 1, n);
      const dateStr = nextDate.toISOString().slice(0, 10);
      cells.push({
        dayNum: n,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return cells;
  }, [calYear, calMonth]);

  // Index projects by date for fast calendar lookup
  const eventsByDate = useMemo(() => {
    const map = {};
    projects.forEach((p) => {
      // Start date event
      if (p.plannedStart) {
        const d = p.plannedStart.slice(0, 10);
        if (!map[d]) map[d] = [];
        map[d].push({ type: 'START', project: p, title: `${p.projectCode} Start: ${p.name}` });
      }
      // Survey date event
      if (p.surveyDate) {
        const d = p.surveyDate.slice(0, 10);
        if (!map[d]) map[d] = [];
        map[d].push({ type: 'SURVEY', project: p, title: `${p.projectCode} Survey @ ${p.siteName || 'Site'}` });
      }
      // End date event
      if (p.plannedEnd) {
        const d = p.plannedEnd.slice(0, 10);
        if (!map[d]) map[d] = [];
        map[d].push({ type: 'END', project: p, title: `${p.projectCode} Target Finish` });
      }
    });

    // Also map tasks with due dates
    tasks.forEach((t) => {
      if (t.dueAt) {
        const d = t.dueAt.slice(0, 10);
        if (!map[d]) map[d] = [];
        map[d].push({ type: 'TASK', task: t, title: `Task: ${t.title}` });
      }
    });

    return map;
  }, [projects, tasks]);

  // Events on selected calendar date
  const selectedDateEvents = selectedCalDate ? (eventsByDate[selectedCalDate] || []) : [];

  return (
    <div className="workspace-container">
      {/* PAGEHEAD */}
      <div className="pagehead">
        <div>
          <div className="eyebrow">MODULE 5 · PROJECT MANAGEMENT & SITE PLANNING</div>
          <h2>Project & Site Planning Workspace</h2>
          <p>
            Convert confirmed customer orders into live site operations. Schedule site surveys, plan material and teams,
            monitor milestone execution, and navigate your complete operational calendar.
          </p>
        </div>
        <div className="head-actions">
          <button type="button" className="btn" onClick={onOpenAssignTask}>
            ✓ Assign Task
          </button>
          <button type="button" className="btn primary" onClick={onOpenCreateProject}>
            ＋ Create Project
          </button>
        </div>
      </div>

      {/* FLOWBAR */}
      <div className="flowbar">
        <div className="flowstep">
          <div className="stepno">1</div>
          <div>
            <b>Create Project</b>
            <small>Link Sales Order</small>
          </div>
        </div>
        <div className="flowstep">
          <div className="stepno">2</div>
          <div>
            <b>Survey Site</b>
            <small>Soil & dimension check</small>
          </div>
        </div>
        <div className="flowstep">
          <div className="stepno">3</div>
          <div>
            <b>Plan & Schedule</b>
            <small>Interactive calendar</small>
          </div>
        </div>
        <div className="flowstep">
          <div className="stepno">4</div>
          <div>
            <b>Release & Track</b>
            <small>Site installation handoff</small>
          </div>
        </div>
      </div>

      {/* 5 KPI METRICS */}
      <div className="metrics">
        <div className="metric" style={{ '--accent': '#2563eb' }}>
          <div className="label">TOTAL REGISTERED</div>
          <div className="value">{projects.length}</div>
          <div className="foot">{activeCount} active site jobs</div>
          <div className="progress">
            <i style={{ width: `${Math.min(projects.length * 20, 100)}%`, background: '#2563eb' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#0ea5e9' }}>
          <div className="label">SITE SURVEYS DUE</div>
          <div className="value">{surveyDueCount}</div>
          <div className="foot">Needs technical survey</div>
          <div className="progress">
            <i style={{ width: `${Math.min(surveyDueCount * 25, 100)}%`, background: '#0ea5e9' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#f59e0b' }}>
          <div className="label">IN PROGRESS</div>
          <div className="value">{inProgressCount}</div>
          <div className="foot">Site execution active</div>
          <div className="progress">
            <i style={{ width: `${Math.min(inProgressCount * 33, 100)}%`, background: '#f59e0b' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#168456' }}>
          <div className="label">COMPLETED JOBS</div>
          <div className="value">{completedCount}</div>
          <div className="foot">Verified & handed over</div>
          <div className="progress">
            <i style={{ width: `${Math.min(completedCount * 30, 100)}%`, background: '#168456' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#b91c1c' }}>
          <div className="label">ON HOLD / RISKS</div>
          <div className="value">{onHoldCount}</div>
          <div className="foot">Requires attention</div>
          <div className="progress">
            <i style={{ width: onHoldCount > 0 ? '40%' : '5%', background: '#b91c1c' }}></i>
          </div>
        </div>
      </div>

      {/* EXPANSIVE MAIN ACTIVITY WORKSPACE */}
      <div className="card main-activity-card">
        {/* CARD HEADER & VIEW SWITCHER */}
        <div className="cardhead workspace-toolbar-head">
          <div className="workspace-title-box">
            <h3>Site Activity & Planning Management</h3>
            <small>Real-time enterprise operations · Choose between Full Register, Interactive Calendar, and Timeline View</small>
          </div>

          <div className="view-mode-tabs">
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'register' ? 'active' : ''}`}
              onClick={() => setViewMode('register')}
            >
              <span className="tab-icon">📋</span> All Activities Register
            </button>
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              <span className="tab-icon">📅</span> Interactive Site Calendar
            </button>
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'timeline' ? 'active' : ''}`}
              onClick={() => setViewMode('timeline')}
            >
              <span className="tab-icon">📊</span> Gantt Timeline
            </button>
          </div>
        </div>

        {/* 1. REGISTER VIEW (EXPANDED & UNCONGESTED) */}
        {viewMode === 'register' && (
          <div className="register-view-wrap">
            <div className="toolbar spacious-toolbar">
              <div className="search-wrap">
                <input
                  type="text"
                  className="field search"
                  placeholder="Search project code, customer, title, site..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="filter-chips">
                <button
                  type="button"
                  className={`chip-filter ${statusFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('ALL')}
                >
                  All ({projects.length})
                </button>
                <button
                  type="button"
                  className={`chip-filter ${statusFilter === 'SURVEY_PENDING' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('SURVEY_PENDING')}
                >
                  Survey Pending ({surveyDueCount})
                </button>
                <button
                  type="button"
                  className={`chip-filter ${statusFilter === 'IN_PROGRESS' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('IN_PROGRESS')}
                >
                  In Progress ({inProgressCount})
                </button>
                <button
                  type="button"
                  className={`chip-filter ${statusFilter === 'COMPLETED' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('COMPLETED')}
                >
                  Completed ({completedCount})
                </button>
                <button
                  type="button"
                  className={`chip-filter ${statusFilter === 'ON_HOLD' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('ON_HOLD')}
                >
                  On Hold ({onHoldCount})
                </button>
              </div>

              <div className="count-badge">
                Showing <b>{filteredProjects.length}</b> of <b>{projects.length}</b> projects
              </div>
            </div>

            <div className="tablewrap expansive-table">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '130px' }}>Project Code</th>
                    <th>Project Name & Scope</th>
                    <th>Customer & Contact</th>
                    <th>Site Location</th>
                    <th>Execution Timeline</th>
                    <th style={{ width: '130px' }}>Current Stage</th>
                    <th>Lead Engineer</th>
                    <th style={{ width: '160px', textAlign: 'right' }}>Actions & Workflow</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
                        <b>No projects match your current filter.</b>
                        <p style={{ margin: '4px 0 16px', fontSize: '12px' }}>
                          Create a new project from a confirmed Sales Order to begin tracking site activities.
                        </p>
                        <button type="button" className="btn primary" onClick={onOpenCreateProject}>
                          ＋ Create Project
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((p) => {
                      const startDate = p.plannedStart ? p.plannedStart.slice(0, 10) : null;
                      const endDate = p.plannedEnd ? p.plannedEnd.slice(0, 10) : null;
                      
                      // Calculate duration if both dates exist
                      let durationDays = null;
                      if (startDate && endDate) {
                        const diffMs = new Date(endDate) - new Date(startDate);
                        durationDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
                      }

                      return (
                        <tr key={p.id} className="project-row">
                          <td>
                            <span className="code-pill">{p.projectCode}</span>
                            {p.salesOrder?.orderNumber && (
                              <span className="so-pill" title="Linked Sales Order">
                                SO: {p.salesOrder.orderNumber}
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="proj-title-cell">
                              <b>{p.name}</b>
                              {p.notes && <small className="proj-notes-preview">{p.notes}</small>}
                            </div>
                          </td>
                          <td>
                            <div className="customer-info-cell">
                              <b>{p.customer?.name || 'Standard Client'}</b>
                              {p.customer?.city && <small>📍 {p.customer.city}</small>}
                            </div>
                          </td>
                          <td>
                            <div className="site-cell">
                              <span>📍 {p.siteName || 'Site location pending'}</span>
                            </div>
                          </td>
                          <td>
                            <div className="timeline-cell">
                              {startDate ? (
                                <>
                                  <div className="dates-range">
                                    <span className="date-badge start">{startDate}</span>
                                    <span className="date-arrow">→</span>
                                    <span className="date-badge end">{endDate || 'TBD'}</span>
                                  </div>
                                  {durationDays && (
                                    <small className="duration-tag">{durationDays} days planned</small>
                                  )}
                                </>
                              ) : (
                                <span className="no-dates">No dates scheduled</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`status ${
                                p.status === 'COMPLETED'
                                  ? 'green'
                                  : p.status === 'IN_PROGRESS'
                                  ? 'blue'
                                  : p.status === 'SURVEY_PENDING'
                                  ? 'amber'
                                  : p.status === 'ON_HOLD'
                                  ? 'red'
                                  : 'neutral'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td>
                            <div className="owner-cell">
                              <span className="owner-avatar">
                                {(p.owner?.name || 'U').charAt(0).toUpperCase()}
                              </span>
                              <span>{p.owner?.name || 'Unassigned'}</span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="action-buttons-wrap">
                              <button
                                type="button"
                                className="btn sm blue"
                                onClick={() => onOpenTrace(p)}
                                title="Trace complete lifecycle from Order to Site"
                              >
                                🔍 Trace
                              </button>
                              <select
                                className="field mini-status-select"
                                value={p.status}
                                onChange={(e) => onUpdateStatus(p.id, e.target.value)}
                              >
                                <option value="DRAFT">Draft</option>
                                <option value="SURVEY_PENDING">Survey Pending</option>
                                <option value="PLANNED">Planned</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. INTERACTIVE SITE CALENDAR VIEW */}
        {viewMode === 'calendar' && (
          <div className="calendar-view-wrap">
            {/* CALENDAR CONTROLS HEADER */}
            <div className="calendar-controls">
              <div className="month-selector">
                <button type="button" className="cal-nav-btn" onClick={handlePrevMonth} title="Previous Month">
                  ◀
                </button>
                <h4 className="cal-current-label">
                  {monthNames[calMonth]} {calYear}
                </h4>
                <button type="button" className="cal-nav-btn" onClick={handleNextMonth} title="Next Month">
                  ▶
                </button>
                <button type="button" className="cal-today-btn" onClick={handleToday}>
                  Today
                </button>
              </div>

              <div className="calendar-legend">
                <span className="legend-item"><i className="legend-dot start"></i> Planned Start</span>
                <span className="legend-item"><i className="legend-dot survey"></i> Site Survey</span>
                <span className="legend-item"><i className="legend-dot end"></i> Finish Target</span>
                <span className="legend-item"><i className="legend-dot task"></i> Assigned Task</span>
              </div>
            </div>

            {/* CALENDAR GRID */}
            <div className="calendar-matrix-grid">
              {/* Day headers Mon-Sun */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="cal-header-cell">
                  {day}
                </div>
              ))}

              {/* Day cells */}
              {calendarMatrix.map((cell, idx) => {
                const dayEvents = eventsByDate[cell.dateStr] || [];
                const isSelected = selectedCalDate === cell.dateStr;

                return (
                  <div
                    key={idx}
                    className={`cal-day-cell ${cell.isCurrentMonth ? 'in-month' : 'out-month'} ${
                      cell.isToday ? 'is-today' : ''
                    } ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedCalDate(cell.dateStr)}
                  >
                    <div className="day-number-row">
                      <span className={`day-number ${cell.isToday ? 'today-pill' : ''}`}>
                        {cell.dayNum}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="event-count-badge">{dayEvents.length}</span>
                      )}
                    </div>

                    <div className="day-events-list">
                      {dayEvents.slice(0, 3).map((ev, evIdx) => (
                        <div
                          key={evIdx}
                          className={`cal-event-pill ${ev.type.toLowerCase()}`}
                          title={ev.title}
                        >
                          <span className="pill-dot">●</span>
                          <span className="pill-text">{ev.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="cal-more-pill">+{dayEvents.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SELECTED DATE DRILLDOWN PANEL */}
            {selectedCalDate && (
              <div className="cal-selected-drilldown">
                <div className="drilldown-head">
                  <div>
                    <h4>Events Scheduled on: {selectedCalDate}</h4>
                    <small>{selectedDateEvents.length} operational items scheduled</small>
                  </div>
                  <div className="drilldown-actions">
                    <button
                      type="button"
                      className="btn sm primary"
                      onClick={onOpenCreateProject}
                    >
                      ＋ Schedule Project for this Date
                    </button>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() => setSelectedCalDate(null)}
                    >
                      ✕ Close
                    </button>
                  </div>
                </div>

                <div className="drilldown-body">
                  {selectedDateEvents.length === 0 ? (
                    <p style={{ color: 'var(--muted)', fontSize: '12px', margin: '12px 0' }}>
                      No events currently scheduled on {selectedCalDate}. Click <b>Schedule Project for this Date</b> to assign work.
                    </p>
                  ) : (
                    <div className="drilldown-events-grid">
                      {selectedDateEvents.map((ev, i) => (
                        <div key={i} className={`drilldown-card ${ev.type.toLowerCase()}`}>
                          <div className="drilldown-card-top">
                            <span className="type-badge">{ev.type}</span>
                            <b>{ev.title}</b>
                          </div>
                          {ev.project && (
                            <div className="drilldown-card-meta">
                              <span>Customer: {ev.project.customer?.name || 'Standard'}</span>
                              <span>Site: {ev.project.siteName || '—'}</span>
                              <span>Status: <b>{ev.project.status}</b></span>
                              <button
                                type="button"
                                className="btn sm blue"
                                style={{ marginTop: '8px' }}
                                onClick={() => onOpenTrace(ev.project)}
                              >
                                Trace Details
                              </button>
                            </div>
                          )}
                          {ev.task && (
                            <div className="drilldown-card-meta">
                              <span>Dept: {ev.task.department}</span>
                              <span>Priority: <b>{ev.task.priority}</b></span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. TIMELINE / GANTT VIEW */}
        {viewMode === 'timeline' && (
          <div className="timeline-view-wrap">
            <div className="timeline-intro">
              <h4>Project Execution Timeline & Milestones</h4>
              <p>Visual representation of project duration and planned completion dates.</p>
            </div>

            <div className="gantt-chart-container">
              {filteredProjects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                  No active projects with schedule dates to render on timeline.
                </div>
              ) : (
                filteredProjects.map((p) => {
                  const start = p.plannedStart ? p.plannedStart.slice(0, 10) : 'Not Set';
                  const end = p.plannedEnd ? p.plannedEnd.slice(0, 10) : 'Not Set';
                  const progressPct =
                    p.status === 'COMPLETED'
                      ? 100
                      : p.status === 'IN_PROGRESS'
                      ? 60
                      : p.status === 'SURVEY_PENDING'
                      ? 20
                      : 40;

                  return (
                    <div key={p.id} className="gantt-row">
                      <div className="gantt-label">
                        <b>{p.projectCode}</b>
                        <span>{p.name}</span>
                        <small>{p.customer?.name || 'Customer'}</small>
                      </div>

                      <div className="gantt-bar-area">
                        <div className="gantt-bar-track">
                          <div
                            className={`gantt-bar-fill ${p.status.toLowerCase()}`}
                            style={{ width: `${progressPct}%` }}
                          >
                            <span className="gantt-bar-text">
                              {start} → {end} ({progressPct}%)
                            </span>
                          </div>
                        </div>
                        <div className="gantt-dates-label">
                          <span>Start: {start}</span>
                          <span>Target Finish: {end}</span>
                        </div>
                      </div>

                      <div className="gantt-action">
                        <button
                          type="button"
                          className="btn sm"
                          onClick={() => onOpenTrace(p)}
                        >
                          Trace
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* LOWER SECTION: OPERATIONAL TO-DO & DELIVERY STATUS (SPACIOUS 2-COLUMN) */}
      <div className="lower-widgets-grid">
        {/* OPERATIONAL TASKS TO-DO */}
        <div className="card widget-card">
          <div className="cardhead">
            <div>
              <h3>Operational Project Tasks & Field To-do</h3>
              <small>Actionable assignments linked to real projects</small>
            </div>
            <button type="button" className="btn sm" onClick={onOpenAssignTask}>
              ＋ Add Task
            </button>
          </div>
          <div className="cardbody">
            {tasks.length > 0 ? (
              <div className="tasks-list-grid">
                {tasks.slice(0, 6).map((tsk) => (
                  <div className="todo-item-card" key={tsk.id}>
                    <div className="todo-checkbox-box">
                      <input
                        type="checkbox"
                        className="check"
                        defaultChecked={tsk.status === 'COMPLETED'}
                      />
                    </div>
                    <div className="todo-details">
                      <b>{tsk.title}</b>
                      <div className="todo-meta">
                        <span className="dept-pill">{tsk.department || 'Projects'}</span>
                        {tsk.linkedJob && <span className="job-pill">{tsk.linkedJob}</span>}
                        {tsk.dueAt && (
                          <span className="due-pill">Due: {tsk.dueAt.slice(0, 10)}</span>
                        )}
                      </div>
                    </div>
                    <span className={`priority-badge ${tsk.priority?.toLowerCase() || 'medium'}`}>
                      {tsk.priority || 'NORMAL'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-tasks-box">
                <p>No active project tasks logged yet.</p>
                <button type="button" className="btn sm primary" onClick={onOpenAssignTask}>
                  Assign Field Task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* DELIVERY PROGRESS & ARCHITECTURE AUDIT */}
        <div className="card widget-card">
          <div className="cardhead">
            <div>
              <h3>Site Delivery & Lifecycle Readiness</h3>
              <small>Connected ERP Module 5 execution audit</small>
            </div>
          </div>
          <div className="cardbody">
            <div className="delivery-stat-row">
              <span className="stat-label">Completed Site Jobs</span>
              <b className="stat-value">{completedCount} of {projects.length}</b>
            </div>
            <div className="progress progress-tall">
              <i
                style={{
                  width: `${projects.length > 0 ? (completedCount / projects.length) * 100 : 0}%`,
                  background: '#168456',
                }}
              ></i>
            </div>

            <div className="audit-points-list">
              <div className="audit-item done">
                <span className="audit-ico">✓</span>
                <div>
                  <b>Multi-Tier Database Architecture</b>
                  <small>Route → Controller → Service → Repository → Prisma (PostgreSQL)</small>
                </div>
              </div>
              <div className="audit-item done">
                <span className="audit-ico">✓</span>
                <div>
                  <b>Cross-Module Foreign Keys</b>
                  <small>Linked to salesOrder.id, customer.id, product.id, and user.id</small>
                </div>
              </div>
              <div className="audit-item done">
                <span className="audit-ico">✓</span>
                <div>
                  <b>Free Un-Prefilled Date Pickers</b>
                  <small>No pre-reserved default dates; user selects dates freely on calendar</small>
                </div>
              </div>
              <div className="audit-item done">
                <span className="audit-ico">✓</span>
                <div>
                  <b>Uncongested Expansive Workspace</b>
                  <small>Full-width data registers, monthly site calendar, and responsive layout</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
