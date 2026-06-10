import { RIDE_STATUS_LABELS } from '../lib/constants.js';

export default function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      <span className="dot" />
      {RIDE_STATUS_LABELS[status] || status}
    </span>
  );
}
