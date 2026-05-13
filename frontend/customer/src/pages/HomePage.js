import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRoomTypes } from '../api/rooms';

export default function HomePage() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [roomTypeImages, setRoomTypeImages] = useState({});

  // Fetch room types on component mount
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const { data } = await getRoomTypes();
        const types = data.results || data;
        setRoomTypes(types);
        
        // Generate placeholder images for each room type
        const images = {};
        types.forEach(type => {
          const name = type.name.toLowerCase();
          if (name === 'standard') {
            images[type.id] = { bg: '#dbeafe', accent: '#1e5fa8', icon: '🛏️' };
          } else if (name === 'deluxe') {
            images[type.id] = { bg: '#fef3c7', accent: '#92400e', icon: '✨' };
          } else if (name === 'suite') {
            images[type.id] = { bg: '#f0fdf4', accent: '#065f46', icon: '👑' };
          } else {
            images[type.id] = { bg: '#f3e8ff', accent: '#7c3aed', icon: '🏨' };
          }
        });
        setRoomTypeImages(images);
      } catch (error) {
        console.error('Error fetching room types:', error);
      } finally {
        setTypesLoading(false);
      }
    };
    fetchRoomTypes();
  }, []);

  // Helper function to format price
  const formatPrice = (price) => {
    return `₱${Number(price).toLocaleString()}/night`;
  };

  // Helper function to get description based on room type
  const getRoomDescription = (typeName) => {
    const name = typeName.toLowerCase();
    if (name === 'standard') {
      return 'Comfortable and well-appointed rooms with all essential amenities for a perfect stay.';
    } else if (name === 'deluxe') {
      return 'Spacious rooms with premium furnishings, enhanced amenities, and stunning views.';
    } else if (name === 'suite') {
      return 'The pinnacle of luxury — expansive suites with separate living areas and exclusive perks.';
    } else {
      return `Experience our luxurious ${typeName} rooms with premium amenities and exceptional service.`;
    }
  };

  return (
    <div>
      {/* Hero */}
      <section style={{
        minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, #0a1e3d 0%, #0f2b4c 40%, #1a3a5c 100%)',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -150, left: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,95,168,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 24px', animation: 'fadeUp 0.8s ease forwards' }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 20, fontWeight: 600 }}>Welcome to Grand Azure</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 7vw, 5.5rem)', fontWeight: 300, color: 'white', lineHeight: 1.1, marginBottom: 20 }}>
            Where Luxury<br /><em style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>Meets Comfort</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.1rem', maxWidth: 480, margin: '0 auto', lineHeight: 1.8 }}>
            Discover an unparalleled experience of elegance and hospitality in the heart of Cagayan de Oro.
          </p>
        </div>

      </section>

      {/* Features */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--blue)', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>Why Choose Us</div>
          <h2 className="section-title" style={{ marginBottom: 48 }}>The Grand Azure Experience</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              { icon: '🌊', title: 'Breathtaking Views', desc: 'Wake up to panoramic cityscapes and natural beauty from every room.' },
              { icon: '🍽️', title: 'Fine Dining', desc: 'World-class cuisine crafted by expert chefs using fresh local ingredients.' },
              { icon: '🧖', title: 'Wellness & Spa', desc: 'Rejuvenate your body and mind with our premium wellness facilities.' },
              { icon: '🏊', title: 'Infinity Pool', desc: 'Dive into luxury with our stunning rooftop infinity pool experience.' },
              { icon: '🔒', title: 'Secure Booking', desc: 'Book with confidence. Your reservation is guaranteed and protected.' },
              { icon: '💳', title: 'Pay at Hotel', desc: 'No upfront payment required. Simply pay upon arrival at check-in.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ padding: '32px 24px', borderRadius: 16, border: '1px solid var(--gray-100)', textAlign: 'center', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-100)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--navy)', marginBottom: 8 }}>{title}</h3>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Room Types Preview - Dynamic */}
      <section className="section" style={{ background: 'var(--cream)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--blue)', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>Accommodations</div>
            <h2 className="section-title">Our Room Categories</h2>
            <p className="section-subtitle">From cozy rooms to luxurious suites</p>
          </div>
          
          {typesLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 400, borderRadius: 16 }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {roomTypes.map(type => {
                const style = roomTypeImages[type.id] || { bg: '#f3e8ff', accent: '#7c3aed', icon: '🏨' };
                return (
                  <div key={type.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)', transition: 'all 0.3s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                  >
                    <div style={{ height: 180, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                      <span style={{ fontSize: '3rem' }}>{style.icon}</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: style.accent, opacity: 0.5, textTransform: 'capitalize' }}>
                        {type.name}
                      </span>
                    </div>
                    <div style={{ padding: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--navy)', textTransform: 'capitalize' }}>
                          {type.name} Room
                        </h3>
                        <span style={{ fontSize: '0.78rem', color: 'var(--blue)', fontWeight: 600, background: style.bg, padding: '4px 10px', borderRadius: 99 }}>
                          {formatPrice(type.base_price)}
                        </span>
                      </div>
                      <p style={{ color: 'var(--gray-600)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: 16 }}>
                        {type.description || getRoomDescription(type.name)}
                      </p>
                      <div style={{ marginBottom: 16 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                          👥 Up to {type.capacity} guests
                        </span>
                        {type.amenities && type.amenities.length > 0 && (
                          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {type.amenities.slice(0, 3).map(amenity => (
                              <span key={amenity} style={{ fontSize: '0.7rem', background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 99, color: 'var(--gray-600)' }}>
                                {amenity}
                              </span>
                            ))}
                            {type.amenities.length > 3 && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>+{type.amenities.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>
                      <Link to="/rooms" style={{ color: 'var(--blue)', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        View details →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)', padding: '80px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 300, color: 'white', marginBottom: 16 }}>
            Ready for Your Stay?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', marginBottom: 32 }}>Book directly and enjoy our best available rates.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link to="/rooms" className="btn btn-gold" style={{ fontSize: '0.95rem', padding: '14px 32px' }}>Browse Our Rooms</Link>
          </div>
        </div>
      </section>
    </div>
  );
}