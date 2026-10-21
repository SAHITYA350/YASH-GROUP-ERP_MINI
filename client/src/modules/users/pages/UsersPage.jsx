import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Eye, RefreshCw, Shield } from 'lucide-react';
import PageHeader from '../../../layouts/PageHeader';
import userApi from '../api/userApi';
import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchBar from '../../../components/common/SearchBar';
import ErrorState from '../../../components/common/ErrorState';

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await userApi.getUsers();
      setUsers(res.users || res || []);
    } catch (err) {
      setError(err.message || 'Failed to load staff users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      header: 'Staff Member',
      accessor: 'name',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.8rem',
            }}
          >
            {row.name ? row.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{row.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Access Role',
      accessor: 'role',
      render: (row) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--primary-dark)',
            backgroundColor: 'var(--primary-light)',
            padding: '0.2rem 0.55rem',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <Shield size={12} />
          {row.role}
        </span>
      ),
    },
    {
      header: 'Account Status',
      accessor: 'isActive',
      align: 'center',
      render: (row) => <StatusBadge status={row.isActive ? 'ACTIVE' : 'INACTIVE'} />,
    },
    {
      header: 'Active Session',
      accessor: 'isLoggedIn',
      align: 'center',
      render: (row) => (
        <span style={{ fontSize: '0.8rem', color: row.isLoggedIn ? 'var(--success-text)' : 'var(--text-subtle)' }}>
          {row.isLoggedIn ? '● Logged In' : 'Offline'}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'center',
      render: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/users/${row.id}`);
          }}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.25rem 0.5rem' }}
        >
          <Eye size={14} />
          <span>Profile</span>
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users & Access Management"
        subtitle="Staff accounts, security permissions, and role-based access control (RBAC)."
        breadcrumbs={[{ label: 'Users' }]}
        actions={
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadUsers}
            disabled={loading}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        }
      />

      {error && <ErrorState message={error} onRetry={loadUsers} />}

      {!loading && !error && (
        <div className="grid-cols-4" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-card-title">
              <span>Total Staff</span>
              <Users size={18} style={{ color: 'var(--primary)' }} />
            </div>
            <div className="stat-card-value">{users.length}</div>
            <div className="stat-card-meta">Registered user accounts</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-title">
              <span>Active Accounts</span>
              <span style={{ color: 'var(--success)' }}>●</span>
            </div>
            <div className="stat-card-value" style={{ color: 'var(--success)' }}>
              {users.filter((u) => u.isActive).length}
            </div>
            <div className="stat-card-meta">Full system authorization</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-title">
              <span>Supervisors & Admins</span>
              <Shield size={18} style={{ color: 'var(--purple-text)' }} />
            </div>
            <div className="stat-card-value" style={{ color: 'var(--purple-text)' }}>
              {users.filter((u) => u.role === 'ADMIN' || String(u.role).includes('MANAGER')).length}
            </div>
            <div className="stat-card-meta">Admin & Manager privileges</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-title">
              <span>Online Now</span>
              <span style={{ color: 'var(--info)' }}>●</span>
            </div>
            <div className="stat-card-value" style={{ color: 'var(--info-text)' }}>
              {users.filter((u) => u.isLoggedIn).length}
            </div>
            <div className="stat-card-meta">Active session tokens</div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, role..."
          />
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Total <strong>{filtered.length}</strong> staff accounts
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          onRowClick={(row) => navigate(`/users/${row.id}`)}
          emptyTitle="No staff members found"
          emptyDescription="User accounts created in the system will be displayed here."
        />
      </div>
    </div>
  );
}

export default UsersPage;
