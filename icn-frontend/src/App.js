import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BookmarkProvider } from './contexts/BookmarkContext';
import NavigationBar from './components/layout/NavigationBar';
import AdminRoute from './components/admin/AdminRoute';
import OnboardingModal from './components/onboarding/OnboardingModal';

// Public Pages
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import SearchPage from './pages/search/SearchPage';
import CompanyDetailPage from './pages/company/CompanyDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
import PricingPage from './pages/pricing/PricingPage';
import CompaniesPage from './pages/companies/CompaniesPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CompanyManagement from './pages/admin/CompanyManagement';
import UserManagement from './pages/admin/UserManagement';

import NavigationPage from './pages/navigation/NavigationPage';
import MobileDesignsPage from './pages/mobile/MobileDesignsPage';
import IllustrationsPage from './pages/illustrations/IllustrationsPage';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children, user }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Check if onboarding is needed (only for logged-in users who haven't completed it)
        if (parsedUser && !parsedUser.onboardingComplete && !parsedUser.preferences && !parsedUser.onboardingSkipped) {
          setShowOnboarding(true);
        }
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
    
    // Check if new user needs onboarding after login
    if (userData && !userData.onboardingComplete && !userData.preferences && !userData.onboardingSkipped) {
      setShowOnboarding(true);
    }
  };

  const handleSignUp = (userData) => {
    setUser(userData);
    // Note: Onboarding is handled within SignUpPage component
  };

  const handleLogout = () => {
    setUser(null);
    setShowOnboarding(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleOnboardingComplete = (preferences) => {
    // Update user with preferences
    const updatedUser = {
      ...user,
      preferences,
      onboardingComplete: true
    };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setShowOnboarding(false);
    
    // Optional: Reload to apply preferences
    window.location.reload();
  };

  const handleOnboardingSkip = () => {
    // Mark onboarding as skipped
    const updatedUser = {
      ...user,
      onboardingComplete: true,
      onboardingSkipped: true
    };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setShowOnboarding(false);
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <BookmarkProvider>
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
                element={<ForgotPasswordPage />} 
              />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/company/:id" element={<CompanyDetailPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              
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
              
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/navigation" 
                element={
                  <NavigationPage />
                } 
              />
              <Route 
                path="/mobile-designs" 
                element={
                  <MobileDesignsPage />
                } 
              />
              <Route 
                path="/illustrations" 
                element={
                  <IllustrationsPage />
                } 
              />
              
              {/* Protected Admin Routes */}
              <Route 
                path="/admin/companies" 
                element={
                  <AdminRoute>
                    <CompanyManagement />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                } 
              />
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Global Onboarding Modal */}
          {showOnboarding && (
            <OnboardingModal
              user={user}
              onComplete={handleOnboardingComplete}
              onSkip={handleOnboardingSkip}
            />
          )}
        </div>
      </Router>
    </BookmarkProvider>
  );
}

export default App;