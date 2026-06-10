import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area,
} from 'recharts';
import api from '../lib/api.js';
import StatCard from '../components/StatCard.jsx';

const axisStyle = { fontSize: 12, fill: '#969db0' };
const tooltipStyle = { background: '#181b24', border: '1px solid #2b303c', borderRadius: 10 };

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/analytics/demand').then((r) => setData(r.data));
  }, []);

  if (!data) return <div className="container page empty">Loading analytics…</div>;

  const { peakHours, popularPickups, dailyVolume, statusTotals } = data;
  const totalRides = Object.values(statusTotals).reduce((a, b) => a + b, 0);
  const busiest = [...peakHours].sort((a, b) => b.rides - a.rides)[0];
  const topPickup = popularPickups[0];

  return (
    <div className="container page">
      <h1>Demand Analytics</h1>
      <p className="text-muted" style={{ marginTop: -4 }}>
        Campus-wide ride demand insights — useful for planning driver supply. <span className="badge">Bonus feature</span>
      </p>

      <div className="grid grid-4 mt-3">
        <StatCard label="Total rides" value={totalRides} />
        <StatCard label="Completed" value={statusTotals.completed || 0} accent="#22c55e" />
        <StatCard label="Peak hour" value={busiest ? `${busiest.hour}:00` : '—'} sub={busiest ? `${busiest.rides} rides` : ''} accent="#f59e0b" />
        <StatCard label="Top pickup" value={topPickup ? topPickup.rides : 0} sub={topPickup ? topPickup.location : ''} accent="#38bdf8" />
      </div>

      <div className="grid grid-2 mt-3">
        <div className="card">
          <div className="card-title">Peak demand hours (rides by hour of day)</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2b303c" />
              <XAxis dataKey="hour" tick={axisStyle} tickFormatter={(h) => `${h}h`} interval={1} />
              <YAxis tick={axisStyle} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(h) => `${h}:00 – ${h + 1}:00`} />
              <Bar dataKey="rides" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">Daily ride volume</div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailyVolume}>
              <defs>
                <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2b303c" />
              <XAxis dataKey="date" tick={axisStyle} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={axisStyle} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="rides" stroke="#22c55e" strokeWidth={2} fill="url(#vol)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-title">Popular pickup locations</div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={popularPickups} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2b303c" />
            <XAxis type="number" tick={axisStyle} allowDecimals={false} />
            <YAxis type="category" dataKey="location" tick={axisStyle} width={180} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="rides" fill="#38bdf8" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
