import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../auth/LoginPage';
import * as serviceFactory from '../../services/serviceFactory';

jest.mock('../../services/serviceFactory');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe('LoginPage', () => {
  const mockOnLogin = jest.fn();
  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    serviceFactory.getAuthService.mockReturnValue(mockAuthService);
    localStorage.clear();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <LoginPage onLogin={mockOnLogin} />
      </BrowserRouter>
    );
  };

  test('renders login form', () => {
    renderComponent();
    
    // Use getByRole to specifically target the heading
    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address or user name/i)).toBeInTheDocument();
    // Use exact label text to avoid matching the toggle button
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    renderComponent();
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  test('shows validation error for invalid email', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address or user name/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    });
  });

  test('validates email with missing domain', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address or user name/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    });
  });

  test('validates email with no @ symbol', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address or user name/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'testtest.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    });
  });

  test('successfully logs in with valid credentials', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address or user name/i);
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    }, { timeout: 2000 });
  });

  test('logs in as admin with admin credentials', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address or user name/i);
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@icn.vic.gov.au' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'admin@icn.vic.gov.au',
          role: 'admin'
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    }, { timeout: 2000 });
  });

  test('logs in with alternative valid user credentials', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address or user name/i);
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    }, { timeout: 2000 });
  });

  test('shows error message for invalid credentials', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address or user name/i);
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@email.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password. Please try again.')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('shows error for valid email with wrong password', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address or user name/i);
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password. Please try again.')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('toggles password visibility', () => {
    renderComponent();
    
    const passwordInput = screen.getByLabelText('Password');
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(passwordInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('clears field errors on input change', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address or user name/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });

    await waitFor(() => {
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
  });

  test('clears password error on input change', async () => {
    renderComponent();
    
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    fireEvent.change(passwordInput, { target: { value: 'newpassword' } });

    await waitFor(() => {
      expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
    });
  });

  test('clears invalid email error when typing valid email', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address or user name/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    // First submit with invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    });

    // Type valid email
    fireEvent.change(emailInput, { target: { value: 'valid@test.com' } });

    await waitFor(() => {
      expect(screen.queryByText('Email is invalid')).not.toBeInTheDocument();
    });
  });

  test('disables submit button while loading', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address or user name/i);
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Check for loading state immediately
    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  test('disables input fields while loading', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address or user name/i);
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Check inputs are disabled during loading
    await waitFor(() => {
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });
  });

  test('disables social buttons while loading', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address or user name/i);
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const socialButtons = screen.getAllByRole('button').filter(
        button => button.className.includes('social-btn')
      );
      socialButtons.forEach(btn => {
        expect(btn).toBeDisabled();
      });
    });
  });

  test('renders social login buttons', () => {
    renderComponent();
    
    expect(screen.getByText('Or continue with')).toBeInTheDocument();
    
    // Check for social buttons (they should be visible)
    const socialButtons = screen.getAllByRole('button').filter(
      button => !button.textContent.includes('Log in') && 
               !button.textContent.includes('Show') &&
               !button.textContent.includes('Hide')
    );
    
    expect(socialButtons.length).toBeGreaterThan(0);
  });

  test('handles Facebook social login button click', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    renderComponent();
    
    const socialButtons = screen.getAllByRole('button');
    const facebookBtn = socialButtons.find(btn => btn.className.includes('facebook'));
    
    fireEvent.click(facebookBtn);
    expect(consoleSpy).toHaveBeenCalledWith('Login with facebook');
    
    consoleSpy.mockRestore();
  });

  test('handles Apple social login button click', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    renderComponent();
    
    const socialButtons = screen.getAllByRole('button');
    const appleBtn = socialButtons.find(btn => btn.className.includes('apple'));
    
    fireEvent.click(appleBtn);
    expect(consoleSpy).toHaveBeenCalledWith('Login with apple');
    
    consoleSpy.mockRestore();
  });

  test('handles Google social login button click', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    renderComponent();
    
    const socialButtons = screen.getAllByRole('button');
    const googleBtn = socialButtons.find(btn => btn.className.includes('google'));
    
    fireEvent.click(googleBtn);
    expect(consoleSpy).toHaveBeenCalledWith('Login with google');
    
    consoleSpy.mockRestore();
  });

  test('handles Twitter social login button click', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    renderComponent();
    
    const socialButtons = screen.getAllByRole('button');
    const twitterBtn = socialButtons.find(btn => btn.className.includes('twitter'));
    
    fireEvent.click(twitterBtn);
    expect(consoleSpy).toHaveBeenCalledWith('Login with twitter');
    
    consoleSpy.mockRestore();
  });

  test('renders forgot password link', () => {
    renderComponent();
    
    const forgotLink = screen.getByText('Forget your password');
    expect(forgotLink).toBeInTheDocument();
    expect(forgotLink.closest('a')).toHaveAttribute('href', '/forgot-password');
  });

  test('renders sign up link', () => {
    renderComponent();
    
    const signUpLink = screen.getByText('Sign up');
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink.closest('a')).toHaveAttribute('href', '/signup');
  });

  test('stores user data in localStorage on successful login', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address or user name/i);
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('mock-jwt-token');
      expect(localStorage.getItem('user')).toBeTruthy();
    }, { timeout: 2000 });
  });

  test('stores correct user data structure in localStorage', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address or user name/i);
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const userData = JSON.parse(localStorage.getItem('user'));
      expect(userData).toHaveProperty('id');
      expect(userData).toHaveProperty('name');
      expect(userData).toHaveProperty('email', 'test@test.com');
      expect(userData).toHaveProperty('tier');
      expect(userData).toHaveProperty('role');
    }, { timeout: 2000 });
  });

  test('stores admin user data correctly in localStorage', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address or user name/i);
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@icn.vic.gov.au' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const userData = JSON.parse(localStorage.getItem('user'));
      expect(userData.role).toBe('admin');
      expect(userData.tier).toBe('premium');
      expect(userData.name).toBe('ICN Admin');
    }, { timeout: 2000 });
  });

  test('renders terms of use and privacy policy links', () => {
    renderComponent();
    
    const termsLink = screen.getByText('Terms of use');
    const privacyLink = screen.getByText('Privacy Policy');
    
    expect(termsLink).toBeInTheDocument();
    expect(privacyLink).toBeInTheDocument();
  });

  test('terms link points to correct route', () => {
    renderComponent();
    
    const termsLink = screen.getByText('Terms of use');
    expect(termsLink.closest('a')).toHaveAttribute('href', '/terms');
  });

  test('privacy link points to correct route', () => {
    renderComponent();
    
    const privacyLink = screen.getByText('Privacy Policy');
    expect(privacyLink.closest('a')).toHaveAttribute('href', '/privacy');
  });

  test('remember me checkbox works', () => {
    renderComponent();
    
    const rememberCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
    expect(rememberCheckbox).toBeChecked(); // Default is checked
    
    fireEvent.click(rememberCheckbox);
    expect(rememberCheckbox).not.toBeChecked();
  });

  test('remember me checkbox can be toggled multiple times', () => {
    renderComponent();
    
    const rememberCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
    
    // Default checked
    expect(rememberCheckbox).toBeChecked();
    
    // Uncheck
    fireEvent.click(rememberCheckbox);
    expect(rememberCheckbox).not.toBeChecked();
    
    // Check again
    fireEvent.click(rememberCheckbox);
    expect(rememberCheckbox).toBeChecked();
  });

  test('renders download buttons', () => {
    renderComponent();
    
    expect(screen.getByText('App Store')).toBeInTheDocument();
    expect(screen.getByText('Google Play')).toBeInTheDocument();
  });

  test('renders download button text correctly', () => {
    renderComponent();
    
    expect(screen.getByText('Download on the')).toBeInTheDocument();
    expect(screen.getByText('GET IT ON')).toBeInTheDocument();
  });

  test('renders mobile preview images', () => {
    renderComponent();
    
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  test('renders mobile preview with correct alt text', () => {
    renderComponent();
    
    expect(screen.getByAltText('Company Information App Screen')).toBeInTheDocument();
    expect(screen.getByAltText('Map Page App Screen')).toBeInTheDocument();
  });

  test('does not call onLogin if validation fails', async () => {
    renderComponent();
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  test('does not navigate if validation fails', async () => {
    renderComponent();
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('maintains form state during loading', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address or user name/i);
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Form values should remain during loading
    expect(emailInput).toHaveValue('test@test.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('password toggle button has correct aria-label', () => {
    renderComponent();
    
    const toggleButton = screen.getByRole('button', { name: /show password/i });
    expect(toggleButton).toHaveAttribute('aria-label', 'Show password');
    
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-label', 'Hide password');
  });

  test('legal agreement text is displayed', () => {
    renderComponent();
    
    expect(screen.getByText(/By continuing, you agree to the/i)).toBeInTheDocument();
  });

  test('sign up prompt is displayed', () => {
    renderComponent();
    
    expect(screen.getByText(/Don't have an account?/i)).toBeInTheDocument();
  });
});