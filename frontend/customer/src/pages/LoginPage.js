import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import toast from 'react-hot-toast';
import OTPVerification from '../components/OTPVerification'; // We'll create this

export default function LoginPage() {
  const { login, user: authUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}!`);
      navigate(searchParams.get('next') || '/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth handler with OTP ────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        'http://localhost:8000/api/auth/google/',
        { token: credentialResponse.credential },
        { withCredentials: true }
      );
      
      // Check if verification is required (first time user)
      if (data.requires_verification) {
        setPendingEmail(data.email);
        setShowOTP(true);
        toast.success('Verification code sent to your email!');
      } else {
        // Already verified user - login directly
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success(`Welcome, ${data.user.full_name || data.user.email}!`);
        window.location.href = searchParams.get('next') || '/';
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign-in was cancelled or failed.');
  };

  const handleOTPVerified = (userData) => {
    localStorage.setItem('access_token', userData.access);
    localStorage.setItem('user', JSON.stringify(userData.user));
    toast.success('Email verified successfully!');
    window.location.href = searchParams.get('next') || '/';
  };

  // Show OTP verification screen if needed
  if (showOTP) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #0a1e3d 0%, #1a3a5c 100%)' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 440, boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>
            <OTPVerification 
              email={pendingEmail}
              onVerified={handleOTPVerified}
              onBack={() => setShowOTP(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  // Normal login screen
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #0a1e3d 0%, #1a3a5c 100%)' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 440, boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32, textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--navy)' }}>Grand Azure</span>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.18em', color: 'var(--gold)', textTransform: 'uppercase' }}>Hotel & Resort</span>
          </Link>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--navy)', marginBottom: 6, textAlign: 'center' }}>Welcome Back</h2>
          <p style={{ color: 'var(--gray-400)', fontSize: '0.88rem', textAlign: 'center', marginBottom: 28 }}>Sign in to manage your reservations</p>

          {/* ── Divider ───────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
            <span style={{ fontSize: '0.82rem', color: 'var(--gray-400)', fontWeight: 500 }}>or sign in with email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
          </div>

          {/* ── Email/Password Form ───────────────────────────────────────── */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Your password"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '13px' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: 'var(--gray-600)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--blue)', fontWeight: 600 }}>Create one</Link>
          </p>

          {/* ── Google Sign In Button at Bottom ─────────────────────────────────── */}
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              width="50"
              text="signin_with"
              shape="circle"
              logo_alignment="center"
            />
          </div>
        </div>
      </div>
    </div>
  );
}