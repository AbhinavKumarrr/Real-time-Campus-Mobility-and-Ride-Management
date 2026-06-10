import { useEffect, useState } from 'react';
import api from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { Stars, StarPicker } from '../../components/StarRating.jsx';

export default function PassengerRides() {
  const toast = useToast();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState({}); // rideId -> { stars, feedback }

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/rides');
    setRides(data.rides);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submitRating = async (ride) => {
    const r = rating[ride._id] || {};
    if (!r.stars) return toast.error('Pick a rating', 'Select 1–5 stars first.');
    try {
      await api.post('/ratings', { rideId: ride._id, stars: r.stars, feedback: r.feedback || '' });
      toast.success('Thanks for your feedback!');
      setRating((prev) => ({ ...prev, [ride._id]: undefined }));
      load();
    } catch (err) {
      toast.error('Could not submit rating', err.message);
    }
  };

  const fmt = (d) => (d ? new Date(d).toLocaleString() : '—');

  return (
    <div className="container page">
      <h1>My Rides</h1>
      <p className="text-muted" style={{ marginTop: -4 }}>Your ride history and trip ratings.</p>

      {loading ? (
        <div className="empty">Loading…</div>
      ) : rides.length === 0 ? (
        <div className="card empty">You haven’t taken any rides yet.</div>
      ) : (
        <div className="list mt-3">
          {rides.map((ride) => (
            <div className="card" key={ride._id}>
              <div className="row-between wrap">
                <div>
                  <strong>{ride.pickup.label} → {ride.destination.label}</strong>
                  <div className="text-sm text-muted">
                    {fmt(ride.requestedAt)} · {ride.distanceKm} km · ₹{ride.fare}
                    {ride.driver ? ` · Driver: ${ride.driver.name}` : ''}
                  </div>
                </div>
                <StatusBadge status={ride.status} />
              </div>

              {ride.status === 'completed' && !ride.rated && (
                <div className="list-item mt-3">
                  <div className="row-between wrap">
                    <div>
                      <div className="text-sm text-muted">Rate this ride</div>
                      <StarPicker
                        value={rating[ride._id]?.stars || 0}
                        onChange={(stars) => setRating((p) => ({ ...p, [ride._id]: { ...p[ride._id], stars } }))}
                      />
                    </div>
                    <input
                      className="input"
                      style={{ maxWidth: 280 }}
                      placeholder="Optional feedback"
                      value={rating[ride._id]?.feedback || ''}
                      onChange={(e) => setRating((p) => ({ ...p, [ride._id]: { ...p[ride._id], feedback: e.target.value } }))}
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => submitRating(ride)}>Submit</button>
                  </div>
                </div>
              )}

              {ride.rated && (
                <div className="text-sm text-muted mt-2">✓ You rated this ride.</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
