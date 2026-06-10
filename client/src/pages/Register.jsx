import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState('passenger');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    vehicleType: 'e-rickshaw', vehicleModel: '', plateNumber: '', color: '', licenseNumber: '',
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        name: form.name, email: form.email, phone: form.phone, password: form.password, role,
      };
      if (role === 'driver') {
        payload.vehicle = {
          type: form.vehicleType, model: form.vehicleModel,
          plateNumber: form.plateNumber, color: form.color,
        };
        payload.verification = { licenseNumber: form.licenseNumber };
      }
      const user = await register(payload);
      toast.success('Account created', `Welcome, ${user.name}!`);
      navigate(user.role === 'driver' ? '/driver' : '/passenger');
    } catch (err) {
      toast.error('Registration failed', err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h2>Create your account</h2>
        <p className="text-muted text-sm">Join CampusRide as a passenger or a driver.</p>

        <div className="role-toggle mt-3">
          <button type="button" className={role === 'passenger' ? 'active' : ''} onClick={() => setRole('passenger')}>🧑‍🎓 Passenger</button>
          <button type="button" className={role === 'driver' ? 'active' : ''} onClick={() => setRole('driver')}>🛺 Driver</button>
        </div>

        <form onSubmit={submit} className="mt-3">
          <div className="field">
            <label>Full name</label>
            <input className="input" required value={form.name} onChange={set('name')} placeholder="Your name" />
          </div>
          <div className="grid grid-2" style={{ gap: 0, gridTemplateColumns: '1fr 1fr', columnGap: 12 }}>
            <div className="field">
              <label>Email</label>
              <input className="input" type="email" required value={form.email} onChange={set('email')} placeholder="you@iitr.ac.in" />
            </div>
            <div className="field">
              <label>Phone</label>
              <input className="input" value={form.phone} onChange={set('phone')} placeholder="9XXXXXXXXX" />
            </div>
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" required minLength={6} value={form.password} onChange={set('password')} placeholder="At least 6 characters" />
          </div>

          {role === 'driver' && (
            <>
              <div className="divider" />
              <p className="text-sm text-muted" style={{ marginTop: 0 }}>Vehicle & verification</p>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', columnGap: 12, gap: 0 }}>
                <div className="field">
                  <label>Vehicle type</label>
                  <select className="select" value={form.vehicleType} onChange={set('vehicleType')}>
                    <option value="e-rickshaw">E-Rickshaw</option>
                    <option value="auto">Auto</option>
                    <option value="cab">Cab</option>
                    <option value="bike">Bike</option>
                  </select>
                </div>
                <div className="field">
                  <label>Model</label>
                  <input className="input" value={form.vehicleModel} onChange={set('vehicleModel')} placeholder="Mahindra Treo" />
                </div>
                <div className="field">
                  <label>Plate number</label>
                  <input className="input" value={form.plateNumber} onChange={set('plateNumber')} placeholder="UK07 1234" />
                </div>
                <div className="field">
                  <label>Colour</label>
                  <input className="input" value={form.color} onChange={set('color')} placeholder="Green" />
                </div>
              </div>
              <div className="field">
                <label>Driving licence number</label>
                <input className="input" value={form.licenseNumber} onChange={set('licenseNumber')} placeholder="DL-UK-123456" />
              </div>
            </>
          )}

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Creating…' : `Sign up as ${role}`}
          </button>
        </form>

        <p className="text-sm mt-3" style={{ margin: 0 }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
