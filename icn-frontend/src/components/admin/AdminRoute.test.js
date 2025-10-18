import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminRoute from './AdminRoute';

const MockAdminPage = () => <div>Admin Dashboard</div>;
const MockHomePage = () => <div>Home Page</div>;

const renderAdminRoute = (user = null, initialPath = '/') => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
  
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
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
    </MemoryRouter>
  );
};

describe('AdminRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders children for admin users', () => {
    const adminUser = { role: 'admin', name: 'Admin User' };
    renderAdminRoute(adminUser, '/admin');
    
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('redirects non-admin users to home', () => {
    const regularUser = { role: 'user', name: 'Regular User' };
    renderAdminRoute(regularUser, '/admin');
    
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to home', () => {
    renderAdminRoute(null, '/admin');
    
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('handles invalid user object', () => {
    localStorage.setItem('user', '{}');
    renderAdminRoute(null, '/admin');
    
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });

  it('handles malformed JSON in localStorage', () => {
    localStorage.setItem('user', 'invalid json');
    renderAdminRoute(null, '/admin');
    
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });

  it('allows admin role exactly', () => {
    const adminUser = { role: 'admin' };
    renderAdminRoute(adminUser, '/admin');
    
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('blocks moderator role', () => {
    const modUser = { role: 'moderator' };
    renderAdminRoute(modUser, '/admin');
    
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });
});