import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRooms, getRoomTypes } from '../api/rooms';

function RoomCard({ room }) {
  const img = room.primary_image;
  const price = room.room_type?.base_price;
  
  return (
    <div 
      className="card" 
      style={{ 
        cursor: 'pointer',
        background: 'white',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        border: '1px solid rgba(0,0,0,0.05)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
      }}
    >
      <div style={{ 
        height: 240, 
        background: img ? `url(${img}) center/cover` : 'linear-gradient(135deg, #dbeafe, #bfdbfe)', 
        position: 'relative', 
        overflow: 'hidden' 
      }}>
        {!img && (
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontFamily: 'var(--font-display, "Playfair Display", serif)', 
            fontSize: '2rem', 
            color: '#93c5fd', 
            opacity: 0.5 
          }}>
            No Image
          </div>
        )}
        
        {/* Room Type Badge */}
        <div style={{ position: 'absolute', top: 16, left: 16 }}>
          <span style={{ 
            background: 'rgba(255,255,255,0.95)', 
            backdropFilter: 'blur(10px)',
            padding: '6px 16px', 
            borderRadius: 100, 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            color: '#0a1e3d', 
            textTransform: 'capitalize',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            letterSpacing: '0.5px'
          }}>
            {room.room_type?.name}
          </span>
        </div>
        
        {/* Price Badge */}
        <div style={{ 
          position: 'absolute', 
          bottom: 16, 
          right: 16,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          padding: '8px 16px',
          borderRadius: 12,
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            fontFamily: 'var(--font-display, "Playfair Display", serif)', 
            fontSize: '1.2rem', 
            color: '#c9a84c', 
            fontWeight: 700 
          }}>
            ₱{Number(price).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>per night</div>
        </div>
        
        {/* Unavailable Overlay */}
        {room.status !== 'available' && (
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'rgba(0,0,0,0.6)', 
            backdropFilter: 'blur(5px)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <span style={{ 
              color: 'white', 
              fontWeight: 700, 
              fontSize: '1rem', 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em',
              background: 'rgba(239,68,68,0.9)',
              padding: '8px 20px',
              borderRadius: 100
            }}>
              Unavailable
            </span>
          </div>
        )}
      </div>
      
      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
          <div>
            <h3 style={{ 
              fontFamily: 'var(--font-display, "Playfair Display", serif)', 
              fontSize: '1.4rem', 
              color: '#0a1e3d',
              fontWeight: 500,
              marginBottom: 4
            }}>
              Room {room.room_number}
            </h3>
            <span style={{ 
              fontSize: '0.8rem', 
              color: '#94a3b8',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              <span>📍</span> Floor {room.floor}
            </span>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          flexWrap: 'wrap', 
          margin: '16px 0',
          padding: '12px 0',
          borderTop: '1px solid #f1f5f9',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <span style={{ 
            fontSize: '0.75rem', 
            background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', 
            padding: '5px 12px', 
            borderRadius: 100, 
            color: '#475569',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            👥 Up to {room.room_type?.capacity} guests
          </span>
          {(room.room_type?.amenities || []).slice(0, 2).map(a => (
            <span key={a} style={{ 
              fontSize: '0.75rem', 
              background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', 
              padding: '5px 12px', 
              borderRadius: 100, 
              color: '#475569'
            }}>
              {a}
            </span>
          ))}
          {(room.room_type?.amenities || []).length > 2 && (
            <span style={{ 
              fontSize: '0.75rem', 
              color: '#c9a84c',
              fontWeight: 500
            }}>
              +{(room.room_type?.amenities || []).length - 2} more
            </span>
          )}
        </div>
        
        <Link 
          to={`/rooms/${room.id}`} 
          className="btn btn-primary" 
          style={{ 
            width: '100%', 
            justifyContent: 'center', 
            marginTop: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #c9a84c, #b8923e)',
            borderRadius: 12,
            color: 'white',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'all 0.3s',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(201,168,76,0.3)';
            e.currentTarget.style.gap = '12px';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.gap = '8px';
          }}
        >
          View Details →
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
    <div style={{ 
      paddingTop: 72, 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh'
    }}>
      {/* Hero Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0a1e3d 0%, #0f2b4c 50%, #1a3a5c 100%)',
        padding: '50px 0 70px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,95,168,0.2) 0%, transparent 70%)',
          animation: 'float 10s ease-in-out infinite reverse'
        }} />
        <div style={{
          position: 'absolute',
          top: '40%',
          right: '20%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)',
          animation: 'float 12s ease-in-out infinite'
        }} />
        
        <div className="container" style={{ 
          position: 'relative', 
          zIndex: 2, 
          maxWidth: 1200, 
          margin: '0 auto', 
          padding: '0 24px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            borderRadius: '100px',
            marginBottom: 20,
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: '#c9a84c',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <span>✦</span> ACCOMMODATIONS <span>✦</span>
          </div>
          <h1 style={{ 
            fontFamily: 'var(--font-display, "Playfair Display", serif)', 
            fontSize: 'clamp(2rem, 5vw, 3.2rem)', 
            fontWeight: 400, 
            color: 'white',
            letterSpacing: '-0.02em',
            marginBottom: 12
          }}>
            Our Rooms & Suites
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', maxWidth: 600, margin: '0 auto' }}>
            Choose from our carefully curated selection of luxurious rooms
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', paddingBottom: 80 }}>
        {/* Filters - Now properly visible with no negative margin overlap */}
        <div style={{ 
          background: 'white', 
          borderRadius: 20, 
          padding: '8px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
          marginTop: 30,
          marginBottom: 40, 
          display: 'flex', 
          gap: 8, 
          alignItems: 'center',
          flexWrap: 'wrap',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <span style={{ 
            fontSize: '0.85rem', 
            color: '#64748b', 
            fontWeight: 600, 
            marginLeft: 12,
            marginRight: 4 
          }}>
            Filter by type:
          </span>
          <button 
            onClick={() => setFilter('')} 
            style={{
              padding: '10px 24px',
              borderRadius: 14,
              border: 'none',
              cursor: 'pointer',
              background: filter === '' ? 'linear-gradient(135deg, #c9a84c, #b8923e)' : 'transparent',
              color: filter === '' ? 'white' : '#64748b',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'all 0.3s',
              textTransform: 'capitalize',
            }}
            onMouseEnter={e => {
              if (filter !== '') {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.color = '#0f172a';
              }
            }}
            onMouseLeave={e => {
              if (filter !== '') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#64748b';
              }
            }}
          >
            All Rooms
          </button>
          {roomTypes.map(type => (
            <button 
              key={type.id}
              onClick={() => setFilter(type.name)} 
              style={{
                padding: '10px 24px',
                borderRadius: 14,
                border: 'none',
                cursor: 'pointer',
                background: filter === type.name ? 'linear-gradient(135deg, #c9a84c, #b8923e)' : 'transparent',
                color: filter === type.name ? 'white' : '#64748b',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.3s',
                textTransform: 'capitalize',
              }}
              onMouseEnter={e => {
                if (filter !== type.name) {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.color = '#0f172a';
                }
              }}
              onMouseLeave={e => {
                if (filter !== type.name) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }
              }}
            >
              {type.name}
            </button>
          ))}
          <span style={{ 
            marginLeft: 'auto', 
            fontSize: '0.85rem', 
            color: '#94a3b8',
            padding: '0 16px'
          }}>
            {filtered.length} room{filtered.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 30 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ 
                height: 450, 
                borderRadius: 20, 
                background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                animation: 'shimmer 2s infinite'
              }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 40px',
            background: 'white',
            borderRadius: 24,
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: 20, animation: 'float 3s ease-in-out infinite' }}>🏨</div>
            <h3 style={{ 
              fontFamily: 'var(--font-display, "Playfair Display", serif)', 
              fontSize: '1.5rem', 
              color: '#0a1e3d', 
              marginBottom: 12 
            }}>
              No Rooms Found
            </h3>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>Try a different filter to see more rooms.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 30, paddingBottom: 64 }}>
            {filtered.map(room => <RoomCard key={room.id} room={room} />)}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(20px, -20px);
          }
        }
      `}</style>
    </div>
  );
}