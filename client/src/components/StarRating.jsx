import { useState } from 'react';

/** Read-only star display. */
export function Stars({ value = 0, size = 16 }) {
  const full = Math.round(value);
  return (
    <span className="stars" style={{ fontSize: size }} title={`${value} / 5`}>
      {'★'.repeat(full)}
      <span style={{ color: 'var(--border)' }}>{'★'.repeat(5 - full)}</span>
    </span>
  );
}

/** Interactive star picker. */
export function StarPicker({ value, onChange, size = 28 }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div style={{ fontSize: size, cursor: 'pointer', userSelect: 'none' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          style={{ color: n <= active ? '#fbbf24' : 'var(--border)', marginRight: 4 }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
