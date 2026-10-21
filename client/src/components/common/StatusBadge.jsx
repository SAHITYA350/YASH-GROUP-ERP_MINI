import React from 'react';

const STATUS_CONFIG = {
  // Green / Success
  PAID: { bg: 'var(--success-bg)', text: 'var(--success-text)', border: 'var(--success-border)', label: 'Paid' },
  APPROVED: { bg: 'var(--success-bg)', text: 'var(--success-text)', border: 'var(--success-border)', label: 'Approved' },
  COMPLETED: { bg: 'var(--success-bg)', text: 'var(--success-text)', border: 'var(--success-border)', label: 'Completed' },
  ACCEPTED: { bg: 'var(--success-bg)', text: 'var(--success-text)', border: 'var(--success-border)', label: 'Accepted' },
  CLOSED: { bg: 'var(--success-bg)', text: 'var(--success-text)', border: 'var(--success-border)', label: 'Closed' },
  ACTIVE: { bg: 'var(--success-bg)', text: 'var(--success-text)', border: 'var(--success-border)', label: 'Active' },
  QUALIFIED: { bg: 'var(--success-bg)', text: 'var(--success-text)', border: 'var(--success-border)', label: 'Qualified' },
  DELIVERED: { bg: 'var(--success-bg)', text: 'var(--success-text)', border: 'var(--success-border)', label: 'Delivered' },

  // Amber / Warning
  PARTIALLY_PAID: { bg: 'var(--warning-bg)', text: 'var(--warning-text)', border: 'var(--warning-border)', label: 'Partially Paid' },
  SUBMITTED: { bg: 'var(--warning-bg)', text: 'var(--warning-text)', border: 'var(--warning-border)', label: 'Submitted' },
  CONTACTED: { bg: 'var(--warning-bg)', text: 'var(--warning-text)', border: 'var(--warning-border)', label: 'Contacted' },
  MEDIUM: { bg: 'var(--warning-bg)', text: 'var(--warning-text)', border: 'var(--warning-border)', label: 'Medium' },

  // Blue / Info
  IN_PROGRESS: { bg: 'var(--info-bg)', text: 'var(--info-text)', border: 'var(--info-border)', label: 'In Progress' },
  OPEN: { bg: 'var(--info-bg)', text: 'var(--info-text)', border: 'var(--info-border)', label: 'Open' },
  HIGH: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5', label: 'High' },
  LOW: { bg: 'var(--info-bg)', text: 'var(--info-text)', border: 'var(--info-border)', label: 'Low' },

  // Red / Danger
  OVERDUE: { bg: 'var(--danger-bg)', text: 'var(--danger-text)', border: 'var(--danger-border)', label: 'Overdue' },
  REJECTED: { bg: 'var(--danger-bg)', text: 'var(--danger-text)', border: 'var(--danger-border)', label: 'Rejected' },
  CANCELLED: { bg: 'var(--danger-bg)', text: 'var(--danger-text)', border: 'var(--danger-border)', label: 'Cancelled' },
  LOST: { bg: 'var(--danger-bg)', text: 'var(--danger-text)', border: 'var(--danger-border)', label: 'Lost' },

  // Neutral / Purple / Gray
  DRAFT: { bg: 'var(--bg-muted)', text: 'var(--text-muted)', border: 'var(--border-medium)', label: 'Draft' },
  NEW: { bg: 'var(--purple-bg)', text: 'var(--purple-text)', border: 'var(--purple-border)', label: 'New' },
};

export function StatusBadge({ status, text, size = 'sm' }) {
  if (!status) return null;

  const key = String(status).toUpperCase();
  const config = STATUS_CONFIG[key] || {
    bg: 'var(--bg-muted)',
    text: 'var(--text-muted)',
    border: 'var(--border-subtle)',
    label: text || status,
  };

  const displayText = text || config.label || status;
  const padding = size === 'sm' ? '0.2rem 0.55rem' : '0.35rem 0.75rem';
  const fontSize = size === 'sm' ? '0.725rem' : '0.8rem';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        borderRadius: 'var(--radius-full)',
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        padding,
        fontSize,
        whiteSpace: 'nowrap',
      }}
    >
      {displayText}
    </span>
  );
}

export default StatusBadge;
