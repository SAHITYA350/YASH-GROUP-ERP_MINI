import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Eye, RefreshCw, Calendar, PhoneCall } from 'lucide-react';
import PageHeader from '../../../layouts/PageHeader';
import leadApi from '../api/leadApi';
import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchBar from '../../../components/common/SearchBar';
import ErrorState from '../../../components/common/ErrorState';

function formatInr(val) {
  if (val === undefined || val === null) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await leadApi.getLeads();
      setLeads(res.leads || res || []);
    } catch (err) {
      setError(err.message || 'Failed to load CRM leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.code?.toLowerCase().includes(q) ||
      l.customerName?.toLowerCase().includes(q) ||
      l.contactName?.toLowerCase().includes(q) ||
      l.stage?.toLowerCase().includes(q) ||
      l.productName?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      header: 'Lead Code',
      accessor: 'code',
      render: (row) => (
        <span style={{ fontWeight: 600, fontFamily: 'var(--font-family-mono)', color: 'var(--primary)' }}>
          {row.code}
        </span>
      ),
    },
    {
      header: 'Company / Customer',
      accessor: 'customerName',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.customerName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Contact: {row.contactName || '—'} {row.phone && `(${row.phone})`}
          </div>
        </div>
      ),
    },
    {
      header: 'Enquiry Product',
      accessor: 'productName',
    },
    {
      header: 'Expected Value',
      align: 'right',
      render: (row) => <span style={{ fontWeight: 600 }}>{formatInr(row.expectedValue)}</span>,
    },
    {
      header: 'Stage',
      align: 'center',
      render: (row) => <StatusBadge status={row.stage} />,
    },
    {
      header: 'Priority',
      align: 'center',
      render: (row) => <StatusBadge status={row.priority} />,
    },
    {
      header: 'Next Follow-up',
      accessor: (row) => (row.nextFollowUpAt ? new Date(row.nextFollowUpAt).toLocaleDateString('en-IN') : '—'),
    },
    {
      header: 'Action',
      align: 'center',
      render: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/leads/${row.id}`);
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
        title="CRM & Sales Leads"
        subtitle="Inbound customer enquiries, qualification stages, and follow-up communications."
        breadcrumbs={[{ label: 'Leads' }]}
        actions={
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadLeads}
            disabled={loading}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        }
      />

      {error && <ErrorState message={error} onRetry={loadLeads} />}

      {!loading && !error && (
        <div className="grid-cols-4" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-card-title">
              <span>Pipeline Value</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>₹</span>
            </div>
            <div className="stat-card-value" style={{ color: 'var(--primary)' }}>
              {formatInr(leads.reduce((sum, l) => sum + (Number(l.expectedValue) || 0), 0))}
            </div>
            <div className="stat-card-meta">Total prospective deal size</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-title">
              <span>Total Inquiries</span>
              <UserCheck size={18} style={{ color: 'var(--info)' }} />
            </div>
            <div className="stat-card-value">{leads.length}</div>
            <div className="stat-card-meta">CRM opportunity callset</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-title">
              <span>Qualified & Won</span>
              <span style={{ color: 'var(--success)' }}>●</span>
            </div>
            <div className="stat-card-value" style={{ color: 'var(--success)' }}>
              {leads.filter((l) => ['QUALIFIED', 'PO_RECEIVED', 'CONVERTED'].includes(l.stage)).length}
            </div>
            <div className="stat-card-meta">Active deal prospects</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-title">
              <span>High Priority</span>
              <span style={{ color: 'var(--danger)' }}>●</span>
            </div>
            <div className="stat-card-value" style={{ color: 'var(--danger)' }}>
              {leads.filter((l) => ['HIGH', 'CRITICAL'].includes(l.priority)).length}
            </div>
            <div className="stat-card-meta">Urgent follow-up needed</div>
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
            placeholder="Search leads, customer, product..."
          />
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Total <strong>{filtered.length}</strong> leads
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          onRowClick={(row) => navigate(`/leads/${row.id}`)}
          emptyTitle="No leads found"
          emptyDescription="Customer enquiries and prospect records will appear here."
        />
      </div>
    </div>
  );
}

export default LeadsPage;
