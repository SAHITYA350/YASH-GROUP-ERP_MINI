import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Eye, RefreshCw } from 'lucide-react';
import PageHeader from '../../../layouts/PageHeader';
import invoiceApi from '../api/invoiceApi';
import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchBar from '../../../components/common/SearchBar';
import ErrorState from '../../../components/common/ErrorState';

function formatInr(val) {
  if (val === undefined || val === null) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

export function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await invoiceApi.getInvoices();
      setInvoices(res.invoices || res || []);
    } catch (err) {
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    return (
      inv.invoiceNo?.toLowerCase().includes(q) ||
      inv.customer?.name?.toLowerCase().includes(q) ||
      inv.status?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      header: 'Invoice #',
      accessor: 'invoiceNo',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'var(--font-family-mono)' }}>
          {row.invoiceNo}
        </span>
      ),
    },
    {
      header: 'Customer',
      accessor: (row) => row.customer?.name || row.customer?.code || '—',
    },
    {
      header: 'Issue Date',
      accessor: (row) => (row.issueDate ? new Date(row.issueDate).toLocaleDateString('en-IN') : '—'),
    },
    {
      header: 'Due Date',
      accessor: (row) => (row.dueDate ? new Date(row.dueDate).toLocaleDateString('en-IN') : '—'),
    },
    {
      header: 'Total Value',
      align: 'right',
      render: (row) => <span style={{ fontWeight: 600 }}>{formatInr(row.total)}</span>,
    },
    {
      header: 'Paid Amount',
      align: 'right',
      render: (row) => <span style={{ color: 'var(--success)', fontWeight: 500 }}>{formatInr(row.paidAmount)}</span>,
    },
    {
      header: 'Balance',
      align: 'right',
      render: (row) => {
        const bal = Number(row.total) - Number(row.paidAmount || 0);
        return <span style={{ fontWeight: 600, color: bal > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{formatInr(bal)}</span>;
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
            navigate(`/finance/invoices/${row.id}`);
          }}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.25rem 0.5rem' }}
          title="View Details"
        >
          <Eye size={14} />
          <span>View</span>
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tax Invoices (Receivables)"
        subtitle="List of issued GST commercial and tax invoices with real-time balance tracking."
        breadcrumbs={[
          { label: 'Finance', to: '/finance/dashboard' },
          { label: 'Invoices' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={loadInvoices}
              disabled={loading}
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      {error && <ErrorState message={error} onRetry={loadInvoices} />}

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
            placeholder="Search by Invoice #, customer..."
          />
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filtered.length}</strong> invoices
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          onRowClick={(row) => navigate(`/finance/invoices/${row.id}`)}
          emptyTitle="No invoices found"
          emptyDescription="There are no invoices recorded in the database matching your criteria."
        />
      </div>
    </div>
  );
}

export default InvoicesPage;
