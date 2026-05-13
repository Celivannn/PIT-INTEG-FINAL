import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [form, setForm]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    getSettings().then(r => setForm(r.data)).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(form);
      toast.success('Settings saved successfully.');
    } catch (e) {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 32, color: 'var(--gray-400)' }}>Loading settings...</div>;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em' }}>Hotel Settings</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)', marginTop: 2 }}>Configure hotel information and booking policies</p>
      </div>

      <form onSubmit={handleSave} style={{ maxWidth: 720 }}>
        {/* Hotel Info */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Hotel Information</span></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label>Hotel Name</label>
              <input value={form.hotel_name || ''} onChange={e => set('hotel_name', e.target.value)} placeholder="Grand Azure Hotel" />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea rows={2} value={form.address || ''} onChange={e => set('address', e.target.value)} placeholder="Full hotel address" style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Contact Email</label>
                <input type="email" value={form.contact_email || ''} onChange={e => set('contact_email', e.target.value)} placeholder="info@hotel.com" />
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input value={form.contact_phone || ''} onChange={e => set('contact_phone', e.target.value)} placeholder="+63 912 345 6789" />
              </div>
            </div>
          </div>
        </div>

        {/* Check-in/out */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Check-In / Check-Out Times</span></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Check-In Time</label>
                <input type="time" value={form.check_in_time || '14:00'} onChange={e => set('check_in_time', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Check-Out Time</label>
                <input type="time" value={form.check_out_time || '12:00'} onChange={e => set('check_out_time', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Cancellation Policy</span></div>
          <div className="card-body">
            <div className="form-group">
              <label>Policy Text (shown to customers)</label>
              <textarea rows={4} value={form.cancellation_policy || ''} onChange={e => set('cancellation_policy', e.target.value)}
                placeholder="e.g. Customers may cancel within 24 hours of booking for Pending and Confirmed reservations..." style={{ resize: 'vertical' }} />
            </div>
          </div>
        </div>

        <button className="btn btn-primary" type="submit" disabled={saving} style={{ padding: '12px 32px', fontSize: '0.9rem' }}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
