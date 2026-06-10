import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="container page text-center text-muted">Loading…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    // Send users to their own home if they hit the wrong area.
    return <Navigate to={user.role === 'driver' ? '/driver' : '/passenger'} replace />;
  }
  return children;
}
