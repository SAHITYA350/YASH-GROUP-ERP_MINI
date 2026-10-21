import React, { useState, useEffect } from 'react';
import { CreditCard, RefreshCw, Plus } from 'lucide-react';
import PageHeader from '../../../layouts/PageHeader';
import expenseApi from '../api/expenseApi';
import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchBar from '../../../components/common/SearchBar';
import ErrorState from '../../../components/common/ErrorState';

function formatInr(val) {
  if (val === undefined || val === null) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await expenseApi.getExpenses();
      setExpenses(res.expenses || res || []);
    } catch (err) {
      setError(err.message || 'Failed to load direct expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const filtered = expenses.filter((exp) => {
    const q = search.toLowerCase();
    return (
      exp.billNo?.toLowerCase().includes(q) ||
      exp.vendor?.name?.toLowerCase().includes(q) ||
      exp.status?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      header: 'Expense Code',
      accessor: 'billNo',
      render: (row) => (
        <span style={{ fontWeight: 600, fontFamily: 'var(--font-family-mono)', color: 'var(--primary)' }}>
          {row.billNo}
        </span>
      ),
    },
    {
      header: 'Payee / Vendor',
      accessor: (row) => row.vendor?.name || '—',
    },
    {
      header: 'Category',
      accessor: (row) => row.vendor?.category || 'Operational Expense',
    },
    {
      header: 'Date',
      accessor: (row) => (row.billDate ? new Date(row.billDate).toLocaleDateString('en-IN') : '—'),
    },
    {
      header: 'Amount',
      align: 'right',
      render: (row) => <span style={{ fontWeight: 700 }}>{formatInr(row.total)}</span>,
    },
    {
      header: 'Status',
      align: 'center',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Direct Expenses"
        subtitle="Operational overheads, logistics transportation bills, and petty site expenses."
        breadcrumbs={[
          { label: 'Finance', to: '/finance/dashboard' },
          { label: 'Expenses' },
        ]}
        actions={
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadExpenses}
            disabled={loading}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        }
      />

      {error && <ErrorState message={error} onRetry={loadExpenses} />}

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
            placeholder="Search expense bills..."
          />
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filtered.length}</strong> records
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyTitle="No direct expenses found"
          emptyDescription="Operational expenses will appear in this ledger."
        />
      </div>
    </div>
  );
}

export default ExpensesPage;
