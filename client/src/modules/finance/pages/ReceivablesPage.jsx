import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, AlertCircle, Clock, CheckCircle2, Eye } from 'lucide-react';
import PageHeader from '../../../layouts/PageHeader';
import receivablesApi from '../api/receivablesApi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorState from '../../../components/common/ErrorState';
import StatusBadge from '../../../components/common/StatusBadge';

function formatInr(val) {
  if (val === undefined || val === null) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function ReceivablesPage() {
  const [summary, setSummary] = useState(null);
  const [ageing, setAgeing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumRes, ageRes] = await Promise.all([
        receivablesApi.getSummary(),
        receivablesApi.getAgeing(),
      ]);
      setSummary(sumRes);
      setAgeing(ageRes);
    } catch (err) {
      setError(err.message || 'Failed to load receivables report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <PageHeader
        title="Receivables & Debtors Ageing"
        subtitle="Accounts receivable summary and customer overdue ageing buckets."
        breadcrumbs={[
          { label: 'Finance', to: '/finance/dashboard' },
          { label: 'Receivables' },
        ]}
      />

      {loading && <LoadingSpinner text="Analyzing receivables & ageing..." />}
      {error && <ErrorState message={error} onRetry={loadData} />}

      {!loading && !error && summary && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* KPI Summary Cards */}
          <div className="grid-cols-4">
            <div className="stat-card">
              <div className="stat-card-title">
                <span>Total Invoiced</span>
                <CreditCard size={18} style={{ color: 'var(--primary)' }} />
              </div>
              <div className="stat-card-value">{formatInr(summary.invoiced)}</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-title">
                <span>Total Collected</span>
                <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
              </div>
              <div className="stat-card-value" style={{ color: 'var(--success)' }}>
                {formatInr(summary.received)}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-title">
                <span>Total Outstanding</span>
                <Clock size={18} style={{ color: 'var(--warning)' }} />
              </div>
              <div className="stat-card-value">{formatInr(summary.outstanding)}</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-title">
                <span>Total Overdue</span>
                <AlertCircle size={18} style={{ color: 'var(--danger)' }} />
              </div>
              <div className="stat-card-value" style={{ color: 'var(--danger)' }}>
                {formatInr(summary.overdue)}
              </div>
            </div>
          </div>

          {/* Ageing Buckets Cards */}
          {ageing && (
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem' }}>
                Customer Debtors Ageing Schedule
              </h3>
              <div className="grid-cols-4">
                <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>Current (Not Due)</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#15803d', marginTop: '0.25rem' }}>
                    {formatInr(ageing.current || 0)}
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#fefce8', borderRadius: 'var(--radius-md)', border: '1px solid #fef08a' }}>
                  <div style={{ fontSize: '0.8rem', color: '#854d0e', fontWeight: 600 }}>1 - 30 Days Past Due</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#a16207', marginTop: '0.25rem' }}>
                    {formatInr(ageing.days1to30 || 0)}
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#fff7ed', borderRadius: 'var(--radius-md)', border: '1px solid #fed7aa' }}>
                  <div style={{ fontSize: '0.8rem', color: '#9a3412', fontWeight: 600 }}>31 - 60 Days Past Due</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#c2410c', marginTop: '0.25rem' }}>
                    {formatInr(ageing.days31to60 || ageing.overdue || 0)}
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#fef2f2', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 600 }}>&gt; 60 Days Overdue</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#dc2626', marginTop: '0.25rem' }}>
                    {formatInr(ageing.days60plus || 0)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Invoice Link */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Link to="/finance/invoices" className="btn btn-primary btn-sm">
              <Eye size={15} />
              <span>Go to Invoices to manage individual items</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceivablesPage;
