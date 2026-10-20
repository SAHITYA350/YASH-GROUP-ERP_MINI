import React from 'react';

export function FormActions({
  children,
  align = 'right',
  style = {},
}) {
  const justify =
    align === 'left' ? 'flex-start' : align === 'center' ? 'center' : 'flex-end';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: justify,
        gap: '0.75rem',
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-subtle)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default FormActions;
