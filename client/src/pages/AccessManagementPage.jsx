import { useState, useMemo } from "react";
import {
  Check,
  CheckSquare,
  Key,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Square,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import useApi from "../hooks/useApi.js";
import { Empty, ErrorMessage, Modal, PageHeader } from "../components/ui.jsx";
import api, { getApiErrorMessage } from "../services/api.js";

export default function AccessManagementPage() {
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Form state for modal
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isActive, setIsActive] = useState(true);

  const usersQuery = useApi(`/users?search=${encodeURIComponent(search)}`);
  const metaQuery = useApi("/users/meta");

  const roles = metaQuery.data?.data?.roles || [];
  const permissionModules = metaQuery.data?.data?.modules || [];
  const roleDefaults = metaQuery.data?.data?.roleDefaults || {};

  // Open accessibility editor
  const handleEdit = (user) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setIsActive(user.isActive);
    setSaveError(null);

    // Initial permissions: if custom permissions exist and not empty, use them;
    // otherwise use effective permissions or role defaults
    const initialPerms =
      user.permissions && user.permissions.length > 0
        ? user.permissions
        : user.effectivePermissions || roleDefaults[user.role] || [];
    setSelectedPermissions(initialPerms);
  };

  // Toggle single permission checkbox
  const togglePermission = (key) => {
    setSelectedPermissions((current) => {
      if (current.includes(key)) {
        return current.filter((p) => p !== key);
      } else {
        return [...current, key];
      }
    });
  };

  // Toggle entire module's permissions
  const toggleModulePermissions = (modulePerms, shouldSelect) => {
    const keys = modulePerms.map((p) => p.key);
    setSelectedPermissions((current) => {
      if (shouldSelect) {
        return Array.from(new Set([...current, ...keys]));
      } else {
        return current.filter((p) => !keys.includes(p));
      }
    });
  };

  // Apply default permissions for the chosen role
  const applyRoleDefaults = (roleToApply = selectedRole) => {
    const defaults = roleDefaults[roleToApply] || [];
    setSelectedPermissions(defaults);
  };

  // Handle changing role in modal
  const handleRoleChange = (newRole) => {
    setSelectedRole(newRole);
    // If the user's permissions were identical to previous defaults or empty, update to new defaults
    applyRoleDefaults(newRole);
  };

  // Save changes
  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setSaveLoading(true);
      setSaveError(null);

      await api.patch(`/users/${editingUser.id}/accessibility`, {
        role: selectedRole,
        permissions: selectedPermissions,
        isActive,
      });

      setSuccessToast(`Access permissions updated for ${editingUser.name}`);
      setTimeout(() => setSuccessToast(null), 4000);
      setEditingUser(null);
      usersQuery.reload();
    } catch (err) {
      setSaveError({ message: getApiErrorMessage(err) });
    } finally {
      setSaveLoading(false);
    }
  };

  // Calculate stats
  const usersList = usersQuery.data?.data || [];
  const adminCount = usersList.filter((u) => u.role === "ADMIN").length;
  const activeCount = usersList.filter((u) => u.isActive).length;

  return (
    <div className="access-mgmt">
      <PageHeader title="Accessibility & Role Management">
        <div className="toolbar">
          <button
            className="secondary small"
            onClick={() => {
              usersQuery.reload();
              metaQuery.reload();
            }}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </PageHeader>

      {/* Metrics Row */}
      <section className="cards" style={{ marginBottom: "24px" }}>
        <article>
          <p>Total Users</p>
          <strong>{usersList.length}</strong>
        </article>
        <article>
          <p>Active Staff</p>
          <strong>{activeCount}</strong>
        </article>
        <article>
          <p>Administrators</p>
          <strong style={{ color: "#047857" }}>{adminCount}</strong>
        </article>
      </section>

      {successToast && <p className="notice">{successToast}</p>}

      {/* Users Table Panel */}
      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <label className="search" style={{ margin: 0, width: "320px" }}>
            <Search size={17} />
            <input
              aria-label="Search users"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, department…"
            />
          </label>
          <small className="muted">
            Tick and untick permissions to grant or restrict specific modules
          </small>
        </div>

        {usersQuery.loading ? (
          <p className="pad">Loading users…</p>
        ) : usersQuery.error ? (
          <ErrorMessage error={usersQuery.error} />
        ) : (
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>User &amp; Email</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Effective Accessibility</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.length ? (
                  usersList.map((user) => {
                    const hasAdminAccess =
                      user.role === "ADMIN" ||
                      user.effectivePermissions?.includes("*");
                    const permCount = user.effectivePermissions?.length || 0;

                    return (
                      <tr key={user.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                              style={{
                                width: "34px",
                                height: "34px",
                                borderRadius: "50%",
                                background: hasAdminAccess ? "#047857" : "#0284c7",
                                color: "#fff",
                                display: "grid",
                                placeItems: "center",
                                fontWeight: "700",
                                fontSize: "13px",
                              }}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <b>{user.name}</b>
                              <small className="muted">{user.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>{user.department || "Sales"}</td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              background: hasAdminAccess ? "#dcfce7" : "#f1f5f9",
                              color: hasAdminAccess ? "#15803d" : "#334155",
                              fontWeight: "600",
                              fontSize: "11px",
                            }}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td>
                          {user.isActive ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                color: "#16a34a",
                                fontSize: "12px",
                                fontWeight: "600",
                              }}
                            >
                              <UserCheck size={14} /> Active
                            </span>
                          ) : (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                color: "#dc2626",
                                fontSize: "12px",
                                fontWeight: "600",
                              }}
                            >
                              <UserX size={14} /> Inactive
                            </span>
                          )}
                        </td>
                        <td>
                          {hasAdminAccess ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                color: "#047857",
                                fontWeight: "600",
                                fontSize: "13px",
                              }}
                            >
                              <ShieldCheck size={16} /> Full Access (Super Admin)
                            </span>
                          ) : (
                            <span style={{ fontSize: "13px", color: "#475569" }}>
                              {permCount} permissions enabled
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            className="secondary small"
                            onClick={() => handleEdit(user)}
                            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                          >
                            <Shield size={14} />
                            Alter Access
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <Empty message="No users matching your criteria." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Accessibility & Role Modal */}
      {editingUser && (
        <Modal
          title={`Accessibility Management · ${editingUser.name}`}
          close={() => setEditingUser(null)}
        >
          <form onSubmit={handleSave} style={{ display: "grid", gap: "18px" }}>
            {saveError && <ErrorMessage error={saveError} />}

            {/* User Overview Box */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f8fafc",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div>
                <span style={{ fontWeight: "700", fontSize: "15px" }}>
                  {editingUser.name}
                </span>
                <span style={{ color: "#64748b", fontSize: "13px", display: "block" }}>
                  {editingUser.email} · {editingUser.department || "Sales"}
                </span>
              </div>
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  margin: 0,
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                <input
                  type="checkbox"
                  style={{ width: "18px", height: "18px", margin: 0 }}
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Active Account
              </label>
            </div>

            {/* Role Selection */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <label style={{ fontWeight: "700", fontSize: "14px", margin: 0 }}>
                  User Role
                </label>
                <button
                  type="button"
                  onClick={() => applyRoleDefaults(selectedRole)}
                  style={{
                    background: "none",
                    border: 0,
                    color: "#047857",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Reset permissions to {selectedRole} defaults
                </button>
              </div>
              <select
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  width: "100%",
                  background: "#fff",
                }}
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label} ({r.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Accessibility Checkbox Matrix */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>
                    Accessibility &amp; Permissions
                  </h3>
                  <small className="muted">
                    Tick or untick checkboxes to customize accessibility for this user
                  </small>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="secondary small"
                    onClick={() => {
                      const allKeys = permissionModules.flatMap((m) =>
                        m.permissions.map((p) => p.key)
                      );
                      setSelectedPermissions(allKeys);
                    }}
                    style={{ padding: "4px 8px", fontSize: "11px" }}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className="secondary small"
                    onClick={() => setSelectedPermissions([])}
                    style={{ padding: "4px 8px", fontSize: "11px" }}
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Module Groups */}
              <div
                style={{
                  maxHeight: "360px",
                  overflowY: "auto",
                  paddingRight: "6px",
                  display: "grid",
                  gap: "12px",
                }}
              >
                {permissionModules.map((module) => {
                  const moduleKeys = module.permissions.map((p) => p.key);
                  const isAllChecked = moduleKeys.every((k) =>
                    selectedPermissions.includes(k)
                  );
                  const isSomeChecked = moduleKeys.some((k) =>
                    selectedPermissions.includes(k)
                  );

                  return (
                    <div
                      key={module.key}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "12px",
                        background: isAllChecked ? "#f0fdf4" : "#ffffff",
                      }}
                    >
                      {/* Module Header with toggle */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                          borderBottom: "1px solid #e2e8f0",
                          paddingBottom: "6px",
                        }}
                      >
                        <span style={{ fontWeight: "700", fontSize: "13px", color: "#1e293b" }}>
                          {module.module}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            toggleModulePermissions(module.permissions, !isAllChecked)
                          }
                          style={{
                            background: "none",
                            border: 0,
                            color: "#047857",
                            fontSize: "12px",
                            cursor: "pointer",
                            fontWeight: "600",
                          }}
                        >
                          {isAllChecked ? "Untick all" : "Tick all"}
                        </button>
                      </div>

                      {/* Checkboxes in Module */}
                      <div style={{ display: "grid", gap: "8px" }}>
                        {module.permissions.map((perm) => {
                          const isChecked = selectedPermissions.includes(perm.key);
                          return (
                            <label
                              key={perm.key}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "10px",
                                cursor: "pointer",
                                margin: 0,
                                padding: "6px 8px",
                                borderRadius: "6px",
                                background: isChecked ? "#dcfce733" : "transparent",
                                transition: "background 0.15s",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(perm.key)}
                                style={{
                                  width: "18px",
                                  height: "18px",
                                  marginTop: "2px",
                                  cursor: "pointer",
                                }}
                              />
                              <div style={{ flex: 1 }}>
                                <span
                                  style={{
                                    display: "block",
                                    fontSize: "13px",
                                    fontWeight: isChecked ? "700" : "500",
                                    color: isChecked ? "#065f46" : "#334155",
                                  }}
                                >
                                  {perm.label}
                                </span>
                                <small style={{ color: "#64748b", fontSize: "11px" }}>
                                  {perm.description} (<code>{perm.key}</code>)
                                </small>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="actions" style={{ marginTop: "12px" }}>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                disabled={saveLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary"
                disabled={saveLoading}
              >
                {saveLoading ? "Saving accessibility…" : "Save Accessibility"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
