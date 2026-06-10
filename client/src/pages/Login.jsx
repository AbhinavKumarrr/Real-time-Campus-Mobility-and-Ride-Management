import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Welcome back!', user.name);
      navigate(user.role === 'driver' ? '/driver' : '/passenger');
    } catch (err) {
      toast.error('Login failed', err.message);
    } finally {
      setBusy(false);
    }
  };

  const fill = (email) => setForm({ email, password: 'password123' });

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h2>Sign in</h2>
        <p className="text-muted text-sm">Access your CampusRide account.</p>

        <form onSubmit={submit} className="mt-3">
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@iitr.ac.in" />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="divider" />
        <p className="text-sm text-muted" style={{ margin: 0 }}>Try a demo account:</p>
        <div className="row mt-2 wrap">
          <button className="btn btn-ghost btn-sm" onClick={() => fill('ananya@iitr.ac.in')}>Passenger demo</button>
          <button className="btn btn-ghost btn-sm" onClick={() => fill('suresh@iitr.ac.in')}>Driver demo</button>
        </div>

        <p className="text-sm mt-3" style={{ margin: 0 }}>
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
