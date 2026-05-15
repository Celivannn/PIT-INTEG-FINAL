import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/auth';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ full_name: user.full_name || '', phone: user.phone || '' });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      // Refresh user data
      if (login) {
        await login(user.email, user.password, true);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match.');
      return;
    }
    if (passwordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    
    setPasswordLoading(true);
    try {
      await updateProfile({ password: passwordData.new_password });
      toast.success('Password changed successfully!');
      setShowPasswordChange(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Get initials for avatar
  const getInitials = () => {
    if (!user?.full_name) return '?';
    return user.full_name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get random gradient for avatar
  const getAvatarGradient = () => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    ];
    const index = (user?.email?.length || 0) % gradients.length;
    return gradients[index];
  };

  return (
    <div style={{ 
      paddingTop: 72, 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
      minHeight: '100vh' 
    }}>
      {/* Hero Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0a1e3d 0%, #0f2b4c 50%, #1a3a5c 100%)',
        padding: '60px 0 80px',
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
          background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,95,168,0.15) 0%, transparent 70%)',
          animation: 'float 10s ease-in-out infinite reverse'
        }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{
                display: 'inline-block',
                padding: '6px 16px',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '100px',
                marginBottom: 20,
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                color: '#c9a84c'
              }}>
                MY ACCOUNT
              </div>
              <h1 style={{ 
                fontFamily: 'var(--font-display, "Playfair Display", serif)', 
                fontSize: 'clamp(2rem, 5vw, 3rem)', 
                fontWeight: 300, 
                color: 'white',
                marginBottom: 12
              }}>
                Profile Settings
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
                Manage your personal information and preferences
              </p>
            </div>
            <Link 
              to="/my-reservations" 
              style={{
                padding: '12px 28px',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50px',
                color: 'white',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'all 0.3s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                border: '1px solid rgba(255,255,255,0.2)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              View My Reservations →
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', marginTop: -40, paddingBottom: 80 }}>
        {/* Profile Card */}
        <div style={{
          background: 'white',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          animation: 'fadeInUp 0.6s ease'
        }}>
          {/* Profile Header */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)',
            padding: '40px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              {/* Avatar */}
              <div style={{
                position: 'relative',
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: getAvatarGradient(),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: 700,
                color: 'white',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                {getInitials()}
                <div style={{
                  position: 'absolute',
                  bottom: 5,
                  right: 5,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#c9a84c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  border: '3px solid white'
                }}>
                  ✎
                </div>
              </div>

              <div>
                <h2 style={{
                  fontFamily: 'var(--font-display, "Playfair Display", serif)',
                  fontSize: '1.8rem',
                  color: '#0a1e3d',
                  marginBottom: 8
                }}>
                  {user?.full_name || 'Guest User'}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 12px',
                    background: '#f0fdf4',
                    borderRadius: 100,
                    fontSize: '0.75rem',
                    color: '#10b981'
                  }}>
                    ✓ Verified Account
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 12px',
                    background: '#fef3c7',
                    borderRadius: 100,
                    fontSize: '0.75rem',
                    color: '#f59e0b'
                  }}>
                    ★ Member since {new Date().getFullYear()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div style={{ padding: '40px' }}>
            {!isEditing ? (
              // View Mode
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 32
                }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: 600,
                    color: '#0a1e3d'
                  }}>
                    Personal Information
                  </h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: '8px 20px',
                      background: 'linear-gradient(135deg, #c9a84c, #b8923e)',
                      border: 'none',
                      borderRadius: 8,
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 5px 15px rgba(201,168,76,0.3)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    ✎ Edit Profile
                  </button>
                </div>

                <div style={{ display: 'grid', gap: 24 }}>
                  <div>
                    <label style={{
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontWeight: 600,
                      marginBottom: 8,
                      display: 'block'
                    }}>
                      Full Name
                    </label>
                    <div style={{
                      fontSize: '1rem',
                      color: '#1a1a2e',
                      padding: '12px 0',
                      borderBottom: '2px solid #f0f0f0'
                    }}>
                      {form.full_name || 'Not set'}
                    </div>
                  </div>

                  <div>
                    <label style={{
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontWeight: 600,
                      marginBottom: 8,
                      display: 'block'
                    }}>
                      Email Address
                    </label>
                    <div style={{
                      fontSize: '1rem',
                      color: '#1a1a2e',
                      padding: '12px 0',
                      borderBottom: '2px solid #f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      {user?.email}
                      <span style={{
                        fontSize: '0.7rem',
                        color: '#10b981',
                        background: '#f0fdf4',
                        padding: '2px 8px',
                        borderRadius: 100
                      }}>
                        Verified
                      </span>
                    </div>
                  </div>

                  <div>
                    <label style={{
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontWeight: 600,
                      marginBottom: 8,
                      display: 'block'
                    }}>
                      Phone Number
                    </label>
                    <div style={{
                      fontSize: '1rem',
                      color: '#1a1a2e',
                      padding: '12px 0',
                      borderBottom: '2px solid #f0f0f0'
                    }}>
                      {form.phone || 'Not provided'}
                    </div>
                  </div>
                </div>

                {/* Password Change Link */}
                <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
                  <button
                    onClick={() => setShowPasswordChange(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#c9a84c',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'gap 0.3s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.gap = '10px'}
                    onMouseLeave={e => e.currentTarget.style.gap = '6px'}
                  >
                    Change Password →
                  </button>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleSubmit}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 32
                }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: 600,
                    color: '#0a1e3d'
                  }}>
                    Edit Profile
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setForm({ full_name: user?.full_name || '', phone: user?.phone || '' });
                    }}
                    style={{
                      padding: '8px 20px',
                      background: 'transparent',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      color: '#666',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#c9a84c';
                      e.currentTarget.style.color = '#c9a84c';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.color = '#666';
                    }}
                  >
                    Cancel
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div className="form-group">
                    <label style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#0a1e3d',
                      marginBottom: 8,
                      display: 'block'
                    }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: 12,
                        fontSize: '1rem',
                        transition: 'all 0.3s',
                        outline: 'none'
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = '#c9a84c';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)';
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#0a1e3d',
                      marginBottom: 8,
                      display: 'block'
                    }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email}
                      disabled
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: 12,
                        fontSize: '1rem',
                        background: '#f9fafb',
                        color: '#9ca3af',
                        cursor: 'not-allowed'
                      }}
                    />
                    <p style={{
                      fontSize: '0.7rem',
                      color: '#9ca3af',
                      marginTop: 4
                    }}>
                      Email cannot be changed. Contact support for assistance.
                    </p>
                  </div>

                  <div className="form-group">
                    <label style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#0a1e3d',
                      marginBottom: 8,
                      display: 'block'
                    }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+63 XXX XXX XXXX"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: 12,
                        fontSize: '1rem',
                        transition: 'all 0.3s',
                        outline: 'none'
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = '#c9a84c';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)';
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: '12px 32px',
                        background: 'linear-gradient(135deg, #c9a84c, #b8923e)',
                        border: 'none',
                        borderRadius: 12,
                        color: 'white',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s',
                        opacity: loading ? 0.7 : 1
                      }}
                      onMouseEnter={e => {
                        if (!loading) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 5px 15px rgba(201,168,76,0.3)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!loading) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordChange && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease'
          }} onClick={() => setShowPasswordChange(false)}>
            <div style={{
              background: 'white',
              borderRadius: 24,
              padding: 32,
              maxWidth: 450,
              width: '90%',
              animation: 'slideUp 0.3s ease'
            }} onClick={e => e.stopPropagation()}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: '#0a1e3d'
                }}>
                  Change Password
                </h3>
                <button
                  onClick={() => setShowPasswordChange(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#999'
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handlePasswordChange}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#0a1e3d',
                      marginBottom: 8,
                      display: 'block'
                    }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={e => setPasswordData(p => ({ ...p, new_password: e.target.value }))}
                      required
                      minLength={6}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: 12,
                        fontSize: '1rem',
                        transition: 'all 0.3s',
                        outline: 'none'
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = '#c9a84c';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)';
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#0a1e3d',
                      marginBottom: 8,
                      display: 'block'
                    }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={e => setPasswordData(p => ({ ...p, confirm_password: e.target.value }))}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: 12,
                        fontSize: '1rem',
                        transition: 'all 0.3s',
                        outline: 'none'
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = '#c9a84c';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)';
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: 'linear-gradient(135deg, #c9a84c, #b8923e)',
                        border: 'none',
                        borderRadius: 12,
                        color: 'white',
                        fontWeight: 600,
                        cursor: passwordLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s',
                        opacity: passwordLoading ? 0.7 : 1
                      }}
                    >
                      {passwordLoading ? 'Changing...' : 'Change Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPasswordChange(false)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: 'transparent',
                        border: '2px solid #e5e7eb',
                        borderRadius: 12,
                        color: '#666',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#c9a84c';
                        e.currentTarget.style.color = '#c9a84c';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.color = '#666';
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
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
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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
      `}</style>
    </div>
  );
}