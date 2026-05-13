import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getRoom } from '../api/rooms';
import { createReservation } from '../api/reservations';
import toast from 'react-hot-toast';

export default function BookingPage() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [room, setRoom]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep]       = useState(1);
  const [booking, setBooking] = useState(null);
  const [form, setForm]       = useState({
    check_in:  searchParams.get('check_in')  || today,
    check_out: searchParams.get('check_out') || tomorrow,
    guests: 1,
  });

  useEffect(() => {
    getRoom(roomId).then(r => setRoom(r.data)).finally(() => setLoading(false));
  }, [roomId]);

  const nights = Math.max(1, Math.round((new Date(form.check_out) - new Date(form.check_in)) / 86400000));
  const total  = room ? Number(room.room_type?.base_price) * nights : 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data } = await createReservation({
        room: String(roomId),          // keep as string — never parseInt() a CockroachDB ID
        ...form,
        guests: parseInt(form.guests), // guests is a small number, safe to parse
      });
      setBooking(data);
      setStep(3);
    } catch (e) {
      console.error('Booking error details:', e.response?.data); // helpful for debugging
      const msg = e.response?.data?.non_field_errors?.[0] || e.response?.data?.detail || 'Booking failed. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ paddingTop: 120, textAlign: 'center' }}>Loading...</div>;
  if (!room)   return <div style={{ paddingTop: 120, textAlign: 'center' }}>Room not found.</div>;

  if (step === 3) return (
    <div style={{ paddingTop: 72, minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2.5rem' }}>✓</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--navy)', marginBottom: 8 }}>Booking Confirmed!</h1>
        <p style={{ color: 'var(--gray-600)', marginBottom: 32 }}>Your reservation has been successfully created.</p>
        <div style={{ background: 'var(--gray-50)', borderRadius: 12, padding: '24px', marginBottom: 32, textAlign: 'left' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              ['Booking Reference', booking?.booking_ref],
              ['Room', `Room ${room.room_number}`],
              ['Check In', form.check_in],
              ['Check Out', form.check_out],
              ['Guests', form.guests],
              ['Total', `PHP ${total.toLocaleString()}`],
              ['Status', 'Pending'],
              ['Payment', 'Pay at hotel'],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: '0.95rem', color: 'var(--navy)', fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/my-reservations')} style={{ marginRight: 12 }}>View My Bookings</button>
        <button className="btn btn-outline" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop: 72, paddingBottom: 64 }}>
      <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-mid))', padding: '40px 0 60px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 300, color: 'white' }}>Reserve Your Room</h1>
        </div>
      </div>
      <div className="container" style={{ maxWidth: 900, marginTop: -24 }}>
        {/* Steps */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginBottom: 40 }}>
          {['Stay Details', 'Confirm'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: i + 1 < step ? 'pointer' : 'default' }} onClick={() => i + 1 < step && setStep(i + 1)}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700,
                  background: step > i + 1 ? '#d1fae5' : step === i + 1 ? 'var(--blue)' : 'var(--gray-100)',
                  color: step > i + 1 ? '#065f46' : step === i + 1 ? 'white' : 'var(--gray-400)',
                }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.78rem', marginTop: 4, color: step === i + 1 ? 'var(--blue)' : 'var(--gray-400)', fontWeight: step === i + 1 ? 600 : 400 }}>{label}</span>
              </div>
              {i < 1 && <div style={{ width: 80, height: 2, background: step > i + 1 ? 'var(--blue)' : 'var(--gray-200)', margin: '0 8px', marginBottom: 20 }} />}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 32 }}>
          {/* Form */}
          <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)' }}>
            {step === 1 && (
              <>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--navy)', marginBottom: 24 }}>Stay Details</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div className="form-group">
                    <label>Check In Date</label>
                    <input type="date" value={form.check_in} min={today} onChange={e => setForm(f => ({ ...f, check_in: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Check Out Date</label>
                    <input type="date" value={form.check_out} min={form.check_in} onChange={e => setForm(f => ({ ...f, check_out: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label>Number of Guests (max {room.room_type?.capacity})</label>
                  <select value={form.guests} onChange={e => setForm(f => ({ ...f, guests: e.target.value }))}>
                    {Array.from({ length: room.room_type?.capacity || 2 }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStep(2)}>
                  Continue to Confirm →
                </button>
              </>
            )}
            {step === 2 && (
              <>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--navy)', marginBottom: 24 }}>Confirm Booking</h2>
                <div style={{ background: 'var(--gray-50)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                  {[
                    ['Room', `Room ${room.room_number} (${room.room_type?.name})`],
                    ['Floor', `Floor ${room.floor}`],
                    ['Check In', form.check_in],
                    ['Check Out', form.check_out],
                    ['Nights', nights],
                    ['Guests', form.guests],
                    ['Price/Night', `PHP ${Number(room.room_type?.base_price).toLocaleString()}`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-200)', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--gray-600)' }}>{k}</span>
                      <span style={{ color: 'var(--navy)', fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)' }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--blue)' }}>PHP {total.toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: '0.82rem', color: '#92400e' }}>
                  💳 Payment is collected at the hotel upon check-in.
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-gold" style={{ flex: 2, justifyContent: 'center' }} onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Processing...' : 'Confirm Booking'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Summary */}
          <div style={{ background: 'var(--navy)', borderRadius: 16, padding: 28, color: 'white', height: 'fit-content' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 16 }}>Booking Summary</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 4, fontWeight: 400 }}>Room {room.room_number}</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textTransform: 'capitalize', marginBottom: 20 }}>{room.room_type?.name} Room · Floor {room.floor}</p>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.88rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>PHP {Number(room.room_type?.base_price).toLocaleString()} × {nights} nights</span>
                <span>PHP {total.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700 }}>
                <span>Total</span>
                <span style={{ color: 'var(--gold)' }}>PHP {total.toLocaleString()}</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: 4 }}>Due at hotel check-in</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}