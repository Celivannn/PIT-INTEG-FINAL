import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReservationsPage from './pages/ReservationsPage';
import RoomsPage from './pages/RoomsPage';
import CustomersPage from './pages/CustomersPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.875rem' } }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={
            <PrivateRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/"             element={<DashboardPage />} />
                  <Route path="/reservations" element={<ReservationsPage />} />
                  <Route path="/rooms"        element={<RoomsPage />} />
                  <Route path="/customers"    element={<CustomersPage />} />
                  <Route path="/reports"      element={<ReportsPage />} />
                  <Route path="/settings"     element={<SettingsPage />} />
                  <Route path="*"             element={<Navigate to="/" replace />} />
                </Routes>
              </AdminLayout>
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
