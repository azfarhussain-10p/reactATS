import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

const AuthCheck: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // Redirect to login page, but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default AuthCheck; 