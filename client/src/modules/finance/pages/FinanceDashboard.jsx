import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  FileText,
  CreditCard,
  Layers,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowUpRight,
  PieChart,
} from 'lucide-react';
import PageHeader from '../../../layouts/PageHeader';
import financeReportApi from '../api/financeReportApi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorState from '../../../components/common/ErrorState';

function formatInr(val) {
  if (val === undefined || val === null) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function FinanceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await financeReportApi.getDashboard();
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load finance data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Finance & Commercial Overview"
        subtitle="Manage billing, receivables, supplier payables, expense claims and job profit margin analysis."
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/finance/invoices" className="btn btn-primary btn-sm">
              <FileText size={15} />
              <span>Invoices</span>
            </Link>
            <Link to="/finance/vendor-bills" className="btn btn-secondary btn-sm">
              <Layers size={15} />
              <span>Vendor Bills</span>
            </Link>
          </div>
        }
      />

      {loading && <LoadingSpinner text="Loading financial records..." />}
      {error && <ErrorState message={error} onRetry={() => window.location.reload()} />}

      {!loading && !error && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Executive KPIs */}
          <div className="grid-cols-4">
            <div className="stat-card">
              <div className="stat-card-title">
                <span>Invoiced Revenue</span>
                <FileText size={18} style={{ color: 'var(--primary)' }} />
              </div>
              <div className="stat-card-value">{formatInr(data.receivables?.invoiced)}</div>
              <div className="stat-card-meta">
                <span>Total invoices billed</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-title">
                <span>Cash Receipts</span>
                <DollarSign size={18} style={{ color: 'var(--success)' }} />
              </div>
              <div className="stat-card-value" style={{ color: 'var(--success)' }}>
                {formatInr(data.receivables?.received)}
              </div>
              <div className="stat-card-meta">
                <span>Settled payments</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-title">
                <span>Total Receivables</span>
                <CreditCard size={18} style={{ color: 'var(--warning)' }} />
              </div>
              <div className="stat-card-value">{formatInr(data.receivables?.outstanding)}</div>
              <div className="stat-card-meta">
                <span style={{ color: 'var(--danger)' }}>
                  Overdue: {formatInr(data.receivables?.overdue)}
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-title">
                <span>Vendor Payables</span>
                <Clock size={18} style={{ color: 'var(--info)' }} />
              </div>
              <div className="stat-card-value">{formatInr(data.payables?.outstanding)}</div>
              <div className="stat-card-meta">
                <span>Total Billed: {formatInr(data.payables?.billed)}</span>
              </div>
            </div>
          </div>

          {/* Workflow Sections */}
          <div className="grid-cols-2">
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Billing & Receivables (Workflow 1)</h3>
                <Link to="/finance/receivables" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  View Ageing <ArrowUpRight size={14} />
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Invoiced</span>
                  <strong>{formatInr(data.receivables?.invoiced)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Received (Bank Receipts)</span>
                  <strong style={{ color: 'var(--success)' }}>{formatInr(data.receivables?.received)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Current Outstanding</span>
                  <strong>{formatInr(data.receivables?.outstanding)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ color: 'var(--danger-text)' }}>Overdue (&gt; Due Date)</span>
                  <strong style={{ color: 'var(--danger)' }}>{formatInr(data.receivables?.overdue)}</strong>
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Payables & Expenses (Workflow 2)</h3>
                <Link to="/finance/vendor-bills" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  View Bills <ArrowUpRight size={14} />
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Vendor Bills</span>
                  <strong>{formatInr(data.payables?.billed)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Paid to Vendors</span>
                  <strong style={{ color: 'var(--info-text)' }}>{formatInr(data.payables?.paid)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--warning-bg)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ color: 'var(--warning-text)' }}>Pending Balance Payables</span>
                  <strong style={{ color: 'var(--warning-text)' }}>{formatInr(data.payables?.outstanding)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinanceDashboard;
