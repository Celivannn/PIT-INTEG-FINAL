import React, { useState, useEffect, useCallback } from 'react';
import { getReservations, updateReservationStatus } from '../api';
import toast from 'react-hot-toast';

const STATUS_TRANSITIONS = {
  pending:     ['confirmed', 'cancelled'],
  confirmed:   ['checked_in', 'cancelled'],
  checked_in:  ['checked_out'],
  checked_out: [],
  cancelled:   [],
};

const STATUS_LABELS = { pending: 'Pending', confirmed: 'Confirmed', checked_in: 'Checked In', checked_out: 'Checked Out', cancelled: 'Cancelled' };

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating]         = useState(null);
  const [selected, setSelected]         = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search)       params.search = search;
    if (statusFilter) params.status = statusFilter;
    getReservations(params).then(r => setReservations(r.data.results || r.data)).finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id);
    try {
      await updateReservationStatus(id, newStatus);
      toast.success(`Status updated to ${STATUS_LABELS[newStatus]}`);
      load();
      if (selected?.id === id) setSelected(s => ({ ...s, status: newStatus }));
    } catch (e) {
      toast.error(e.response?.data?.status?.[0] || 'Failed to update status.');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em' }}>Reservations</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)', marginTop: 2 }}>Manage all guest bookings</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input placeholder="Search booking ref, guest, room..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 220, padding: '9px 12px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: '0.85rem', outline: 'none' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          {['', 'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
              background: statusFilter === s ? 'var(--blue)' : 'var(--gray-100)',
              color: statusFilter === s ? 'white' : 'var(--gray-600)',
              transition: 'all 0.2s', textTransform: 'capitalize',
            }}>{s ? s.replace('_', ' ') : 'All'}</button>
          ))}
        </div>
        <span style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginLeft: 'auto' }}>{reservations.length} results</span>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Loading reservations...</div>
        ) : reservations.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📋</div>
            <p>No reservations found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Dates</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(r => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(r)}>
                    <td><span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem', color: 'var(--blue)' }}>{r.booking_ref}</span></td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.customer_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{r.customer_email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>Room {r.room?.room_number}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', textTransform: 'capitalize' }}>{r.room?.room_type?.name}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem' }}>{r.check_in} → {r.check_out}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{r.nights} nights · {r.guests} guests</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--blue)' }}>₱{Number(r.total_price).toLocaleString()}</div>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <span className={`badge badge-${r.status}`}>{r.status.replace('_', ' ')}</span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      {STATUS_TRANSITIONS[r.status]?.length > 0 ? (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {STATUS_TRANSITIONS[r.status].map(next => (
                            <button key={next} className="btn btn-sm btn-outline" disabled={updating === r.id}
                              onClick={() => handleStatusChange(r.id, next)}
                              style={{ fontSize: '0.72rem', padding: '5px 10px', textTransform: 'capitalize' }}>
                              {next.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex' }} onClick={() => setSelected(null)}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)' }} />
          <div style={{ width: 420, background: 'white', height: '100%', overflowY: 'auto', boxShadow: '-8px 0 32px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--navy)' }}>Reservation Detail</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: 'var(--gray-400)', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: 28 }}>
              <div style={{ background: 'var(--blue-pale)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.95rem', color: 'var(--blue)' }}>{selected.booking_ref}</span>
                <span className={`badge badge-${selected.status}`}>{selected.status.replace('_', ' ')}</span>
              </div>
              {[
                ['Guest', selected.customer_name],
                ['Email', selected.customer_email],
                ['Room', `Room ${selected.room?.room_number} (${selected.room?.room_type?.name})`],
                ['Check In', selected.check_in],
                ['Check Out', selected.check_out],
                ['Nights', selected.nights],
                ['Guests', selected.guests],
                ['Price/Night', `₱${Number(selected.price_per_night).toLocaleString()}`],
                ['Total', `₱${Number(selected.total_price).toLocaleString()}`],
                ['Booked On', new Date(selected.created_at).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-100)', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--gray-400)', fontWeight: 500 }}>{k}</span>
                  <span style={{ color: 'var(--navy)', fontWeight: 600, textAlign: 'right', maxWidth: 220, textTransform: 'capitalize' }}>{v}</span>
                </div>
              ))}
              {STATUS_TRANSITIONS[selected.status]?.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Update Status</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {STATUS_TRANSITIONS[selected.status].map(next => (
                      <button key={next} className="btn btn-primary btn-sm" onClick={() => handleStatusChange(selected.id, next)} style={{ textTransform: 'capitalize' }}>
                        → {next.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
