import React, { createContext, useContext, useState } from 'react';
import { adminLogin, adminLogout } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('admin_user') || 'null'));

  const login = async (email, password) => {
    const { data } = await adminLogin({ email, password });
    if (data.user.role !== 'admin') throw new Error('Access denied. Admin accounts only.');
    localStorage.setItem('admin_access_token', data.access);
    localStorage.setItem('admin_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try { await adminLogout(); } catch (_) {}
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
