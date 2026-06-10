import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api.js';
import { useSocket } from '../../context/SocketContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { CAMPUS_PLACES, findPlace } from '../../lib/constants.js';
import MapView from '../../components/MapView.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import RideProgress from '../../components/RideProgress.jsx';
import { Stars } from '../../components/StarRating.jsx';

const ACTIVE = ['requested', 'accepted', 'in_progress'];

export default function PassengerHome() {
  const { socket } = useSocket();
  const toast = useToast();
  const [drivers, setDrivers] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [pickup, setPickup] = useState(CAMPUS_PLACES[0].label);
  const [destination, setDestination] = useState(CAMPUS_PLACES[2].label);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const loadDrivers = useCallback(async () => {
    const { data } = await api.get('/drivers/available');
    setDrivers(data.drivers);
  }, []);

  const loadActive = useCallback(async () => {
    const { data } = await api.get('/rides', { params: { status: ACTIVE.join(',') } });
    setActiveRide(data.rides[0] || null);
  }, []);

  useEffect(() => {
    loadDrivers();
    loadActive();
  }, [loadDrivers, loadActive]);

  // ── Real-time wiring ──────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onAssigned = (ride) => {
      setActiveRide(ride);
      toast.success('Driver assigned!', `${ride.driver?.name} is on the way.`);
    };
    const onUpdated = (ride) => {
      setActiveRide((cur) => (cur && cur._id === ride._id ? ride : cur));
      if (ride.status === 'in_progress') toast.info('Ride started', 'Enjoy your trip!');
      if (ride.status === 'completed') {
        toast.success('Ride completed', 'Please rate your driver from “My Rides”.');
        setActiveRide(null);
      }
    };
    const onCancelled = (ride) => {
      setActiveRide((cur) => (cur && cur._id === ride._id ? null : cur));
      toast.error('Ride cancelled', `Cancelled by ${ride.cancelledBy || 'system'}.`);
    };
    const onAvailability = () => loadDrivers();
    const onLocation = (loc) =>
      setDrivers((ds) =>
        ds.map((d) => (String(d._id) === String(loc.driverId)
          ? { ...d, currentLocation: { lat: loc.lat, lng: loc.lng } } : d))
      );

    socket.on('ride:assigned', onAssigned);
    socket.on('ride:updated', onUpdated);
    socket.on('ride:cancelled', onCancelled);
    socket.on('driver:availability', onAvailability);
    socket.on('driver:location', onLocation);
    return () => {
      socket.off('ride:assigned', onAssigned);
      socket.off('ride:updated', onUpdated);
      socket.off('ride:cancelled', onCancelled);
      socket.off('driver:availability', onAvailability);
      socket.off('driver:location', onLocation);
    };
  }, [socket, toast, loadDrivers]);

  // Join the active ride's room for targeted updates.
  useEffect(() => {
    if (!socket || !activeRide) return;
    socket.emit('ride:join', activeRide._id);
    return () => socket.emit('ride:leave', activeRide._id);
  }, [socket, activeRide?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const requestRide = async (e) => {
    e.preventDefault();
    if (pickup === destination) return toast.error('Invalid trip', 'Pickup and destination must differ.');
    setBusy(true);
    try {
      const { data } = await api.post('/rides', {
        pickup: findPlace(pickup),
        destination: findPlace(destination),
        notes,
      });
      setActiveRide(data.ride);
      toast.success('Ride requested', 'Looking for a nearby driver…');
      setNotes('');
    } catch (err) {
      toast.error('Could not request ride', err.message);
    } finally {
      setBusy(false);
    }
  };

  const cancelRide = async () => {
    try {
      await api.patch(`/rides/${activeRide._id}/cancel`);
      setActiveRide(null);
      toast.info('Ride cancelled');
    } catch (err) {
      toast.error('Could not cancel', err.message);
    }
  };

  const mapPickup = activeRide ? activeRide.pickup : findPlace(pickup);
  const mapDest = activeRide ? activeRide.destination : findPlace(destination);
  const mapDrivers = activeRide?.driver ? [activeRide.driver] : drivers;

  return (
    <div className="container page">
      <h1>Book a Ride</h1>
      <p className="text-muted" style={{ marginTop: -4 }}>Request a campus e-rickshaw and track it live.</p>

      <div className="grid grid-2 mt-3">
        {/* Left column: request / active ride */}
        <div className="col">
          {activeRide ? (
            <div className="card">
              <div className="row-between">
                <h3 style={{ margin: 0 }}>Your current ride</h3>
                <StatusBadge status={activeRide.status} />
              </div>
              <RideProgress status={activeRide.status} />
              <div className="divider" />
              <div className="row-between text-sm">
                <span className="text-muted">From</span><strong>{activeRide.pickup.label}</strong>
              </div>
              <div className="row-between text-sm mt-2">
                <span className="text-muted">To</span><strong>{activeRide.destination.label}</strong>
              </div>
              <div className="row-between text-sm mt-2">
                <span className="text-muted">Distance / Fare</span>
                <strong>{activeRide.distanceKm} km · ₹{activeRide.fare}</strong>
              </div>

              {activeRide.driver && (
                <div className="list-item mt-3">
                  <div className="row-between">
                    <div>
                      <strong>{activeRide.driver.name}</strong>
                      <div className="text-sm text-muted">
                        {activeRide.driver.vehicle?.type} · {activeRide.driver.vehicle?.plateNumber}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Stars value={activeRide.driver.ratingAvg} />
                      <div className="text-sm text-muted">{activeRide.driver.phone || '—'}</div>
                    </div>
                  </div>
                </div>
              )}

              {activeRide.status === 'requested' && (
                <p className="text-sm text-muted mt-3 pulse">⏳ Waiting for a driver to accept…</p>
              )}
              {['requested', 'accepted'].includes(activeRide.status) && (
                <button className="btn btn-danger btn-block mt-3" onClick={cancelRide}>Cancel ride</button>
              )}
            </div>
          ) : (
            <form className="card" onSubmit={requestRide}>
              <h3 style={{ marginTop: 0 }}>Where to?</h3>
              <div className="field">
                <label>Pickup location</label>
                <select className="select" value={pickup} onChange={(e) => setPickup(e.target.value)}>
                  {CAMPUS_PLACES.map((p) => <option key={p.label}>{p.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Destination</label>
                <select className="select" value={destination} onChange={(e) => setDestination(e.target.value)}>
                  {CAMPUS_PLACES.map((p) => <option key={p.label}>{p.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Notes (optional)</label>
                <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. I have luggage" />
              </div>
              <button className="btn btn-primary btn-block" disabled={busy}>
                {busy ? 'Requesting…' : 'Request ride'}
              </button>
            </form>
          )}

          {/* Available drivers */}
          <div className="card">
            <div className="row-between">
              <h3 style={{ margin: 0 }}>Available drivers</h3>
              <span className="badge badge-online"><span className="dot" />{drivers.length} online</span>
            </div>
            <div className="list mt-3">
              {drivers.length === 0 && <div className="empty">No drivers online right now.</div>}
              {drivers.map((d) => (
                <div className="list-item" key={d._id}>
                  <div className="row-between">
                    <div>
                      <strong>{d.name}</strong>
                      <div className="text-sm text-muted">{d.vehicle?.type} · {d.vehicle?.color} · {d.vehicle?.plateNumber}</div>
                    </div>
                    <Stars value={d.ratingAvg} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: live map */}
        <div className="col">
          <div className="card tight">
            <MapView pickup={mapPickup} destination={mapDest} drivers={mapDrivers} />
            <p className="text-sm text-muted mt-2" style={{ marginBottom: 0 }}>
              🟢 Pickup &nbsp; 🔴 Destination &nbsp; 🟣 Driver
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
