import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { checkAvailability, getRoomTypes } from '../api/rooms';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    check_in:  searchParams.get('check_in')  || today,
    check_out: searchParams.get('check_out') || tomorrow,
    type:      searchParams.get('type')      || '',
  });
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [roomTypes, setRoomTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(true);
  
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Fetch room types on component mount
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const { data } = await getRoomTypes();
        const types = data.results || data;
        setRoomTypes(types);
      } catch (error) {
        console.error('Error fetching room types:', error);
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

  const nights = Math.max(1, Math.round((new Date(form.check_out) - new Date(form.check_in)) / 86400000));

  return (
    <div style={{ paddingTop: 72 }}>
      <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-mid))', padding: '48px 0 80px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 300, color: 'white', marginBottom: 32 }}>Check Availability</h1>
          <div style={{ background: 'white', borderRadius: 16, padding: '24px 32px', boxShadow: 'var(--shadow-lg)', maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 16, alignItems: 'end' }}>
              <div className="form-group">
                <label>Check In</label>
                <input type="date" value={form.check_in} min={today} onChange={e => set('check_in', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Check Out</label>
                <input type="date" value={form.check_out} min={form.check_in} onChange={e => set('check_out', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Room Type</label>
                <select value={form.type} onChange={e => set('type', e.target.value)}>
                  <option value="">Any type</option>
                  {!typesLoading && roomTypes.map(type => (
                    <option key={type.id} value={type.name}>
                      {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn-gold" onClick={search} style={{ height: 44 }}>Search</button>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: 40, paddingBottom: 64 }}>
        {searched && !loading && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.95rem' }}>
              {results.length > 0
                ? <><strong style={{ color: 'var(--navy)' }}>{results.length} room{results.length > 1 ? 's' : ''}</strong> available · {form.check_in} → {form.check_out} · {nights} night{nights > 1 ? 's' : ''}</>
                : 'No rooms available for the selected dates.'}
            </p>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 360, borderRadius: 16 }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {results.map(room => {
              const total = Number(room.room_type?.base_price) * nights;
              return (
                <div key={room.id} className="card">
                  <div style={{ height: 200, background: room.primary_image ? `url(${room.primary_image}) center/cover` : 'linear-gradient(135deg,#dbeafe,#bfdbfe)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 12, left: 12, background: 'white', padding: '4px 12px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600, color: 'var(--navy)', textTransform: 'capitalize' }}>
                      {room.room_type?.name}
                    </div>
                    <div style={{ position: 'absolute', top: 12, right: 12, background: '#d1fae5', padding: '4px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600, color: '#065f46' }}>
                      Available
                    </div>
                  </div>
                  <div style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--navy)' }}>Room {room.room_number}</h3>
                        <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>Floor {room.floor} · Up to {room.room_type?.capacity} guests</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>₱{Number(room.room_type?.base_price).toLocaleString()}/night</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--blue)', fontWeight: 600 }}>₱{total.toLocaleString()} total</div>
                      </div>
                    </div>
                    <Link to={`/book/${room.id}?check_in=${form.check_in}&check_out=${form.check_out}`}
                      className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
                      Book Now
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {searched && !loading && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--navy)', marginBottom: 8 }}>No Rooms Available</h3>
            <p style={{ color: 'var(--gray-600)', marginBottom: 24 }}>Try different dates or room type.</p>
            <Link to="/rooms" className="btn btn-outline">Browse All Rooms</Link>
          </div>
        )}
      </div>
    </div>
  );
}