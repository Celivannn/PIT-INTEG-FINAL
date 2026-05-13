import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || err.response?.data?.detail || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #0a1e3d 0%, #1a3a5c 100%)', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 420, boxShadow: '0 32px 80px rgba(0,0,0,0.35)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em' }}>Grand Azure</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 2, marginBottom: 20 }}>Admin Portal</div>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--blue-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 16px' }}>🔐</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>Admin Sign In</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>Restricted to authorized staff only</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="admin@grandazure.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required autoFocus />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Your password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4, fontSize: '0.9rem' }}>
            {loading ? 'Signing in...' : 'Sign In to Dashboard'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.78rem', color: 'var(--gray-400)' }}>
          Admin accounts are created via the Django management command only.
        </p>
      </div>
    </div>
  );
}
