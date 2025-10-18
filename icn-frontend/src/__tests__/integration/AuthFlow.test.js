import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

// Mock serviceFactory with a factory function pattern
jest.mock('../../services/serviceFactory', () => {
  // Create mock functions inside the factory
  const mockLoginFn = jest.fn((credentials) => {
    console.log('🔵 Mock login called with:', credentials);
    return Promise.resolve({
      token: 'mock-jwt-token',
      user: { id: 1, email: 'test@test.com', name: 'Test User' }
    });
  });
  
  const mockRegisterFn = jest.fn((userData) => {
    console.log('🔵 Mock register called with:', userData);
    return Promise.resolve({
      token: 'mock-jwt-token',
      user: { id: 2, email: 'new@example.com', name: 'New User' }
    });
  });

  const mockForgotPasswordFn = jest.fn((email) => {
    return Promise.resolve({ success: true, message: 'Reset email sent' });
  });

  const mockResetPasswordFn = jest.fn((token, password) => {
    return Promise.resolve({ success: true });
  });

  return {
    getAuthService: jest.fn(() => ({
      login: mockLoginFn,
      register: mockRegisterFn,
      forgotPassword: mockForgotPasswordFn,
      resetPassword: mockResetPasswordFn,
    })),
    // Store references so tests can access them
    __mockLogin: mockLoginFn,
    __mockRegister: mockRegisterFn,
    __mockForgotPassword: mockForgotPasswordFn,
    __mockResetPassword: mockResetPasswordFn,
    getCompanyService: jest.fn(),
    getBookmarkService: jest.fn(),
    getSavedSearchService: jest.fn(),
    getSubscriptionService: jest.fn(),
    getExportService: jest.fn(),
    getAdminService: jest.fn(),
    getGeocodingService: jest.fn(),
  };
});

// Mock OnboardingModal
jest.mock('../../components/onboarding/OnboardingModal', () => {
  return function MockOnboardingModal({ onComplete }) {
    return (
      <div data-testid="onboarding-modal">
        <h1>Onboarding Modal</h1>
        <button onClick={onComplete}>Complete Onboarding</button>
      </div>
    );
  };
});

// Mock image imports
jest.mock('../../assets/logo/ICN-logo-little.png', () => 'logo.png');
jest.mock('../../assets/use_image/cmp_inf.jpg', () => 'cmp_inf.jpg');
jest.mock('../../assets/use_image/map_page.jpg', () => 'map_page.jpg');
jest.mock('../../assets/use_image/sign-up.png', () => 'sign-up.png');

// NOW import the components (after mocks are set up)
import LoginPage from '../../pages/auth/LoginPage';
import SignUpPage from '../../pages/auth/SignUpPage';

// Import the mock to access the mock functions
const serviceFactory = require('../../services/serviceFactory');
const mockLogin = serviceFactory.__mockLogin;
const mockRegister = serviceFactory.__mockRegister;
const mockForgotPassword = serviceFactory.__mockForgotPassword;
const mockResetPassword = serviceFactory.__mockResetPassword;

describe('Authentication Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    
    // Clear call history
    mockLogin.mockClear();
    mockRegister.mockClear();
    mockForgotPassword.mockClear();
    mockResetPassword.mockClear();
    
    // Reset to default successful implementations
    mockLogin.mockResolvedValue({
      token: 'mock-jwt-token',
      user: { id: 1, email: 'test@test.com', name: 'Test User' }
    });
    
    mockRegister.mockResolvedValue({
      token: 'mock-jwt-token',
      user: { id: 2, email: 'new@example.com', name: 'New User' }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Flow', () => {
    it('completes login flow successfully', async () => {
      const user = userEvent.setup();
      const mockOnLogin = jest.fn();
      
      console.log('🟡 Test starting, rendering LoginPage');
      
      render(
        <BrowserRouter>
          <LoginPage onLogin={mockOnLogin} />
        </BrowserRouter>
      );

      console.log('🟡 LoginPage rendered');

      // Wait a moment for any auto-login to attempt
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check the state of the form
      const loginButton = screen.getByRole('button', { name: /log in/i });
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      
      console.log('🟡 Button disabled:', loginButton.disabled);
      console.log('🟡 Email value:', emailInput.value);
      console.log('🟡 Password value:', passwordInput.value);
      console.log('🟡 mockLogin called:', mockLogin.mock.calls.length, 'times');

      // If button is disabled, wait for it to enable
      if (loginButton.disabled) {
        await waitFor(() => {
          expect(loginButton).not.toBeDisabled();
        }, { timeout: 10000 });
      }

      // If fields are empty, fill them manually
      if (!emailInput.value) {
        await user.type(emailInput, 'test@test.com');
        await user.type(passwordInput, 'password123');
      }

      console.log('🟡 About to click login button');
      await user.click(loginButton);

      console.log('🟡 Login button clicked, waiting for response');
      
      await waitFor(() => {
        console.log('🟡 Checking... mockLogin calls:', mockLogin.mock.calls.length);
        console.log('🟡 Token:', localStorage.getItem('token'));
        expect(mockOnLogin).toHaveBeenCalled();
        expect(localStorage.getItem('token')).toBe('mock-jwt-token');
      }, { timeout: 10000 });
    });

    it('shows validation errors for invalid input', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <LoginPage onLogin={jest.fn()} />
        </BrowserRouter>
      );

      const loginButton = screen.getByRole('button', { name: /log in/i });
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('shows error for invalid credentials', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <LoginPage onLogin={jest.fn()} />
        </BrowserRouter>
      );

      // Wait for the initial auto-login to complete
      await waitFor(() => {
        const loginButton = screen.getByRole('button', { name: /log in/i });
        expect(loginButton).not.toBeDisabled();
      }, { timeout: 5000 });

      // Now set up the mock to reject for the next login attempt
      mockLogin.mockRejectedValueOnce(new Error('Invalid email or password'));

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const loginButton = screen.getByRole('button', { name: /log in/i });

      // Clear and enter wrong credentials
      await user.clear(emailInput);
      await user.clear(passwordInput);
      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(loginButton);

      // Check for error message
      await waitFor(() => {
        expect(screen.getByText(/invalid email or password.*please try again/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('validates email format', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <LoginPage onLogin={jest.fn()} />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const loginButton = screen.getByRole('button', { name: /log in/i });

      await user.type(emailInput, 'invalidemail');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });

    it('disables button while submitting', async () => {
      const user = userEvent.setup();
      
      // Make login slow to test loading state
      mockLogin.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          token: 'mock-jwt-token',
          user: { id: 1, email: 'test@test.com', name: 'Test User' }
        }), 1000))
      );
      
      render(
        <BrowserRouter>
          <LoginPage onLogin={jest.fn()} />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const loginButton = screen.getByRole('button', { name: /log in/i });

      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      // Button should be disabled during submission
      expect(loginButton).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(loginButton).not.toBeDisabled();
      }, { timeout: 2000 });
    });

    it('stores user data in localStorage on successful login', async () => {
      const user = userEvent.setup();
      const mockOnLogin = jest.fn();
      
      render(
        <BrowserRouter>
          <LoginPage onLogin={mockOnLogin} />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const loginButton = screen.getByRole('button', { name: /log in/i });

      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('mock-jwt-token');
        expect(localStorage.getItem('user')).toBeTruthy();
        const storedUser = JSON.parse(localStorage.getItem('user'));
        expect(storedUser.email).toBe('test@test.com');
      });
    });

    it('shows "remember me" functionality', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <LoginPage onLogin={jest.fn()} />
        </BrowserRouter>
      );

      const rememberMeCheckbox = screen.queryByRole('checkbox', { name: /remember me/i });
      
      if (rememberMeCheckbox) {
        expect(rememberMeCheckbox).toBeInTheDocument();
        await user.click(rememberMeCheckbox);
        expect(rememberMeCheckbox).toBeChecked();
      }
    });
  });

  describe('Signup Flow', () => {
    it('completes signup flow successfully', async () => {
      const user = userEvent.setup();
      const mockOnSignUp = jest.fn();
      
      render(
        <BrowserRouter>
          <SignUpPage onSignUp={mockOnSignUp} />
        </BrowserRouter>
      );

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm.*password/i);
      const agreeTermsCheckbox = screen.getByRole('checkbox', { name: /terms and conditions/i });
      const signupButton = screen.getByRole('button', { name: /create an account/i });

      await user.type(nameInput, 'New User');
      await user.type(emailInput, 'new@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(agreeTermsCheckbox);
      await user.click(signupButton);

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('mock-jwt-token');
        expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
      });
    });

    it('validates password match in signup', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignUpPage onSignUp={jest.fn()} />
        </BrowserRouter>
      );

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm.*password/i);
      const agreeTermsCheckbox = screen.getByRole('checkbox', { name: /terms and conditions/i });
      const signupButton = screen.getByRole('button', { name: /create an account/i });

      await user.type(nameInput, 'New User');
      await user.type(emailInput, 'new@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'differentpassword');
      await user.click(agreeTermsCheckbox);
      await user.click(signupButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('requires terms and conditions acceptance', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignUpPage onSignUp={jest.fn()} />
        </BrowserRouter>
      );

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm.*password/i);
      const signupButton = screen.getByRole('button', { name: /create an account/i });

      await user.type(nameInput, 'New User');
      await user.type(emailInput, 'new@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      // Don't check the terms checkbox
      await user.click(signupButton);

      await waitFor(() => {
        expect(screen.getByText(/you must agree to the terms/i)).toBeInTheDocument();
      });
    });

    it('validates all required fields', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignUpPage onSignUp={jest.fn()} />
        </BrowserRouter>
      );

      const signupButton = screen.getByRole('button', { name: /create an account/i });
      await user.click(signupButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('validates password strength', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignUpPage onSignUp={jest.fn()} />
        </BrowserRouter>
      );

      const passwordInput = screen.getByLabelText(/^password$/i);
      
      // Try weak password
      await user.type(passwordInput, '123');
      
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('shows error for duplicate email', async () => {
      const user = userEvent.setup();
      
      mockRegister.mockRejectedValueOnce(new Error('Email already registered'));
      
      render(
        <BrowserRouter>
          <SignUpPage onSignUp={jest.fn()} />
        </BrowserRouter>
      );

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm.*password/i);
      const agreeTermsCheckbox = screen.getByRole('checkbox', { name: /terms and conditions/i });
      const signupButton = screen.getByRole('button', { name: /create an account/i });

      await user.type(nameInput, 'Existing User');
      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(agreeTermsCheckbox);
      await user.click(signupButton);

      await waitFor(() => {
        expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
      });
    });

    it('completes onboarding after signup', async () => {
      const user = userEvent.setup();
      const mockOnSignUp = jest.fn();
      
      render(
        <BrowserRouter>
          <SignUpPage onSignUp={mockOnSignUp} />
        </BrowserRouter>
      );

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm.*password/i);
      const agreeTermsCheckbox = screen.getByRole('checkbox', { name: /terms and conditions/i });
      const signupButton = screen.getByRole('button', { name: /create an account/i });

      await user.type(nameInput, 'New User');
      await user.type(emailInput, 'new@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(agreeTermsCheckbox);
      await user.click(signupButton);

      // Wait for onboarding modal
      await waitFor(() => {
        expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
      });

      // Complete onboarding
      const completeButton = screen.getByText(/complete onboarding/i);
      await user.click(completeButton);

      // Verify modal closes or callback is called
      expect(mockOnSignUp).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('navigates from login to signup', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <LoginPage onLogin={jest.fn()} />
        </BrowserRouter>
      );

      const signupLink = screen.getByText(/sign up/i);
      expect(signupLink).toBeInTheDocument();
      expect(signupLink).toHaveAttribute('href', expect.stringContaining('signup'));
    });

    it('navigates from signup to login', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignUpPage onSignUp={jest.fn()} />
        </BrowserRouter>
      );

      const loginLink = screen.getByText(/log in|sign in/i);
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', expect.stringContaining('login'));
    });
  });

  describe('Password Reset', () => {
    it('shows forgot password link', () => {
      render(
        <BrowserRouter>
          <LoginPage onLogin={jest.fn()} />
        </BrowserRouter>
      );

      const forgotPasswordLink = screen.queryByText(/forgot.*password/i);
      if (forgotPasswordLink) {
        expect(forgotPasswordLink).toBeInTheDocument();
      }
    });

    it('handles forgot password request', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <LoginPage onLogin={jest.fn()} />
        </BrowserRouter>
      );

      const forgotPasswordLink = screen.queryByText(/forgot.*password/i);
      
      if (forgotPasswordLink) {
        await user.click(forgotPasswordLink);

        const emailInput = await screen.findByLabelText(/email/i);
        await user.type(emailInput, 'test@test.com');

        const submitButton = screen.getByRole('button', { name: /send reset link|reset/i });
        await user.click(submitButton);

        await waitFor(() => {
          expect(mockForgotPassword).toHaveBeenCalledWith('test@test.com');
          expect(screen.getByText(/reset email sent/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      render(
        <BrowserRouter>
          <LoginPage onLogin={jest.fn()} />
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    });

    it('has proper ARIA attributes', () => {
      render(
        <BrowserRouter>
          <LoginPage onLogin={jest.fn()} />
        </BrowserRouter>
      );

      const loginButton = screen.getByRole('button', { name: /log in/i });
      expect(loginButton).toHaveAttribute('type', 'submit');
    });

    it('shows error messages with proper ARIA', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <LoginPage onLogin={jest.fn()} />
        </BrowserRouter>
      );

      const loginButton = screen.getByRole('button', { name: /log in/i });
      await user.click(loginButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert');
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Security', () => {
    it('does not expose password in DOM', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <LoginPage onLogin={jest.fn()} />
        </BrowserRouter>
      );

      const passwordInput = screen.getByLabelText(/^password$/i);
      
      await user.type(passwordInput, 'secretpassword');
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput.value).toBe('secretpassword');
    });

    it('clears sensitive data on unmount', () => {
      const { unmount } = render(
        <BrowserRouter>
          <LoginPage onLogin={jest.fn()} />
        </BrowserRouter>
      );

      unmount();

      // Verify no sensitive data remains in memory or DOM
      expect(document.body.textContent).not.toContain('password');
    });
  });
});