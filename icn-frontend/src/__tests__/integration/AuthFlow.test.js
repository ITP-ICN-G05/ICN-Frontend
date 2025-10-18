// src/__tests__/integration/AuthFlow.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../pages/auth/LoginPage';
import SignUpPage from '../../pages/auth/SignUpPage';

const mockAuthService = {
  login: jest.fn().mockResolvedValue({
    token: 'mock-token',
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      tier: 'free',
    },
  }),
  register: jest.fn().mockResolvedValue({
    token: 'mock-token',
    user: {
      id: 2,
      name: 'New User',
      email: 'new@example.com',
      tier: 'free',
    },
  }),
};

jest.mock('../../services/serviceFactory', () => ({
  getService: () => mockAuthService,
}));

describe('Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('completes login flow successfully', async () => {
    const user = userEvent.setup();
    const mockOnLogin = jest.fn();

    render(
      <BrowserRouter>
        <LoginPage onLogin={mockOnLogin} />
      </BrowserRouter>
    );

    // Fill in login form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /log in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    // Wait for login to complete
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
      expect(mockOnLogin).toHaveBeenCalled();
    });
  });

  it('completes signup flow successfully', async () => {
    const user = userEvent.setup();
    const mockOnSignUp = jest.fn();

    render(
      <BrowserRouter>
        <SignUpPage onSignUp={mockOnSignUp} />
      </BrowserRouter>
    );

    // Fill in signup form
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const signupButton = screen.getByRole('button', { name: /sign up/i });

    await user.type(nameInput, 'New User');
    await user.type(emailInput, 'new@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(signupButton);

    // Wait for signup to complete
    await waitFor(() => {
      expect(mockAuthService.register).toHaveBeenCalled();
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

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });
});