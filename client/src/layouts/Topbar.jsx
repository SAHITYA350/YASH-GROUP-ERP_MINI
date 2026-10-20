import React from 'react';
import { Bell, Sparkles, ShieldCheck } from 'lucide-react';

export function Topbar() {
  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left section: Module status indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary-dark)',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          <Sparkles size={13} />
          Module 6: Commercial & Accounts
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          <ShieldCheck size={13} />
          GST Compliant & Audit Ready
        </span>
      </div>

      {/* Right: Notifications & Desk Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ padding: '0.45rem', borderRadius: '50%', color: 'var(--text-muted)' }}
          title="Finance Alerts"
        >
          <Bell size={18} />
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-alt)',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
            }}
          />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Finance Desk
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            (INR &#8377;)
          </span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
