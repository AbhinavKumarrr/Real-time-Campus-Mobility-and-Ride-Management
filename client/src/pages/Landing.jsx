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

const HIGHLIGHTS = [
  ['Live', 'WebSocket updates'],
  ['Fast', 'Instant ride status'],
  ['Safe', 'Role-based access'],
  ['Smart', 'Campus analytics'],
];

export default function Landing() {
  const { user } = useAuth();
  const cta = user ? (user.role === 'driver' ? '/driver' : '/passenger') : '/register';

  return (
    <div className="container">
      <section className="hero">
        <div className="hero-badge">
          <span className="dot" />
          Real-time campus mobility
        </div>

        <h1 className="mt-3">
          Get around campus,
          <br />
          the smart way.
        </h1>

        <p className="mt-2">
          CampusRide connects passengers with nearby e-rickshaw drivers in real time —
          request a ride, track its status live, and rate your trip, all in one place.
        </p>

        <div className="row mt-4 wrap">
          <Link to={cta} className="btn btn-primary">
            {user ? 'Open App' : 'Get Started'}
          </Link>
          {!user && (
            <Link to="/login" className="btn btn-ghost">
              I already have an account
            </Link>
          )}
        </div>

        <div className="grid grid-4 mt-4">
          {HIGHLIGHTS.map(([value, label]) => (
            <div className="stat soft-glow" key={label}>
              <div className="value" style={{ fontSize: 22 }}>{value}</div>
              <div className="sub mt-2">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <div className="row-between wrap">
          <div>
            <h2 className="section-title">Why students and drivers will use it</h2>
            <p className="section-subtitle">
              A clean, real-time experience built for campus transport.
            </p>
          </div>
        </div>

        <div className="grid grid-3 feature-grid mt-4">
          {FEATURES.map(([icon, title, body]) => (
            <div className="card feature-card" key={title}>
              <div className="feature-icon">{icon}</div>
              <h3>{title}</h3>
              <p className="text-muted text-sm">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 grid grid-2">
        <div className="card glass">
          <div className="card-title">For passengers</div>
          <p>
            Request a ride in seconds, see live driver response, and follow every ride stage
            from start to finish.
          </p>
        </div>

        <div className="card glass">
          <div className="card-title">For drivers</div>
          <p>
            Receive nearby ride requests, manage active trips, and track performance through
            a simple dashboard.
          </p>
        </div>
      </section>
    </div>
  );
}