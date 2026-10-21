import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Wrench, Shield, Calendar, User, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../../layouts/PageHeader';
import serviceApi from '../api/serviceApi';
import StatusBadge from '../../../components/common/StatusBadge';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorState from '../../../components/common/ErrorState';

export function ServiceDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTicket = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await serviceApi.getTicket(id);
      setTicket(res.ticket || res);
    } catch (err) {
      setError(err.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading ticket details..." />;
  if (error) return <ErrorState message={error} onRetry={loadTicket} />;
  if (!ticket) return <ErrorState message="Service ticket not found." />;

  return (
    <div>
      <PageHeader
        title={`${ticket.ticketNo}: ${ticket.issue}`}
        subtitle={`Client: ${ticket.customer?.name || 'Customer'}`}
        breadcrumbs={[
          { label: 'Services', to: '/services' },
          { label: ticket.ticketNo },
        ]}
        actions={
          <Link to="/services" className="btn btn-secondary btn-sm">
            <ArrowLeft size={14} />
            <span>Back to Tickets</span>
          </Link>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-family-mono)', color: 'var(--primary)' }}>
                  {ticket.ticketNo}
                </h2>
                <StatusBadge status={ticket.status} />
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Reported on: {ticket.reportedAt ? new Date(ticket.reportedAt).toLocaleDateString('en-IN') : '—'}
              </div>
            </div>

            {ticket.serialNumber && (
              <div style={{ padding: '0.4rem 0.8rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 600 }}>
                Equipment S/N: {ticket.serialNumber}
              </div>
            )}
          </div>

          <div className="grid-cols-2">
            <div>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Customer Details
              </h4>
              <div style={{ fontWeight: 600 }}>{ticket.customer?.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{ticket.customer?.city}, {ticket.customer?.state}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{ticket.customer?.phone}</div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Assigned Service Technician
              </h4>
              <div style={{ fontWeight: 600 }}>{ticket.assignedTo?.name || 'Unassigned / In Dispatch Queue'}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{ticket.assignedTo?.email || '—'}</div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Issue Description & Work Details
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
              {ticket.issue}
            </p>
            {ticket.resolution && (
              <div style={{ marginTop: '0.75rem', padding: '0.85rem', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#065f46' }}>Resolution Note:</div>
                <div style={{ fontSize: '0.85rem', color: '#047857', marginTop: '0.2rem' }}>{ticket.resolution}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceDetailsPage;
