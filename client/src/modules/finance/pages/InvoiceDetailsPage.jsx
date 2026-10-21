import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  Plus,
  Calendar,
  Building,
  FileCheck,
  CreditCard,
} from 'lucide-react';
import PageHeader from '../../../layouts/PageHeader';
import invoiceApi from '../api/invoiceApi';
import StatusBadge from '../../../components/common/StatusBadge';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorState from '../../../components/common/ErrorState';
import FormField from '../../../components/forms/FormField';
import SelectField from '../../../components/forms/SelectField';
import FormActions from '../../../components/forms/FormActions';

function formatInr(val) {
  if (val === undefined || val === null) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function InvoiceDetailsPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Record receipt state
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const [receiptAmount, setReceiptAmount] = useState('');
  const [receiptMethod, setReceiptMethod] = useState('BANK_TRANSFER');
  const [receiptRef, setReceiptRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  const loadInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await invoiceApi.getInvoice(id);
      setInvoice(res);
      // default receipt amount to remaining balance
      if (res) {
        const remaining = Number(res.total || 0) - Number(res.paidAmount || 0);
        setReceiptAmount(remaining > 0 ? remaining : '');
      }
    } catch (err) {
      setError(err.message || 'Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const handleRecordReceipt = async (e) => {
    e.preventDefault();
    if (!receiptAmount || Number(receiptAmount) <= 0) {
      setActionError('Please enter a valid receipt amount.');
      return;
    }

    try {
      setSubmitting(true);
      setActionError('');
      await invoiceApi.createReceipt(id, {
        amount: Number(receiptAmount),
        method: receiptMethod,
        referenceNo: receiptRef,
      });
      setShowReceiptForm(false);
      await loadInvoice();
    } catch (err) {
      setActionError(err.message || 'Failed to record payment receipt');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading invoice record..." />;
  if (error) return <ErrorState message={error} onRetry={loadInvoice} />;
  if (!invoice) return <ErrorState message="Invoice not found." />;

  const balance = Number(invoice.total || 0) - Number(invoice.paidAmount || 0);

  return (
    <div>
      <PageHeader
        title={`Invoice: ${invoice.invoiceNo}`}
        subtitle={`Issued to ${invoice.customer?.name || 'Customer'}`}
        breadcrumbs={[
          { label: 'Finance', to: '/finance/dashboard' },
          { label: 'Invoices', to: '/finance/invoices' },
          { label: invoice.invoiceNo },
        ]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link to="/finance/invoices" className="btn btn-secondary btn-sm">
              <ArrowLeft size={14} />
              <span>Back to Invoices</span>
            </Link>
            {balance > 0 && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowReceiptForm(!showReceiptForm)}
              >
                <DollarSign size={14} />
                <span>Record Receipt</span>
              </button>
            )}
          </div>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Record Receipt Collapsible Panel */}
        {showReceiptForm && (
          <div className="card" style={{ border: '2px solid var(--primary)', backgroundColor: 'var(--bg-surface)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Record Customer Receipt (Money In)
            </h3>
            {actionError && (
              <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                {actionError}
              </div>
            )}
            <form onSubmit={handleRecordReceipt}>
              <div className="grid-cols-3">
                <FormField
                  label="Receipt Amount (₹)"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={receiptAmount}
                  onChange={(e) => setReceiptAmount(e.target.value)}
                  required
                />
                <SelectField
                  label="Payment Method"
                  name="method"
                  value={receiptMethod}
                  onChange={(e) => setReceiptMethod(e.target.value)}
                  options={[
                    { value: 'BANK_TRANSFER', label: 'Bank Transfer (NEFT/RTGS/IMPS)' },
                    { value: 'CHEQUE', label: 'Cheque' },
                    { value: 'CASH', label: 'Cash' },
                    { value: 'UPI', label: 'UPI' },
                  ]}
                  required
                />
                <FormField
                  label="Reference / Transaction No."
                  name="referenceNo"
                  value={receiptRef}
                  onChange={(e) => setReceiptRef(e.target.value)}
                  placeholder="e.g. UTR / NEFT ref"
                />
              </div>
              <FormActions>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowReceiptForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submitting}
                >
                  {submitting ? 'Recording...' : 'Save Receipt'}
                </button>
              </FormActions>
            </form>
          </div>
        )}

        {/* Invoice Summary Header Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-family-mono)', color: 'var(--primary)' }}>
                  {invoice.invoiceNo}
                </h2>
                <StatusBadge status={invoice.status} />
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.25rem' }}>
                Order Ref: {invoice.salesOrder?.orderNumber || 'Standard Commercial Order'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'right' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Invoice Total</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatInr(invoice.total)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Paid Amount</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>{formatInr(invoice.paidAmount)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Balance Due</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: balance > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                  {formatInr(balance)}
                </div>
              </div>
            </div>
          </div>

          <div className="grid-cols-3">
            <div>
              <h4 style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Customer Information
              </h4>
              <div style={{ fontWeight: 600 }}>{invoice.customer?.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>GSTIN: {invoice.customer?.gstin || '—'}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{invoice.customer?.city}, {invoice.customer?.state}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{invoice.customer?.email}</div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Timeline & Dates
              </h4>
              <div style={{ fontSize: '0.85rem' }}>
                <strong>Issue Date:</strong> {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('en-IN') : '—'}
              </div>
              <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                <strong>Due Date:</strong> {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN') : '—'}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Financial Breakdown
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.2rem 0' }}>
                <span>Subtotal (Base):</span>
                <span>{formatInr(invoice.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.2rem 0' }}>
                <span>GST Tax (18%):</span>
                <span>{formatInr(invoice.taxAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700, borderTop: '1px solid var(--border-subtle)', paddingTop: '0.35rem', marginTop: '0.25rem' }}>
                <span>Grand Total:</span>
                <span>{formatInr(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payments / Receipts History Table */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Payment Receipts Recorded Against This Invoice</h3>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Reference / UTR</th>
                  <th style={{ textAlign: 'right' }}>Amount Received</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments && invoice.payments.length > 0 ? (
                  invoice.payments.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--font-family-mono)' }}>{p.paymentNo}</td>
                      <td>{p.receivedAt ? new Date(p.receivedAt).toLocaleDateString('en-IN') : '—'}</td>
                      <td>{p.method}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{p.referenceNo || '—'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--success)' }}>
                        {formatInr(p.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No payment receipts have been recorded yet for this invoice.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetailsPage;
