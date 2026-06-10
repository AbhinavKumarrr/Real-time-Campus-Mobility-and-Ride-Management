import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="brand">
          <span className="logo">🛺</span> CampusRide
        </NavLink>

        <div className="spacer" />

        {user && (
          <div className="nav-links">
            {user.role === 'passenger' && (
              <>
                <NavLink to="/passenger" end>Book a Ride</NavLink>
                <NavLink to="/passenger/rides">My Rides</NavLink>
              </>
            )}
            {user.role === 'driver' && (
              <>
                <NavLink to="/driver" end>Drive</NavLink>
                <NavLink to="/driver/dashboard">Dashboard</NavLink>
              </>
            )}
            <NavLink to="/analytics">Demand</NavLink>
          </div>
        )}

        <div className="spacer" />

        {user ? (
          <div className="row">
            <span
              className={`badge ${connected ? 'badge-online' : 'badge-offline'}`}
              title={connected ? 'Real-time connected' : 'Reconnecting…'}
            >
              <span className="dot" /> {connected ? 'Live' : 'Offline'}
            </span>
            <span className="text-sm text-muted">{user.name} · {user.role}</span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div className="nav-links">
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register" className="btn btn-primary btn-sm" style={{ color: '#fff' }}>Sign up</NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}
