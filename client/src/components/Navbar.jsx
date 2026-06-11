import {NavLink,useNavigate}from 'react-router-dom';
import {useAuth}from '../context/AuthContext.jsx';
import {useSocket}from '../context/SocketContext.jsx';

export default function Navbar(){
  const {user,logout}=useAuth();
  const {connected}=useSocket();
  const navigate=useNavigate();

  const handleLogout=()=>{
    logout();
    navigate('/login');
  };

  const linkClass=({isActive})=>`nav-pill ${isActive?'active':''}`;

  return(
    <nav className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="brand">
          <span className="logo">🛺</span>
          <span>CampusRide</span>
        </NavLink>

        <div className="spacer" />

        {user&&(
          <div className="nav-links">
            {user.role==='passenger'&&(
              <>
                <NavLink to="/passenger" end className={linkClass}>Book a Ride</NavLink>
                <NavLink to="/passenger/rides" className={linkClass}>My Rides</NavLink>
              </>
            )}

            {user.role==='driver'&&(
              <>
                <NavLink to="/driver" end className={linkClass}>Drive</NavLink>
                <NavLink to="/driver/dashboard" className={linkClass}>Dashboard</NavLink>
              </>
            )}

            <NavLink to="/analytics" className={linkClass}>Demand</NavLink>
          </div>
        )}

        <div className="spacer" />

        {user?(
          <div className="row wrap navbar-actions">
            <span
              className={`badge ${connected?'badge-online':'badge-offline'}`}
              title={connected?'Real-time connected':'Reconnecting…'}
            >
              <span className="dot" />
              {connected?'Live':'Offline'}
            </span>

            <span className="text-sm text-muted">
              {user.name} · {user.role}
            </span>

            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ):(
          <div className="nav-links">
            <NavLink to="/login" className={linkClass}>Login</NavLink>
            <NavLink to="/register" className="btn btn-primary btn-sm">Sign up</NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}