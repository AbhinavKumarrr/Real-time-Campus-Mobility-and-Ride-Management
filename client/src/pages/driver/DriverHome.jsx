import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { CAMPUS_PLACES, findPlace } from '../../lib/constants.js';
import MapView from '../../components/MapView.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import RideProgress from '../../components/RideProgress.jsx';

export default function DriverHome() {
  const { user, refreshUser } = useAuth();
  const { socket } = useSocket();
  const toast = useToast();

  const [online, setOnline] = useState(user.isOnline);
  const [place, setPlace] = useState(user.currentLocation?.label || CAMPUS_PLACES[0].label);
  const [requests, setRequests] = useState([]);
  const [activeRide, setActiveRide] = useState(null);

  const loadRequests = useCallback(async () => {
    const { data } = await api.get('/rides/requests');
    setRequests(data.rides);
  }, []);

  const loadActive = useCallback(async () => {
    const { data } = await api.get('/rides', { params: { status: 'accepted,in_progress' } });
    setActiveRide(data.rides[0] || null);
  }, []);

  useEffect(() => {
    loadActive();
    if (online) loadRequests();
  }, [loadActive, loadRequests, online]);

  // ── Real-time wiring ──────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const onNew = (ride) => {
      setRequests((rs) => (rs.find((r) => r._id === ride._id) ? rs : [ride, ...rs]));
      toast.info('New ride request', `${ride.pickup.label} → ${ride.destination.label}`);
    };
    const onClosed = ({ rideId }) => setRequests((rs) => rs.filter((r) => r._id !== rideId));
    const onUpdated = (ride) => setActiveRide((cur) => (cur && cur._id === ride._id ? ride : cur));
    const onCancelled = (ride) => {
      setRequests((rs) => rs.filter((r) => r._id !== ride._id));
      setActiveRide((cur) => (cur && cur._id === ride._id ? null : cur));
    };
    socket.on('ride:new', onNew);
    socket.on('ride:requestClosed', onClosed);
    socket.on('ride:updated', onUpdated);
    socket.on('ride:cancelled', onCancelled);
    return () => {
      socket.off('ride:new', onNew);
      socket.off('ride:requestClosed', onClosed);
      socket.off('ride:updated', onUpdated);
      socket.off('ride:cancelled', onCancelled);
    };
  }, [socket, toast]);

  const toggleOnline = async () => {
    const next = !online;
    try {
      await api.patch('/drivers/availability', { isOnline: next });
      if (next) await api.patch('/drivers/location', findPlace(place));
      setOnline(next);
      await refreshUser();
      toast.success(next ? 'You are online' : 'You are offline', next ? 'You can now receive requests.' : '');
      if (next) loadRequests(); else setRequests([]);
    } catch (err) {
      toast.error('Could not update status', err.message);
    }
  };

  const changeLocation = async (label) => {
    setPlace(label);
    try {
      await api.patch('/drivers/location', findPlace(label));
      if (socket) socket.emit('driver:location', findPlace(label));
    } catch { /* non-fatal */ }
  };

  const accept = async (ride) => {
    try {
      const { data } = await api.patch(`/rides/${ride._id}/accept`);
      setActiveRide(data.ride);
      setRequests((rs) => rs.filter((r) => r._id !== ride._id));
      toast.success('Ride accepted', 'Head to the pickup point.');
    } catch (err) {
      toast.error('Could not accept', err.message);
      setRequests((rs) => rs.filter((r) => r._id !== ride._id));
    }
  };

  const reject = async (ride) => {
    try {
      await api.patch(`/rides/${ride._id}/reject`);
      setRequests((rs) => rs.filter((r) => r._id !== ride._id));
    } catch (err) {
      toast.error('Could not reject', err.message);
    }
  };

  const advance = async (action) => {
    try {
      const { data } = await api.patch(`/rides/${activeRide._id}/${action}`);
      if (action === 'complete') {
        setActiveRide(null);
        toast.success('Ride completed', 'Nice work!');
        await refreshUser();
      } else {
        setActiveRide(data.ride);
        toast.info('Ride started');
      }
    } catch (err) {
      toast.error('Action failed', err.message);
    }
  };

  return (
    <div className="container page">
      <div className="row-between wrap">
        <div>
          <h1 style={{ marginBottom: 2 }}>Driver Console</h1>
          <p className="text-muted" style={{ margin: 0 }}>Accept requests and manage your active ride.</p>
        </div>
        <div className="card tight" style={{ minWidth: 260 }}>
          <div className="row-between">
            <div>
              <div className="text-sm text-muted">Status</div>
              <strong style={{ color: online ? 'var(--success)' : 'var(--text-muted)' }}>
                {online ? 'Online · Available' : 'Offline'}
              </strong>
            </div>
            <button className={`btn ${online ? 'btn-danger' : 'btn-success'}`} onClick={toggleOnline}>
              {online ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
          <div className="field mt-2" style={{ marginBottom: 0 }}>
            <label>Current location</label>
            <select className="select" value={place} onChange={(e) => changeLocation(e.target.value)} disabled={!online}>
              {CAMPUS_PLACES.map((p) => <option key={p.label}>{p.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-2 mt-3">
        <div className="col">
          {/* Active ride */}
          {activeRide && (
            <div className="card">
              <div className="row-between">
                <h3 style={{ margin: 0 }}>Active ride</h3>
                <StatusBadge status={activeRide.status} />
              </div>
              <RideProgress status={activeRide.status} />
              <div className="divider" />
              <div className="row-between text-sm"><span className="text-muted">Passenger</span><strong>{activeRide.passenger?.name}</strong></div>
              <div className="row-between text-sm mt-2"><span className="text-muted">Pickup</span><strong>{activeRide.pickup.label}</strong></div>
              <div className="row-between text-sm mt-2"><span className="text-muted">Drop</span><strong>{activeRide.destination.label}</strong></div>
              <div className="row-between text-sm mt-2"><span className="text-muted">Fare</span><strong>₹{activeRide.fare}</strong></div>
              <div className="row mt-3">
                {activeRide.status === 'accepted' && <button className="btn btn-primary btn-block" onClick={() => advance('start')}>Start ride</button>}
                {activeRide.status === 'in_progress' && <button className="btn btn-success btn-block" onClick={() => advance('complete')}>Complete ride</button>}
                <button className="btn btn-danger" onClick={() => advance('cancel')}>Cancel</button>
              </div>
            </div>
          )}

          {/* Incoming requests */}
          <div className="card">
            <div className="row-between">
              <h3 style={{ margin: 0 }}>Incoming requests</h3>
              <span className="badge"><span className="dot" />{requests.length}</span>
            </div>
            {!online && <div className="empty">Go online to receive ride requests.</div>}
            {online && requests.length === 0 && <div className="empty pulse">Waiting for requests…</div>}
            <div className="list mt-3">
              {online && requests.map((ride) => (
                <div className="list-item" key={ride._id}>
                  <div className="row-between wrap">
                    <div>
                      <strong>{ride.pickup.label} → {ride.destination.label}</strong>
                      <div className="text-sm text-muted">
                        {ride.passenger?.name} · {ride.distanceKm} km · ₹{ride.fare}
                      </div>
                    </div>
                    <div className="row">
                      <button className="btn btn-success btn-sm" onClick={() => accept(ride)} disabled={!!activeRide}>Accept</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => reject(ride)}>Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card tight">
            <MapView
              pickup={activeRide?.pickup}
              destination={activeRide?.destination}
              drivers={[{ _id: user._id, name: 'You', currentLocation: findPlace(place), vehicle: user.vehicle }]}
            />
            <p className="text-sm text-muted mt-2" style={{ marginBottom: 0 }}>
              🟣 You {activeRide ? '· 🟢 Pickup · 🔴 Drop' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
