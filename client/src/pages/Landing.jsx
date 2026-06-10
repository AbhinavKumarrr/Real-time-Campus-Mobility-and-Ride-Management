import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const FEATURES = [
  ['⚡', 'Real-Time Matching', 'Live ride requests and driver responses powered by WebSockets — no refreshing.'],
  ['🗺️', 'Campus Map', 'See available e-rickshaws, pickup and drop points on an interactive map.'],
  ['🔄', 'Full Ride Lifecycle', 'Requested → Accepted → In Progress → Completed, kept in sync for everyone.'],
  ['📊', 'Driver Insights', 'Dashboards with earnings, ratings, ride history and demand analytics.'],
  ['⭐', 'Ratings & Feedback', 'Passengers rate completed rides; drivers build a reputation.'],
  ['🔒', 'Secure Auth', 'JWT-based authentication with separate passenger and driver roles.'],
];

export default function Landing() {
  const { user } = useAuth();
  const cta = user ? (user.role === 'driver' ? '/driver' : '/passenger') : '/register';

  return (
    <div className="container">
      <section className="hero">
        <span className="badge badge-online"><span className="dot" /> Real-time campus mobility</span>
        <h1 className="mt-3">Get around campus,<br />the smart way.</h1>
        <p className="mt-2">
          CampusRide connects passengers with nearby e-rickshaw drivers in real time —
          request a ride, track its status live, and rate your trip, all in one place.
        </p>
        <div className="row mt-4">
          <Link to={cta} className="btn btn-primary">{user ? 'Open App' : 'Get Started'}</Link>
          {!user && <Link to="/login" className="btn btn-ghost">I already have an account</Link>}
        </div>
      </section>

      <section className="grid grid-3 feature-grid">
        {FEATURES.map(([icon, title, body]) => (
          <div className="card" key={title}>
            <div style={{ fontSize: 26 }}>{icon}</div>
            <h3 className="mt-2">{title}</h3>
            <p className="text-muted text-sm" style={{ margin: 0 }}>{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
