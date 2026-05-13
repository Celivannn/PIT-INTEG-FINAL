import React, { useState, useEffect } from 'react';
import { getDashboard } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

function KPICard({ icon, label, value, sub, color }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--gray-800)', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginTop: 6 }}>{sub}</div>}
        </div>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{icon}</div>
      </div>
    </div>
  );
}

const STATUS_COLORS = { pending: '#f59e0b', confirmed: '#3b82f6', checked_in: '#10b981', checked_out: '#94a3b8', cancelled: '#ef4444' };

export default function DashboardPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const [range, setRange]   = useState({ date_from: firstDay, date_to: today });

  useEffect(() => {
    setLoading(true);
    getDashboard(range).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [range]);

  const monthlyData = (data?.monthly_trend || []).slice().reverse().map(m => ({
    month: new Date(m.month).toLocaleString('default', { month: 'short' }),
    bookings: m.count,
    revenue: parseFloat(m.revenue || 0),
  }));

  const pieData = (data?.status_breakdown || []).map(s => ({
    name: s.status.replace('_', ' '),
    value: s.count,
    color: STATUS_COLORS[s.status] || '#94a3b8',
  }));

  if (loading) return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 24 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: 110, borderRadius: 10, background: '#e2e8f0', animation: 'pulse 1.5s infinite' }} />)}
      </div>
      <div style={{ height: 320, borderRadius: 10, background: '#e2e8f0' }} />
    </div>
  );

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em' }}>Dashboard</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)', marginTop: 2 }}>Overview of hotel performance</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input type="date" value={range.date_from} onChange={e => setRange(r => ({ ...r, date_from: e.target.value }))}
            style={{ padding: '8px 12px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: '0.82rem', outline: 'none' }} />
          <span style={{ color: 'var(--gray-400)', fontSize: '0.82rem' }}>to</span>
          <input type="date" value={range.date_to} onChange={e => setRange(r => ({ ...r, date_to: e.target.value }))}
            style={{ padding: '8px 12px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: '0.82rem', outline: 'none' }} />
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 24 }}>
        <KPICard icon="📋" label="Total Bookings"   value={data?.total_bookings ?? 0}            sub="In selected period"      color="#3b82f6" />
        <KPICard icon="💰" label="Revenue"           value={`₱${Number(data?.total_revenue ?? 0).toLocaleString()}`} sub="Confirmed + checked out" color="#10b981" />
        <KPICard icon="🏨" label="Occupancy Rate"   value={`${data?.occupancy_rate ?? 0}%`}      sub="Current room occupancy"  color="#f59e0b" />
        <KPICard icon="👥" label="Total Customers"  value={data?.total_customers ?? 0}            sub="Registered guests"       color="#8b5cf6" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Monthly Bookings & Revenue</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: '0.82rem' }} />
                <Bar dataKey="bookings" fill="#1e5fa8" radius={[6,6,0,0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Booking Status</span>
          </div>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} contentStyle={{ borderRadius: 8, fontSize: '0.82rem', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: '0.78rem', color: 'var(--gray-600)', textTransform: 'capitalize' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ color: 'var(--gray-400)', fontSize: '0.85rem', textAlign: 'center', padding: 40 }}>No booking data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
