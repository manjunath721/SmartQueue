import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Checking authentication session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole === 'ROLE_ADMIN' && !user?.roles?.includes('ROLE_ADMIN')) {
    return <Navigate to="/staff" replace />;
  }

  if (requiredRole === 'ROLE_STAFF' && !user?.roles?.some(r => ['ROLE_STAFF', 'ROLE_ADMIN'].includes(r))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
