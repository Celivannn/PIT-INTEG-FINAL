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
    <div style={{ 
      paddingTop: 72, 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh'
    }}>
      {/* Hero Header - Made smaller to reduce overlap */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0a1e3d 0%, #0f2b4c 50%, #1a3a5c 100%)',
        padding: '40px 0 60px',
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
            <span>✦</span> FIND YOUR STAY <span>✦</span>
          </div>
          <h1 style={{ 
            fontFamily: 'var(--font-display, "Playfair Display", serif)', 
            fontSize: 'clamp(2rem, 5vw, 3rem)', 
            fontWeight: 400, 
            color: 'white',
            letterSpacing: '-0.02em',
            marginBottom: 12
          }}>
            Check Availability
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', maxWidth: 600, margin: '0 auto' }}>
            Find the perfect room for your stay at Grand Azure
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', paddingBottom: 80 }}>
        {/* Search Form Card - Positioned lower with more margin */}
        <div style={{ 
          background: 'white', 
          borderRadius: 24, 
          padding: '32px 40px', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)', 
          maxWidth: 1000, 
          margin: '60px auto 48px',
          border: '1px solid rgba(0,0,0,0.05)',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 20, 
            alignItems: 'end' 
          }}>
            <div className="form-group">
              <label style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#0f172a',
                marginBottom: 8,
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Check In
              </label>
              <input 
                type="date" 
                value={form.check_in} 
                min={today} 
                onChange={e => set('check_in', e.target.value)} 
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: 12,
                  fontSize: '0.95rem',
                  transition: 'all 0.3s',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#c9a84c';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            <div className="form-group">
              <label style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#0f172a',
                marginBottom: 8,
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Check Out
              </label>
              <input 
                type="date" 
                value={form.check_out} 
                min={form.check_in} 
                onChange={e => set('check_out', e.target.value)} 
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: 12,
                  fontSize: '0.95rem',
                  transition: 'all 0.3s',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#c9a84c';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            <div className="form-group">
              <label style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#0f172a',
                marginBottom: 8,
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Room Type
              </label>
              <select 
                value={form.type} 
                onChange={e => set('type', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: 12,
                  fontSize: '0.95rem',
                  transition: 'all 0.3s',
                  outline: 'none',
                  background: 'white',
                  cursor: 'pointer'
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#c9a84c';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="">Any type</option>
                {!typesLoading && roomTypes.map(type => (
                  <option key={type.id} value={type.name}>
                    {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <button 
              className="btn btn-gold" 
              onClick={search} 
              style={{ 
                height: 48,
                padding: '0 32px',
                background: 'linear-gradient(135deg, #c9a84c, #b8923e)',
                border: 'none',
                borderRadius: 12,
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s',
                fontSize: '0.95rem',
                marginTop: 4
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(201,168,76,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Search Rooms →
            </button>
          </div>
        </div>

        {/* Results Header */}
        {searched && !loading && (
          <div style={{ marginBottom: 32 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 20px',
              background: 'white',
              borderRadius: 100,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <span style={{ fontSize: '1rem' }}>📅</span>
              <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0 }}>
                {results.length > 0
                  ? <><strong style={{ color: '#c9a84c', fontWeight: 700 }}>{results.length} room{results.length > 1 ? 's' : ''}</strong> available · {form.check_in} → {form.check_out} · {nights} night{nights > 1 ? 's' : ''}</>
                  : 'No rooms available for the selected dates.'}
              </p>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 30 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ 
                height: 420, 
                borderRadius: 20, 
                background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                animation: 'shimmer 2s infinite'
              }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 30 }}>
            {results.map(room => {
              const total = Number(room.room_type?.base_price) * nights;
              return (
                <div 
                  key={room.id} 
                  style={{
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
                    height: 220, 
                    background: room.primary_image ? `url(${room.primary_image}) center/cover` : 'linear-gradient(135deg, #dbeafe, #bfdbfe)', 
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
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
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        {room.room_type?.name}
                      </span>
                    </div>
                    
                    {/* Available Badge */}
                    <div style={{ position: 'absolute', top: 16, right: 16 }}>
                      <span style={{ 
                        background: 'linear-gradient(135deg, #10b981, #059669)', 
                        padding: '6px 14px', 
                        borderRadius: 100, 
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        color: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        letterSpacing: '0.5px'
                      }}>
                        ✓ Available
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: 16 }}>
                      <h3 style={{ 
                        fontFamily: 'var(--font-display, "Playfair Display", serif)', 
                        fontSize: '1.3rem', 
                        color: '#0a1e3d',
                        fontWeight: 500,
                        marginBottom: 6
                      }}>
                        Room {room.room_number}
                      </h3>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 12,
                        fontSize: '0.8rem', 
                        color: '#94a3b8',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>📍</span> Floor {room.floor}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>👥</span> Up to {room.room_type?.capacity} guests
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ 
                      marginTop: 'auto',
                      paddingTop: 16,
                      borderTop: '1px solid #f1f5f9',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12
                    }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          ₱{Number(room.room_type?.base_price).toLocaleString()}/night
                        </div>
                        <div style={{ 
                          fontFamily: 'var(--font-display, "Playfair Display", serif)', 
                          fontSize: '1.3rem', 
                          color: '#c9a84c', 
                          fontWeight: 700 
                        }}>
                          ₱{total.toLocaleString()} total
                        </div>
                      </div>
                      <Link 
                        to={`/book/${room.id}?check_in=${form.check_in}&check_out=${form.check_out}`}
                        style={{
                          padding: '10px 24px',
                          background: 'linear-gradient(135deg, #c9a84c, #b8923e)',
                          borderRadius: 12,
                          color: 'white',
                          textDecoration: 'none',
                          fontWeight: 600,
                          transition: 'all 0.3s',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(201,168,76,0.3)';
                          e.currentTarget.style.gap = '10px';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.gap = '6px';
                        }}
                      >
                        Book Now →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {searched && !loading && results.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 40px',
            background: 'white',
            borderRadius: 24,
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: 20, animation: 'float 3s ease-in-out infinite' }}>🔍</div>
            <h3 style={{ 
              fontFamily: 'var(--font-display, "Playfair Display", serif)', 
              fontSize: '1.6rem', 
              color: '#0a1e3d', 
              marginBottom: 12,
              fontWeight: 500
            }}>
              No Rooms Available
            </h3>
            <p style={{ color: '#64748b', marginBottom: 32, fontSize: '1rem' }}>
              Try different dates or room type to find your perfect stay.
            </p>
            <Link 
              to="/rooms" 
              style={{
                padding: '12px 32px',
                background: 'white',
                border: '2px solid #c9a84c',
                borderRadius: 12,
                color: '#c9a84c',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-block',
                transition: 'all 0.3s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#c9a84c';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#c9a84c';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Browse All Rooms
            </Link>
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