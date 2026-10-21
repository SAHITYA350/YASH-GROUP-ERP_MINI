import React, { useState, useEffect } from 'react';
import { Layers, RefreshCw, CheckCircle, DollarSign } from 'lucide-react';
import PageHeader from '../../../layouts/PageHeader';
import vendorBillApi from '../api/vendorBillApi';
import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchBar from '../../../components/common/SearchBar';
import ErrorState from '../../../components/common/ErrorState';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

function formatInr(val) {
  if (val === undefined || val === null) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function VendorBillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Approval modal state
  const [approveId, setApproveId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const canApprove = true;

  const loadBills = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await vendorBillApi.getVendorBills();
      setBills(res.bills || res || []);
    } catch (err) {
      setError(err.message || 'Failed to load vendor bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  const handleApprove = async () => {
    if (!approveId) return;
    try {
      setActionLoading(true);
      await vendorBillApi.approveVendorBill(approveId);
      setApproveId(null);
      await loadBills();
    } catch (err) {
      alert(err.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = bills.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.billNo?.toLowerCase().includes(q) ||
      b.vendor?.name?.toLowerCase().includes(q) ||
      b.purchaseOrder?.poNumber?.toLowerCase().includes(q) ||
      b.status?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      header: 'Bill #',
      accessor: 'billNo',
      render: (row) => (
        <span style={{ fontWeight: 600, fontFamily: 'var(--font-family-mono)', color: 'var(--primary)' }}>
          {row.billNo}
        </span>
      ),
    },
    {
      header: 'Vendor Name',
      accessor: (row) => row.vendor?.name || '—',
    },
    {
      header: 'Matched PO / Category',
      accessor: (row) => (
        <div>
          <span style={{ fontWeight: 500 }}>{row.purchaseOrder?.poNumber || 'Direct Expense'}</span>
          {row.vendor?.category && (
            <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              {row.vendor.category}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Bill Date',
      accessor: (row) => (row.billDate ? new Date(row.billDate).toLocaleDateString('en-IN') : '—'),
    },
    {
      header: 'Total Bill',
      align: 'right',
      render: (row) => <span style={{ fontWeight: 600 }}>{formatInr(row.total)}</span>,
    },
    {
      header: 'Paid Out',
      align: 'right',
      render: (row) => <span style={{ color: 'var(--info-text)' }}>{formatInr(row.paidAmount)}</span>,
    },
    {
      header: 'Outstanding',
      align: 'right',
      render: (row) => {
        const bal = Number(row.total) - Number(row.paidAmount || 0);
        return <span style={{ fontWeight: 600, color: bal > 0 ? 'var(--warning-text)' : 'var(--text-muted)' }}>{formatInr(bal)}</span>;
      },
    },
    {
      header: 'Status',
      align: 'center',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      align: 'center',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
          {row.status === 'SUBMITTED' && canApprove && (
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={() => setApproveId(row.id)}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
              title="Approve Bill"
            >
              <CheckCircle size={13} />
              <span>Approve</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Vendor Bills & Accounts Payable"
        subtitle="3-way matched purchase bills, transport logistics invoices, and vendor disbursements."
        breadcrumbs={[
          { label: 'Finance', to: '/finance/dashboard' },
          { label: 'Vendor Bills' },
        ]}
        actions={
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadBills}
            disabled={loading}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        }
      />

      {error && <ErrorState message={error} onRetry={loadBills} />}

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
            placeholder="Search by Bill #, vendor, PO..."
          />
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filtered.length}</strong> bills
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyTitle="No vendor bills found"
          emptyDescription="Vendor purchase bills and expense invoices will appear here."
        />
      </div>

      <ConfirmDialog
        isOpen={Boolean(approveId)}
        title="Approve Vendor Bill"
        message="Are you sure you want to approve this vendor bill for payment clearance?"
        confirmText="Approve Bill"
        loading={actionLoading}
        onConfirm={handleApprove}
        onCancel={() => setApproveId(null)}
      />
    </div>
  );
}

export default VendorBillsPage;
