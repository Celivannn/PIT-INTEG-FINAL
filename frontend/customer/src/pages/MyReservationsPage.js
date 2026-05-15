import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getMyReservations, cancelReservation } from '../api/reservations';
import toast from 'react-hot-toast';

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const contentRefs = useRef({});

  const load = () => getMyReservations()
    .then(r => setReservations(r.data.results || r.data))
    .finally(() => setLoading(false));
  
  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    setCancelling(id);
    try {
      await cancelReservation(id);
      toast.success('Reservation cancelled successfully.');
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Could not cancel reservation.');
    } finally {
      setCancelling(null);
    }
  };

  const toggleExpand = (id, e) => {
    // Stop propagation to prevent any parent handlers
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredReservations = reservations.filter(r => {
    if (selectedFilter === 'all') return true;
    return r.status === selectedFilter;
  });

  const getStatusStyle = (status) => {
    switch(status) {
      case 'confirmed':
        return { bg: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', icon: '✓', label: 'CONFIRMED' };
      case 'pending':
        return { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', icon: '⏳', label: 'PENDING' };
      case 'checked_in':
        return { bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', icon: '🏨', label: 'CHECKED IN' };
      case 'checked_out':
        return { bg: 'linear-gradient(135deg, #6b7280, #4b5563)', color: 'white', icon: '✓✓', label: 'CHECKED OUT' };
      case 'cancelled':
        return { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', icon: '✗', label: 'CANCELLED' };
      default:
        return { bg: 'linear-gradient(135deg, #9ca3af, #6b7280)', color: 'white', icon: '•', label: status };
    }
  };

  return (
    <div style={{ 
      paddingTop: 72, 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
      minHeight: '100vh' 
    }}>
      {/* Hero Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0a1e3d 0%, #0f2b4c 50%, #1a3a5c 100%)',
        padding: '60px 0 80px',
        position: 'relative',
        overflow: 'hidden'
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
        
        <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
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
                <span>✦</span> MY ACCOUNT <span>✦</span>
              </div>
              <h1 style={{ 
                fontFamily: 'var(--font-display, "Playfair Display", serif)', 
                fontSize: 'clamp(2rem, 5vw, 3rem)', 
                fontWeight: 400, 
                color: 'white',
                marginBottom: 12,
                letterSpacing: '-0.02em'
              }}>
                My Reservations
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
                {reservations.length} {reservations.length === 1 ? 'reservation' : 'reservations'} found
              </p>
            </div>
            <Link 
              to="/rooms" 
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #c9a84c, #b8923e)',
                borderRadius: '50px',
                color: 'white',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'all 0.3s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 15px rgba(201,168,76,0.2)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(201,168,76,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(201,168,76,0.2)';
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>+</span> New Reservation
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', marginTop: -40, paddingBottom: 80 }}>
        {/* Filter Tabs */}
        {!loading && reservations.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: 20,
            padding: 6,
            marginBottom: 32,
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            {[
              { id: 'all', label: 'All Reservations', icon: '📋' },
              { id: 'confirmed', label: 'Confirmed', icon: '✓' },
              { id: 'pending', label: 'Pending', icon: '⏳' },
              { id: 'checked_in', label: 'Checked In', icon: '🏨' },
              { id: 'checked_out', label: 'Checked Out', icon: '✓✓' },
              { id: 'cancelled', label: 'Cancelled', icon: '✗' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                style={{
                  padding: '10px 24px',
                  background: selectedFilter === filter.id ? 'linear-gradient(135deg, #c9a84c, #b8923e)' : 'transparent',
                  border: 'none',
                  borderRadius: 14,
                  color: selectedFilter === filter.id ? 'white' : '#64748b',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>{filter.icon}</span>
                {filter.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{
                height: 180,
                borderRadius: 20,
                background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                animation: 'shimmer 2s infinite'
              }} />
            ))}
          </div>
        ) : filteredReservations.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 40px',
            background: 'white',
            borderRadius: 24,
            boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <div style={{
              fontSize: '5rem',
              marginBottom: 20,
              animation: 'float 3s ease-in-out infinite'
            }}>
              🏨
            </div>
            <h2 style={{ 
              fontFamily: 'var(--font-display, "Playfair Display", serif)', 
              fontSize: '1.8rem', 
              color: '#0a1e3d', 
              marginBottom: 12,
              fontWeight: 400
            }}>
              No Reservations Yet
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32, fontSize: '1rem' }}>
              {selectedFilter !== 'all' 
                ? `No ${selectedFilter} reservations found.` 
                : 'Start your luxury journey with us today!'}
            </p>
            <Link 
              to="/rooms" 
              style={{
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #c9a84c, #b8923e)',
                borderRadius: '50px',
                color: 'white',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-block',
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(201,168,76,0.2)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(201,168,76,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(201,168,76,0.2)';
              }}
            >
              Browse Available Rooms
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {filteredReservations.map((r, idx) => {
              const statusStyle = getStatusStyle(r.status);
              const checkInDate = new Date(r.check_in);
              const checkOutDate = new Date(r.check_out);
              const isExpanded = expandedId === r.id;
              
              return (
                <div
                  key={r.id}
                  style={{
                    background: 'white',
                    borderRadius: 24,
                    overflow: 'hidden',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    animation: `fadeInUp 0.5s ease ${idx * 0.05}s backwards`,
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Main Card - No onClick here anymore */}
                  <div style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
                      {/* Status Badge */}
                      <div style={{ minWidth: 110 }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 16px',
                          background: statusStyle.bg,
                          borderRadius: 100,
                          color: statusStyle.color,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          letterSpacing: '0.5px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                          <span style={{ fontSize: '0.9rem' }}>{statusStyle.icon}</span>
                          {statusStyle.label}
                        </div>
                      </div>

                      {/* Booking Reference */}
                      <div style={{ flex: 1, minWidth: 140 }}>
                        <div style={{ 
                          fontSize: '0.7rem', 
                          color: '#94a3b8', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.1em', 
                          marginBottom: 6,
                          fontWeight: 600
                        }}>
                          Booking Reference
                        </div>
                        <div style={{ 
                          fontWeight: 700, 
                          color: '#0f172a', 
                          fontSize: '0.95rem',
                          fontFamily: 'monospace',
                          letterSpacing: '0.5px',
                          background: '#f8fafc',
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: 8
                        }}>
                          {r.booking_ref}
                        </div>
                      </div>

                      {/* Room Info */}
                      <div style={{ flex: 2, minWidth: 180 }}>
                        <div style={{ 
                          fontSize: '0.7rem', 
                          color: '#94a3b8', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.1em', 
                          marginBottom: 6,
                          fontWeight: 600
                        }}>
                          Room Details
                        </div>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 6, fontSize: '0.95rem' }}>
                          {r.room?.room_type?.name} • Room {r.room?.room_number}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>👥 {r.guests} {r.guests === 1 ? 'Guest' : 'Guests'}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>🛏️ {r.room?.room_type?.capacity} max</span>
                        </div>
                      </div>

                      {/* Dates */}
                      <div style={{ flex: 2, minWidth: 200 }}>
                        <div style={{ 
                          fontSize: '0.7rem', 
                          color: '#94a3b8', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.1em', 
                          marginBottom: 6,
                          fontWeight: 600
                        }}>
                          Stay Dates
                        </div>
                        <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: 6, fontSize: '0.9rem' }}>
                          {checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
                          <span style={{ color: '#c9a84c', margin: '0 6px' }}>→</span> 
                          {checkOutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {r.nights} {r.nights === 1 ? 'night' : 'nights'}
                        </div>
                      </div>

                      {/* Price */}
                      <div style={{ minWidth: 130, textAlign: 'right' }}>
                        <div style={{ 
                          fontSize: '0.7rem', 
                          color: '#94a3b8', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.1em', 
                          marginBottom: 6,
                          fontWeight: 600
                        }}>
                          Total Amount
                        </div>
                        <div style={{ 
                          fontFamily: 'var(--font-display, "Playfair Display", serif)', 
                          fontSize: '1.5rem', 
                          color: '#c9a84c', 
                          fontWeight: 700,
                          letterSpacing: '-0.01em'
                        }}>
                          ₱{Number(r.total_price).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          ₱{Math.round(Number(r.total_price) / r.nights).toLocaleString()}/night
                        </div>
                      </div>

                      {/* Expand/Collapse Button - Separate click handler */}
                      <button
                        onClick={(e) => toggleExpand(r.id, e)}
                        style={{ 
                          color: '#c9a84c', 
                          fontSize: '1.2rem',
                          width: 40,
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          transition: 'all 0.3s',
                          background: isExpanded ? 'rgba(201,168,76,0.1)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          margin: 0,
                          padding: 0
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(201,168,76,0.15)';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = isExpanded ? 'rgba(201,168,76,0.1)' : 'transparent';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        {isExpanded ? '▲' : '▼'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div style={{
                      borderTop: '2px solid rgba(201,168,76,0.1)',
                      padding: '28px',
                      background: 'linear-gradient(135deg, #faf9f6 0%, #ffffff 100%)',
                      animation: 'slideDown 0.3s ease'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28 }}>
                        {/* Additional Details */}
                        <div>
                          <h4 style={{ 
                            fontSize: '0.85rem', 
                            fontWeight: 700, 
                            color: '#0f172a', 
                            marginBottom: 16,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            <span style={{ fontSize: '1.1rem' }}>📋</span> Booking Details
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Created:</span>
                              <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: 4 }}>
                                {new Date(r.created_at).toLocaleDateString('en-US', { 
                                  month: 'long', 
                                  day: 'numeric', 
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                            {r.special_requests && (
                              <div>
                                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Special Requests:</span>
                                <div style={{ 
                                  fontSize: '0.85rem', 
                                  color: '#475569', 
                                  marginTop: 4, 
                                  fontStyle: 'italic',
                                  padding: '8px 12px',
                                  background: 'white',
                                  borderRadius: 12,
                                  border: '1px solid rgba(0,0,0,0.05)'
                                }}>
                                  "{r.special_requests}"
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Room Amenities */}
                        {r.room?.room_type?.amenities && r.room.room_type.amenities.length > 0 && (
                          <div>
                            <h4 style={{ 
                              fontSize: '0.85rem', 
                              fontWeight: 700, 
                              color: '#0f172a', 
                              marginBottom: 16,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              <span style={{ fontSize: '1.1rem' }}>✨</span> Room Amenities
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                              {r.room.room_type.amenities.slice(0, 6).map(amenity => (
                                <span key={amenity} style={{
                                  padding: '6px 14px',
                                  background: 'white',
                                  borderRadius: 100,
                                  fontSize: '0.75rem',
                                  color: '#475569',
                                  border: '1px solid #e2e8f0',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}>
                                  {amenity}
                                </span>
                              ))}
                              {r.room.room_type.amenities.length > 6 && (
                                <span style={{
                                  padding: '6px 14px',
                                  background: '#f1f5f9',
                                  borderRadius: 100,
                                  fontSize: '0.75rem',
                                  color: '#64748b',
                                  fontWeight: 500
                                }}>
                                  +{r.room.room_type.amenities.length - 6} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div>
                          <h4 style={{ 
                            fontSize: '0.85rem', 
                            fontWeight: 700, 
                            color: '#0f172a', 
                            marginBottom: 16,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            <span style={{ fontSize: '1.1rem' }}>⚡</span> Quick Actions
                          </h4>
                          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <Link 
                              to={`/rooms/${r.room?.id}`} 
                              style={{
                                padding: '10px 20px',
                                background: 'white',
                                border: '2px solid #c9a84c',
                                borderRadius: 12,
                                color: '#c9a84c',
                                textDecoration: 'none',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                transition: 'all 0.3s',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8
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
                              View Room Details →
                            </Link>
                            
                            {r.can_cancel && (
                              <button
                                onClick={() => handleCancel(r.id)}
                                disabled={cancelling === r.id}
                                style={{
                                  padding: '10px 20px',
                                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                  border: 'none',
                                  borderRadius: 12,
                                  color: 'white',
                                  fontSize: '0.85rem',
                                  fontWeight: 700,
                                  cursor: cancelling === r.id ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.3s',
                                  opacity: cancelling === r.id ? 0.7 : 1,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  boxShadow: '0 2px 8px rgba(239,68,68,0.2)'
                                }}
                                onMouseEnter={e => {
                                  if (cancelling !== r.id) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.3)';
                                  }
                                }}
                                onMouseLeave={e => {
                                  if (cancelling !== r.id) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,68,68,0.2)';
                                  }
                                }}
                              >
                                {cancelling === r.id ? 'Cancelling...' : 'Cancel Reservation ✗'}
                              </button>
                            )}
                            
                            {r.status === 'confirmed' && (
                              <button
                                style={{
                                  padding: '10px 20px',
                                  background: 'linear-gradient(135deg, #10b981, #059669)',
                                  border: 'none',
                                  borderRadius: 12,
                                  color: 'white',
                                  fontSize: '0.85rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  transition: 'all 0.3s',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  boxShadow: '0 2px 8px rgba(16,185,129,0.2)'
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(16,185,129,0.2)';
                                }}
                              >
                                Download Invoice 📄
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
        
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
      `}</style>
    </div>
  );
}