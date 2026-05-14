import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import toast from 'react-hot-toast';

function getStrength(pwd) {
  if (!pwd) return null;
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  const map = [null,
    { level: 1, label: 'Weak',   color: '#ef4444' },
    { level: 2, label: 'Fair',   color: '#f97316' },
    { level: 3, label: 'Good',   color: '#eab308' },
    { level: 4, label: 'Strong', color: '#22c55e' },
  ];
  return map[s] ?? map[4];
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', full_name: '', phone: '', password: '', password2: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const strength = getStrength(form.password);
  const matched  = form.password2 && form.password === form.password2;
  const mismatch = form.password2 && form.password !== form.password2;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) { toast.error('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      const d = err.response?.data;
      toast.error(d?.email?.[0] || d?.password?.[0] || d?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="card" style={{ padding: '48px 40px', width: '100%', maxWidth: 480, boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--navy)' }}>Grand Azure</span>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.18em', color: 'var(--gold)', textTransform: 'uppercase' }}>Hotel & Resort</span>
          </Link>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--navy)', textAlign: 'center', marginBottom: 6 }}>Create Account</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--gray-400)', textAlign: 'center', marginBottom: 28 }}>Join us for a seamless booking experience</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Full Name */}
            <div className="form-group">
              <label>Full Name</label>
              <input placeholder="Juan dela Cruz" value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
            </div>

            {/* Email */}
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label>Phone Number <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional)</span></label>
              <input placeholder="+63 912 345 6789" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>

            {/* Password row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Min 8 characters"
                    style={{ paddingRight: 40, width: '100%' }}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)} tabIndex={-1}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-400)', fontSize: '0.9rem' }}>
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
                {/* Strength bar */}
                {strength && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1,2,3,4].map(n => (
                        <div key={n} style={{ flex: 1, height: 3, borderRadius: 4, background: n <= strength.level ? strength.color : 'var(--gray-200)', transition: 'background 0.3s' }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: strength.color, marginTop: 3, display: 'block' }}>{strength.label}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPwd2 ? 'text' : 'password'}
                    placeholder="Repeat password"
                    style={{ paddingRight: 40, width: '100%' }}
                    value={form.password2}
                    onChange={e => set('password2', e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPwd2(v => !v)} tabIndex={-1}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-400)', fontSize: '0.9rem' }}>
                    {showPwd2 ? '🙈' : '👁️'}
                  </button>
                </div>
                {matched  && <span style={{ fontSize: '0.72rem', color: '#22c55e', marginTop: 3, display: 'block' }}>✓ Passwords match</span>}
                {mismatch && <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: 3, display: 'block' }}>✗ Passwords don't match</span>}
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '13px' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: 'var(--gray-600)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}