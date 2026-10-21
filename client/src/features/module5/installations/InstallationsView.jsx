// client/src/features/module5/installations/InstallationsView.jsx
import React, { useState, useMemo } from 'react';

export default function InstallationsView({
  installations,
  projects,
  onOpenScheduleModal,
  onOpenTrace,
  onOpenMedia,
  onOpenVoiceModal,
  onUpdateStatus,
  onRecordTestResult,
  toast,
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredInstallations = useMemo(() => {
    return installations.filter((i) => {
      const matchSearch =
        i.installationNo?.toLowerCase().includes(search.toLowerCase()) ||
        i.project?.name?.toLowerCase().includes(search.toLowerCase()) ||
        i.project?.projectCode?.toLowerCase().includes(search.toLowerCase()) ||
        i.project?.customer?.name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || i.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [installations, search, statusFilter]);

  const activeInstallation = installations[0] || null;
  const activeProject = activeInstallation?.project || projects[0] || null;

  const playVoiceInstruction = () => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(
        'Yash ERP Site Instruction. Confirm drawing DWG-042. Verify earthing electrode pit excavation depth. Complete assembly and record earth resistance test reading below 2.0 ohms.'
      );
      msg.rate = 0.95;
      window.speechSynthesis.speak(msg);
      toast('🔊 Playing site audio guide...');
    } else {
      toast('Voice synthesis not supported in this browser.');
    }
  };

  const completedCount = installations.filter((i) => i.status === 'COMPLETED').length;
  const inProgressCount = installations.filter((i) => i.status === 'IN_PROGRESS').length;
  const scheduledCount = installations.filter((i) => ['SCHEDULED', 'PLANNED'].includes(i.status)).length;
  const testingCount = installations.filter((i) => ['TESTING', 'HANDOVER_PENDING'].includes(i.status)).length;
  const blockedCount = installations.filter((i) => i.status === 'BLOCKED').length;

  return (
    <div className="workspace-container">
      {/* PAGEHEAD */}
      <div className="pagehead">
        <div>
          <div className="eyebrow">MODULE 5 · INSTALLATION & COMMISSIONING</div>
          <h2>Installation & Commissioning Console</h2>
          <p>
            Field-execution console with approved technical drawings, site photos, video training, audio assistant,
            resistance test logging, and customer sign-off.
          </p>
        </div>
        <div className="head-actions">
          <button type="button" className="btn" onClick={() => onOpenTrace(activeProject)}>
            🔍 Trace Job
          </button>
          <button type="button" className="btn blue" onClick={() => onOpenMedia(activeInstallation)}>
            📷 Site Photo Pack
          </button>
          <button type="button" className="btn primary" onClick={onOpenScheduleModal}>
            ＋ Schedule Installation
          </button>
        </div>
      </div>

      {/* FLOWBAR */}
      <div className="flowbar">
        <div className="flowstep">
          <div className="stepno">1</div>
          <div>
            <b>Start Site</b>
            <small>Check team + material</small>
          </div>
        </div>
        <div className="flowstep">
          <div className="stepno">2</div>
          <div>
            <b>Install</b>
            <small>Use drawing + visual guide</small>
          </div>
        </div>
        <div className="flowstep">
          <div className="stepno">3</div>
          <div>
            <b>Test</b>
            <small>Record values + evidence</small>
          </div>
        </div>
        <div className="flowstep">
          <div className="stepno">4</div>
          <div>
            <b>Handover</b>
            <small>Customer sign-off</small>
          </div>
        </div>
      </div>

      {/* METRICS */}
      <div className="metrics">
        <div className="metric" style={{ '--accent': '#2563eb' }}>
          <div className="label">ACTIVE JOBS</div>
          <div className="value">{installations.length}</div>
          <div className="foot">Site installations</div>
          <div className="progress">
            <i style={{ width: `${Math.min(installations.length * 25, 100)}%`, background: '#2563eb' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#168456' }}>
          <div className="label">COMPLETED</div>
          <div className="value">{completedCount}</div>
          <div className="foot">Handover signed</div>
          <div className="progress">
            <i style={{ width: `${Math.min(completedCount * 33, 100)}%`, background: '#168456' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#0ea5e9' }}>
          <div className="label">TESTING / PENDING</div>
          <div className="value">{testingCount}</div>
          <div className="foot">Awaiting acceptance</div>
          <div className="progress">
            <i style={{ width: `${Math.min(testingCount * 40, 100)}%`, background: '#0ea5e9' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#7c3aed' }}>
          <div className="label">SCHEDULED</div>
          <div className="value">{scheduledCount}</div>
          <div className="foot">Upcoming visits</div>
          <div className="progress">
            <i style={{ width: `${Math.min(scheduledCount * 30, 100)}%`, background: '#7c3aed' }}></i>
          </div>
        </div>
        <div className="metric" style={{ '--accent': '#b91c1c' }}>
          <div className="label">BLOCKED</div>
          <div className="value">{blockedCount}</div>
          <div className="foot">Escalation required</div>
          <div className="progress">
            <i style={{ width: blockedCount > 0 ? '40%' : '5%', background: '#b91c1c' }}></i>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH FIELD WORK PACK & TECHNICAL CONSOLE */}
      <div className="card main-activity-card">
        <div className="cardhead workspace-toolbar-head">
          <div className="workspace-title-box">
            <h3>Field Work Pack & Technical Drawing Console</h3>
            <small>
              {activeProject ? `${activeProject.projectCode} · ${activeProject.customer?.name || 'Customer'} · ${activeProject.siteName || 'Site Location'}` : 'Site Technical Resources'}
            </small>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {activeInstallation && (
              <span className={`status ${activeInstallation.status === 'COMPLETED' ? 'green' : 'blue'}`}>
                Active: {activeInstallation.installationNo} ({activeInstallation.status})
              </span>
            )}
          </div>
        </div>

        <div className="cardbody">
          {/* MEDIA GRID (3-COLUMN FULL WIDTH) */}
          <div className="media-grid">
            <div className="media-card">
              <div style={{ height: '170px', background: '#f0f9f4', display: 'grid', placeItems: 'center', color: '#0b7a4f', fontSize: '36px' }}>
                ⚡
              </div>
              <div className="media-body">
                <b>Product Reference Specification</b>
                <p>Pure Copper Bonded Earthing Electrode · Heavy Duty</p>
              </div>
            </div>

            <div className="media-card">
              <div className="drawing">
                <svg viewBox="0 0 600 300">
                  <rect width="600" height="300" fill="#fbfdff" />
                  <g stroke="#0b7a4f" fill="none" strokeWidth="2">
                    <rect x="205" y="45" width="190" height="210" rx="8" />
                    <line x1="300" y1="45" x2="300" y2="255" />
                    <circle cx="300" cy="150" r="58" />
                    <line x1="78" y1="70" x2="205" y2="70" />
                    <line x1="395" y1="70" x2="525" y2="70" />
                    <line x1="78" y1="230" x2="205" y2="230" />
                    <line x1="395" y1="230" x2="525" y2="230" />
                  </g>
                  <g fill="#0b7a4f" fontFamily="Arial" fontSize="12">
                    <text x="28" y="73">Copper Bonded Layer</text>
                    <text x="425" y="73">Terminal Clamp</text>
                    <text x="28" y="233">Electrolyte Chamber</text>
                    <text x="425" y="233">Earthing Conductor</text>
                    <text x="216" y="25">APPROVED SPECIFICATION DWG-042</text>
                  </g>
                </svg>
              </div>
              <div className="media-body">
                <b>Assembly Drawing DWG-042</b>
                <p>Controlled revision · Site borehole depth 3m</p>
              </div>
            </div>

            <div className="media-card">
              <div className="playbadge" onClick={() => toast('Playing installation video guide...')}>
                ▶
              </div>
              <div style={{ height: '170px', background: '#04372b', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '24px' }}>
                🎬 Video Guide
              </div>
              <div className="media-body">
                <b>Field Training Video</b>
                <p>Pit boring & backfill compound slurry mixing</p>
              </div>
            </div>
          </div>

          {/* CHECKLIST, AUDIO ASSISTANT & EXECUTION BAR (FULL WIDTH) */}
          <div className="gridEqual" style={{ marginTop: '20px' }}>
            <div className="voicebox">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <b>Site Execution Checklist</b>
                <small style={{ color: 'var(--muted)' }}>Mandatory for handover</small>
              </div>
              <div className="todo">
                <input type="checkbox" className="check" defaultChecked />
                <div>
                  <b>Verify drawing DWG-042 dimensions</b>
                  <small>Check borehole clearances and conductor cross-section</small>
                </div>
              </div>
              <div className="todo">
                <input type="checkbox" className="check" defaultChecked />
                <div>
                  <b>Inspect material received on site</b>
                  <small>Copper bonded electrode rod & carbon compound bags</small>
                </div>
              </div>
              <div className="todo">
                <input type="checkbox" className="check" />
                <div>
                  <b>Record digital resistance test</b>
                  <small>Target: Earth resistance &lt; 2.0 Ohms</small>
                </div>
              </div>
            </div>

            <div className="voicebox">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <b>Field Audio Assistant & Execution</b>
                <small style={{ color: 'var(--muted)' }}>Voice & microphone memos</small>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: '1.6', margin: '0 0 12px' }}>
                Listen to voice instructions for soil compound mixing, or record site audio inspection memos.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button
                  type="button"
                  className="btn sm blue"
                  style={{ flex: 1 }}
                  onClick={playVoiceInstruction}
                >
                  🔊 Play Voice Instructions
                </button>
                <button
                  type="button"
                  className="btn sm"
                  style={{ flex: 1 }}
                  onClick={onOpenVoiceModal}
                >
                  🎙 Record Site Audio
                </button>
              </div>

              {activeInstallation && (
                <div style={{ borderTop: '1px solid #dcece3', paddingTop: '12px', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => onOpenMedia(activeInstallation)}
                  >
                    📷 Upload Photos
                  </button>
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => onRecordTestResult(activeInstallation.id)}
                  >
                    ⚡ Test Reading
                  </button>
                  <button
                    type="button"
                    className="btn sm green"
                    onClick={() => onUpdateStatus(activeInstallation.id, 'COMPLETED')}
                  >
                    ✓ Handover
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH INSTALLATIONS REGISTER */}
      <div className="card main-activity-card">
        <div className="cardhead workspace-toolbar-head">
          <div className="workspace-title-box">
            <h3>Installation & Commissioning Register</h3>
            <small>All scheduled, in-progress, and completed site activities</small>
          </div>
          <span className="status green">Controlled Field Register</span>
        </div>

        <div className="toolbar spacious-toolbar">
          <div className="search-wrap">
            <input
              type="text"
              className="field search"
              placeholder="Search installation number, project, site, customer..."
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
              All ({installations.length})
            </button>
            <button
              type="button"
              className={`chip-filter ${statusFilter === 'SCHEDULED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('SCHEDULED')}
            >
              Scheduled ({scheduledCount})
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
          </div>
        </div>

        <div className="tablewrap expansive-table">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '150px' }}>Installation No</th>
                <th>Project & Customer</th>
                <th>Site Location</th>
                <th>Scheduled Date & Time</th>
                <th>Execution Stage</th>
                <th>Field Actions</th>
                <th style={{ width: '140px', textAlign: 'right' }}>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstallations.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚙️</div>
                    <b>No installation jobs found matching your filter.</b>
                    <p style={{ margin: '4px 0 16px', fontSize: '12px' }}>
                      Click <b>＋ Schedule Installation</b> to link an existing project.
                    </p>
                    <button type="button" className="btn primary" onClick={onOpenScheduleModal}>
                      ＋ Schedule Installation
                    </button>
                  </td>
                </tr>
              ) : (
                filteredInstallations.map((i) => (
                  <tr key={i.id} className="project-row">
                    <td>
                      <span className="code-pill">{i.installationNo}</span>
                      {i.project?.projectCode && (
                        <span className="so-pill">PRJ: {i.project.projectCode}</span>
                      )}
                    </td>
                    <td>
                      <div className="proj-title-cell">
                        <b>{i.project?.name || 'Standard Site Work'}</b>
                        <small>{i.project?.customer?.name || 'Customer'}</small>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#173d31' }}>
                        📍 {i.project?.siteName || 'Site Location'}
                      </span>
                    </td>
                    <td>
                      <div className="timeline-cell">
                        {i.scheduledAt ? (
                          <span className="date-badge start">
                            📅 {i.scheduledAt.replace('T', ' ').slice(0, 16)}
                          </span>
                        ) : (
                          <span className="no-dates">Unscheduled</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status ${
                          i.status === 'COMPLETED'
                            ? 'green'
                            : i.status === 'IN_PROGRESS'
                            ? 'blue'
                            : i.status === 'TESTING' || i.status === 'HANDOVER_PENDING'
                            ? 'amber'
                            : i.status === 'BLOCKED'
                            ? 'red'
                            : 'neutral'
                        }`}
                      >
                        {i.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-wrap">
                        <button
                          type="button"
                          className="btn sm"
                          onClick={() => onOpenMedia(i)}
                          title="Upload and inspect site photos"
                        >
                          📷 Photos
                        </button>
                        <button
                          type="button"
                          className="btn sm"
                          onClick={() => onRecordTestResult(i.id)}
                          title="Record earth resistance measurement"
                        >
                          ⚡ Test
                        </button>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <select
                        className="field mini-status-select"
                        value={i.status}
                        onChange={(e) => onUpdateStatus(i.id, e.target.value)}
                      >
                        <option value="NOT_REQUIRED">Not Required</option>
                        <option value="SURVEY_DUE">Survey Due</option>
                        <option value="PLANNED">Planned</option>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="TESTING">Testing</option>
                        <option value="HANDOVER_PENDING">Handover Pending</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="BLOCKED">Blocked</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
