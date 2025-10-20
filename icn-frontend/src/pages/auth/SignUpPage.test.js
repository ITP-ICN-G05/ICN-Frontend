import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignUpPage from '../auth/SignUpPage';
import * as serviceFactory from '../../services/serviceFactory';

jest.mock('../../services/serviceFactory');
jest.mock('../../components/onboarding/OnboardingModal', () => {
  return function MockOnboardingModal({ onComplete, onSkip }) {
    return (
      <div data-testid="onboarding-modal">
        <button onClick={() => onComplete({ interests: ['tech'] })}>Complete</button>
        <button onClick={onSkip}>Skip</button>
      </div>
    );
  };
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe('SignUpPage', () => {
  const mockOnSignUp = jest.fn();
  const mockAuthService = {
    signup: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    serviceFactory.getAuthService.mockReturnValue(mockAuthService);
    localStorage.clear();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <SignUpPage onSignUp={mockOnSignUp} />
      </BrowserRouter>
    );
  };

  test('renders sign up form', () => {
    renderComponent();
    
    expect(screen.getByText('Sign up')).toBeInTheDocument();
    expect(screen.getByLabelText(/user name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm your password/i)).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    renderComponent();
    
    const submitButton = screen.getByRole('button', { name: /create an account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  test('shows validation error for invalid email', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    });
  });

  test('shows validation error for short password', async () => {
    renderComponent();
    
    const nameInput = screen.getByLabelText(/user name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  test('shows validation error for mismatched passwords', async () => {
    renderComponent();
    
    const nameInput = screen.getByLabelText(/user name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm your password/i);
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  test('shows validation error when terms not agreed', async () => {
    renderComponent();
    
    const nameInput = screen.getByLabelText(/user name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm your password/i);
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('You must agree to the terms and conditions')).toBeInTheDocument();
    });
  });

  test('successfully signs up with valid data', async () => {
    renderComponent();
    
    const nameInput = screen.getByLabelText(/user name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm your password/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /i agree to the terms/i });
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(termsCheckbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('toggles password visibility', () => {
    renderComponent();
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    const toggleButtons = screen.getAllByRole('button', { name: /show password|hide password/i });

    expect(passwordInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButtons[0]);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('clears field errors on input change', async () => {
    renderComponent();
    
    const nameInput = screen.getByLabelText(/user name/i);
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    fireEvent.change(nameInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    });
  });

  test('disables submit button while loading', async () => {
    renderComponent();
    
    const nameInput = screen.getByLabelText(/user name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm your password/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /i agree to the terms/i });
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(termsCheckbox);
    fireEvent.click(submitButton);

    expect(screen.getByText('Creating account...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  test('renders social signup buttons', () => {
    renderComponent();
    
    expect(screen.getByText('Or continue with')).toBeInTheDocument();
  });

  test('renders login link', () => {
    renderComponent();
    
    const loginLink = screen.getByText('log in instead');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  test('shows password hint', () => {
    renderComponent();
    
    expect(screen.getByText(/use 8 or more characters/i)).toBeInTheDocument();
  });

  test('handles onboarding completion', async () => {
    renderComponent();
    
    const nameInput = screen.getByLabelText(/user name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm your password/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /i agree to the terms/i });
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(termsCheckbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
    }, { timeout: 3000 });

    const completeButton = screen.getByText('Complete');
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(mockOnSignUp).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('handles onboarding skip', async () => {
    renderComponent();
    
    const nameInput = screen.getByLabelText(/user name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm your password/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /i agree to the terms/i });
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(termsCheckbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
    }, { timeout: 3000 });

    const skipButton = screen.getByText('Skip');
    fireEvent.click(skipButton);

    await waitFor(() => {
      expect(mockOnSignUp).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('renders promotional image', () => {
    renderComponent();
    
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  test('renders terms and conditions link', () => {
    renderComponent();
    
    const termsLink = screen.getByText('Terms and Conditions');
    const privacyLink = screen.getByText('Privacy Policy');
    
    expect(termsLink).toBeInTheDocument();
    expect(privacyLink).toBeInTheDocument();
  });

  // ============= ADDITIONAL COVERAGE TESTS =============

  test('toggles confirm password visibility', () => {
    renderComponent();
    
    const confirmPasswordInput = screen.getByLabelText(/confirm your password/i);
    const toggleButtons = screen.getAllByRole('button', { name: /show password|hide password/i });
    
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButtons[1]);
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    
    fireEvent.click(toggleButtons[1]);
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  test('handles social login button clicks', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    renderComponent();
    
    const socialButtons = screen.getAllByRole('button');
    const facebookBtn = socialButtons.find(btn => btn.classList.contains('facebook'));
    fireEvent.click(facebookBtn);
    expect(consoleSpy).toHaveBeenCalledWith('Sign up with facebook');
    
    const appleBtn = socialButtons.find(btn => btn.classList.contains('apple'));
    fireEvent.click(appleBtn);
    expect(consoleSpy).toHaveBeenCalledWith('Sign up with apple');
    
    const googleBtn = socialButtons.find(btn => btn.classList.contains('google'));
    fireEvent.click(googleBtn);
    expect(consoleSpy).toHaveBeenCalledWith('Sign up with google');
    
    const twitterBtn = socialButtons.find(btn => btn.classList.contains('twitter'));
    fireEvent.click(twitterBtn);
    expect(consoleSpy).toHaveBeenCalledWith('Sign up with twitter');
    
    consoleSpy.mockRestore();
  });

  test('validates email format correctly', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    const invalidEmails = ['test@', '@test.com', 'test', 'test@test'];
    
    for (const invalidEmail of invalidEmails) {
      fireEvent.change(emailInput, { target: { value: invalidEmail } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email is invalid')).toBeInTheDocument();
      });
    }
  });

  test('validates password length edge case', async () => {
    renderComponent();
    
    const nameInput = screen.getByLabelText(/user name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    
    fireEvent.change(passwordInput, { target: { value: '1234567' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });

    fireEvent.change(passwordInput, { target: { value: '12345678' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText('Password must be at least 8 characters')).not.toBeInTheDocument();
    });
  });

  test('clears multiple field errors on input change', async () => {
    renderComponent();
    
    const nameInput = screen.getByLabelText(/user name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    fireEvent.change(nameInput, { target: { value: 'John' } });
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();

    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
  });

  test('clears confirm password error on input change', async () => {
    renderComponent();
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm your password/i);
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
  });

  test('clears terms error on checkbox change', async () => {
    renderComponent();
    
    const termsCheckbox = screen.getByRole('checkbox', { name: /i agree to the terms/i });
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('You must agree to the terms and conditions')).toBeInTheDocument();
    });

    fireEvent.click(termsCheckbox);
    expect(screen.queryByText('You must agree to the terms and conditions')).not.toBeInTheDocument();
  });

  test('stores user data correctly in localStorage after signup', async () => {
    renderComponent();
    
    const nameInput = screen.getByLabelText(/user name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm your password/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /i agree to the terms/i });
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(termsCheckbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
    }, { timeout: 3000 });

    const storedToken = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user'));

    expect(storedToken).toBe('mock-jwt-token');
    expect(storedUser).toMatchObject({
      name: 'John Doe',
      email: 'john@test.com',
      tier: 'free',
      onboardingComplete: false
    });
  });

  test('updates user data after onboarding completion', async () => {
    renderComponent();
    
    const nameInput = screen.getByLabelText(/user name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm your password/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /i agree to the terms/i });
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(termsCheckbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
    }, { timeout: 3000 });

    const completeButton = screen.getByText('Complete');
    fireEvent.click(completeButton);

    await waitFor(() => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      expect(storedUser.onboardingComplete).toBe(true);
      expect(storedUser.preferences).toEqual({ interests: ['tech'] });
    });
  });

  test('marks onboarding as skipped when user skips', async () => {
    renderComponent();
    
    const nameInput = screen.getByLabelText(/user name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm your password/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /i agree to the terms/i });
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(termsCheckbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
    }, { timeout: 3000 });

    const skipButton = screen.getByText('Skip');
    fireEvent.click(skipButton);

    await waitFor(() => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      expect(storedUser.onboardingComplete).toBe(true);
      expect(storedUser.onboardingSkipped).toBe(true);
    });
  });

  test('disables social login buttons while loading', async () => {
    renderComponent();
    
    const nameInput = screen.getByLabelText(/user name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm your password/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /i agree to the terms/i });
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(termsCheckbox);
    fireEvent.click(submitButton);

    const socialButtons = screen.getAllByRole('button');
    const facebookBtn = socialButtons.find(btn => btn.classList.contains('facebook'));
    expect(facebookBtn).toBeDisabled();
  });

  test('validates empty confirm password separately', async () => {
    renderComponent();
    
    const nameInput = screen.getByLabelText(/user name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
    });
  });

  test('clears password error on input change', async () => {
    renderComponent();
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
  });

  test('clears email error on input change', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    });

    fireEvent.change(emailInput, { target: { value: 'valid@test.com' } });
    expect(screen.queryByText('Email is invalid')).not.toBeInTheDocument();
  });
});