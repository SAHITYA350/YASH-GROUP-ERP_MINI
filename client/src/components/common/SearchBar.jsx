import React from 'react';
import { Search, X } from 'lucide-react';

export function SearchBar({
  value = '',
  onChange,
  placeholder = 'Search records...',
  onClear,
  style = {},
}) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: '320px',
        ...style,
      }}
    >
      <Search
        size={16}
        style={{
          position: 'absolute',
          left: '0.75rem',
          color: 'var(--text-subtle)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="form-input"
        style={{
          paddingLeft: '2.25rem',
          paddingRight: value ? '2rem' : '0.75rem',
          height: '36px',
          fontSize: '0.85rem',
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          style={{
            position: 'absolute',
            right: '0.6rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            color: 'var(--text-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
