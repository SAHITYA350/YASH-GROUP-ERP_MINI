import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, RefreshCw, FileText } from 'lucide-react';
import PageHeader from '../../../layouts/PageHeader';
import paymentApi from '../api/paymentApi';
import DataTable from '../../../components/common/DataTable';
import SearchBar from '../../../components/common/SearchBar';
import ErrorState from '../../../components/common/ErrorState';

function formatInr(val) {
  if (val === undefined || val === null) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await paymentApi.getPayments();
      setPayments(res.payments || res || []);
    } catch (err) {
      setError(err.message || 'Failed to load payments history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.paymentNo?.toLowerCase().includes(q) ||
      p.referenceNo?.toLowerCase().includes(q) ||
      p.method?.toLowerCase().includes(q) ||
      p.invoice?.invoiceNo?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      header: 'Receipt #',
      accessor: 'paymentNo',
      render: (row) => (
        <span style={{ fontWeight: 600, fontFamily: 'var(--font-family-mono)', color: 'var(--primary)' }}>
          {row.paymentNo}
        </span>
      ),
    },
    {
      header: 'Date Received',
      accessor: (row) => (row.receivedAt ? new Date(row.receivedAt).toLocaleDateString('en-IN') : '—'),
    },
    {
      header: 'Against Invoice',
      accessor: (row) => (
        row.invoice ? (
          <Link to={`/finance/invoices/${row.invoice.id}`} style={{ fontWeight: 500 }}>
            {row.invoice.invoiceNo}
          </Link>
        ) : '—'
      ),
    },
    {
      header: 'Payment Method',
      accessor: 'method',
      render: (row) => (
        <span style={{ fontSize: '0.8rem', backgroundColor: 'var(--bg-surface-alt)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-xs)' }}>
          {row.method}
        </span>
      ),
    },
    {
      header: 'Bank / UTR Reference',
      accessor: (row) => row.referenceNo || '—',
    },
    {
      header: 'Amount Received',
      align: 'right',
      render: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--success)' }}>
          {formatInr(row.amount)}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Payment Receipts (Cash In)"
        subtitle="Complete log of customer remittances, NEFT transfers, and bank receipts."
        breadcrumbs={[
          { label: 'Finance', to: '/finance/dashboard' },
          { label: 'Payments' },
        ]}
        actions={
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadPayments}
            disabled={loading}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        }
      />

      {error && <ErrorState message={error} onRetry={loadPayments} />}

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
            placeholder="Search by receipt #, UTR, invoice..."
          />
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Total <strong>{filtered.length}</strong> receipts
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyTitle="No receipts recorded"
          emptyDescription="Customer receipts recorded against tax invoices will appear here."
        />
      </div>
    </div>
  );
}

export default PaymentsPage;
