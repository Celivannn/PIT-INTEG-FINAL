import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { checkAvailability, getRoomTypes } from '../api/rooms';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const today    = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    check_in:  searchParams.get('check_in')  || today,
    check_out: searchParams.get('check_out') || tomorrow,
    type:      searchParams.get('type')      || '',
  });
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);
  const [roomTypes, setRoomTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const { data } = await getRoomTypes();
        setRoomTypes(data.results || data);
      } catch (e) {
        console.error('Error fetching room types:', e);
      } finally {
        setTypesLoading(false);
      }
    };
    fetchRoomTypes();
  }, []);

  const search = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = { check_in: form.check_in, check_out: form.check_out };
      if (form.type) params.type = form.type;
      const { data } = await checkAvailability(params);
      setResults(data);
    } catch (e) {
      setResults([]);
      console.error('Search error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('check_in')) search();
  }, []);

  const nights = Math.max(1, Math.round(
    (new Date(form.check_out) - new Date(form.check_in)) / 86400000
  ));

  return (
    <div style={{ paddingTop: 72, background: 'var(--cream)', minHeight: '100vh' }}>

      {/* ── Hero / Search Bar ───────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-mid))', padding: '52px 0 88px', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circle */}
        <div style={{ position: 'absolute', right: -80, top: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(201,168,76,0.06)', pointerEvents: 'none' }} />

        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 99, padding: '4px 16px', marginBottom: 16 }}>
            <span style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 500 }}>Room Availability</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.6rem', fontWeight: 300, color: 'white', marginBottom: 8 }}>
            Find Your Perfect Room
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: 36, fontWeight: 300 }}>
            Select your dates and room preference to check availability
          </p>

          {/* Search card */}
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '28px 32px', boxShadow: 'var(--shadow-lg)', maxWidth: 820, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 16, alignItems: 'end' }}>
              <div className="form-group">
                <label>📅 Check In</label>
                <input type="date" value={form.check_in} min={today}
                  onChange={e => set('check_in', e.target.value)} />
              </div>
              <div className="form-group">
                <label>📅 Check Out</label>
                <input type="date" value={form.check_out} min={form.check_in}
                  onChange={e => set('check_out', e.target.value)} />
              </div>
              <div className="form-group">
                <label>🛏️ Room Type</label>
                <select value={form.type} onChange={e => set('type', e.target.value)}>
                  <option value="">Any type</option>
                  {!typesLoading && roomTypes.map(type => (
                    <option key={type.id} value={type.name}>
                      {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn-gold" onClick={search}
                style={{ height: 46, paddingLeft: 28, paddingRight: 28, fontWeight: 600 }}>
                Search
              </button>
            </div>

            {/* Nights pill */}
            {form.check_in && form.check_out && (
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
                <span style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 99, padding: '4px 14px', fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                  🌙 {nights} night{nights > 1 ? 's' : ''} · {form.check_in} → {form.check_out}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Results ─────────────────────────────────────────────────── */}
      <div className="container" style={{ marginTop: '-28px', paddingBottom: 64 }}>

        {/* Results count bar */}
        {searched && !loading && results.length > 0 && (
          <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '14px 20px', marginBottom: 24, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', margin: 0 }}>
              <strong style={{ color: 'var(--navy)' }}>{results.length} room{results.length > 1 ? 's' : ''}</strong> available for your dates
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>
              {nights} night{nights > 1 ? 's' : ''} · {form.check_in} → {form.check_out}
            </span>
          </div>
        )}

        {/* Skeleton loaders */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 380, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        )}

        {/* Room cards */}
        {!loading && results.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {results.map(room => {
              const total = Number(room.room_type?.base_price) * nights;
              return (
                <div key={room.id} className="card">
                  {/* Image */}
                  <div style={{
                    height: 210,
                    background: room.primary_image
                      ? `url(${room.primary_image}) center/cover`
                      : 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)',
                    position: 'relative',
                  }}>
                    {/* Room type badge */}
                    <div style={{ position: 'absolute', top: 12, left: 12, background: 'white', padding: '4px 12px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600, color: 'var(--navy)', textTransform: 'capitalize', boxShadow: 'var(--shadow-sm)' }}>
                      {room.room_type?.name}
                    </div>
                    {/* Available badge */}
                    <div style={{ position: 'absolute', top: 12, right: 12, background: '#d1fae5', padding: '4px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600, color: '#065f46' }}>
                      ✓ Available
                    </div>
                    {/* Overlay gradient */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)' }} />
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--navy)', marginBottom: 2 }}>
                          Room {room.room_number}
                        </h3>
                        <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>
                          Floor {room.floor} · Up to {room.room_type?.capacity} guests
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                          ₱{Number(room.room_type?.base_price).toLocaleString()}/night
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--blue)', fontWeight: 600 }}>
                          ₱{total.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>total</div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: 'var(--gray-100)', margin: '12px 0' }} />

                    <Link
                      to={`/book/${room.id}?check_in=${form.check_in}&check_out=${form.check_out}`}
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}>
                      Book Now →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {searched && !loading && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--navy)', marginBottom: 8 }}>
              No Rooms Available
            </h3>
            <p style={{ color: 'var(--gray-600)', marginBottom: 28, maxWidth: 360, margin: '0 auto 28px' }}>
              No rooms match your selected dates or type. Try adjusting your search.
            </p>
            <Link to="/rooms" className="btn btn-outline">Browse All Rooms</Link>
          </div>
        )}

        {/* Initial state — not searched yet */}
        {!searched && !loading && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏨</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--navy)', marginBottom: 8 }}>
              Select Your Dates
            </h3>
            <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>
              Choose your check-in and check-out dates above to see available rooms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}