export default function StatCard({ label, value, sub, accent }) {
  return (
    <div className="stat">
      <div className="label">{label}</div>
      <div className="value" style={accent ? { color: accent } : undefined}>{value}</div>
      {sub ? <div className="sub">{sub}</div> : null}
    </div>
  );
}
