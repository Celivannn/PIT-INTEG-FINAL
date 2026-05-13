import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/',             icon: '📊', label: 'Dashboard' },
  { to: '/reservations', icon: '📋', label: 'Reservations' },
  { to: '/rooms',        icon: '🏨', label: 'Rooms' },
  { to: '/customers',    icon: '👥', label: 'Customers' },
  { to: '/reports',      icon: '📈', label: 'Reports' },
  { to: '/settings',     icon: '⚙️',  label: 'Settings' },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 'var(--sidebar-w)', background: 'var(--navy)', color: 'white',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Grand Azure</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 2 }}>Admin Dashboard</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
              borderRadius: 8, marginBottom: 4, fontSize: '0.875rem', fontWeight: 500,
              color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
              background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
              transition: 'all 0.15s',
              textDecoration: 'none',
            })}>
              <span style={{ fontSize: '1rem' }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, marginBottom: 8, background: 'rgba(255,255,255,0.06)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy)', flexShrink: 0 }}>
              {user?.full_name?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.full_name}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Administrator</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '9px 14px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 'var(--sidebar-w)', flex: 1, minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
