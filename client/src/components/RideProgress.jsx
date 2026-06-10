import { RIDE_FLOW, RIDE_STATUS_LABELS } from '../lib/constants.js';

/** Horizontal stepper showing where a ride is in its lifecycle. */
export default function RideProgress({ status }) {
  if (status === 'cancelled') {
    return <div className="badge badge-cancelled" style={{ marginTop: 4 }}><span className="dot" />Ride cancelled</div>;
  }
  const currentIndex = RIDE_FLOW.indexOf(status);
  return (
    <div className="row" style={{ gap: 0, marginTop: 8 }}>
      {RIDE_FLOW.map((step, i) => {
        const done = i <= currentIndex;
        return (
          <div key={step} className="row" style={{ gap: 0, flex: i < RIDE_FLOW.length - 1 ? 1 : 'none' }}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 26, height: 26, borderRadius: '50%', display: 'grid', placeItems: 'center',
                  background: done ? 'var(--primary)' : 'var(--surface-2)',
                  border: `1px solid ${done ? 'var(--primary)' : 'var(--border)'}`,
                  color: done ? '#fff' : 'var(--text-muted)', fontSize: 13, fontWeight: 700,
                }}
              >
                {done ? '✓' : i + 1}
              </div>
              <div className="text-sm" style={{ marginTop: 4, color: done ? 'var(--text)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {RIDE_STATUS_LABELS[step]}
              </div>
            </div>
            {i < RIDE_FLOW.length - 1 && (
              <div style={{ flex: 1, height: 2, margin: '0 6px', background: i < currentIndex ? 'var(--primary)' : 'var(--border)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
