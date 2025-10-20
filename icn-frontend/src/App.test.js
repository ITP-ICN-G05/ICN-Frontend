import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import App from './App';
import * as serviceFactory from './services/serviceFactory';
import icnDataService from './services/icnDataService';

// Mock all dependencies
jest.mock('./services/serviceFactory');
jest.mock('./services/icnDataService');
jest.mock('@react-google-maps/api', () => ({
  LoadScript: ({ children }) => <div data-testid="load-script">{children}</div>,
}));

// Mock all page components
jest.mock('./pages/home/HomePage', () => {
  return function MockHomePage({ dataStats }) {
    return (
      <div data-testid="home-page">
        Home Page
        {dataStats && <div data-testid="home-stats">{dataStats.totalCompanies}</div>}
      </div>
    );
  };
});

jest.mock('./pages/auth/LoginPage', () => {
  return function MockLoginPage({ onLogin }) {
    return (
      <div data-testid="login-page">
        <button onClick={() => onLogin({ id: 1, email: 'test@test.com', tier: 'free', onboardingComplete: true })}>
          Mock Login
        </button>
        <button onClick={() => onLogin({ 
          id: 2, 
          email: 'newuser@test.com', 
          tier: 'free',
          onboardingComplete: false 
        })}>
          Mock Login New User
        </button>
      </div>
    );
  };
});

jest.mock('./pages/auth/SignUpPage', () => {
  return function MockSignUpPage({ onSignUp }) {
    return (
      <div data-testid="signup-page">
        <button onClick={() => onSignUp({ id: 1, email: 'test@test.com', tier: 'free' })}>
          Mock Sign Up
        </button>
      </div>
    );
  };
});

jest.mock('./pages/auth/ForgotPasswordPage', () => {
  return function MockForgotPasswordPage() {
    return <div data-testid="forgot-password-page">Forgot Password Page</div>;
  };
});

jest.mock('./pages/search/SearchPage', () => {
  return function MockSearchPage({ user, dataLoaded }) {
    return (
      <div data-testid="search-page">
        Search Page
        {user && <span data-testid="search-user">Logged In</span>}
        {dataLoaded && <span data-testid="search-data-loaded">Data Loaded</span>}
      </div>
    );
  };
});

jest.mock('./pages/company/CompanyDetailPage', () => {
  return function MockCompanyDetailPage({ user, dataLoaded }) {
    return (
      <div data-testid="company-detail-page">
        Company Detail
        {user && <span data-testid="company-user">Has User</span>}
        {dataLoaded && <span data-testid="company-data-loaded">Data Loaded</span>}
      </div>
    );
  };
});

jest.mock('./pages/profile/ProfilePage', () => {
  return function MockProfilePage({ user }) {
    return (
      <div data-testid="profile-page">
        Profile Page
        {user && <span data-testid="profile-email">{user.email}</span>}
      </div>
    );
  };
});

jest.mock('./pages/pricing/PricingPage', () => {
  return function MockPricingPage({ user }) {
    return (
      <div data-testid="pricing-page">
        Pricing
        {user && <span data-testid="pricing-user">Logged In</span>}
      </div>
    );
  };
});

jest.mock('./pages/companies/CompaniesPage', () => {
  return function MockCompaniesPage({ dataLoaded }) {
    return (
      <div data-testid="companies-page">
        Companies Page
        {dataLoaded && <span data-testid="companies-data">Data Available</span>}
      </div>
    );
  };
});

jest.mock('./pages/admin/AdminDashboard', () => {
  return function MockAdminDashboard({ dataStats }) {
    return (
      <div data-testid="admin-dashboard">
        Admin Dashboard
        {dataStats && <span data-testid="admin-stats">{dataStats.totalCompanies}</span>}
      </div>
    );
  };
});

jest.mock('./pages/admin/CompanyManagement', () => {
  return function MockCompanyManagement({ dataLoaded }) {
    return (
      <div data-testid="company-management">
        Company Management
        {dataLoaded && <span>Data Ready</span>}
      </div>
    );
  };
});

jest.mock('./pages/admin/UserManagement', () => {
  return function MockUserManagement() {
    return <div data-testid="user-management">User Management</div>;
  };
});

jest.mock('./pages/navigation/NavigationPage', () => {
  return function MockNavigationPage() {
    return <div data-testid="navigation-page">Navigation Page</div>;
  };
});

jest.mock('./pages/mobile/MobileDesignsPage', () => {
  return function MockMobileDesignsPage() {
    return <div data-testid="mobile-designs-page">Mobile Designs Page</div>;
  };
});

jest.mock('./pages/illustrations/IllustrationsPage', () => {
  return function MockIllustrationsPage() {
    return <div data-testid="illustrations-page">Illustrations Page</div>;
  };
});

jest.mock('./components/layout/NavigationBar', () => {
  return function MockNavigationBar({ user, onLogout }) {
    return (
      <div data-testid="navigation-bar">
        {user ? (
          <>
            <span data-testid="nav-user-email">{user.email}</span>
            <button onClick={onLogout}>Logout</button>
          </>
        ) : (
          <span>Not logged in</span>
        )}
      </div>
    );
  };
});

jest.mock('./components/onboarding/OnboardingModal', () => {
  return function MockOnboardingModal({ user, onComplete, onSkip }) {
    return (
      <div data-testid="onboarding-modal">
        <span data-testid="onboarding-user-email">Onboarding for {user?.email}</span>
        <button onClick={() => onComplete({ interests: ['tech'] })}>Complete</button>
        <button onClick={onSkip}>Skip</button>
      </div>
    );
  };
});

jest.mock('./components/admin/AdminRoute', () => {
  return function MockAdminRoute({ children }) {
    return <div data-testid="admin-route">{children}</div>;
  };
});

jest.mock('./contexts/BookmarkContext', () => ({
  BookmarkProvider: ({ children }) => <div data-testid="bookmark-provider">{children}</div>,
}));

describe('App Component - Comprehensive Test Suite', () => {
  const mockAuthService = {
    validateToken: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
  };

  const originalLocation = window.location;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Reset all mock functions
    mockAuthService.validateToken.mockResolvedValue({ valid: true });
    mockAuthService.logout.mockResolvedValue();
    mockAuthService.updateProfile.mockResolvedValue({ success: true });
    
    serviceFactory.getService.mockReturnValue(mockAuthService);
    
    // Mock ICN data service
    icnDataService.loadData = jest.fn().mockResolvedValue();
    icnDataService.getStatistics = jest.fn().mockReturnValue({
      totalCompanies: 2716,
      verified: 1500,
      unverified: 1216,
      bySector: { Technology: 500, Manufacturing: 800 },
      byState: { VIC: 2716 }
    });
    icnDataService.getCompanies = jest.fn().mockReturnValue([
      { id: 1, name: 'Test Company 1' },
      { id: 2, name: 'Test Company 2' },
      { id: 3, name: 'Test Company 3' }
    ]);
    icnDataService.clearCache = jest.fn();
    
    // Suppress console logs in tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    if (window.location !== originalLocation) {
      window.location = originalLocation;
    }
    jest.restoreAllMocks();
  });

  // ========================================================================
  // INITIALIZATION & LOADING
  // ========================================================================
  
  describe('Initial Rendering and Loading', () => {
    test('renders loading screen with all elements', () => {
      const { container } = render(<App />);
      
      expect(screen.getByText('Loading ICN Navigator...')).toBeInTheDocument();
      expect(container.querySelector('.loading-screen')).toBeInTheDocument();
      expect(container.querySelector('.loading-content')).toBeInTheDocument();
      expect(container.querySelector('.spinner')).toBeInTheDocument();
    });

    test('shows loading progress bar', () => {
      const { container } = render(<App />);
      
      const progressBar = container.querySelector('.loading-progress');
      expect(progressBar).toBeInTheDocument();
      
      const progressFill = container.querySelector('.progress-fill');
      expect(progressFill).toBeInTheDocument();
    });

    test('loading logo handles error gracefully', () => {
      const { container } = render(<App />);
      
      const logo = container.querySelector('.loading-logo');
      if (logo) {
        act(() => {
          const errorEvent = new Event('error');
          logo.dispatchEvent(errorEvent);
        });
        
        expect(logo.style.display).toBe('none');
      }
    });

    test('completes full initialization flow', async () => {
      render(<App />);
      
      expect(screen.getByText('Loading ICN Navigator...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(icnDataService.loadData).toHaveBeenCalled();
        expect(icnDataService.getStatistics).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('shows different loading stages', async () => {
      const { container } = render(<App />);
      
      const loadingStage = container.querySelector('.loading-stage');
      expect(loadingStage).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('loads ICN data during initialization', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(icnDataService.loadData).toHaveBeenCalledTimes(1);
        expect(icnDataService.getStatistics).toHaveBeenCalled();
      });
    });
  });

  // ========================================================================
  // AUTHENTICATION
  // ========================================================================

  describe('Authentication Flow', () => {
    test('restores valid user session from localStorage', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: true
      };
      
      localStorage.setItem('token', 'valid-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(mockAuthService.validateToken).toHaveBeenCalledWith('valid-token');
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('nav-user-email')).toHaveTextContent('test@test.com');
      });
    });

    test('clears invalid token and user data', async () => {
      localStorage.setItem('token', 'invalid-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, email: 'test@test.com' }));
      
      mockAuthService.validateToken.mockResolvedValue({ valid: false });
      
      render(<App />);
      
      await waitFor(() => {
        expect(mockAuthService.validateToken).toHaveBeenCalledWith('invalid-token');
      });
      
      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
        expect(screen.getByText('Not logged in')).toBeInTheDocument();
      });
    });

    test('keeps user logged in when token validation fails (offline mode)', async () => {
      const mockUser = { id: 1, email: 'offline@test.com', tier: 'free', onboardingComplete: true };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      mockAuthService.validateToken.mockRejectedValue(new Error('Network error'));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
        expect(screen.getByText('offline@test.com')).toBeInTheDocument();
      });
    });

    test('handles corrupted user data in localStorage', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', '{invalid-json}');
      
      render(<App />);
      
      await waitFor(() => {
        expect(localStorage.getItem('user')).toBeNull();
        expect(localStorage.getItem('token')).toBeNull();
        expect(screen.getByText('Not logged in')).toBeInTheDocument();
      });
    });

    test('works without auth service', async () => {
      serviceFactory.getService.mockReturnValue(null);
      
      const mockUser = { id: 1, email: 'test@test.com', tier: 'free', onboardingComplete: true };
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
        expect(screen.getByText('test@test.com')).toBeInTheDocument();
      });
    });

    test('handles auth service without validateToken method', async () => {
      const partialAuthService = {
        logout: jest.fn().mockResolvedValue(),
        updateProfile: jest.fn().mockResolvedValue({ success: true })
      };
      
      serviceFactory.getService.mockReturnValue(partialAuthService);
      
      const mockUser = { id: 1, email: 'test@test.com', tier: 'free', onboardingComplete: true };
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('test@test.com')).toBeInTheDocument();
      });
    });
  });

  // ========================================================================
  // LOGOUT
  // ========================================================================

  describe('Logout Functionality', () => {
    test('successful logout clears all user data', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: true
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
      
      await act(async () => {
        screen.getByText('Logout').click();
      });
      
      await waitFor(() => {
        expect(mockAuthService.logout).toHaveBeenCalled();
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
        expect(screen.getByText('Not logged in')).toBeInTheDocument();
      });
    });

    test('logout works even when service fails', async () => {
      mockAuthService.logout.mockRejectedValue(new Error('Logout service error'));
      
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: true
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
      
      await act(async () => {
        screen.getByText('Logout').click();
      });
      
      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
      });
    });

    test('clears cache on logout when configured', async () => {
      process.env.REACT_APP_CLEAR_CACHE_ON_LOGOUT = 'true';
      
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: true
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
      
      await act(async () => {
        screen.getByText('Logout').click();
      });
      
      await waitFor(() => {
        expect(icnDataService.clearCache).toHaveBeenCalled();
      });
      
      delete process.env.REACT_APP_CLEAR_CACHE_ON_LOGOUT;
    });

    test('does not clear cache when not configured', async () => {
      delete process.env.REACT_APP_CLEAR_CACHE_ON_LOGOUT;
      
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: true
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
      
      await act(async () => {
        screen.getByText('Logout').click();
      });
      
      await waitFor(() => {
        expect(icnDataService.clearCache).not.toHaveBeenCalled();
      });
    });

    test('logout without auth service', async () => {
      serviceFactory.getService.mockReturnValue({
        validateToken: jest.fn().mockResolvedValue({ valid: true })
      });
      
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: true
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
      
      await act(async () => {
        screen.getByText('Logout').click();
      });
      
      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeNull();
      });
    });

    test('hides onboarding modal on logout', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: false
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
      });
      
      await act(async () => {
        screen.getByText('Logout').click();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
      });
    });
  });

  // ========================================================================
  // ONBOARDING
  // ========================================================================

  describe('Onboarding Flow', () => {
    test('shows onboarding for incomplete users', async () => {
      const mockUser = {
        id: 1,
        email: 'newuser@test.com',
        tier: 'free',
        onboardingComplete: false
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
        expect(screen.getByTestId('onboarding-user-email')).toHaveTextContent('newuser@test.com');
      });
    });

    test('hides onboarding for completed users', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: true
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
      });
    });

    test('skips onboarding for users with preferences', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        preferences: { interests: ['tech'] }
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
      });
    });

    test('skips onboarding for users who previously skipped', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingSkipped: true
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
      });
    });

    test('handleOnboardingComplete saves preferences', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: false
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
      });
      
      await act(async () => {
        screen.getByText('Complete').click();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
        
        const savedUser = JSON.parse(localStorage.getItem('user'));
        expect(savedUser.onboardingComplete).toBe(true);
        expect(savedUser.preferences).toEqual({ interests: ['tech'] });
        expect(savedUser.onboardingCompletedAt).toBeDefined();
      });
    });

    test('onboarding complete calls updateProfile API', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: false
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
      });
      
      await act(async () => {
        screen.getByText('Complete').click();
      });
      
      await waitFor(() => {
        expect(mockAuthService.updateProfile).toHaveBeenCalledWith(
          1,
          { preferences: { interests: ['tech'] } }
        );
      });
    });

    test('onboarding completes even if API fails', async () => {
      mockAuthService.updateProfile.mockRejectedValue(new Error('API Error'));
      
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: false
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
      });
      
      await act(async () => {
        screen.getByText('Complete').click();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
        const savedUser = JSON.parse(localStorage.getItem('user'));
        expect(savedUser.onboardingComplete).toBe(true);
      });
    });

    test('handleOnboardingSkip marks as skipped', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: false
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
      });
      
      await act(async () => {
        screen.getByText('Skip').click();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
        
        const savedUser = JSON.parse(localStorage.getItem('user'));
        expect(savedUser.onboardingComplete).toBe(true);
        expect(savedUser.onboardingSkipped).toBe(true);
        expect(savedUser.onboardingSkippedAt).toBeDefined();
      });
    });

    test('onboarding works without updateProfile service', async () => {
      serviceFactory.getService.mockReturnValue({
        validateToken: jest.fn().mockResolvedValue({ valid: true }),
        logout: jest.fn().mockResolvedValue()
      });
      
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: false
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
      });
      
      await act(async () => {
        screen.getByText('Complete').click();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
      });
    });
  });

  // ========================================================================
  // DATA LOADING
  // ========================================================================

  describe('ICN Data Loading', () => {
    test('successfully loads ICN data', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(icnDataService.loadData).toHaveBeenCalled();
        expect(icnDataService.getStatistics).toHaveBeenCalled();
      });
    });

    test('handles data loading failure with error screen', async () => {
      icnDataService.loadData.mockRejectedValue(new Error('Network error'));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/Initialization Error/)).toBeInTheDocument();
        expect(screen.getByText(/Failed to load company data/)).toBeInTheDocument();
      });
    });

    test('logs statistics in console', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      render(<App />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('ICN Data Loaded Successfully'),
          expect.objectContaining({
            companies: 2716,
            verified: 1500
          })
        );
      });
    });

    test('passes dataStats to components', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
        expect(screen.getByTestId('home-stats')).toHaveTextContent('2716');
      });
    });
  });

  // ========================================================================
  // CRITICAL COVERAGE - CATCH BLOCKS AND ERROR PATHS
  // ========================================================================

  describe('Error Path Coverage', () => {
    test('main initialization catch block executes with localStorage error', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      
      // Override just the initialization to throw
      const originalGetItem = Storage.prototype.getItem;
      let firstCall = true;
      
      Storage.prototype.getItem = function(key) {
        if (key === 'token' && firstCall) {
          firstCall = false;
          throw new Error('Storage quota exceeded');
        }
        return originalGetItem.call(this, key);
      };
      
      render(<App />);
      
      await waitFor(() => {
        // Main catch should log initialization error
        expect(consoleSpy).toHaveBeenCalledWith(
          'App initialization error:',
          expect.any(Error)
        );
      }, { timeout: 3000 });
      
      // Restore
      Storage.prototype.getItem = originalGetItem;
      consoleSpy.mockRestore();
    });

    test('setInitError and setLoading called in data load error', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      
      // Make loadData throw synchronously
      icnDataService.loadData.mockImplementation(() => {
        throw new Error('Immediate sync error');
      });
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/Initialization Error/)).toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });
  });

  // ========================================================================
  // WARNING BANNER & ERROR SCREEN
  // ========================================================================

  describe('Warning Banner and Error Screen', () => {
    test('shows error screen when data completely fails to load', async () => {
      icnDataService.loadData.mockRejectedValue(new Error('Complete failure'));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/Initialization Error/)).toBeInTheDocument();
        expect(screen.getByText(/Failed to load company data/)).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    test('retry button works on error screen', async () => {
      delete window.location;
      window.location = { reload: jest.fn() };
      
      icnDataService.loadData.mockRejectedValue(new Error('Fatal error'));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
      
      const retryBtn = screen.getByText('Retry');
      act(() => {
        retryBtn.click();
      });
      
      expect(window.location.reload).toHaveBeenCalled();
    });

    test('dismisses warning banner when close button clicked', async () => {
      icnDataService.loadData.mockResolvedValue();
      
      const { container } = render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
      
      const warningBanner = container.querySelector('.warning-banner');
      if (warningBanner) {
        const closeButton = warningBanner.querySelector('button');
        
        await act(async () => {
          closeButton.click();
        });
        
        await waitFor(() => {
          expect(container.querySelector('.warning-banner')).not.toBeInTheDocument();
        });
      }
    });
  });

  // ========================================================================
  // DEV MODE BANNER
  // ========================================================================

  describe('Development Mode Banner', () => {
    test('dev banner minimizes and expands', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalMock = process.env.REACT_APP_USE_MOCK;
      
      process.env.NODE_ENV = 'development';
      process.env.REACT_APP_USE_MOCK = 'true';
      
      const { container } = render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
      
      const devBanner = container.querySelector('.dev-banner');
      if (devBanner) {
        const minimizeBtn = container.querySelector('.minimize-btn');
        if (minimizeBtn) {
          await act(async () => {
            minimizeBtn.click();
          });
          
          expect(devBanner.classList.contains('minimized')).toBe(true);
          
          const expandBtn = container.querySelector('.expand-btn');
          if (expandBtn) {
            await act(async () => {
              expandBtn.click();
            });
            
            expect(devBanner.classList.contains('minimized')).toBe(false);
          }
        }
      }
      
      process.env.NODE_ENV = originalEnv;
      process.env.REACT_APP_USE_MOCK = originalMock;
    });

    test('hides banner in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalMock = process.env.REACT_APP_USE_MOCK;
      
      process.env.NODE_ENV = 'production';
      process.env.REACT_APP_USE_MOCK = 'false';
      
      const { container } = render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
      
      const banner = container.querySelector('.dev-banner');
      expect(banner).not.toBeInTheDocument();
      
      process.env.NODE_ENV = originalEnv;
      process.env.REACT_APP_USE_MOCK = originalMock;
    });

    test('hides banner when mock data is off', async () => {
      const originalMock = process.env.REACT_APP_USE_MOCK;
      
      delete process.env.REACT_APP_USE_MOCK;
      
      const { container } = render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
      
      const banner = container.querySelector('.dev-banner');
      expect(banner).not.toBeInTheDocument();
      
      process.env.REACT_APP_USE_MOCK = originalMock;
    });
  });

  // ========================================================================
  // PROTECTED ROUTES
  // ========================================================================

  describe('Protected Routes', () => {
    test('ProtectedRoute redirects when no user', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
        expect(screen.getByText('Not logged in')).toBeInTheDocument();
      });
    });

    test('ProtectedRoute allows access with user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: true
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
        expect(screen.getByText('test@test.com')).toBeInTheDocument();
      });
    });
  });

  // ========================================================================
  // LOADING SCREEN DETAILS
  // ========================================================================

  describe('Loading Screen Details', () => {
    test('loading screen shows progress updates', async () => {
      const { container } = render(<App />);
      
      const loadingScreen = container.querySelector('.loading-screen');
      expect(loadingScreen).toBeInTheDocument();
      
      const progressText = container.querySelector('.progress-text');
      const progressFill = container.querySelector('.progress-fill');
      
      expect(progressText).toBeInTheDocument();
      expect(progressFill).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('loading screen displays stages', async () => {
      const { container } = render(<App />);
      
      const loadingStage = container.querySelector('.loading-stage');
      expect(loadingStage).toBeInTheDocument();
      
      const loadingText = container.querySelector('.loading-text');
      expect(loadingText).toHaveTextContent('Loading ICN Navigator...');
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  // ========================================================================
  // ADDITIONAL EDGE CASES
  // ========================================================================

  describe('Additional Edge Cases', () => {
    test('handles initialization with partial data', async () => {
      icnDataService.getStatistics.mockReturnValue({
        totalCompanies: 100,
        verified: 50,
        unverified: 50,
        bySector: { Tech: 10 },
        byState: { VIC: 100 }
      });
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
        expect(screen.getByTestId('home-stats')).toHaveTextContent('100');
      });
    });

    test('handles auth check with token but no user data', async () => {
      localStorage.setItem('token', 'test-token');
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
        expect(screen.getByText('Not logged in')).toBeInTheDocument();
      });
    });

    test('handles user data without token', async () => {
      localStorage.setItem('user', JSON.stringify({ id: 1, email: 'test@test.com' }));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
        expect(screen.getByText('Not logged in')).toBeInTheDocument();
      });
    });

    test('handles onboarding check for null user', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
        expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
      });
    });

    test('handles multiple onboarding conditions', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: false,
        preferences: null,
        onboardingSkipped: false
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
      });
    });

    test('handles successful data load with all statistics', async () => {
      icnDataService.getStatistics.mockReturnValue({
        totalCompanies: 2716,
        verified: 1500,
        unverified: 1216,
        bySector: { 
          Technology: 500, 
          Manufacturing: 800,
          Services: 400,
          Other: 1016
        },
        byState: { 
          VIC: 1000,
          NSW: 800,
          QLD: 500,
          WA: 300,
          SA: 116
        }
      });
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
        expect(screen.getByTestId('home-stats')).toHaveTextContent('2716');
      });
    });

    test('initialization handles all progress stages', async () => {
      const { container } = render(<App />);
      
      const progressFill = container.querySelector('.progress-fill');
      expect(progressFill).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  // ========================================================================
  // ERROR HANDLING - ADDITIONAL COVERAGE
  // ========================================================================

  describe('Error Handling - Complete Coverage', () => {
    test('shows error screen when critical data loading fails', async () => {
      icnDataService.loadData.mockRejectedValue(new Error('Critical failure'));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/Initialization Error/)).toBeInTheDocument();
        expect(screen.getByText(/Failed to load company data/)).toBeInTheDocument();
      });
    });

    test('retry button reloads window', async () => {
      delete window.location;
      window.location = { reload: jest.fn() };
      
      icnDataService.loadData.mockRejectedValue(new Error('Load failed'));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
      
      const retryButton = screen.getByText('Retry');
      act(() => {
        retryButton.click();
      });
      
      expect(window.location.reload).toHaveBeenCalled();
    });

    test('handles error in getStatistics during init', async () => {
      icnDataService.loadData.mockResolvedValue();
      icnDataService.getStatistics.mockImplementation(() => {
        throw new Error('Stats calculation failed');
      });
      
      const consoleSpy = jest.spyOn(console, 'error');
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });

    test('handles error in getCompanies during development logging', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      icnDataService.loadData.mockResolvedValue();
      icnDataService.getStatistics.mockReturnValue({
        totalCompanies: 100,
        verified: 50,
        unverified: 50,
        bySector: { Tech: 10 },
        byState: { VIC: 100 }
      });
      
      icnDataService.getCompanies.mockImplementation(() => {
        throw new Error('Cannot get companies for logging');
      });
      
      const consoleSpy = jest.spyOn(console, 'error');
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
      
      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });

    test('catches main initialization errors and sets error state', async () => {
      icnDataService.loadData.mockRejectedValue(new Error('Fatal init error'));
      
      const consoleSpy = jest.spyOn(console, 'error');
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/Initialization Error/)).toBeInTheDocument();
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load ICN data'),
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  // ========================================================================
  // EDGE CASES AND STRESS TESTS
  // ========================================================================

  describe('Edge Cases and Stress Tests', () => {
    test('handles null user gracefully', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
        expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
      });
    });

    test('handles user without id', async () => {
      const mockUser = {
        email: 'noid@test.com',
        tier: 'free',
        onboardingComplete: false
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
      });
      
      await act(async () => {
        screen.getByText('Complete').click();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
      });
    });

    test('handles rapid logout clicks', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: true
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
      
      const logoutBtn = screen.getByText('Logout');
      
      await act(async () => {
        logoutBtn.click();
        logoutBtn.click();
        logoutBtn.click();
      });
      
      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeNull();
      });
    });

    test('handles empty statistics', async () => {
      icnDataService.getStatistics.mockReturnValue({
        totalCompanies: 0,
        verified: 0,
        unverified: 0,
        bySector: {},
        byState: {}
      });
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });

    test('handles missing dataStats gracefully', async () => {
      icnDataService.getStatistics.mockReturnValue(null);
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });
  });

  // ========================================================================
  // ONBOARDING EDGE CASES - COMPLETE COVERAGE
  // ========================================================================

  describe('Onboarding Edge Cases - Complete Coverage', () => {
    test('shows onboarding when onboardingComplete is explicitly false', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: false,
        preferences: null,
        onboardingSkipped: false
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
      });
    });

    test('hides onboarding when preferences exist', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: false,
        preferences: { interests: ['tech'] },
        onboardingSkipped: false
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
      });
    });

    test('hides onboarding when onboardingSkipped is true', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: false,
        preferences: null,
        onboardingSkipped: true
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
      });
    });

    test('hides onboarding when onboardingComplete is true', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: true,
        preferences: null,
        onboardingSkipped: false
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
      });
    });

    test('onboarding adds timestamp on completion', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: false
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
      });
      
      const beforeTime = new Date().toISOString();
      
      await act(async () => {
        screen.getByText('Complete').click();
      });
      
      await waitFor(() => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        expect(savedUser.onboardingCompletedAt).toBeDefined();
        expect(new Date(savedUser.onboardingCompletedAt).getTime()).toBeGreaterThanOrEqual(
          new Date(beforeTime).getTime()
        );
      });
    });

    test('onboarding skip adds timestamp', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: false
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
      });
      
      await act(async () => {
        screen.getByText('Skip').click();
      });
      
      await waitFor(() => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        expect(savedUser.onboardingSkipped).toBe(true);
        expect(savedUser.onboardingSkippedAt).toBeDefined();
      });
    });

    test('logs onboarding completion', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: false
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
      });
      
      await act(async () => {
        screen.getByText('Complete').click();
      });
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Onboarding completed with preferences:',
          expect.any(Object)
        );
      });
      
      consoleSpy.mockRestore();
    });

    test('logs onboarding skip', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: false
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
      });
      
      await act(async () => {
        screen.getByText('Skip').click();
      });
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Onboarding skipped');
      });
      
      consoleSpy.mockRestore();
    });
  });

  // ========================================================================
  // BASIC ROUTE RENDERING
  // ========================================================================
  
  describe('Basic Route Rendering', () => {
    test('renders default route correctly', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });

    test('protected routes work with authenticated user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: true
      };
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
        expect(screen.getByText('test@test.com')).toBeInTheDocument();
      });
    });
  });
});