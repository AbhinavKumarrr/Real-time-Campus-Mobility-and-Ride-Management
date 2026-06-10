import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import api from '../../lib/api.js';
import StatCard from '../../components/StatCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { Stars } from '../../components/StarRating.jsx';
import { RIDE_STATUS_LABELS } from '../../lib/constants.js';

const STATUS_COLORS = {
  completed: '#22c55e', cancelled: '#ef4444', accepted: '#f59e0b',
  in_progress: '#a78bfa', requested: '#38bdf8',
};

const axisStyle = { fontSize: 12, fill: '#969db0' };

export default function DriverDashboard() {
  const [data, setData] = useState(null);
  const [rides, setRides] = useState([]);

  useEffect(() => {
    api.get('/analytics/driver').then((r) => setData(r.data));
    api.get('/rides').then((r) => setRides(r.data.rides));
  }, []);

  if (!data) return <div className="container page empty">Loading dashboard…</div>;

  const { summary, statusBreakdown, ridesPerDay, recentRatings } = data;
  const pieData = Object.entries(statusBreakdown).map(([status, count]) => ({
    name: RIDE_STATUS_LABELS[status] || status, value: count, status,
  }));

  return (
    <div className="container page">
      <h1>Driver Dashboard</h1>
      <p className="text-muted" style={{ marginTop: -4 }}>Your performance at a glance.</p>

      {/* Summary cards */}
      <div className="grid grid-4 mt-3">
        <StatCard label="Total rides" value={summary.totalRides} sub={`${summary.completedRides} completed`} />
        <StatCard label="Active rides" value={summary.activeRides} accent="#a78bfa" />
        <StatCard label="Total earnings" value={`₹${summary.earnings}`} sub={`${summary.distanceKm} km driven`} accent="#22c55e" />
        <StatCard label="Rating" value={summary.ratingAvg ? summary.ratingAvg.toFixed(2) : '—'} sub={`${summary.ratingCount} reviews`} accent="#fbbf24" />
      </div>

      {/* Charts */}
      <div className="grid grid-2 mt-3">
        <div className="card">
          <div className="card-title">Completed rides & earnings (by day)</div>
          {ridesPerDay.length === 0 ? <div className="empty">No completed rides yet.</div> : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={ridesPerDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2b303c" />
                <XAxis dataKey="date" tick={axisStyle} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={axisStyle} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#181b24', border: '1px solid #2b303c', borderRadius: 10 }} />
                <Legend />
                <Line type="monotone" dataKey="rides" stroke="#6366f1" strokeWidth={2} name="Rides" />
                <Line type="monotone" dataKey="earnings" stroke="#22c55e" strokeWidth={2} name="Earnings (₹)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-title">Ride status breakdown</div>
          {pieData.length === 0 ? <div className="empty">No rides yet.</div> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {pieData.map((d) => <Cell key={d.status} fill={STATUS_COLORS[d.status] || '#6366f1'} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#181b24', border: '1px solid #2b303c', borderRadius: 10 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent ratings */}
      <div className="card mt-3">
        <div className="card-title">Recent feedback</div>
        {recentRatings.length === 0 ? <div className="empty">No ratings yet.</div> : (
          <div className="list">
            {recentRatings.map((r) => (
              <div className="list-item" key={r._id}>
                <div className="row-between wrap">
                  <div>
                    <Stars value={r.stars} />
                    <div className="text-sm">{r.feedback || <span className="text-muted">No written feedback</span>}</div>
                  </div>
                  <div className="text-sm text-muted">{r.passenger?.name} · {new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ride history table */}
      <div className="card mt-3">
        <div className="card-title">Ride history</div>
        {rides.length === 0 ? <div className="empty">No rides yet.</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Date</th><th>Route</th><th>Passenger</th><th>Distance</th><th>Fare</th><th>Status</th></tr>
              </thead>
              <tbody>
                {rides.slice(0, 20).map((ride) => (
                  <tr key={ride._id}>
                    <td className="text-sm">{new Date(ride.requestedAt).toLocaleDateString()}</td>
                    <td className="text-sm">{ride.pickup.label} → {ride.destination.label}</td>
                    <td className="text-sm">{ride.passenger?.name || '—'}</td>
                    <td className="text-sm">{ride.distanceKm} km</td>
                    <td className="text-sm">₹{ride.fare}</td>
                    <td><StatusBadge status={ride.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
