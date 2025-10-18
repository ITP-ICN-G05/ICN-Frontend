import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api';
import { BookmarkProvider } from './contexts/BookmarkContext';
import icnDataService from './services/icnDataService';
import { getService } from './services/serviceFactory';
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

// Loading Screen Component
function LoadingScreen({ stage, progress }) {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        {/* Add your logo here if available */}
        <img 
          src="/assets/logo/ICN-logo-little.png" 
          alt="ICN Logo" 
          className="loading-logo"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className="spinner"></div>
        <p className="loading-text">Loading ICN Navigator...</p>
        {stage && <p className="loading-stage">{stage}</p>}
        {progress !== undefined && (
          <div className="loading-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="progress-text">{Math.round(progress)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Development Mode Banner Component
function DevModeBanner({ dataStats }) {
  const [isMinimized, setIsMinimized] = useState(false);
  
  if (process.env.NODE_ENV !== 'development' || !process.env.REACT_APP_USE_MOCK) {
    return null;
  }
  
  return (
    <div className={`dev-banner ${isMinimized ? 'minimized' : ''}`}>
      {!isMinimized ? (
        <>
          <span className="badge">DEV MODE</span>
          <span>Mock Data: ON</span>
          {dataStats && (
            <>
              <span>• Companies: {dataStats.totalCompanies}</span>
              <span>• Verified: {dataStats.verified}</span>
              <span>• Sectors: {dataStats.sectors}</span>
            </>
          )}
          <span>• Source: ICN JSON</span>
          <button 
            className="minimize-btn"
            onClick={() => setIsMinimized(true)}
            title="Minimize"
          >
            _
          </button>
        </>
      ) : (
        <button 
          className="expand-btn"
          onClick={() => setIsMinimized(false)}
          title="Expand"
        >
          DEV MODE ↑
        </button>
      )}
    </div>
  );
}

function App() {
  // State management
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState('Initializing...');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dataStats, setDataStats] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [initError, setInitError] = useState(null);
  const libraries = ['places', 'geometry'];
  
  // Get auth service
  const authService = getService('auth');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoadingProgress(10);
      setLoadingStage('Checking authentication...');
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          setLoadingProgress(20);
          const parsedUser = JSON.parse(userData);
          
          // Validate token if using mock or real service
          if (authService && authService.validateToken) {
            try {
              const validation = await authService.validateToken(token);
              if (validation.valid) {
                setUser(parsedUser);
                
                // Check if onboarding is needed
                if (parsedUser && !parsedUser.onboardingComplete && 
                    !parsedUser.preferences && !parsedUser.onboardingSkipped) {
                  setShowOnboarding(true);
                }
              } else {
                // Invalid token, clear auth
                localStorage.removeItem('token');
                localStorage.removeItem('user');
              }
            } catch (validationError) {
              console.warn('Token validation failed:', validationError);
              // Keep user logged in if validation fails (offline mode)
              setUser(parsedUser);
            }
          } else {
            setUser(parsedUser);
            
            // Check onboarding
            if (parsedUser && !parsedUser.onboardingComplete && 
                !parsedUser.preferences && !parsedUser.onboardingSkipped) {
              setShowOnboarding(true);
            }
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setLoadingProgress(30);
      setLoadingStage('Loading ICN company data...');
      
      // Load ICN data
      try {
        await icnDataService.loadData();
        setDataLoaded(true);
        setLoadingProgress(80);
        
        // Get statistics
        const stats = icnDataService.getStatistics();
        setDataStats({
          totalCompanies: stats.totalCompanies,
          verified: stats.verified,
          sectors: Object.keys(stats.bySector).length
        });
        
        console.log('✅ ICN Data Loaded Successfully:', {
          companies: stats.totalCompanies,
          verified: stats.verified,
          unverified: stats.unverified,
          sectors: Object.keys(stats.bySector).length,
          states: Object.keys(stats.byState).length
        });
        
        // Log sample data for debugging
        if (process.env.NODE_ENV === 'development') {
          const sampleCompanies = icnDataService.getCompanies().slice(0, 3);
          console.log('Sample companies:', sampleCompanies);
        }
        
      } catch (dataError) {
        console.error('❌ Failed to load ICN data:', dataError);
        setInitError('Failed to load company data. Some features may be limited.');
        // Continue app initialization even if data loading fails
      }
      
      setLoadingProgress(100);
      setLoadingStage('Ready!');
      
      // Delay to show completion
      setTimeout(() => {
        setLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('App initialization error:', error);
      setInitError(error.message);
      setLoading(false);
    }
  };

  const handleLogin = async (userData) => {
    setUser(userData);
    
    // Check if new user needs onboarding after login
    if (userData && !userData.onboardingComplete && 
        !userData.preferences && !userData.onboardingSkipped) {
      setShowOnboarding(true);
    }
    
    // Reload ICN data if needed
    if (!dataLoaded) {
      try {
        await icnDataService.loadData();
        setDataLoaded(true);
        const stats = icnDataService.getStatistics();
        setDataStats({
          totalCompanies: stats.totalCompanies,
          verified: stats.verified,
          sectors: Object.keys(stats.bySector).length
        });
      } catch (error) {
        console.error('Failed to load ICN data after login:', error);
      }
    }
  };

  const handleSignUp = (userData) => {
    setUser(userData);
    // Note: Onboarding is handled within SignUpPage component
  };

  const handleLogout = async () => {
    try {
      // Call logout service if available
      if (authService && authService.logout) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setShowOnboarding(false);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Optional: Clear ICN data cache on logout
      if (process.env.REACT_APP_CLEAR_CACHE_ON_LOGOUT === 'true') {
        icnDataService.clearCache();
        setDataLoaded(false);
      }
    }
  };

  const handleOnboardingComplete = (preferences) => {
    // Update user with preferences
    const updatedUser = {
      ...user,
      preferences,
      onboardingComplete: true,
      onboardingCompletedAt: new Date().toISOString()
    };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setShowOnboarding(false);
    
    // Track onboarding completion
    console.log('Onboarding completed with preferences:', preferences);
    
    // Optional: Send preferences to backend
    if (authService && authService.updateProfile) {
      authService.updateProfile(user.id, { preferences })
        .catch(err => console.error('Failed to save preferences:', err));
    }
  };

  const handleOnboardingSkip = () => {
    // Mark onboarding as skipped
    const updatedUser = {
      ...user,
      onboardingComplete: true,
      onboardingSkipped: true,
      onboardingSkippedAt: new Date().toISOString()
    };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setShowOnboarding(false);
    
    console.log('Onboarding skipped');
  };

  // Show loading screen
  if (loading) {
    return <LoadingScreen stage={loadingStage} progress={loadingProgress} />;
  }

  // Show error screen if critical error
  if (initError && !dataLoaded) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <h1>⚠️ Initialization Error</h1>
          <p>{initError}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <LoadScript 
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY || ''}
      libraries={libraries}
      loadingElement={<LoadingScreen stage="Loading Maps..." progress={50} />}
    >
      <BookmarkProvider>
        <Router>
          <div className="App">
            <NavigationBar user={user} onLogout={handleLogout} />
            
            {/* Warning banner for data loading issues */}
            {initError && dataLoaded && (
              <div className="warning-banner">
                <span>⚠️ {initError}</span>
                <button onClick={() => setInitError(null)}>×</button>
              </div>
            )}
            
            <main className="app-main">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage dataStats={dataStats} />} />
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
                <Route path="/search" element={
                  <SearchPage 
                    user={user} 
                    dataLoaded={dataLoaded} 
                  />
                } />
                <Route path="/company/:id" element={
                  <CompanyDetailPage 
                    user={user}
                    dataLoaded={dataLoaded}
                  />
                } />
                <Route path="/pricing" element={<PricingPage user={user} />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/companies" 
                  element={
                    <ProtectedRoute user={user}>
                      <CompaniesPage dataLoaded={dataLoaded} />
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
                      <AdminDashboard dataStats={dataStats} />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/navigation" 
                  element={<NavigationPage />} 
                />
                <Route 
                  path="/mobile-designs" 
                  element={<MobileDesignsPage />} 
                />
                <Route 
                  path="/illustrations" 
                  element={<IllustrationsPage />} 
                />
                
                {/* Protected Admin Routes */}
                <Route 
                  path="/admin/companies" 
                  element={
                    <AdminRoute>
                      <CompanyManagement dataLoaded={dataLoaded} />
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
            
            {/* Development Mode Banner */}
            <DevModeBanner dataStats={dataStats} />
          </div>
        </Router>
      </BookmarkProvider>
    </LoadScript>
  );
}

export default App;
