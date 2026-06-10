import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import PassengerHome from './pages/passenger/PassengerHome.jsx';
import PassengerRides from './pages/passenger/PassengerRides.jsx';
import DriverHome from './pages/driver/DriverHome.jsx';
import DriverDashboard from './pages/driver/DriverDashboard.jsx';
import Analytics from './pages/Analytics.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/passenger" element={<ProtectedRoute role="passenger"><PassengerHome /></ProtectedRoute>} />
        <Route path="/passenger/rides" element={<ProtectedRoute role="passenger"><PassengerRides /></ProtectedRoute>} />

        <Route path="/driver" element={<ProtectedRoute role="driver"><DriverHome /></ProtectedRoute>} />
        <Route path="/driver/dashboard" element={<ProtectedRoute role="driver"><DriverDashboard /></ProtectedRoute>} />

        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
