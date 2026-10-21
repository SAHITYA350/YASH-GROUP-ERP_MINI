import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  actions = null,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginBottom: '1.5rem',
      }}
    >
      {breadcrumbs.length > 0 && (
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.label || idx}>
              {idx > 0 && <ChevronRight size={12} />}
              {crumb.to ? (
                <Link to={crumb.to} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                  {crumb.label}
                </Link>
              ) : (
                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
