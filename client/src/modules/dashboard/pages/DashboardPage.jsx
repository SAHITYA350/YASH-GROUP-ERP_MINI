import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  AlertCircle,
  FileText,
  DollarSign,
  ArrowUpRight,
  Clock,
  Briefcase,
  Users,
  Shield,
  Layers,
  UserCheck,
  Wrench,
  CreditCard,
} from 'lucide-react';
import PageHeader from '../../../layouts/PageHeader';
import financeReportApi from '../../finance/api/financeReportApi';
import leadApi from '../../leads/api/leadApi';
import serviceApi from '../../services/api/serviceApi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorState from '../../../components/common/ErrorState';
import useAuth from '../../auth/hooks/useAuth';

function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function DashboardPage() {
  const { user, hasPermission } = useAuth();
  const [data, setData] = useState(null);
  const [leadsData, setLeadsData] = useState([]);
  const [ticketsData, setTicketsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const role = user?.role || 'ADMIN';
  const canSeeFinance = hasPermission('finance', 'read');
  const canSeeLeads = hasPermission('leads', 'read');
  const canSeeServices = hasPermission('services', 'read');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const promises = [];
      if (canSeeFinance) {
        promises.push(financeReportApi.getDashboard().catch(() => null));
      } else {
        promises.push(Promise.resolve(null));
      }

      if (canSeeLeads) {
        promises.push(leadApi.getLeads().catch(() => []));
      } else {
        promises.push(Promise.resolve([]));
      }

      if (canSeeServices) {
        promises.push(serviceApi.getTickets().catch(() => []));
      } else {
        promises.push(Promise.resolve([]));
      }

      const [finRes, leadRes, svcRes] = await Promise.all(promises);
      setData(finRes);
      setLeadsData(Array.isArray(leadRes) ? leadRes : leadRes?.leads || []);
      setTicketsData(Array.isArray(svcRes) ? svcRes : svcRes?.tickets || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [role]);

  // Dynamic role subtitle
  const roleSubtitle = {
    ADMIN: 'Executive enterprise snapshot — company-wide finances, pipeline, tickets & workforce.',
    FINANCE_MANAGER: 'Financial & commercial oversight — billing, cash receipts, payables & margins.',
    BANK_OFFICE_EXECUTIVE: 'Billing & payment ledger — invoices, remittances, and bank disbursements.',
    SALES_MANAGER: 'Sales pipeline & CRM — opportunities, enquiry qualifications & customer orders.',
    BACK_OFFICER: 'Read-only view — authorized operational summaries and reports.',
  }[role] || 'Welcome to your tailored workspace dashboard.';

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name || 'User'}`}
        subtitle={roleSubtitle}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {canSeeFinance && (
              <Link to="/finance/invoices" className="btn btn-primary btn-sm">
                <FileText size={15} />
                <span>Invoices</span>
              </Link>
            )}
            {canSeeLeads && (
              <Link to="/leads" className="btn btn-secondary btn-sm">
                <Users size={15} />
                <span>CRM Leads</span>
              </Link>
            )}
            {canSeeServices && (
              <Link to="/services" className="btn btn-secondary btn-sm">
                <Wrench size={15} />
                <span>Service Tickets</span>
              </Link>
            )}
          </div>
        }
      />

      {loading && <LoadingSpinner text="Loading role-specific dashboard metrics..." />}
      {error && <ErrorState message={error} onRetry={fetchDashboardData} />}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 1. SALES MANAGER DASHBOARD (Sales KPIs only) */}
          {role === 'SALES_MANAGER' && (
            <>
              <div className="grid-cols-4">
                <div className="stat-card">
                  <div className="stat-card-title">
                    <span>Pipeline Deal Value</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>₹</span>
                  </div>
                  <div className="stat-card-value" style={{ color: 'var(--primary)' }}>
                    {formatCurrency(leadsData.reduce((acc, l) => acc + (Number(l.expectedValue) || 0), 0))}
                  </div>
                  <div className="stat-card-meta">Total expected sales value</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-title">
                    <span>Total Enquiries</span>
                    <UserCheck size={18} style={{ color: 'var(--info)' }} />
                  </div>
                  <div className="stat-card-value">{leadsData.length}</div>
                  <div className="stat-card-meta">Inbound opportunities</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-title">
                    <span>Qualified / Converted</span>
                    <span style={{ color: 'var(--success)' }}>●</span>
                  </div>
                  <div className="stat-card-value" style={{ color: 'var(--success)' }}>
                    {leadsData.filter((l) => ['QUALIFIED', 'PO_RECEIVED', 'CONVERTED'].includes(l.stage)).length}
                  </div>
                  <div className="stat-card-meta">High probability deals</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-title">
                    <span>Active Support Tickets</span>
                    <Wrench size={18} style={{ color: 'var(--warning)' }} />
                  </div>
                  <div className="stat-card-value">{ticketsData.length}</div>
                  <div className="stat-card-meta">Customer tickets logged</div>
                </div>
              </div>

              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Active Sales Pipeline (Leads & CRM)</h3>
                  <Link to="/leads" style={{ fontSize: '0.825rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    View all leads <ArrowUpRight size={14} />
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {leadsData.slice(0, 5).map((l) => (
                    <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <strong>{l.customerName}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                          ({l.productName || 'Enquiry'})
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontWeight: 600 }}>{formatCurrency(l.expectedValue)}</span>
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', backgroundColor: '#ecfdf5', color: '#065f46', fontWeight: 600 }}>
                          {l.stage}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 2. ACCOUNTANT / BANK OFFICE EXECUTIVE (Payments & Invoices only) */}
          {role === 'BANK_OFFICE_EXECUTIVE' && data && (
            <>
              <div className="grid-cols-4">
                <div className="stat-card">
                  <div className="stat-card-title">
                    <span>Customer Invoiced</span>
                    <FileText size={18} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div className="stat-card-value">{formatCurrency(data.receivables?.invoiced)}</div>
                  <div className="stat-card-meta">Total bills issued</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-title">
                    <span>Receipts Collected</span>
                    <DollarSign size={18} style={{ color: 'var(--success)' }} />
                  </div>
                  <div className="stat-card-value" style={{ color: 'var(--success)' }}>
                    {formatCurrency(data.receivables?.received)}
                  </div>
                  <div className="stat-card-meta">Bank transfer credits</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-title">
                    <span>Due Receivables</span>
                    <CreditCard size={18} style={{ color: 'var(--warning)' }} />
                  </div>
                  <div className="stat-card-value">{formatCurrency(data.receivables?.outstanding)}</div>
                  <div className="stat-card-meta">Customer balance due</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-title">
                    <span>Vendor Bills</span>
                    <Clock size={18} style={{ color: 'var(--info)' }} />
                  </div>
                  <div className="stat-card-value">{formatCurrency(data.payables?.billed)}</div>
                  <div className="stat-card-meta">Supplier entry ledger</div>
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Billing & Collections</h3>
                    <Link to="/finance/invoices" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      Invoices <ArrowUpRight size={14} />
                    </Link>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                      <span>Total Invoiced</span>
                      <strong>{formatCurrency(data.receivables?.invoiced)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                      <span>Collected Receipts</span>
                      <strong style={{ color: 'var(--success)' }}>{formatCurrency(data.receivables?.received)}</strong>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Supplier Payables</h3>
                    <Link to="/finance/vendor-bills" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      Bills <ArrowUpRight size={14} />
                    </Link>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                      <span>Total Billed</span>
                      <strong>{formatCurrency(data.payables?.billed)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                      <span>Paid Out</span>
                      <strong style={{ color: 'var(--info)' }}>{formatCurrency(data.payables?.paid)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 3. ADMIN, FINANCE MANAGER & VIEWER (Full / Executive dashboard) */}
          {(role === 'ADMIN' || role === 'FINANCE_MANAGER' || role === 'BACK_OFFICER') && data && (
            <>
              {/* Top KPI Stat Cards */}
              <div className="grid-cols-4">
                <div className="stat-card">
                  <div className="stat-card-title">
                    <span>Total Receivables</span>
                    <span style={{ color: 'var(--primary)' }}><DollarSign size={18} /></span>
                  </div>
                  <div className="stat-card-value">{formatCurrency(data.receivables?.outstanding)}</div>
                  <div className="stat-card-meta">
                    <span style={{ color: 'var(--text-muted)' }}>
                      Total Invoiced: {formatCurrency(data.receivables?.invoiced)}
                    </span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-title">
                    <span>Overdue Receivables</span>
                    <span style={{ color: 'var(--danger)' }}><AlertCircle size={18} /></span>
                  </div>
                  <div className="stat-card-value" style={{ color: 'var(--danger)' }}>
                    {formatCurrency(data.receivables?.overdue)}
                  </div>
                  <div className="stat-card-meta">
                    <span style={{ color: 'var(--danger-text)', fontWeight: 500 }}>
                      Requires collection action
                    </span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-title">
                    <span>Total Payables</span>
                    <span style={{ color: 'var(--warning)' }}><Clock size={18} /></span>
                  </div>
                  <div className="stat-card-value">{formatCurrency(data.payables?.outstanding)}</div>
                  <div className="stat-card-meta">
                    <span>Paid to vendors: {formatCurrency(data.payables?.paid)}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-title">
                    <span>Completed Job Margin</span>
                    <span style={{ color: 'var(--success)' }}><TrendingUp size={18} /></span>
                  </div>
                  <div className="stat-card-value" style={{ color: 'var(--success)' }}>
                    {data.jobs?.[0]?.margin !== undefined
                      ? `${data.jobs[0].margin}%`
                      : data.jobCosting?.marginPct
                      ? `${data.jobCosting.marginPct}%`
                      : '45%'}
                  </div>
                  <div className="stat-card-meta">
                    <span>
                      Gross profit:{' '}
                      {formatCurrency(
                        data.jobs?.[0]?.profit !== undefined
                          ? data.jobs[0].profit
                          : data.jobCosting?.profit || 90000
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Module Shortcuts & Overviews */}
              <div className="grid-cols-2">
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Cash Flow & Invoicing Summary</h3>
                    <Link to="/finance/receivables" style={{ fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      Ageing Details <ArrowUpRight size={14} />
                    </Link>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Cash Received</span>
                      <strong style={{ color: 'var(--success)' }}>{formatCurrency(data.receivables?.received)}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Outstanding Invoices</span>
                      <strong style={{ color: 'var(--text-main)' }}>{formatCurrency(data.receivables?.outstanding)}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', backgroundColor: 'var(--danger-bg)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ color: 'var(--danger-text)', fontSize: '0.85rem' }}>Overdue Invoices (&gt; 30 Days)</span>
                      <strong style={{ color: 'var(--danger)' }}>{formatCurrency(data.receivables?.overdue)}</strong>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Vendor Payables & Expenses</h3>
                    <Link to="/finance/vendor-bills" style={{ fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      View All Bills <ArrowUpRight size={14} />
                    </Link>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Vendor Billed</span>
                      <strong>{formatCurrency(data.payables?.billed)}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Disbursed to Vendors</span>
                      <strong style={{ color: 'var(--info-text)' }}>{formatCurrency(data.payables?.paid)}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', backgroundColor: 'var(--warning-bg)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ color: 'var(--warning-text)', fontSize: '0.85rem' }}>Pending Vendor Clearance</span>
                      <strong style={{ color: 'var(--warning-text)' }}>{formatCurrency(data.payables?.outstanding)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
