import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRooms, getRoomTypes } from '../api/rooms';

function RoomCard({ room }) {
  const img = room.primary_image;
  const price = room.room_type?.base_price;
  return (
    <div className="card" style={{ cursor: 'pointer' }}>
      <div style={{ height: 220, background: img ? `url(${img}) center/cover` : 'linear-gradient(135deg,#dbeafe,#bfdbfe)', position: 'relative', overflow: 'hidden' }}>
        {!img && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#93c5fd', opacity: 0.5 }}>No Image</div>}
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span style={{ background: 'white', padding: '4px 12px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600, color: 'var(--navy)', textTransform: 'capitalize' }}>
            {room.room_type?.name}
          </span>
        </div>
        {room.status !== 'available' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 600, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Unavailable</span>
          </div>
        )}
      </div>
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--navy)' }}>Room {room.room_number}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Floor {room.floor}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--blue)', fontWeight: 600 }}>
              PHP {Number(price).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>per night</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '10px 0' }}>
          <span style={{ fontSize: '0.78rem', background: 'var(--gray-100)', padding: '3px 10px', borderRadius: 99, color: 'var(--gray-600)' }}>
            👥 Up to {room.room_type?.capacity} guests
          </span>
          {(room.room_type?.amenities || []).slice(0, 2).map(a => (
            <span key={a} style={{ fontSize: '0.78rem', background: 'var(--gray-100)', padding: '3px 10px', borderRadius: 99, color: 'var(--gray-600)' }}>{a}</span>
          ))}
        </div>
        <Link to={`/rooms/${room.id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
          View Details
        </Link>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    Promise.all([getRooms(), getRoomTypes()]).then(([r, t]) => {
      setRooms(r.data.results || r.data);
      setRoomTypes(t.data.results || t.data);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = filter ? rooms.filter(r => r.room_type?.name === filter) : rooms;

  return (
    <div style={{ paddingTop: 72 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-mid))', padding: '60px 0 80px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 12 }}>Accommodations</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 300, color: 'white' }}>Our Rooms & Suites</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 12, fontSize: '1rem' }}>Choose from our carefully curated selection of rooms</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: -32 }}>
        {/* Filters */}
        <div style={{ background: 'white', borderRadius: 12, padding: '16px 24px', boxShadow: 'var(--shadow-md)', marginBottom: 40, display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)', fontWeight: 500, marginRight: 8 }}>Filter by type:</span>
          {['', ...roomTypes.map(t => t.name)].map(type => (
            <button key={type} onClick={() => setFilter(type)} style={{
              padding: '8px 20px', borderRadius: 99, border: 'none', cursor: 'pointer',
              background: filter === type ? 'var(--blue)' : 'var(--gray-100)',
              color: filter === type ? 'white' : 'var(--gray-600)',
              fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s', textTransform: 'capitalize',
            }}>
              {type || 'All'}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--gray-400)' }}>{filtered.length} room{filtered.length !== 1 ? 's' : ''} found</span>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 380, borderRadius: 16 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏨</div>
            <p>No rooms found. Try a different filter.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24, paddingBottom: 64 }}>
            {filtered.map(room => <RoomCard key={room.id} room={room} />)}
          </div>
        )}
      </div>
    </div>
  );
}