import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyReservations, cancelReservation } from '../api/reservations';
import toast from 'react-hot-toast';

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [cancelling, setCancelling]     = useState(null);

  const load = () => getMyReservations().then(r => setReservations(r.data.results || r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    setCancelling(id);
    try {
      await cancelReservation(id);
      toast.success('Reservation cancelled.');
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Could not cancel.');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div style={{ paddingTop: 72 }}>
      <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-mid))', padding: '48px 0 64px' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 300, color: 'white' }}>My Reservations</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>View and manage your bookings</p>
        </div>
      </div>
      <div className="container" style={{ marginTop: 32, paddingBottom: 64 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 16 }} />)}
          </div>
        ) : reservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🏨</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--navy)', marginBottom: 8 }}>No Reservations Yet</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: 24 }}>Start by browsing our available rooms.</p>
            <Link to="/rooms" className="btn btn-primary">Browse Rooms</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reservations.map(r => (
              <div key={r.id} style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)', display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Booking Ref</div>
                    <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.9rem', fontFamily: 'monospace' }}>{r.booking_ref}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Room</div>
                    <div style={{ fontWeight: 500, color: 'var(--navy)', textTransform: 'capitalize' }}>Room {r.room?.room_number} · {r.room?.room_type?.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Dates</div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--navy)' }}>{r.check_in} → {r.check_out}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{r.nights} nights · {r.guests} guest{r.guests > 1 ? 's' : ''}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Total</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--blue)', fontWeight: 600 }}>PHP {Number(r.total_price).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className={`badge badge-${r.status}`}>{r.status.replace('_', ' ')}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
                  <Link to={`/rooms/${r.room?.id}`} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '8px 16px', justifyContent: 'center' }}>View Room</Link>
                  {r.can_cancel && (
                    <button onClick={() => handleCancel(r.id)} disabled={cancelling === r.id}
                      style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #fecaca', background: 'white', color: '#dc2626', fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {cancelling === r.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
