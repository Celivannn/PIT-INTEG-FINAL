import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRoom } from '../api/rooms';
import { useAuth } from '../context/AuthContext';

export default function RoomDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    getRoom(id).then(r => setRoom(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ 
      paddingTop: 72, 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
      minHeight: '100vh' 
    }}>
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', paddingTop: 48 }}>
        <div style={{ height: 480, borderRadius: 24, background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)', marginBottom: 24, animation: 'shimmer 2s infinite' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 40 }}>
          <div style={{ height: 300, borderRadius: 20, background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)', animation: 'shimmer 2s infinite' }} />
          <div style={{ height: 300, borderRadius: 20, background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)', animation: 'shimmer 2s infinite' }} />
        </div>
      </div>
    </div>
  );

  if (!room) return (
    <div style={{ 
      paddingTop: 120, 
      textAlign: 'center', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' 
    }}>
      <div style={{ fontSize: '4rem', marginBottom: 20, animation: 'float 3s ease-in-out infinite' }}>🏨</div>
      <h2 style={{ color: '#0a1e3d', marginBottom: 16, fontFamily: 'var(--font-display, "Playfair Display", serif)' }}>Room not found</h2>
      <Link to="/rooms" style={{ color: '#c9a84c', textDecoration: 'none', fontWeight: 600 }}>← Back to Rooms</Link>
    </div>
  );

  const images = room.images || [];
  const currentImg = images[activeImg];

  return (
    <div style={{ 
      paddingTop: 72, 
      paddingBottom: 80,
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh'
    }}>
      {/* Hero Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0a1e3d 0%, #0f2b4c 50%, #1a3a5c 100%)',
        padding: '40px 0 60px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 40
      }}>
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
        
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2 }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: 24, fontSize: '0.85rem' }}>
            <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>Home</Link>
            <span style={{ color: '#cbd5e1', margin: '0 8px' }}>›</span>
            <Link to="/rooms" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>Rooms</Link>
            <span style={{ color: '#cbd5e1', margin: '0 8px' }}>›</span>
            <span style={{ color: '#c9a84c', fontWeight: 600 }}>Room {room.room_number}</span>
          </div>

          <div>
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
              <span>✦</span> LUXURY ACCOMMODATION <span>✦</span>
            </div>
            <h1 style={{ 
              fontFamily: 'var(--font-display, "Playfair Display", serif)', 
              fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
              fontWeight: 400, 
              color: 'white',
              letterSpacing: '-0.02em'
            }}>
              Room {room.room_number}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginTop: 12 }}>
              {room.room_type?.name} • Floor {room.floor}
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 48 }}>
          {/* Left: images + info */}
          <div>
            {/* Main image */}
            <div style={{ 
              height: 480, 
              borderRadius: 24, 
              overflow: 'hidden', 
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              marginBottom: 16,
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}>
              {currentImg ? (
                <img 
                  src={currentImg.image} 
                  alt="Room" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              ) : (
                <div style={{ 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontFamily: 'var(--font-display, "Playfair Display", serif)', 
                  fontSize: '2rem', 
                  color: '#93c5fd', 
                  opacity: 0.5 
                }}>
                  No Image Available
                </div>
              )}
              
              {/* Status Badge Overlay */}
              <div style={{
                position: 'absolute',
                top: 20,
                right: 20,
                padding: '8px 20px',
                borderRadius: 100,
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                background: room.status === 'available' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}>
                {room.status === 'available' ? '✓ Available' : '✗ Unavailable'}
              </div>
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
                {images.map((img, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActiveImg(i)} 
                    style={{
                      width: 90, 
                      height: 70, 
                      borderRadius: 12, 
                      overflow: 'hidden', 
                      cursor: 'pointer',
                      border: i === activeImg ? '3px solid #c9a84c' : '2px solid #e2e8f0',
                      transition: 'all 0.3s',
                      boxShadow: i === activeImg ? '0 4px 12px rgba(201,168,76,0.3)' : 'none',
                      opacity: i === activeImg ? 1 : 0.7
                    }}
                    onMouseEnter={e => {
                      if (i !== activeImg) {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (i !== activeImg) {
                        e.currentTarget.style.opacity = '0.7';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <img src={img.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Room info card */}
            <div style={{ 
              background: 'white', 
              borderRadius: 24, 
              padding: 32,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ 
                  fontFamily: 'var(--font-display, "Playfair Display", serif)', 
                  fontSize: '1.5rem', 
                  color: '#0a1e3d', 
                  fontWeight: 500,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span>📖</span> About This Room
                </h2>
                <p style={{ color: '#475569', lineHeight: 1.8, fontSize: '0.95rem' }}>
                  {room.room_type?.description || 'A comfortable and well-appointed room designed for your perfect stay. Experience luxury and comfort with our premium amenities and exceptional service.'}
                </p>
              </div>
              
              <div>
                <h3 style={{ 
                  fontFamily: 'var(--font-display, "Playfair Display", serif)', 
                  fontSize: '1.2rem', 
                  color: '#0a1e3d', 
                  marginBottom: 20,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span>✨</span> Premium Amenities
                </h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {(room.room_type?.amenities || ['WiFi', 'Air Conditioning', 'TV', 'Mini Bar']).map(a => (
                    <span key={a} style={{ 
                      background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', 
                      padding: '8px 18px', 
                      borderRadius: 100, 
                      fontSize: '0.85rem', 
                      color: '#334155',
                      border: '1px solid #e2e8f0',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #c9a84c, #b8923e)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc, #f1f5f9)';
                      e.currentTarget.style.color = '#334155';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}>
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Room Features Grid */}
              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '1.2rem' }}>👥</span>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Capacity</div>
                      <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>Up to {room.room_type?.capacity} guests</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '1.2rem' }}>📍</span>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Floor</div>
                      <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>Floor {room.floor}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '1.2rem' }}>🛏️</span>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Bed Type</div>
                      <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>King Size Bed</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '1.2rem' }}>📶</span>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>WiFi</div>
                      <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>High-Speed Free</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: booking card */}
          <div>
            <div style={{ 
              background: 'white', 
              borderRadius: 24, 
              border: '1px solid rgba(0,0,0,0.05)', 
              padding: 32, 
              position: 'sticky', 
              top: 90, 
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
              transition: 'all 0.3s'
            }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ 
                  fontFamily: 'var(--font-display, "Playfair Display", serif)', 
                  fontSize: '3rem', 
                  color: '#c9a84c', 
                  fontWeight: 700,
                  letterSpacing: '-0.02em'
                }}>
                  ₱{Number(room.room_type?.base_price).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>
                  per night · taxes included
                </div>
              </div>

              <div style={{ 
                background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', 
                border: '1px solid #fde68a', 
                borderRadius: 16, 
                padding: '14px 18px', 
                marginBottom: 24, 
                fontSize: '0.85rem', 
                color: '#92400e',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                <span style={{ fontSize: '1.2rem' }}>💳</span>
                <span style={{ fontWeight: 500 }}>Pay at hotel — no upfront payment required</span>
              </div>

              {room.status === 'available' ? (
                isAuthenticated ? (
                  <button 
                    style={{ 
                      width: '100%', 
                      justifyContent: 'center', 
                      fontSize: '1rem', 
                      padding: '16px',
                      background: 'linear-gradient(135deg, #c9a84c, #b8923e)',
                      border: 'none',
                      borderRadius: 16,
                      color: 'white',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 15px rgba(201,168,76,0.3)'
                    }}
                    onClick={() => navigate(`/book/${room.id}`)}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(201,168,76,0.4)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(201,168,76,0.3)';
                    }}
                  >
                    Book This Room →
                  </button>
                ) : (
                  <div>
                    <Link 
                      to={`/login?next=/book/${room.id}`} 
                      style={{ 
                        width: '100%', 
                        justifyContent: 'center', 
                        marginBottom: 16,
                        display: 'block',
                        textAlign: 'center',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #c9a84c, #b8923e)',
                        borderRadius: 16,
                        color: 'white',
                        textDecoration: 'none',
                        fontWeight: 700,
                        transition: 'all 0.3s',
                        boxShadow: '0 4px 15px rgba(201,168,76,0.3)'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(201,168,76,0.4)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(201,168,76,0.3)';
                      }}
                    >
                      Sign In to Book
                    </Link>
                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
                      Don't have an account?{' '}
                      <Link to="/register" style={{ color: '#c9a84c', fontWeight: 600, textDecoration: 'none' }}>
                        Register
                      </Link>
                    </p>
                  </div>
                )
              ) : (
                <button 
                  disabled 
                  style={{ 
                    width: '100%', 
                    justifyContent: 'center', 
                    background: '#f1f5f9', 
                    color: '#94a3b8',
                    border: 'none',
                    borderRadius: 16,
                    padding: '16px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'not-allowed'
                  }}
                >
                  Currently Unavailable
                </button>
              )}

              {/* Additional Features */}
              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.85rem', color: '#64748b' }}>
                    <span style={{ fontSize: '1.1rem' }}>🔒</span>
                    <span>Secure & Safe Booking</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.85rem', color: '#64748b' }}>
                    <span style={{ fontSize: '1.1rem' }}>🔄</span>
                    <span>Free Cancellation up to 24 hours</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.85rem', color: '#64748b' }}>
                    <span style={{ fontSize: '1.1rem' }}>⭐</span>
                    <span>5-Star Guest Rating</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.85rem', color: '#64748b' }}>
                    <span style={{ fontSize: '1.1rem' }}>🎁</span>
                    <span>Complimentary Breakfast Included</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}