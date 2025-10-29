import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasAdminAccess } from '../../utils/adminUtils';

/**
 * Protected route component for admin-only pages
 * Redirects non-admin users to home page
 */
function AdminRoute({ children }) {
  const location = useLocation();
  const isAdmin = hasAdminAccess();

  if (!isAdmin) {
    console.warn('⛔ Access denied - Admin privileges required');
    // Redirect to home page, saving the attempted location
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  console.log('✅ Admin access granted');
  return children;
}

export default AdminRoute;