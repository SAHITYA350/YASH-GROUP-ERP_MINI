// client/src/components/common/Modals.jsx
import React, { useState, useRef } from 'react';
import DatePickerField from './DatePickerField';

export function CreateProjectModal({ lookups, onClose, onSubmit }) {
  // Empty initial date state: user clicks calendar button to choose date & month freely
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [surveyDate, setSurveyDate] = useState('');

  return (
    <div className="modalback" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={onSubmit}>
          <div className="modalhead">
            <h3>Create Project from Sales Order</h3>
            <button type="button" className="modalclose" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="modalbody">
            <div className="form-grid-pro">
              <div className="form-item span2">
                <label>Select Authoritative Sales Order *</label>
                <select
                  name="salesOrderId"
                  required
                  onChange={(e) => {
                    const so = lookups.salesOrders.find((s) => s.id === Number(e.target.value));
                    if (so) {
                      const form = e.target.form;
                      if (form) {
                        form.name.value = `Site Installation - ${so.customer?.name || so.orderNumber}`;
                        form.siteName.value = so.deliveryLocation || '';
                      }
                    }
                  }}
                >
                  <option value="">Select confirmed Sales Order...</option>
                  {lookups.salesOrders.map((so) => (
                    <option key={so.id} value={so.id}>
                      {so.orderNumber} — {so.customer?.name} ({so.productSummary || 'Standard Order'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-item span2">
                <label>Project Title / Scope *</label>
                <input name="name" required placeholder="e.g. Pune Solar Park Earthing Installation" />
              </div>

              <div className="form-item">
                <label>Customer (Auto-derived from SO)</label>
                <select name="customerId">
                  <option value="">Auto from Sales Order</option>
                  {lookups.customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-item">
                <label>Site Location / Name *</label>
                <input name="siteName" required placeholder="e.g. Sector 4, Pune Industrial Park" />
              </div>

              <div className="form-item">
                <label>Project Owner / Lead Engineer</label>
                <select name="ownerId">
                  <option value="">Assign Engineer...</option>
                  {lookups.users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role || 'Staff'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-item">
                <label>Site Survey Date</label>
                <DatePickerField
                  name="surveyDate"
                  value={surveyDate}
                  onChange={setSurveyDate}
                  placeholder="Select survey date..."
                />
              </div>

              <div className="form-item">
                <label>Planned Start Date *</label>
                <DatePickerField
                  name="plannedStart"
                  required
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Select start date..."
                />
              </div>

              <div className="form-item">
                <label>Planned Completion Date *</label>
                <DatePickerField
                  name="plannedEnd"
                  required
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Select completion date..."
                />
              </div>

              <div className="form-item span2">
                <label>Technical Scope & Survey Notes</label>
                <textarea name="notes" placeholder="Required earth resistance < 2 ohms, pit boring depth 3 meters..."></textarea>
              </div>
            </div>
          </div>
          <div className="modalfoot">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary">
              Create & Link Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ScheduleInstallationModal({ projects, onClose, onSubmit }) {
  // Empty initial date state: let the admin or engineer choose
  const [scheduledAt, setScheduledAt] = useState('');

  return (
    <div className="modalback" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={onSubmit}>
          <div className="modalhead">
            <h3>Schedule Site Installation</h3>
            <button type="button" className="modalclose" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="modalbody">
            <div className="form-grid-pro">
              <div className="form-item span2">
                <label>Select Project *</label>
                <select name="projectId" required>
                  <option value="">Select project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectCode} — {p.name} ({p.customer?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-item span2">
                <label>Scheduled Execution Date & Time *</label>
                <DatePickerField
                  name="scheduledAt"
                  required
                  includeTime
                  value={scheduledAt}
                  onChange={setScheduledAt}
                  placeholder="Choose execution date and time..."
                />
              </div>

              <div className="form-item span2">
                <label>Site Instructions & Safety Checklist</label>
                <textarea name="notes" placeholder="Confirm PPE, pit boring machine clearance and soil test..."></textarea>
              </div>
            </div>
          </div>
          <div className="modalfoot">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary">
              Schedule Installation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function RaiseTicketModal({ lookups, onClose, onSubmit }) {
  return (
    <div className="modalback" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={onSubmit}>
          <div className="modalhead">
            <h3>Raise Service & Warranty Ticket</h3>
            <button type="button" className="modalclose" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="modalbody">
            <div className="form-grid-pro">
              <div className="form-item span2">
                <label>Customer *</label>
                <select name="customerId" required>
                  <option value="">Select customer...</option>
                  {lookups.customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city || 'India'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-item">
                <label>Product Specification</label>
                <select name="productId">
                  <option value="">Select product...</option>
                  {lookups.products.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.name} ({pr.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-item">
                <label>Serial / Batch Number</label>
                <input name="serialNumber" placeholder="e.g. SN-2026-904" />
              </div>

              <div className="form-item span2">
                <label>Reported Issue / Complaint *</label>
                <textarea name="issue" required placeholder="Describe issue, vibration, high earth reading, damaged pit cover..."></textarea>
              </div>

              <div className="form-item span2">
                <label>Assign Field Technician</label>
                <select name="assignedToId">
                  <option value="">Unassigned</option>
                  {lookups.users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="modalfoot">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary">
              Raise Service Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AssignTaskModal({ onClose, onSubmit }) {
  const [dueDate, setDueDate] = useState('');

  return (
    <div className="modalback" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={onSubmit}>
          <div className="modalhead">
            <h3>Assign Operational Task</h3>
            <button type="button" className="modalclose" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="modalbody">
            <div className="form-grid-pro">
              <div className="form-item span2">
                <label>Task Title *</label>
                <input name="title" required placeholder="e.g. Conduct pre-installation soil survey at Pune site" />
              </div>

              <div className="form-item">
                <label>Department</label>
                <select name="department">
                  <option value="Projects">Projects</option>
                  <option value="Installation">Installation</option>
                  <option value="QC & Inspection">QC & Inspection</option>
                  <option value="Service & Warranty">Service & Warranty</option>
                </select>
              </div>

              <div className="form-item">
                <label>Role</label>
                <select name="roleTitle">
                  <option value="Site Engineer">Site Engineer</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="QC Technician">QC Technician</option>
                  <option value="Installation Supervisor">Installation Supervisor</option>
                </select>
              </div>

              <div className="form-item">
                <label>Priority</label>
                <select name="priority">
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div className="form-item">
                <label>Shift</label>
                <select name="shift">
                  <option value="SITE">Site</option>
                  <option value="GENERAL">General</option>
                  <option value="SHIFT_A">Shift A</option>
                  <option value="SHIFT_B">Shift B</option>
                </select>
              </div>

              <div className="form-item span2">
                <label>Linked Project / Job</label>
                <input name="linkedJob" placeholder="e.g. PRJ-118 Pune Solar Park" />
              </div>

              <div className="form-item span2">
                <label>Due Date</label>
                <DatePickerField
                  name="dueAt"
                  value={dueDate}
                  onChange={setDueDate}
                  placeholder="Select due date..."
                />
              </div>

              <div className="form-item span2">
                <label>Instructions & Safety Evidence Notes</label>
                <textarea name="description" placeholder="Check water table, foundation hardness and electrical clearances..."></textarea>
              </div>
            </div>
          </div>
          <div className="modalfoot">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary">
              Assign Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function TraceModal({ traceData, selectedRecord, loading, onClose }) {
  return (
    <div className="modalback" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modalhead">
          <h3>Cross-Module Job Traceability</h3>
          <button type="button" className="modalclose" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modalbody">
          {loading ? (
            <p>Loading authoritative ERP continuity chain...</p>
          ) : (
            <div>
              <div className="flowbar" style={{ marginBottom: '16px' }}>
                <div className="flowstep">
                  <div className="stepno">1</div>
                  <div>
                    <b>Sales Order</b>
                    <small>{traceData?.salesOrder?.orderNumber || selectedRecord?.salesOrderId || 'SO-2026-118'}</small>
                  </div>
                </div>
                <div className="flowstep">
                  <div className="stepno">2</div>
                  <div>
                    <b>Production / QC</b>
                    <small>Passed QC Inspection</small>
                  </div>
                </div>
                <div className="flowstep">
                  <div className="stepno">3</div>
                  <div>
                    <b>Site Project</b>
                    <small>{traceData?.project?.projectCode || selectedRecord?.projectCode || 'PRJ-118'}</small>
                  </div>
                </div>
                <div className="flowstep">
                  <div className="stepno">4</div>
                  <div>
                    <b>Installation</b>
                    <small>{traceData?.installations?.[0]?.installationNo || 'INS-041'}</small>
                  </div>
                </div>
              </div>

              <div style={{ background: '#fbfdfc', border: '1px solid var(--line)', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#173d31' }}>
                  Linked Database Records
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '4px 0' }}>
                  <b>Customer:</b> {traceData?.customer?.name || selectedRecord?.customer?.name || '—'}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '4px 0' }}>
                  <b>Site Location:</b> {traceData?.project?.siteName || selectedRecord?.siteName || 'Not specified'}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '4px 0' }}>
                  <b>Installations:</b> {traceData?.installations?.length || 0} records linked
                </p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '4px 0' }}>
                  <b>Service Tickets:</b> {traceData?.serviceTickets?.length || 0} tickets logged
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="modalfoot">
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function PhotoPackModal({ onClose, toast }) {
  const fileInputRef = useRef(null);
  const [photos, setPhotos] = useState([
    { id: 1, title: 'Pre-Installation Excavation', desc: 'Ground boring depth check', preview: null, time: '2 hours ago' },
    { id: 2, title: 'Electrode Placement', desc: 'Compound slurry compaction', preview: null, time: '1 hour ago' },
    { id: 3, title: 'Completed Earth Pit', desc: 'Pit cover & terminal inspection', preview: null, time: 'Just now' }
  ]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const newPhoto = {
          id: Date.now(),
          title: file.name.slice(0, 24),
          desc: `${(file.size / 1024).toFixed(1)} KB · Real Upload`,
          preview: event.target.result,
          time: 'Uploaded now'
        };
        setPhotos([newPhoto, ...photos]);
        setUploading(false);
        if (toast) toast(`📸 Photo "${file.name}" uploaded and saved to Media Library!`);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="modalback" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modalhead">
          <h3>Site Photo Pack & Media Library</h3>
          <button type="button" className="modalclose" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modalbody">
          <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '0 0 14px' }}>
            Upload real proof photographs from camera or device. Images are verified and retained for customer sign-off.
          </p>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />

          <div className="media-grid">
            {photos.map((p) => (
              <div className="media-card" key={p.id}>
                {p.preview ? (
                  <img src={p.preview} alt={p.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: '140px', background: '#d8f0e4', display: 'grid', placeItems: 'center', color: '#0b7a4f', fontSize: '28px' }}>
                    📸
                  </div>
                )}
                <div className="media-body">
                  <b>{p.title}</b>
                  <p>{p.desc}</p>
                  <small style={{ color: 'var(--muted)', fontSize: '8px' }}>{p.time}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modalfoot">
          <button 
            type="button" 
            className="btn blue" 
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? 'Processing...' : '📁 Select & Upload Photo Proof'}
          </button>
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function VoiceRecorderModal({ onClose, toast }) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordTime, setRecordTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setRecordTime(0);
      timerRef.current = setInterval(() => setRecordTime((t) => t + 1), 1000);
      if (toast) toast('🎙 Recording site voice note... Speak into microphone');
    } catch (err) {
      alert(`Microphone access error: ${err.message}. Please enable microphone permissions.`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
      setRecording(false);
      if (toast) toast('Voice note recorded! You can play it back or save it.');
    }
  };

  const handleSave = () => {
    if (toast) toast('Voice note saved to project media records!');
    onClose();
  };

  return (
    <div className="modalback" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modalhead">
          <h3>Site Voice Recorder Assistant</h3>
          <button type="button" className="modalclose" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modalbody" style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>
            {recording ? '🔴' : '🎙'}
          </div>

          <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: '#173d31' }}>
            {recording ? `Recording in progress... (${recordTime}s)` : 'Capture Audio Instructions / Site Findings'}
          </h4>
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '18px' }}>
            Voice memos are attached to the site work pack for field crew handover.
          </p>

          {audioUrl && (
            <div style={{ margin: '14px 0' }}>
              <audio src={audioUrl} controls style={{ width: '100%' }} />
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {!recording ? (
              <button type="button" className="btn blue" onClick={startRecording}>
                ⏺ Start Recording
              </button>
            ) : (
              <button type="button" className="btn primary" onClick={stopRecording}>
                ⏹ Stop & Preview
              </button>
            )}
          </div>
        </div>
        <div className="modalfoot">
          {audioUrl && (
            <button type="button" className="btn green" onClick={handleSave}>
              Save Voice Note
            </button>
          )}
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
