import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Protected Route component for securing access to dashboard routes
const ProtectedRoute = ({ children, userType }) => {
  const { user, isLoading } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }
  
  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If userType is specified, check if user has the required role
  if (userType && user.role !== userType) {
    // Redirect to appropriate dashboard based on user role
    if (user.role === 'chef') {
      return <Navigate to="/chef/dashboard" replace />;
    } else {
      return <Navigate to="/user/dashboard" replace />;
    }
  }
  
  // User is authenticated and has the correct role
  return children;
};

export default ProtectedRoute;