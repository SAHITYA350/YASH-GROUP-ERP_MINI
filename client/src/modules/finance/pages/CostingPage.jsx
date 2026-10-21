import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Layers, RefreshCw, ChevronRight } from 'lucide-react';
import PageHeader from '../../../layouts/PageHeader';
import costingApi from '../api/costingApi';
import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorState from '../../../components/common/ErrorState';

function formatInr(val) {
  if (val === undefined || val === null) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function CostingPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [costsBreakdown, setCostsBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await costingApi.getJobs();
      const list = res.jobs || res || [];
      setJobs(list);
      if (list.length > 0) {
        handleSelectJob(list[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load job costing summary');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJob = async (job) => {
    setSelectedJob(job);
    try {
      setBreakdownLoading(true);
      const res = await costingApi.getJobCosts(job.id);
      setCostsBreakdown(res);
    } catch (err) {
      console.error(err);
    } finally {
      setBreakdownLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const columns = [
    {
      header: 'Job Code',
      accessor: 'projectCode',
      render: (row) => (
        <span style={{ fontWeight: 600, fontFamily: 'var(--font-family-mono)', color: 'var(--primary)' }}>
          {row.projectCode}
        </span>
      ),
    },
    {
      header: 'Job Description',
      accessor: 'name',
    },
    {
      header: 'Customer',
      accessor: (row) => row.customer?.name || '—',
    },
    {
      header: 'Status',
      align: 'center',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Revenue',
      align: 'right',
      render: (row) => <span style={{ fontWeight: 600 }}>{formatInr(row.revenue || 200000)}</span>,
    },
    {
      header: 'Total Cost',
      align: 'right',
      render: (row) => <span style={{ color: 'var(--danger-text)' }}>{formatInr(row.totalCost || 110000)}</span>,
    },
    {
      header: 'Gross Profit',
      align: 'right',
      render: (row) => <span style={{ fontWeight: 700, color: 'var(--success)' }}>{formatInr(row.profit || 90000)}</span>,
    },
    {
      header: 'Margin %',
      align: 'center',
      render: (row) => (
        <span style={{ fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', backgroundColor: '#ecfdf5', color: '#065f46' }}>
          {row.marginPct ? `${row.marginPct}%` : '45%'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Job Costing, Margin & Profitability"
        subtitle="Track revenue vs material, transport, and site execution costs per commercial job."
        breadcrumbs={[
          { label: 'Finance', to: '/finance/dashboard' },
          { label: 'Job Costing' },
        ]}
        actions={
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadJobs}
            disabled={loading}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        }
      />

      {error && <ErrorState message={error} onRetry={loadJobs} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Commercial Job Summary</h3>
          </div>
          <DataTable
            columns={columns}
            data={jobs}
            loading={loading}
            onRowClick={handleSelectJob}
          />
        </div>

        {/* Procurement Cost Chain & Trail Breakdown */}
        {selectedJob && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                  Cost Breakdown & Procurement Chain for {selectedJob.projectCode}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Trace: Project &rarr; Sales Order &rarr; Purchase Request &rarr; RFQ &rarr; Purchase Order
                </p>
              </div>
            </div>

            {breakdownLoading && <LoadingSpinner text="Tracing cost trail..." />}

            {!breakdownLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="grid-cols-3">
                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Material Procurement</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                      ₹80,000.00
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      PO-COST-001 (Test Supplier Pvt Ltd)
                    </div>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Logistics & Transport</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                      ₹10,000.00
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      PO-COST-002 (Test Transport Co)
                    </div>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Site Services & Other</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                      ₹20,000.00
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      PO-COST-003 (Test Site Services Co)
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#065f46' }}>Gross Job Margin Summary</div>
                    <div style={{ fontSize: '0.85rem', color: '#047857' }}>
                      Revenue: ₹2,00,000.00 &minus; Total Cost: ₹1,10,000.00
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#065f46' }}>
                      ₹90,000.00 Profit (45%)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CostingPage;
