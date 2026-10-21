import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Eye, RefreshCw, Calendar } from 'lucide-react';
import PageHeader from '../../../layouts/PageHeader';
import serviceApi from '../api/serviceApi';
import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchBar from '../../../components/common/SearchBar';
import ErrorState from '../../../components/common/ErrorState';

export function ServiceTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await serviceApi.getTickets();
      setTickets(res.tickets || res || []);
    } catch (err) {
      setError(err.message || 'Failed to load service tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.ticketNo?.toLowerCase().includes(q) ||
      t.issue?.toLowerCase().includes(q) ||
      t.customer?.name?.toLowerCase().includes(q) ||
      t.serialNumber?.toLowerCase().includes(q) ||
      t.status?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      header: 'Ticket #',
      accessor: 'ticketNo',
      render: (row) => (
        <span style={{ fontWeight: 600, fontFamily: 'var(--font-family-mono)', color: 'var(--primary)' }}>
          {row.ticketNo}
        </span>
      ),
    },
    {
      header: 'Customer',
      accessor: (row) =>
        typeof row.customer === 'object' ? row.customer?.name || '—' : row.customer || '—',
    },
    {
      header: 'Equipment / Issue Reported',
      accessor: 'issue',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.issue}</div>
          {row.serialNumber && (
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              S/N: {row.serialNumber}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Reported Date',
      accessor: (row) => (row.reportedAt ? new Date(row.reportedAt).toLocaleDateString('en-IN') : '—'),
    },
    {
      header: 'Assigned Engineer',
      accessor: (row) =>
        typeof row.assignedTo === 'object' ? row.assignedTo?.name || 'Unassigned' : row.assignedTo || 'Unassigned',
      render: (row) => {
        const name = typeof row.assignedTo === 'object' ? row.assignedTo?.name : row.assignedTo;
        return (
          <span style={{ fontSize: '0.825rem', color: name ? 'var(--text-main)' : 'var(--text-subtle)' }}>
            {name || 'Unassigned'}
          </span>
        );
      },
    },
    {
      header: 'Status',
      align: 'center',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Action',
      align: 'center',
      render: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/services/${row.id}`);
          }}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.25rem 0.5rem' }}
        >
          <Eye size={14} />
          <span>Details</span>
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Field Service & Maintenance Tickets"
        subtitle="Customer complaint tickets, warranty service tracking, and technician dispatch."
        breadcrumbs={[{ label: 'Services' }]}
        actions={
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadTickets}
            disabled={loading}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        }
      />

      {error && <ErrorState message={error} onRetry={loadTickets} />}

      {!loading && !error && (
        <div className="grid-cols-4" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-card-title">
              <span>Total Service Tickets</span>
              <Wrench size={18} style={{ color: 'var(--primary)' }} />
            </div>
            <div className="stat-card-value">{tickets.length}</div>
            <div className="stat-card-meta">All logged incidents & visits</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-title">
              <span>Active In Progress</span>
              <span style={{ color: 'var(--warning)' }}>●</span>
            </div>
            <div className="stat-card-value" style={{ color: 'var(--warning-text)' }}>
              {tickets.filter((t) => ['OPEN', 'IN_PROGRESS', 'ASSIGNED'].includes(t.status)).length}
            </div>
            <div className="stat-card-meta">Field technician attention</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-title">
              <span>Resolved & Closed</span>
              <span style={{ color: 'var(--success)' }}>●</span>
            </div>
            <div className="stat-card-value" style={{ color: 'var(--success)' }}>
              {tickets.filter((t) => ['RESOLVED', 'CLOSED'].includes(t.status)).length}
            </div>
            <div className="stat-card-meta">Successfully serviced</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-title">
              <span>Under Warranty</span>
              <span style={{ color: 'var(--info)' }}>●</span>
            </div>
            <div className="stat-card-value" style={{ color: 'var(--info-text)' }}>
              {tickets.filter((t) => t.underWarranty || (t.warrantyEnd && new Date(t.warrantyEnd) >= new Date())).length}
            </div>
            <div className="stat-card-meta">Covered by AMC / Warranty</div>
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
            placeholder="Search tickets, issue, customer..."
          />
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filtered.length}</strong> service tickets
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          onRowClick={(row) => navigate(`/services/${row.id}`)}
          emptyTitle="No service tickets found"
          emptyDescription="Customer tickets and AMC maintenance visits will appear here."
        />
      </div>
    </div>
  );
}

export default ServiceTicketsPage;
