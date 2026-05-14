import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/auth';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated successfully.');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 72, background: 'var(--cream)', minHeight: '100vh' }}>

      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-mid))', padding: '48px 0 64px' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 300, color: 'white', marginBottom: 6 }}>My Profile</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Manage your personal information</p>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ maxWidth: 600, marginTop: '-32px', paddingBottom: 64 }}>
        <div className="card" style={{ padding: 0, boxShadow: 'var(--shadow-lg)' }}>

          {/* Avatar row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '28px 32px', borderBottom: '1px solid var(--gray-100)', background: 'var(--gray-50)' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--blue), var(--navy))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 700, color: 'white', flexShrink: 0,
              boxShadow: 'var(--shadow-md)'
            }}>
              {user?.full_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--navy)' }}>{user?.full_name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--gray-400)', marginTop: 2 }}>{user?.email}</div>
              <span className="badge" style={{ marginTop: 6, background: 'rgba(201,168,76,0.12)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.3)' }}>
                ✦ Member
              </span>
            </div>
          </div>

          {/* Form */}
          <div style={{ padding: '32px' }}>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray-400)', fontWeight: 500, marginBottom: 20 }}>
              Personal Information
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  placeholder="Your full name"
                  value={form.full_name}
                  onChange={e => set('full_name', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input value={user?.email} disabled style={{ background: 'var(--gray-50)', color: 'var(--gray-400)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Email cannot be changed</span>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  placeholder="+63 912 345 6789"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                />
              </div>

              <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 20, marginTop: 4 }}>
                <button className="btn btn-primary" type="submit" disabled={loading} style={{ padding: '11px 28px' }}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}