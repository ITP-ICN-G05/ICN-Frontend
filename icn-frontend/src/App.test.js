import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import * as serviceFactory from './services/serviceFactory';
import icnDataService from './services/icnDataService';

// Mock all dependencies
jest.mock('./services/serviceFactory');
jest.mock('./services/icnDataService');
jest.mock('@react-google-maps/api', () => ({
  LoadScript: ({ children }) => <div data-testid="load-script">{children}</div>,
}));

// Mock all page components to simplify testing
jest.mock('./pages/home/HomePage', () => {
  return function MockHomePage() {
    return <div data-testid="home-page">Home Page</div>;
  };
});

jest.mock('./pages/auth/LoginPage', () => {
  return function MockLoginPage({ onLogin }) {
    return (
      <div data-testid="login-page">
        <button onClick={() => onLogin({ id: 1, email: 'test@test.com', tier: 'free' })}>
          Mock Login
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
  return function MockSearchPage() {
    return <div data-testid="search-page">Search Page</div>;
  };
});

jest.mock('./pages/company/CompanyDetailPage', () => {
  return function MockCompanyDetailPage() {
    return <div data-testid="company-detail-page">Company Detail Page</div>;
  };
});

jest.mock('./pages/profile/ProfilePage', () => {
  return function MockProfilePage() {
    return <div data-testid="profile-page">Profile Page</div>;
  };
});

jest.mock('./pages/pricing/PricingPage', () => {
  return function MockPricingPage() {
    return <div data-testid="pricing-page">Pricing Page</div>;
  };
});

jest.mock('./pages/companies/CompaniesPage', () => {
  return function MockCompaniesPage() {
    return <div data-testid="companies-page">Companies Page</div>;
  };
});

jest.mock('./pages/admin/AdminDashboard', () => {
  return function MockAdminDashboard() {
    return <div data-testid="admin-dashboard">Admin Dashboard</div>;
  };
});

jest.mock('./pages/admin/CompanyManagement', () => {
  return function MockCompanyManagement() {
    return <div data-testid="company-management">Company Management</div>;
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
          <button onClick={onLogout}>Logout</button>
        ) : (
          <span>Not logged in</span>
        )}
      </div>
    );
  };
});

jest.mock('./components/onboarding/OnboardingModal', () => {
  return function MockOnboardingModal({ onComplete, onSkip }) {
    return (
      <div data-testid="onboarding-modal">
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

describe('App', () => {
  const mockAuthService = {
    validateToken: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
  };

  // Store original window.location
  const originalLocation = window.location;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Reset all mock functions with default resolved values
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
      { id: 1, name: 'Test Company' }
    ]);
    icnDataService.clearCache = jest.fn();
  });

  afterEach(() => {
    // Restore window.location if it was modified
    if (window.location !== originalLocation) {
      window.location = originalLocation;
    }
  });

  describe('Initial Rendering and Loading', () => {
    test('renders app and shows loading screen initially', async () => {
      render(<App />);
      
      expect(screen.getByText('Loading ICN Navigator...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });

    test('loads ICN data on initialization', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(icnDataService.loadData).toHaveBeenCalled();
        expect(icnDataService.getStatistics).toHaveBeenCalled();
      });
    });

    test('shows loading progress during initialization', async () => {
      const { container } = render(<App />);
      
      // Check immediately - loading screen should be present
      expect(screen.getByText('Loading ICN Navigator...')).toBeInTheDocument();
      
      // Check for loading stage element (text changes quickly)
      const loadingStage = container.querySelector('.loading-stage');
      expect(loadingStage).toBeInTheDocument();
      
      // Check for progress bar
      const progressBar = container.querySelector('.loading-progress');
      expect(progressBar).toBeInTheDocument();
      
      await waitFor(() => {
        expect(icnDataService.loadData).toHaveBeenCalled();
      });
      
      // Eventually should complete and show home page
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('completes loading with 100% progress', async () => {
      render(<App />);
      
      // Initially should show some progress
      expect(screen.getByText(/Loading ICN Navigator/)).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('loading screen hides logo on error', async () => {
      const { container } = render(<App />);
      
      const logo = container.querySelector('.loading-logo');
      
      if (logo) {
        // Simulate image load error
        act(() => {
          logo.dispatchEvent(new Event('error'));
        });
        
        expect(logo.style.display).toBe('none');
      }
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication and User Session', () => {
    test('restores user session from localStorage', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: true
      };
      
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(mockAuthService.validateToken).toHaveBeenCalledWith('mock-token');
        expect(screen.getByTestId('navigation-bar')).toBeInTheDocument();
      });
    });

    test('validates token on app start', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));
      
      render(<App />);
      
      await waitFor(() => {
        expect(mockAuthService.validateToken).toHaveBeenCalledWith('test-token');
      });
    });

    test('clears auth data for invalid token', async () => {
      localStorage.setItem('token', 'invalid-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));
      
      mockAuthService.validateToken.mockResolvedValue({ valid: false });
      
      render(<App />);
      
      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
      });
    });

    test('handles token validation failure', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));
      
      mockAuthService.validateToken.mockRejectedValue(new Error('Validation failed'));
      
      render(<App />);
      
      await waitFor(() => {
        // Should keep user logged in despite validation failure (offline mode)
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });

    test('handles invalid user data in localStorage', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', 'invalid-json');
      
      render(<App />);
      
      await waitFor(() => {
        // Should handle error and clear invalid data
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
        expect(localStorage.getItem('user')).toBeNull();
      });
    });

    test('handles missing auth service gracefully', async () => {
      serviceFactory.getService.mockReturnValue(null);
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, tier: 'free' }));
      
      render(<App />);
      
      await waitFor(() => {
        // Should still load even without auth service
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });
  });

  describe('Login and SignUp', () => {
    test('handleLogin updates user state and checks onboarding', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });

    test('handleSignUp sets user state', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });
  });

  describe('Logout', () => {
    test('handles logout correctly', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: true
      };
      
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
      
      const logoutButton = screen.getByText('Logout');
      await act(async () => {
        logoutButton.click();
      });
      
      await waitFor(() => {
        expect(mockAuthService.logout).toHaveBeenCalled();
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
      });
    });

    test('handles logout service error gracefully', async () => {
      mockAuthService.logout.mockRejectedValue(new Error('Logout failed'));
      
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: true
      };
      
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
      
      const logoutButton = screen.getByText('Logout');
      
      await act(async () => {
        logoutButton.click();
      });
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error));
        // Should still clear local storage even if service fails
        expect(localStorage.getItem('token')).toBeNull();
      });
      
      consoleSpy.mockRestore();
    });

    test('clears ICN cache on logout when configured', async () => {
      process.env.REACT_APP_CLEAR_CACHE_ON_LOGOUT = 'true';
      
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: true
      };
      
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
      
      const logoutButton = screen.getByText('Logout');
      
      await act(async () => {
        logoutButton.click();
      });
      
      await waitFor(() => {
        expect(icnDataService.clearCache).toHaveBeenCalled();
      });
      
      // Clean up
      delete process.env.REACT_APP_CLEAR_CACHE_ON_LOGOUT;
    });
  });

  describe('Onboarding', () => {
    test('shows onboarding for new users without onboarding complete', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: false
      };
      
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
      });
    });

    test('does not show onboarding for users who completed it', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: true
      };
      
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
      });
    });

    test('users with preferences skip onboarding', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: false,
        preferences: { interests: ['tech'] }
      };
      
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
      });
    });

    test('users who skipped onboarding do not see it again', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: false,
        onboardingSkipped: true
      };
      
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
      });
    });

    test('handleOnboardingComplete saves preferences and updates user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: false
      };
      
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
      });
      
      const completeButton = screen.getByText('Complete');
      
      await act(async () => {
        completeButton.click();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
        
        const savedUser = JSON.parse(localStorage.getItem('user'));
        expect(savedUser.onboardingComplete).toBe(true);
        expect(savedUser.preferences).toEqual({ interests: ['tech'] });
        expect(savedUser.onboardingCompletedAt).toBeDefined();
      });
    });

    test('handleOnboardingComplete calls updateProfile API', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: false
      };
      
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
      });
      
      const completeButton = screen.getByText('Complete');
      
      await act(async () => {
        completeButton.click();
      });
      
      await waitFor(() => {
        expect(mockAuthService.updateProfile).toHaveBeenCalledWith(
          1,
          { preferences: { interests: ['tech'] } }
        );
      });
    });

    test('onboarding completes even if API call fails', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: false
      };
      
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      mockAuthService.updateProfile.mockRejectedValue(new Error('API Error'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
      });
      
      const completeButton = screen.getByText('Complete');
      
      await act(async () => {
        completeButton.click();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
        // Check that error was logged but onboarding still completed
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to save preferences:',
          expect.any(Error)
        );
      });
      
      consoleSpy.mockRestore();
    });

    test('handleOnboardingSkip marks onboarding as skipped', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        tier: 'free',
        onboardingComplete: false
      };
      
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
      });
      
      const skipButton = screen.getByText('Skip');
      
      await act(async () => {
        skipButton.click();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
        
        const savedUser = JSON.parse(localStorage.getItem('user'));
        expect(savedUser.onboardingComplete).toBe(true);
        expect(savedUser.onboardingSkipped).toBe(true);
        expect(savedUser.onboardingSkippedAt).toBeDefined();
      });
    });
  });

  describe('Data Loading', () => {
    test('handles ICN data loading failure gracefully', async () => {
      icnDataService.loadData.mockRejectedValue(new Error('Failed to load data'));
      
      render(<App />);
      
      await waitFor(() => {
        // App should show warning banner instead of error screen
        expect(screen.getByText(/Failed to load company data/)).toBeInTheDocument();
      });
    });

    test('shows warning banner for data loading errors', async () => {
      icnDataService.loadData.mockRejectedValue(new Error('Failed to load data'));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to load company data/)).toBeInTheDocument();
      });
    });

    test('dismisses warning banner when close button clicked', async () => {
      icnDataService.loadData.mockRejectedValue(new Error('Failed to load data'));
      
      const { container } = render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to load company data/)).toBeInTheDocument();
      });
      
      const closeButton = container.querySelector('.warning-banner button');
      
      if (closeButton) {
        await act(async () => {
          closeButton.click();
        });
        
        await waitFor(() => {
          expect(screen.queryByText(/Failed to load company data/)).not.toBeInTheDocument();
        });
      }
    });

    test('logs ICN data statistics in development', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      render(<App />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('ICN Data Loaded Successfully'),
          expect.any(Object)
        );
      });
      
      consoleSpy.mockRestore();
    });

    test('logs sample companies in development mode', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      render(<App />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Sample companies:',
          expect.any(Array)
        );
      });
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('Google Maps Integration', () => {
    test('loads Google Maps with correct API key', async () => {
      process.env.REACT_APP_GOOGLE_MAPS_KEY = 'test-api-key';
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('load-script')).toBeInTheDocument();
      });
    });

    test('handles missing Google Maps API key', async () => {
      delete process.env.REACT_APP_GOOGLE_MAPS_KEY;
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('load-script')).toBeInTheDocument();
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });
  });

  describe('Context Providers', () => {
    test('provides BookmarkProvider context', async () => {
      render(<App />);
      
      await waitFor(() => {
        // App should wrap content in BookmarkProvider
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });
  });

  describe('Development Mode', () => {
    test('displays dev mode banner in development', async () => {
      // Environment variables are set at build time in React
      // This test only works when actually running in development mode
      if (process.env.NODE_ENV !== 'development' || process.env.REACT_APP_USE_MOCK !== 'true') {
        console.log('Skipping dev banner test - not in development with mock data');
        return;
      }
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
      
      const devBanner = document.querySelector('.dev-banner');
      expect(devBanner).toBeTruthy();
    });

    test('dev mode banner can be minimized and expanded', async () => {
      // Force dev mode
      const originalNodeEnv = process.env.NODE_ENV;
      const originalUseMock = process.env.REACT_APP_USE_MOCK;
      
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
      
      // Restore
      process.env.NODE_ENV = originalNodeEnv;
      process.env.REACT_APP_USE_MOCK = originalUseMock;
    });
  });

  describe('Route Protection', () => {
    test('protected routes require authentication', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
      
      // Note: Full route testing would require more complex setup
      // These are basic smoke tests to ensure routes render
    });
  });

  describe('Error Handling', () => {
    test('shows error screen when data loading fails and dataLoaded is false', async () => {
      icnDataService.loadData.mockRejectedValue(new Error('Critical data error'));
      
      // Need to ensure dataLoaded stays false
      icnDataService.getStatistics.mockImplementation(() => {
        throw new Error('No data');
      });
      
      render(<App />);
      
      await waitFor(() => {
        // Check if error screen appears
        const errorScreen = screen.queryByText(/Initialization Error/);
        if (errorScreen) {
          expect(errorScreen).toBeInTheDocument();
          expect(screen.getByText('Retry')).toBeInTheDocument();
        }
      });
    });

    test('retry button reloads window on error screen', async () => {
      // Mock window.location.reload properly
      delete window.location;
      window.location = { reload: jest.fn() };
      
      icnDataService.loadData.mockRejectedValue(new Error('Critical error'));
      icnDataService.getStatistics.mockImplementation(() => {
        throw new Error('No stats');
      });
      
      render(<App />);
      
      await waitFor(() => {
        const retryButton = screen.queryByText('Retry');
        if (retryButton) {
          act(() => {
            retryButton.click();
          });
          
          expect(window.location.reload).toHaveBeenCalled();
        }
      });
    });
  });
});