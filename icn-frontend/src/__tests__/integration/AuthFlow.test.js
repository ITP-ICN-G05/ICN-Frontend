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

  return {
    getAuthService: jest.fn(() => {
      console.log('🟢 getAuthService called');
      return {
        login: mockLoginFn,
        register: mockRegisterFn,
      };
    }),
    // Store references so tests can access them
    __mockLogin: mockLoginFn,
    __mockRegister: mockRegisterFn,
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
  return function MockOnboardingModal() {
    return <div data-testid="onboarding-modal">Onboarding Modal</div>;
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

describe('Authentication Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    
    // Clear call history
    mockLogin.mockClear();
    mockRegister.mockClear();
    
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
});