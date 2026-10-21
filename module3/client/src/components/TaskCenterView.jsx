import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Clock, Plus, CheckCircle2, AlertCircle, User, Filter, X } from "lucide-react";

export default function TaskCenterView() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "HIGH",
    stakeholderName: "Engineering Team",
    roleTitle: "Design Engineer",
    dueAt: "",
  });

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await api.getTasks({
        status: statusFilter,
        priority: priorityFilter,
      });
      setTasks(res);
    } catch (err) {
      alert("Error loading tasks: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [statusFilter, priorityFilter]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.updateTask(id, { status: newStatus });
      loadTasks();
    } catch (err) {
      alert("Error updating task: " + err.message);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createTask(formData);
      alert("Task created successfully!");
      setShowModal(false);
      setFormData({
        title: "",
        description: "",
        priority: "HIGH",
        stakeholderName: "Engineering Team",
        roleTitle: "Design Engineer",
        dueAt: "",
      });
      loadTasks();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--slate-900)" }}>
            Engineering Task & Action Center
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--slate-500)" }}>
            Drawing releases, BOM approvals, third-party lab testing audits, and engineering change requests
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select
            className="select"
            style={{ width: 160 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_APPROVAL">Waiting Approval</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            className="select"
            style={{ width: 140 }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="data-table-wrapper" style={{ border: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task No</th>
                  <th>Title & Description</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assignee / Role</th>
                  <th>Due Date</th>
                  <th style={{ textAlign: "center" }}>Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ textAlign: "center", padding: 30 }}>Loading tasks...</td></tr>
                ) : tasks.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: "center", padding: 30 }}>No engineering tasks found matching criteria.</td></tr>
                ) : (
                  tasks.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--primary)" }}>
                        {t.taskNo}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--slate-900)" }}>{t.title}</div>
                        {t.description && (
                          <div style={{ fontSize: "0.75rem", color: "var(--slate-500)", marginTop: 2 }}>{t.description}</div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${t.priority === "CRITICAL" ? "badge-critical" : t.priority === "HIGH" ? "badge-high" : "badge-medium"}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${t.status === "COMPLETED" ? "badge-released" : t.status === "IN_PROGRESS" ? "badge-review" : "badge-draft"}`}>
                          {t.status.replace("_", " ")}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.78rem" }}>
                        <div style={{ fontWeight: 600, color: "var(--slate-800)" }}>{t.assignedTo?.name || "Unassigned"}</div>
                        <div style={{ color: "var(--slate-400)" }}>{t.roleTitle || "Engineer"}</div>
                      </td>
                      <td style={{ fontSize: "0.78rem", color: "var(--slate-600)" }}>
                        {t.dueAt ? new Date(t.dueAt).toLocaleDateString() : "-"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {t.status === "OPEN" && (
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleUpdateStatus(t.id, "IN_PROGRESS")}
                          >
                            Start Task
                          </button>
                        )}
                        {t.status === "IN_PROGRESS" && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleUpdateStatus(t.id, "COMPLETED")}
                          >
                            Mark Done
                          </button>
                        )}
                        {t.status === "COMPLETED" && (
                          <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600 }}>
                            <CheckCircle2 size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} /> Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE TASK MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Assign Engineering Action Item</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Task Title *</label>
                  <input
                    type="text"
                    className="input"
                    required
                    placeholder="e.g. UL 467 Re-certification: Prepare 15 samples of 17.2mm rod"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="select"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="CRITICAL">Critical</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Completion Date</label>
                    <input
                      type="date"
                      className="input"
                      value={formData.dueAt}
                      onChange={(e) => setFormData({ ...formData, dueAt: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Stakeholder / Department</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.stakeholderName}
                      onChange={(e) => setFormData({ ...formData, stakeholderName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role Title</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.roleTitle}
                      onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Task Scope & Acceptance Criteria</label>
                  <textarea
                    className="textarea"
                    rows="4"
                    placeholder="Provide detailed engineering requirements, specifications, testing guidelines..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
