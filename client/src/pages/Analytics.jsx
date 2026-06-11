import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import api from '../lib/api.js';
import StatCard from '../components/StatCard.jsx';

const axisStyle = { fontSize: 12, fill: '#a2abba' };
const tooltipStyle = {
  background: 'rgba(24, 27, 36, 0.98)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  color: '#edf0f7',
  boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
};

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/analytics/demand').then((r) => setData(r.data));
  }, []);

  const summary = useMemo(() => {
    if (!data) return null;
    const { peakHours = [], popularPickups = [], dailyVolume = [], statusTotals = {} } = data;
    const totalRides = Object.values(statusTotals).reduce((a, b) => a + b, 0);
    const busiest = [...peakHours].sort((a, b) => b.rides - a.rides)[0];
    const topPickup = popularPickups[0];

    return { peakHours, popularPickups, dailyVolume, statusTotals, totalRides, busiest, topPickup };
  }, [data]);

  if (!summary) return <div className="container page empty">Loading analytics…</div>;

  const { peakHours, popularPickups, dailyVolume, statusTotals, totalRides, busiest, topPickup } = summary;

  return (
    <div className="container page">
      <div className="row-between wrap">
        <div>
          <div className="hero-badge">
            <span className="dot" />
            Bonus feature
          </div>
          <h1 className="mt-3">Demand Analytics</h1>
          <p className="section-subtitle">
            Campus-wide ride demand insights — useful for planning driver supply and improving response time.
          </p>
        </div>

        <div className="badge badge-online">
          <span className="dot" />
          Live data
        </div>
      </div>

      <div className="grid grid-4 mt-4">
        <StatCard label="Total rides" value={totalRides} />
        <StatCard label="Completed" value={statusTotals.completed || 0} accent="#22c55e" />
        <StatCard
          label="Peak hour"
          value={busiest ? `${busiest.hour}:00` : '—'}
          sub={busiest ? `${busiest.rides} rides` : ''}
          accent="#f59e0b"
        />
        <StatCard
          label="Top pickup"
          value={topPickup ? topPickup.rides : 0}
          sub={topPickup ? topPickup.location : ''}
          accent="#38bdf8"
        />
      </div>

      <div className="grid grid-2 mt-4">
        <div className="card soft-glow">
          <div className="card-title">Peak demand hours</div>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="hour" tick={axisStyle} tickFormatter={(h) => `${h}h`} interval={1} />
              <YAxis tick={axisStyle} allowDecimals={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(h) => `${h}:00 – ${h + 1}:00`}
              />
              <Bar dataKey="rides" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card soft-glow">
          <div className="card-title">Daily ride volume</div>
          <ResponsiveContainer width="100%" height={290}>
            <AreaChart data={dailyVolume}>
              <defs>
                <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="date" tick={axisStyle} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={axisStyle} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="rides" stroke="#22c55e" strokeWidth={2} fill="url(#vol)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card mt-4 soft-glow">
        <div className="card-title">Popular pickup locations</div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={popularPickups} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis type="number" tick={axisStyle} allowDecimals={false} />
            <YAxis type="category" dataKey="location" tick={axisStyle} width={180} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="rides" fill="#38bdf8" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}