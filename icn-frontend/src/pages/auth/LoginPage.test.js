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

  test('renders terms of use and privacy policy links', () => {
    renderComponent();
    
    const termsLink = screen.getByText('Terms of use');
    const privacyLink = screen.getByText('Privacy Policy');
    
    expect(termsLink).toBeInTheDocument();
    expect(privacyLink).toBeInTheDocument();
  });

  test('remember me checkbox works', () => {
    renderComponent();
    
    const rememberCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
    expect(rememberCheckbox).toBeChecked(); // Default is checked
    
    fireEvent.click(rememberCheckbox);
    expect(rememberCheckbox).not.toBeChecked();
  });

  test('renders download buttons', () => {
    renderComponent();
    
    expect(screen.getByText('App Store')).toBeInTheDocument();
    expect(screen.getByText('Google Play')).toBeInTheDocument();
  });

  test('renders mobile preview images', () => {
    renderComponent();
    
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });
});