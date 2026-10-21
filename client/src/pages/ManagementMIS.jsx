import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Stepper from '../components/Stepper';
import { 
  Download, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  FileText, 
  ArrowRight, 
  AlertCircle, 
  TrendingUp, 
  Activity, 
  BarChart3, 
  CheckCircle2, 
  RefreshCw, 
  Zap,
  Check
} from 'lucide-react';

export default function ManagementMIS({ defaultTab = 'dashboard' }) {
  const [activeSubTab, setActiveSubTab] = useState(defaultTab);
  const [misData, setMisData] = useState(null);
  const [matrixData, setMatrixData] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resolvedFeeds, setResolvedFeeds] = useState({});

  const steps = [
    { title: 'Collect Data', sub: 'All 7 modules' },
    { title: 'Measure', sub: 'Targets + actuals' },
    { title: 'Highlight', sub: 'Risk / exception / margin' },
    { title: 'Decide', sub: 'Owner action + audit' },
  ];

  const fetchMIS = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashRes, matrixRes, auditRes] = await Promise.all([
        api.getMISDashboard().catch((e) => {
          console.warn('[MIS] Dashboard endpoint error:', e.message);
          return null;
        }),
        api.getExecutiveMatrix().catch((e) => {
          console.warn('[MIS] Matrix endpoint error:', e.message);
          return { data: [] };
        }),
        api.getAuditLogs().catch((e) => {
          console.warn('[MIS] Audit endpoint error:', e.message);
          return { data: [] };
        }),
      ]);

      if (dashRes) setMisData(dashRes);
      if (matrixRes && matrixRes.data) setMatrixData(matrixRes.data);
      if (auditRes && auditRes.data) setAuditLogs(auditRes.data);
    } catch (err) {
      console.error('Error fetching MIS:', err);
      setError(err.message || 'Failed to connect to database for MIS metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMIS();
  }, []);

  const handleToggleFeed = (id) => {
    setResolvedFeeds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleExportMIS = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Metric,Score,Target']
        .concat(
          (misData?.healthScorecard || []).map((h) => `"${h.metric}",${h.percentage}%,${h.target}`)
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Management_MIS_Health_Scorecard.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMetricIcon = (metricName) => {
    const lower = (metricName || '').toLowerCase();
    if (lower.includes('lead') || lower.includes('sales')) return <TrendingUp size={16} />;
    if (lower.includes('vendor') || lower.includes('order')) return <Activity size={16} />;
    if (lower.includes('engineering') || lower.includes('release')) return <Zap size={16} />;
    if (lower.includes('qc') || lower.includes('quality')) return <CheckCircle2 size={16} />;
    return <BarChart3 size={16} />;
  };

  const salesVal = misData?.kpis?.salesTarget?.value || misData?.kpis?.sales?.value || '₹0.0L';
  const salesSub = misData?.kpis?.salesTarget?.subtitle || misData?.kpis?.sales?.sub || 'Target: Registered orders';
  const marginVal = misData?.kpis?.grossMargin?.value || '0%';
  const marginSub = misData?.kpis?.grossMargin?.subtitle || misData?.kpis?.grossMargin?.sub || 'Target ≥28%';
  const onTimeVal = misData?.kpis?.orderOnTime?.value || '0%';
  const onTimeSub = misData?.kpis?.orderOnTime?.subtitle || misData?.kpis?.orderOnTime?.sub || 'Target 92%';
  const collectionVal = misData?.kpis?.collection?.value || '0%';
  const collectionSub = misData?.kpis?.collection?.subtitle || misData?.kpis?.collection?.sub || 'Target 80%';
  const workforceVal = misData?.kpis?.workforce?.value || '0%';
  const workforceSub = misData?.kpis?.workforce?.subtitle || misData?.kpis?.workforce?.sub || 'Attendance today';

  const onTimePctNum = parseInt(onTimeVal, 10) || 0;
  const collectionPctNum = parseInt(collectionVal, 10) || 0;
  const workforcePctNum = parseFloat(workforceVal) || 0;

  return (
    <div className="page-container">
      {/* Executive Hero Banner */}
      <div className="mis-hero-banner">
        <div className="banner-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <span className="banner-kicker">MODULE 7 · WORKFORCE, ADMIN & MIS</span>
            <span className="live-sync-badge">
              <span className="pulse-dot-green"></span>
              Live ERP Database Connected
            </span>
          </div>
          <h2 className="banner-heading">Management MIS & Audit Command Tower</h2>
          <p className="banner-description">
            High-level owner dashboard synthesizing revenue targets, gross margins, procurement risk, shop floor output, collection health, and cross-module decision alerts.
          </p>
        </div>
        <div className="banner-actions">
          <button className="btn-secondary" onClick={fetchMIS} disabled={loading} style={{ padding: '0.55rem 0.95rem' }}>
            <RefreshCw size={14} className={loading ? 'spinning' : ''} /> Refresh Data
          </button>
          <button className="btn-primary" onClick={handleExportMIS} style={{ padding: '0.55rem 1.15rem' }}>
            <Download size={15} /> Export MIS
          </button>
        </div>
      </div>

      {/* Stepper Pipeline */}
      <Stepper steps={steps} />

      {/* Database Error Banner */}
      {error && (
        <div
          style={{
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: '0.625rem',
            padding: '0.875rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#9f1239',
          }}
        >
          <AlertCircle size={18} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            <strong>Database Notice:</strong> {error}
          </span>
        </div>
      )}

      {/* View Switcher Sub-tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          className={`nav-pill-btn ${activeSubTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('dashboard')}
        >
          <Activity size={14} /> Executive Scorecard & Feed
        </button>
        <button
          className={`nav-pill-btn ${activeSubTab === 'matrix' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('matrix')}
        >
          <Layers size={14} /> Executive Job Matrix
        </button>
        <button
          className={`nav-pill-btn ${activeSubTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('audit')}
        >
          <FileText size={14} /> System Audit Trail
        </button>
      </div>

      {/* =========================================================
          TAB 1: Executive Dashboard (Scorecard & Feed)
      ========================================================= */}
      {activeSubTab === 'dashboard' && (
        <>
          {/* Executive KPI Metric Cards */}
          <div className="mis-kpi-grid">
            <div className="mis-card accent-blue">
              <div>
                <div className="mis-card-label">
                  <span>Sales Volume</span>
                  <TrendingUp size={14} color="#2563eb" />
                </div>
                <div className="mis-card-value">{salesVal}</div>
                <div className="mis-card-sub">{salesSub}</div>
              </div>
              <div className="mis-card-progress">
                <div className="mis-card-progress-bar" style={{ width: salesVal !== '₹0.0L' ? '85%' : '0%' }}></div>
              </div>
            </div>

            <div className="mis-card accent-green">
              <div>
                <div className="mis-card-label">
                  <span>Gross Margin</span>
                  <ShieldCheck size={14} color="#059669" />
                </div>
                <div className="mis-card-value">{marginVal}</div>
                <div className="mis-card-sub">{marginSub}</div>
              </div>
              <div className="mis-card-progress">
                <div className="mis-card-progress-bar" style={{ width: marginVal !== '0%' ? '78%' : '0%' }}></div>
              </div>
            </div>

            <div className="mis-card accent-orange">
              <div>
                <div className="mis-card-label">
                  <span>Order On-Time</span>
                  <Activity size={14} color="#d97706" />
                </div>
                <div className="mis-card-value">{onTimeVal}</div>
                <div className="mis-card-sub">{onTimeSub}</div>
              </div>
              <div className="mis-card-progress">
                <div className="mis-card-progress-bar" style={{ width: `${onTimePctNum}%` }}></div>
              </div>
            </div>

            <div className="mis-card accent-purple">
              <div>
                <div className="mis-card-label">
                  <span>Collection</span>
                  <BarChart3 size={14} color="#7c3aed" />
                </div>
                <div className="mis-card-value">{collectionVal}</div>
                <div className="mis-card-sub">{collectionSub}</div>
              </div>
              <div className="mis-card-progress">
                <div className="mis-card-progress-bar" style={{ width: `${collectionPctNum}%` }}></div>
              </div>
            </div>

            <div className="mis-card accent-indigo">
              <div>
                <div className="mis-card-label">
                  <span>Workforce Active</span>
                  <CheckCircle2 size={14} color="#4f46e5" />
                </div>
                <div className="mis-card-value">{workforceVal}</div>
                <div className="mis-card-sub">{workforceSub}</div>
              </div>
              <div className="mis-card-progress">
                <div className="mis-card-progress-bar" style={{ width: `${workforcePctNum}%` }}></div>
              </div>
            </div>
          </div>

          {/* 2-Column Split: Business Health Scorecard + Owner Decision Feed */}
          <div className="mis-columns-grid">
            {/* Left Panel: Business Health Scorecard */}
            <div className="mis-panel">
              <div className="mis-panel-header">
                <div>
                  <h3 className="mis-panel-title">
                    <ShieldCheck size={18} color="#059669" />
                    Business Health Scorecard
                  </h3>
                  <p className="mis-panel-sub">Target vs achieved across active ERP workflows</p>
                </div>
                <span className="panel-tag">Live Engine</span>
              </div>

              <div>
                {(misData?.healthScorecard || []).length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem', padding: '2.5rem 1rem' }}>
                    {loading ? 'Evaluating health metrics from database...' : 'No health metrics available. Metrics calculate automatically once operational records exist.'}
                  </p>
                ) : (
                  (misData?.healthScorecard || []).map((item, idx) => {
                    const pct = Number(item.percentage) || 0;
                    const tier = pct >= 85 ? 'high' : pct >= 70 ? 'mid' : 'low';
                    return (
                      <div key={idx} className="scorecard-item">
                        <div className="scorecard-icon-pill">
                          {getMetricIcon(item.metric)}
                        </div>
                        <div className="scorecard-metric-label">
                          <div>{item.metric}</div>
                          {item.target && <span className="scorecard-target-pill">Target: {item.target}</span>}
                        </div>
                        <div className="scorecard-bar-bg">
                          <div className={`scorecard-bar-fill ${tier}`} style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="scorecard-pct-badge">{pct}%</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Panel: Owner Decision Feed */}
            <div className="mis-panel">
              <div className="mis-panel-header">
                <div>
                  <h3 className="mis-panel-title">
                    <AlertTriangle size={18} color="#d97706" />
                    Owner Decision Feed
                  </h3>
                  <p className="mis-panel-sub">Cross-module actionable intelligence and risk triggers</p>
                </div>
                <span className="counter-badge">{(misData?.decisionFeed || []).length} Triggers</span>
              </div>

              <div className="decision-feed-list">
                {(misData?.decisionFeed || []).length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem', padding: '2.5rem 1rem' }}>
                    {loading ? 'Analyzing decision triggers...' : 'No active alerts in the decision feed. All tracked ERP milestones are operating normally.'}
                  </p>
                ) : (
                  (misData?.decisionFeed || []).map((feed) => {
                    const isResolved = !!resolvedFeeds[feed.id];
                    const priorityClass = (feed.priority || 'medium').toLowerCase();
                    return (
                      <div
                        key={feed.id}
                        className={`decision-item ${priorityClass}`}
                        style={{ opacity: isResolved ? 0.6 : 1 }}
                      >
                        <button
                          onClick={() => handleToggleFeed(feed.id)}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            border: isResolved ? '1px solid #10b981' : '1px solid #cbd5e1',
                            background: isResolved ? '#10b981' : '#ffffff',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            marginTop: '0.15rem',
                            flexShrink: 0,
                            padding: 0,
                          }}
                          title={isResolved ? 'Mark as unresolved' : 'Mark as acknowledged'}
                        >
                          {isResolved && <Check size={13} strokeWidth={3} />}
                        </button>

                        <div className="decision-info">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span
                              className="decision-title"
                              style={{ textDecoration: isResolved ? 'line-through' : 'none' }}
                            >
                              {feed.title}
                            </span>
                            <span className={`decision-badge ${priorityClass}`}>
                              <span className={`decision-dot ${priorityClass}`}></span>
                              {feed.priority || 'MEDIUM'}
                            </span>
                          </div>
                          <p className="decision-desc">{feed.description || feed.desc}</p>
                          {(feed.actionRequired || feed.action) && (
                            <div className="decision-action-link">
                              <span>Action: {feed.actionRequired || feed.action}</span>
                              <ArrowRight size={13} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* =========================================================
          TAB 2: Executive Job Traceability Matrix
      ========================================================= */}
      {activeSubTab === 'matrix' && (
        <div className="panel-card content-full-width">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Executive Job Traceability Matrix</h3>
              <p className="panel-subtitle">
                End-to-end status of customer jobs across Sales, Procurement, Engineering, Production, Installation and Accounts
              </p>
            </div>
            <span className="panel-tag">Multi-Department Sync</span>
          </div>

          <div className="table-wrapper">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Job ID / Customer</th>
                  <th>Order Value</th>
                  <th>Sales Owner</th>
                  <th>Sales</th>
                  <th>Procurement</th>
                  <th>Engineering</th>
                  <th>Production</th>
                  <th>Inspection</th>
                  <th>Installation</th>
                  <th>Finance</th>
                  <th>Health</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                      Loading job matrix from database...
                    </td>
                  </tr>
                ) : matrixData.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                      No active jobs found in the database. Customer sales orders will populate this matrix automatically.
                    </td>
                  </tr>
                ) : (
                  matrixData.map((row) => (
                    <tr key={row.jobId}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.jobId}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.customer}</div>
                        <div style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 600 }}>{row.salesOrder}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: '#047857' }}>{row.value}</td>
                      <td>{row.salesOwner}</td>
                      <td>
                        <span className={`status-pill ${row.salesStatus === 'CONFIRMED' || row.salesStatus === 'COMPLETED' ? 'completed' : 'in-progress'}`}>
                          {row.salesStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${row.procurementStatus === 'RECEIVED' || row.procurementStatus === 'COMPLETED' ? 'completed' : row.procurementStatus === 'DELAYED' ? 'critical' : 'in-progress'}`}>
                          {row.procurementStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${row.engineeringStatus === 'RELEASED' ? 'completed' : 'in-progress'}`}>
                          {row.engineeringStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${row.productionStatus === 'COMPLETED' ? 'completed' : row.productionStatus === 'HOLD' ? 'critical' : 'in-progress'}`}>
                          {row.productionStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${row.inspectionStatus === 'PASS' ? 'completed' : row.inspectionStatus === 'PENDING' ? 'due-today' : 'low'}`}>
                          {row.inspectionStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${row.installationStatus === 'TESTING' || row.installationStatus === 'COMPLETED' ? 'completed' : 'in-progress'}`}>
                          {row.installationStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${row.financeStatus === 'ADVANCE_PAID' || row.financeStatus === 'PARTIALLY_PAID' ? 'present' : 'waiting-approval'}`}>
                          {row.financeStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${row.overallHealth === 'EXCELLENT' ? 'completed' : row.overallHealth === 'ON_TRACK' ? 'present' : 'critical'}`}>
                          {row.overallHealth ? row.overallHealth.replace('_', ' ') : 'NORMAL'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: System Audit Log Register
      ========================================================= */}
      {activeSubTab === 'audit' && (
        <div className="panel-card content-full-width">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">System Audit Log Register</h3>
              <p className="panel-subtitle">
                Immutable, timestamped audit trail of task approvals, status transitions, salary adjustments, and user actions
              </p>
            </div>
            <span className="panel-tag">Immutable Log</span>
          </div>

          <div className="table-wrapper">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity Type</th>
                  <th>Entity ID</th>
                  <th>Before State</th>
                  <th>After State</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                      Loading audit logs from database...
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                      No audit trail records found in the database. Approvals and status updates will be logged here.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: 'nowrap', color: '#64748b' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 600 }}>{log.userName}</td>
                      <td>
                        <span className="status-pill in-progress">{log.action}</span>
                      </td>
                      <td>{log.entityType}</td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{log.entityId}</td>
                      <td>
                        <code style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '0.25rem' }}>
                          {JSON.stringify(log.before)}
                        </code>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', padding: '0.2rem 0.4rem', borderRadius: '0.25rem' }}>
                          {JSON.stringify(log.after)}
                        </code>
                      </td>
                      <td style={{ color: '#64748b' }}>{log.ipAddress}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
