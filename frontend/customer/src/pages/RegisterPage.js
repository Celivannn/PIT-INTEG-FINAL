import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', full_name: '', phone: '', password: '', password2: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) { toast.error('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      const errors = err.response?.data;
      const msg = errors?.email?.[0] || errors?.password?.[0] || errors?.detail || 'Registration failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #0a1e3d 0%, #1a3a5c 100%)' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 480, boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>
          <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--navy)' }}>Grand Azure</span>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.18em', color: 'var(--gold)', textTransform: 'uppercase' }}>Hotel & Resort</span>
          </Link>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--navy)', marginBottom: 6, textAlign: 'center' }}>Create Account</h2>
          <p style={{ color: 'var(--gray-400)', fontSize: '0.88rem', textAlign: 'center', marginBottom: 32 }}>Join us for a seamless booking experience</p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label>Full Name</label>
              <input placeholder="Juan dela Cruz" value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Phone Number (optional)</label>
              <input placeholder="+63 912 345 6789" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Min 8 characters" value={form.password} onChange={e => set('password', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" placeholder="Repeat password" value={form.password2} onChange={e => set('password2', e.target.value)} required />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '13px' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: 'var(--gray-600)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
