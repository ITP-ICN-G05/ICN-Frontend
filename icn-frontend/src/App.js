import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavigationBar from './components/layout/NavigationBar';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import SearchPage from './pages/search/SearchPage';
import CompanyDetailPage from './pages/company/CompanyDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children, user }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Placeholder pages
const CompaniesPage = () => <div className="page-placeholder">Companies Page</div>;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleSignUp = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <NavigationBar user={user} onLogout={handleLogout} />
        
        <main className="app-main">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/login" 
              element={
                user ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/signup" 
              element={
                user ? <Navigate to="/" replace /> : <SignUpPage onSignUp={handleSignUp} />
              } 
            />
            <Route 
              path="/forgot-password" 
                element={<ForgotPasswordPage />
              } 
            />
            <Route 
              path="/search" 
                element={<SearchPage />
              } 
            />
            <Route 
              path="/company/:id" 
              element={
                <CompanyDetailPage />
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/companies" 
              element={
                <ProtectedRoute user={user}>
                  <CompaniesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute user={user}>
                  <ProfilePage user={user} />
                </ProtectedRoute>
              } 
            />
            
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;