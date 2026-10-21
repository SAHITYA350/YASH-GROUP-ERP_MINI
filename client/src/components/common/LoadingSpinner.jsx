import React from 'react';

export function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const pixelSize = size === 'sm' ? 18 : size === 'lg' ? 40 : 28;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        gap: '0.75rem',
        color: 'var(--text-muted)',
      }}
    >
      <div
        style={{
          width: pixelSize,
          height: pixelSize,
          border: '3px solid var(--border-subtle)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite',
        }}
      />
      {text && <span style={{ fontSize: '0.85rem' }}>{text}</span>}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default LoadingSpinner;
