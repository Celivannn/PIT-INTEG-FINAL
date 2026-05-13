import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/auth';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated successfully.');
    } catch (e) {
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 72 }}>
      <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-mid))', padding: '48px 0 64px' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 300, color: 'white' }}>My Profile</h1>
        </div>
      </div>
      <div className="container" style={{ maxWidth: 600, marginTop: 32, paddingBottom: 64 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--gray-100)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
              {user?.full_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--navy)' }}>{user?.full_name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>{user?.email}</div>
            </div>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label>Full Name</label>
              <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input value={user?.email} disabled style={{ background: 'var(--gray-50)', color: 'var(--gray-400)' }} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ alignSelf: 'flex-start', padding: '11px 28px' }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
