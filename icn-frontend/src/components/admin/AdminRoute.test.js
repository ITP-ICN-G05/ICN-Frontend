import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminRoute from './AdminRoute';

const MockAdminPage = () => <div>Admin Dashboard</div>;
const MockHomePage = () => <div>Home Page</div>;

const renderAdminRoute = (user = null) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }

  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MockHomePage />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <MockAdminPage />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

describe('AdminRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders children for admin users', () => {
    const adminUser = { role: 'admin', name: 'Admin User' };
    renderAdminRoute(adminUser);
    
    // Navigate to admin route
    window.history.pushState({}, 'Admin', '/admin');
    
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('redirects non-admin users to home', () => {
    const regularUser = { role: 'user', name: 'Regular User' };
    renderAdminRoute(regularUser);
    
    window.history.pushState({}, 'Admin', '/admin');
    
    // Should redirect to home
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated users to home', () => {
    renderAdminRoute(null);
    
    window.history.pushState({}, 'Admin', '/admin');
    
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });

  it('handles invalid user object', () => {
    localStorage.setItem('user', '{}');
    renderAdminRoute();
    
    window.history.pushState({}, 'Admin', '/admin');
    
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });

  it('handles malformed JSON in localStorage', () => {
    localStorage.setItem('user', 'invalid json');
    renderAdminRoute();
    
    window.history.pushState({}, 'Admin', '/admin');
    
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });

  it('allows admin role exactly', () => {
    const adminUser = { role: 'admin' };
    localStorage.setItem('user', JSON.stringify(adminUser));
    
    renderAdminRoute();
    window.history.pushState({}, 'Admin', '/admin');
    
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('blocks moderator role', () => {
    const modUser = { role: 'moderator' };
    renderAdminRoute(modUser);
    
    window.history.pushState({}, 'Admin', '/admin');
    
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });
});