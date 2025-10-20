import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ForgotPasswordPage from '../auth/ForgotPasswordPage';
import * as serviceFactory from '../../services/serviceFactory';

jest.mock('../../services/serviceFactory');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

// Mock timers for countdown
jest.useFakeTimers();

describe('ForgotPasswordPage', () => {
  const mockAuthService = {
    sendVerificationCode: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    serviceFactory.getAuthService.mockReturnValue(mockAuthService);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );
  };

  test('renders forgot password form', () => {
    renderComponent();
    
    expect(screen.getByText('Reset your password')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email verification/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm your password/i)).toBeInTheDocument();
  });

  test('shows validation error for empty email', async () => {
    renderComponent();
    
    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  test('shows validation error for invalid email', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address/i);
    const sendButton = screen.getByText('Send');

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    });
  });

  test('sends verification code successfully', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address/i);
    const sendButton = screen.getByText('Send');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    await act(async () => {
      fireEvent.click(sendButton);
      // Advance timers to resolve the setTimeout in handleSendCode
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      // Button should show countdown
      expect(screen.queryByText('Send')).not.toBeInTheDocument();
      expect(screen.getByText('60s')).toBeInTheDocument();
    });
  });

  test('countdown works after sending code', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address/i);
    const sendButton = screen.getByText('Send');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    await act(async () => {
      fireEvent.click(sendButton);
      // Advance timers to resolve the setTimeout in handleSendCode
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText(/60s/)).toBeInTheDocument();
    });

    // Fast-forward time by 1 second
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText(/59s/)).toBeInTheDocument();
    });

    // Fast-forward through the remaining countdown by advancing in chunks
    // This ensures React state updates are properly flushed between timer ticks
    for (let i = 0; i < 59; i++) {
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
    }

    await waitFor(() => {
      expect(screen.getByText('Send')).toBeInTheDocument();
    });
  });

  test('validates all fields on form submit', async () => {
    renderComponent();
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Verification code is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
    });
  });

  test('shows error for short password', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address/i);
    const codeInput = screen.getByLabelText(/email verification/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmButton = screen.getByRole('button', { name: /confirm/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  test('shows error for mismatched passwords', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address/i);
    const codeInput = screen.getByLabelText(/email verification/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm your password/i);
    const confirmButton = screen.getByRole('button', { name: /confirm/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  test('successfully resets password', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address/i);
    const codeInput = screen.getByLabelText(/email verification/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm your password/i);
    const confirmButton = screen.getByRole('button', { name: /confirm/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.change(passwordInput, { target: { value: 'newPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword123' } });
    
    await act(async () => {
      fireEvent.click(confirmButton);
      // Advance timers to resolve the setTimeout in handleSubmit
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: { message: 'Password reset successfully. Please log in with your new password.' }
      });
    });
  });

  test('toggles password visibility', () => {
    renderComponent();
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    const toggleButtons = screen.getAllByRole('button', { name: /show password|hide password/i });

    expect(passwordInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButtons[0]);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('toggles confirm password visibility', () => {
    renderComponent();
    
    const confirmPasswordInput = screen.getByLabelText(/confirm your password/i);
    const toggleButtons = screen.getAllByRole('button', { name: /show password|hide password/i });

    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    
    // Click the second toggle button (for confirm password)
    fireEvent.click(toggleButtons[1]);
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
  });

  test('clears field errors on input change', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address/i);
    const sendButton = screen.getByText('Send');

    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    await waitFor(() => {
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
  });

  test('disables buttons while loading', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address/i);
    const codeInput = screen.getByLabelText(/email verification/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm your password/i);
    const confirmButton = screen.getByRole('button', { name: /confirm/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.change(passwordInput, { target: { value: 'newPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword123' } });
    fireEvent.click(confirmButton);

    expect(screen.getByText('Resetting password...')).toBeInTheDocument();
    expect(confirmButton).toBeDisabled();
  });

  test('renders login link', () => {
    renderComponent();
    
    const loginLink = screen.getByText('Log in');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  test('shows password hint', () => {
    renderComponent();
    
    expect(screen.getByText(/use 8 or more characters/i)).toBeInTheDocument();
  });

  test('renders promotional image', () => {
    renderComponent();
    
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  test('disables send button during countdown', async () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email address/i);
    const sendButton = screen.getByText('Send');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    await act(async () => {
      fireEvent.click(sendButton);
      // Advance timers to resolve the setTimeout in handleSendCode
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      const countdownButton = screen.getByRole('button', { name: /60s/i });
      expect(countdownButton).toBeDisabled();
    });
  });
});