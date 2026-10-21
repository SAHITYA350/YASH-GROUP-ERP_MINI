import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, PhoneCall, Mail, Calendar, User, Clock, MessageSquare } from 'lucide-react';
import PageHeader from '../../../layouts/PageHeader';
import leadApi from '../api/leadApi';
import StatusBadge from '../../../components/common/StatusBadge';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorState from '../../../components/common/ErrorState';

function formatInr(val) {
  if (val === undefined || val === null) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function LeadDetailsPage() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [leadRes, followRes] = await Promise.all([
        leadApi.getLead(id),
        leadApi.getLeadFollowUps(id).catch(() => []),
      ]);
      setLead(leadRes.lead || leadRes);
      setFollowUps(followRes.communications || followRes || []);
    } catch (err) {
      setError(err.message || 'Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading lead information..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;
  if (!lead) return <ErrorState message="Lead record not found." />;

  return (
    <div>
      <PageHeader
        title={`${lead.code}: ${lead.customerName}`}
        subtitle={`Enquiry for ${lead.productName || 'Equipment'}`}
        breadcrumbs={[
          { label: 'Leads', to: '/leads' },
          { label: lead.code },
        ]}
        actions={
          <Link to="/leads" className="btn btn-secondary btn-sm">
            <ArrowLeft size={14} />
            <span>Back to Leads</span>
          </Link>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Main Details Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{lead.customerName}</h2>
                <StatusBadge status={lead.stage} />
                <StatusBadge status={lead.priority} />
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Source: {lead.source || 'Website / Direct'}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expected Deal Value</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)' }}>
                {formatInr(lead.expectedValue)}
              </div>
            </div>
          </div>

          <div className="grid-cols-3">
            <div>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Contact Details
              </h4>
              <div style={{ fontWeight: 600 }}>{lead.contactName || 'Primary Contact'}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{lead.phone}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{lead.email}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{lead.city}, {lead.state}</div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Requirements & Scope
              </h4>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Product: {lead.productName}</div>
              <div style={{ fontSize: '0.85rem' }}>Quantity: {lead.quantity || 1} units</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                {lead.requirement || 'No detailed requirement specified.'}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Follow-up & Schedule
              </h4>
              <div style={{ fontSize: '0.85rem' }}>
                <strong>Next Follow-up:</strong>{' '}
                {lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toLocaleDateString('en-IN') : 'None scheduled'}
              </div>
              <div style={{ fontSize: '0.85rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>
                <strong>Last Note:</strong> {lead.lastActivityNote || '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Communication History */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Follow-up Activity & Communication Log</h3>
          </div>

          <div style={{ padding: '1.25rem' }}>
            {followUps.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {followUps.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-alt)',
                      border: '1px solid var(--border-light)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.subject || 'Follow-up Call'}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {c.sentAt ? new Date(c.sentAt).toLocaleDateString('en-IN') : 'Recent'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.body}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                No recorded follow-up communications yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeadDetailsPage;
