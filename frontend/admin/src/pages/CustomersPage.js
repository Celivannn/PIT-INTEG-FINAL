import React, { useState, useEffect } from 'react';
import { getCustomers, getCustomer } from '../api';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch]       = useState('');

  useEffect(() => { getCustomers().then(r => setCustomers(r.data)).finally(() => setLoading(false)); }, []);

  const openCustomer = (id) => {
    setDetailLoading(true);
    setSelected({ id });
    getCustomer(id).then(r => setSelected(r.data)).finally(() => setDetailLoading(false));
  };

  const filtered = customers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const STATUS_COLORS = { pending: '#f59e0b', confirmed: '#3b82f6', checked_in: '#10b981', checked_out: '#94a3b8', cancelled: '#ef4444' };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em' }}>Customers</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)', marginTop: 2 }}>Registered guests and their booking history</p>
      </div>

      <div className="card" style={{ padding: '14px 20px', marginBottom: 20 }}>
        <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: '0.85rem', outline: 'none' }} />
      </div>

      <div className="card">
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Loading customers...</div> :
          filtered.length === 0 ? <div style={{ padding: 60, textAlign: 'center', color: 'var(--gray-400)' }}><div style={{ fontSize: '2.5rem', marginBottom: 12 }}>👥</div><p>No customers found.</p></div> : (
          <table className="table">
            <thead><tr><th>Customer</th><th>Phone</th><th>Joined</th><th>Total Bookings</th><th>Total Spent</th><th></th></tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => openCustomer(c.id)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--blue-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'var(--blue)', flexShrink: 0 }}>
                        {c.full_name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.full_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>{c.phone || '—'}</td>
                  <td style={{ color: 'var(--gray-600)', fontSize: '0.82rem' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td><span style={{ fontWeight: 700, color: 'var(--navy)' }}>{c.total_reservations}</span></td>
                  <td><span style={{ fontWeight: 700, color: 'var(--blue)' }}>₱{Number(c.total_spent).toLocaleString()}</span></td>
                  <td><span style={{ color: 'var(--blue)', fontSize: '0.82rem', fontWeight: 600 }}>View →</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Customer Detail Drawer */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex' }} onClick={() => setSelected(null)}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)' }} />
          <div style={{ width: 480, background: 'white', height: '100%', overflowY: 'auto', boxShadow: '-8px 0 32px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--navy)' }}>Customer Profile</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '1.1rem', color: 'var(--gray-400)', cursor: 'pointer' }}>✕</button>
            </div>
            {detailLoading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>
            ) : (
              <div style={{ padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--gray-100)' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--blue-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', color: 'var(--blue)' }}>
                    {selected.full_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--navy)' }}>{selected.full_name}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>{selected.email}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{selected.phone || 'No phone'}</div>
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Booking History</div>
                  {(selected.reservations || []).length === 0 ? (
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>No reservations yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {selected.reservations.map(r => (
                        <div key={r.id} style={{ background: 'var(--gray-50)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--gray-100)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: 'var(--blue)' }}>{r.booking_ref}</span>
                            <span className={`badge badge-${r.status}`}>{r.status.replace('_', ' ')}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>Room {r.room?.room_number} · {r.check_in} → {r.check_out} · ₱{Number(r.total_price).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
