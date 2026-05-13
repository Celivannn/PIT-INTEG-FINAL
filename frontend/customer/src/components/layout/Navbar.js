import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const transparent = isHome && !scrolled;

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: transparent ? 'transparent' : 'rgba(15,43,76,0.97)',
      backdropFilter: transparent ? 'none' : 'blur(12px)',
      transition: 'all 0.4s ease',
      borderBottom: transparent ? 'none' : '1px solid rgba(255,255,255,0.08)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'white', letterSpacing: '0.02em' }}>Grand Azure</span>
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.18em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 500 }}>Hotel & Resort</span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[['/', 'Home'], ['/rooms', 'Rooms'], ['/search', 'Availability']].map(([path, label]) => (
            <Link key={path} to={path} style={{
              color: location.pathname === path ? 'var(--gold)' : 'rgba(255,255,255,0.85)',
              fontSize: '0.88rem', fontWeight: 500, letterSpacing: '0.04em',
              transition: 'color 0.2s',
              borderBottom: location.pathname === path ? '1px solid var(--gold)' : 'none',
              paddingBottom: 2,
            }}>{label}</Link>
          ))}
        </div>

        {/* Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isAuthenticated ? (
            <>
              <Link to="/my-reservations" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem', fontWeight: 500 }}>My Bookings</Link>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setMenuOpen(!menuOpen)} style={{
                  background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 8, padding: '8px 16px', color: 'white', fontSize: '0.88rem',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gold)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy)' }}>
                    {user?.full_name?.[0]?.toUpperCase()}
                  </span>
                  {user?.full_name?.split(' ')[0]}
                </button>
                {menuOpen && (
                  <div style={{
                    position: 'absolute', top: '110%', right: 0, background: 'white',
                    borderRadius: 10, boxShadow: 'var(--shadow-lg)', minWidth: 160,
                    overflow: 'hidden', border: '1px solid var(--gray-100)',
                  }} onClick={() => setMenuOpen(false)}>
                    <Link to="/profile" style={{ display: 'block', padding: '12px 16px', fontSize: '0.9rem', color: 'var(--gray-800)', borderBottom: '1px solid var(--gray-100)' }}>Profile</Link>
                    <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', fontSize: '0.9rem', color: '#dc2626', background: 'none', border: 'none' }}>Sign Out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem', fontWeight: 500 }}>Sign In</Link>
              <Link to="/register" className="btn btn-gold" style={{ padding: '9px 22px', fontSize: '0.85rem' }}>Book Now</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
