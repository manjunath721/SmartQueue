import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerTokenPage from './pages/CustomerTokenPage';
import TokenTrackingPage from './pages/TokenTrackingPage';
import DisplayBoardPage from './pages/DisplayBoardPage';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ServiceManagement from './pages/ServiceManagement';
import QueueManagement from './pages/QueueManagement';
import CustomerManagement from './pages/CustomerManagement';
import StaffManagementPage from './pages/StaffManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';

const App = () => {
  const location = useLocation();
  const isDisplayBoard = location.pathname.startsWith('/display');
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isDisplayBoard) {
    return (
      <Routes>
        <Route path="/display" element={<DisplayBoardPage />} />
      </Routes>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      {isAdminRoute ? (
        <div className="d-flex flex-grow-1">
          <Sidebar />
          <main className="flex-grow-1 bg-light">
            <Routes>
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="ROLE_ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/queue"
                element={
                  <ProtectedRoute requiredRole="ROLE_ADMIN">
                    <QueueManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/services"
                element={
                  <ProtectedRoute requiredRole="ROLE_ADMIN">
                    <ServiceManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/staff"
                element={
                  <ProtectedRoute requiredRole="ROLE_ADMIN">
                    <StaffManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/customers"
                element={
                  <ProtectedRoute requiredRole="ROLE_ADMIN">
                    <CustomerManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute requiredRole="ROLE_ADMIN">
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      ) : (
        <main className="flex-grow-1 d-flex flex-column">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/take-token" element={<CustomerTokenPage />} />
            <Route path="/track" element={<TokenTrackingPage />} />
            <Route path="/track/:trackingId" element={<TokenTrackingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/staff"
              element={
                <ProtectedRoute requiredRole="ROLE_STAFF">
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      )}

      <Footer />
    </div>
  );
};

export default App;
