import React, { useState } from 'react';
import { exportReport } from '../api';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const today     = new Date().toISOString().split('T')[0];
  const firstDay  = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const [form, setForm]       = useState({ date_from: firstDay, date_to: today, status: '', format: 'csv' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleExport = async () => {
    setLoading(true);
    try {
      const { data, headers } = await exportReport({ ...form });
      const contentType = headers['content-type'];
      const blob = new Blob([data], { type: contentType });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `bookings_${form.date_from}_${form.date_to}.${form.format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Report exported as ${form.format.toUpperCase()}`);
    } catch (e) {
      toast.error('Export failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const presets = [
    { label: 'This Month', from: firstDay, to: today },
    { label: 'Last 7 Days', from: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0], to: today },
    { label: 'Last 30 Days', from: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0], to: today },
    { label: 'This Year', from: `${new Date().getFullYear()}-01-01`, to: today },
  ];

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em' }}>Reports & Export</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)', marginTop: 2 }}>Export booking data as CSV or PDF</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Export config */}
        <div className="card">
          <div className="card-header"><span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Export Configuration</span></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Date presets */}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Quick Select</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {presets.map(p => (
                  <button key={p.label} className="btn btn-sm btn-outline" onClick={() => setForm(f => ({ ...f, date_from: p.from, date_to: p.to }))}
                    style={{ fontSize: '0.78rem' }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Date From</label>
                <input type="date" value={form.date_from} onChange={e => set('date_from', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Date To</label>
                <input type="date" value={form.date_to} onChange={e => set('date_to', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Filter by Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked_in">Checked In</option>
                <option value="checked_out">Checked Out</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group">
              <label>Export Format</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['csv', 'pdf'].map(fmt => (
                  <label key={fmt} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '10px 16px', borderRadius: 8, border: `1.5px solid ${form.format === fmt ? 'var(--blue)' : 'var(--gray-200)'}`, background: form.format === fmt ? 'var(--blue-pale)' : 'white', flex: 1, justifyContent: 'center', fontWeight: 600, fontSize: '0.85rem', color: form.format === fmt ? 'var(--blue)' : 'var(--gray-600)' }}>
                    <input type="radio" name="format" value={fmt} checked={form.format === fmt} onChange={() => set('format', fmt)} style={{ display: 'none' }} />
                    {fmt === 'csv' ? '📊 CSV' : '📄 PDF'}
                  </label>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleExport} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.9rem', marginTop: 4 }}>
              {loading ? 'Generating...' : `⬇ Export ${form.format.toUpperCase()}`}
            </button>
          </div>
        </div>

        {/* Info panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>What's Included</div>
            {[
              ['Booking Reference', 'Unique HR-YYYYMMDD-XXXX identifier'],
              ['Guest Information', 'Name and email of the customer'],
              ['Room Details', 'Room number and type category'],
              ['Stay Dates', 'Check-in, check-out, and night count'],
              ['Pricing', 'Price per night and total amount'],
              ['Status', 'Current reservation status'],
              ['Booking Date', 'When the reservation was created'],
            ].map(([label, desc]) => (
              <div key={label} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--success)', fontSize: '0.85rem', marginTop: 1, flexShrink: 0 }}>✓</span>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)' }}>{label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 20, background: 'var(--blue-pale)', border: '1px solid #bfdbfe' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--blue)', marginBottom: 6 }}>💡 Tip</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--blue)', lineHeight: 1.6 }}>
              The export reflects the current filters you've set. Use the Status filter to export only specific booking types, e.g. export only "Checked Out" records for revenue accounting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
