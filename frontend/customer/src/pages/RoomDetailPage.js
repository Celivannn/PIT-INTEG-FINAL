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

  useEffect(() => {
    getRoom(id).then(r => setRoom(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ paddingTop: 72 }}>
      <div className="container" style={{ paddingTop: 48 }}>
        <div className="skeleton" style={{ height: 480, borderRadius: 16, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
          <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
        </div>
      </div>
    </div>
  );

  if (!room) return <div style={{ paddingTop: 120, textAlign: 'center' }}>Room not found.</div>;

  const images = room.images || [];
  const currentImg = images[activeImg];

  return (
    <div style={{ paddingTop: 72, paddingBottom: 64 }}>
      <div className="container" style={{ paddingTop: 40 }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: 24, fontSize: '0.85rem', color: 'var(--gray-400)' }}>
          <Link to="/" style={{ color: 'var(--gray-400)' }}>Home</Link> ›{' '}
          <Link to="/rooms" style={{ color: 'var(--gray-400)' }}>Rooms</Link> ›{' '}
          <span style={{ color: 'var(--gray-800)' }}>Room {room.room_number}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 40 }}>
          {/* Left: images + info */}
          <div>
            {/* Main image */}
            <div style={{ height: 420, borderRadius: 16, overflow: 'hidden', background: '#dbeafe', marginBottom: 12, position: 'relative' }}>
              {currentImg ? (
                <img src={currentImg.image} alt="Room" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#93c5fd', opacity: 0.5 }}>No Image Available</div>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8 }}>
                {images.map((img, i) => (
                  <div key={i} onClick={() => setActiveImg(i)} style={{
                    width: 80, height: 60, borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                    border: i === activeImg ? '2px solid var(--blue)' : '2px solid transparent',
                    transition: 'border-color 0.2s',
                  }}>
                    <img src={img.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Room info */}
            <div style={{ marginTop: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--navy)', fontWeight: 400 }}>
                    Room {room.room_number}
                  </h1>
                  <span style={{ fontSize: '0.85rem', color: 'var(--gray-400)', textTransform: 'capitalize' }}>
                    {room.room_type?.name} · Floor {room.floor}
                  </span>
                </div>
                <span style={{ padding: '6px 16px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize',
                  background: room.status === 'available' ? '#d1fae5' : '#fee2e2',
                  color: room.status === 'available' ? '#065f46' : '#991b1b',
                }}>
                  {room.status}
                </span>
              </div>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.8, marginBottom: 24 }}>{room.room_type?.description || 'A comfortable and well-appointed room designed for your perfect stay.'}</p>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--navy)', marginBottom: 12 }}>Amenities</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(room.room_type?.amenities || ['WiFi', 'Air Conditioning', 'TV', 'Mini Bar']).map(a => (
                    <span key={a} style={{ background: 'var(--gray-100)', padding: '6px 14px', borderRadius: 99, fontSize: '0.85rem', color: 'var(--gray-600)' }}>✓ {a}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: booking card */}
          <div>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--gray-200)', padding: 28, position: 'sticky', top: 90, boxShadow: 'var(--shadow-md)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--blue)', marginBottom: 4 }}>
                PHP {Number(room.room_type?.base_price).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--gray-400)', marginBottom: 24 }}>per night · taxes included</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, border: '1.5px solid var(--gray-200)', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ padding: '12px 14px', background: 'var(--gray-50)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 2 }}>Capacity</div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--navy)', fontWeight: 500 }}>Up to {room.room_type?.capacity} guests</div>
                </div>
                <div style={{ padding: '12px 14px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 2 }}>Floor</div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--navy)', fontWeight: 500 }}>Floor {room.floor}</div>
                </div>
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: '0.82rem', color: '#92400e' }}>
                💳 Pay at hotel — no upfront payment required
              </div>

              {room.status === 'available' ? (
                isAuthenticated ? (
                  <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '14px' }}
                    onClick={() => navigate(`/book/${room.id}`)}>
                    Book This Room
                  </button>
                ) : (
                  <div>
                    <Link to={`/login?next=/book/${room.id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}>
                      Sign In to Book
                    </Link>
                    <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--gray-400)' }}>
                      Don't have an account? <Link to="/register" style={{ color: 'var(--blue)' }}>Register</Link>
                    </p>
                  </div>
                )
              ) : (
                <button className="btn" disabled style={{ width: '100%', justifyContent: 'center', background: 'var(--gray-100)', color: 'var(--gray-400)' }}>
                  Currently Unavailable
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
