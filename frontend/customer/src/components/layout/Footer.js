import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--navy)', color: 'white', padding: '64px 0 32px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 600, marginBottom: 8 }}>Grand Azure</div>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.18em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 16 }}>Hotel & Resort</div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.8, maxWidth: 300 }}>
              Experience luxury and comfort in the heart of the city. Your perfect stay awaits.
            </p>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16, fontWeight: 600 }}>Quick Links</div>
            {[['/', 'Home'], ['/rooms', 'Our Rooms'], ['/search', 'Check Availability'], ['/my-reservations', 'My Bookings']].map(([to, label]) => (
              <Link key={to} to={to} style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'white'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
              >{label}</Link>
            ))}
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16, fontWeight: 600 }}>Contact</div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 2 }}>
              📍 Cagayan de Oro, Philippines<br />
              📞 +63 912 345 6789<br />
              ✉️ info@grandazure.com
            </p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>© 2026 Grand Azure Hotel. All rights reserved.</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>Pay at hotel · PHP pricing</span>
        </div>
      </div>
    </footer>
  );
}
