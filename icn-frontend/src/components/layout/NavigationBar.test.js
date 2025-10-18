import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NavigationBar from './NavigationBar';

const mockUsers = {
  regular: {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
  },
  admin: {
    id: 2,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  },
};

const mockNavigate = jest.fn();
const mockOnLogout = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
}));

const renderNav = (props = {}) => {
  return render(
    <BrowserRouter>
      <NavigationBar onLogout={mockOnLogout} {...props} />
    </BrowserRouter>
  );
};

describe('NavigationBar', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockOnLogout.mockClear();
  });

  describe('Rendering', () => {
    it('renders logo and brand name', () => {
      renderNav();
      expect(screen.getByAltText('ICN Victoria Logo')).toBeInTheDocument();
      expect(screen.getByText('Navigator')).toBeInTheDocument();
      expect(screen.getByText('by ICN Victoria')).toBeInTheDocument();
    });

    it('renders all navigation links', () => {
      renderNav();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText('Mobile designs')).toBeInTheDocument();
      expect(screen.getByText('Illustrations')).toBeInTheDocument();
    });

    it('renders search input', () => {
      renderNav();
      expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    });

    it('shows login and signup buttons when not authenticated', () => {
      renderNav();
      expect(screen.getByText('Log in')).toBeInTheDocument();
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });

    it('shows user avatar when authenticated', () => {
      renderNav({ user: mockUsers.regular });
      const avatar = screen.getByTitle(/Logged in as John Doe/);
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveTextContent('J');
    });

    it('uses first letter of name for avatar', () => {
      renderNav({ user: mockUsers.regular });
      const avatar = screen.getByTitle(/Logged in as/);
      expect(avatar).toHaveTextContent('J');
    });
  });

  describe('Navigation', () => {
    it('navigates to login page', () => {
      renderNav();
      const loginButton = screen.getByText('Log in');
      fireEvent.click(loginButton);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('navigates to signup page', () => {
      renderNav();
      const signupButton = screen.getByText('Sign up');
      fireEvent.click(signupButton);
      expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });

    it('highlights active navigation link', () => {
      renderNav();
      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).toHaveClass('active');
    });
  });

  describe('Search', () => {
    it('updates search query on input change', () => {
      renderNav();
      const searchInput = screen.getByPlaceholderText('Search');
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      expect(searchInput.value).toBe('test query');
    });

    it('submits search on form submit', () => {
      renderNav();
      const searchInput = screen.getByPlaceholderText('Search');
      const form = searchInput.closest('form');
      
      fireEvent.change(searchInput, { target: { value: 'manufacturing' } });
      fireEvent.submit(form);
      
      expect(mockNavigate).toHaveBeenCalledWith('/search?q=manufacturing');
    });

    it('does not submit empty search', () => {
      renderNav();
      const searchInput = screen.getByPlaceholderText('Search');
      const form = searchInput.closest('form');
      
      fireEvent.submit(form);
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('encodes search query in URL', () => {
      renderNav();
      const searchInput = screen.getByPlaceholderText('Search');
      
      fireEvent.change(searchInput, { target: { value: 'test & query' } });
      fireEvent.submit(searchInput.closest('form'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/search?q=test%20%26%20query');
    });
  });

  describe('User Menu', () => {
    it('opens dropdown on avatar click', () => {
      renderNav({ user: mockUsers.regular });
      const avatar = screen.getByTitle(/Logged in as/);
      fireEvent.click(avatar);
      
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText('Companies')).toBeInTheDocument();
      expect(screen.getByText('Log out')).toBeInTheDocument();
    });

    it('displays user name and email in dropdown', () => {
      renderNav({ user: mockUsers.regular });
      const avatar = screen.getByTitle(/Logged in as/);
      fireEvent.click(avatar);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('shows admin dashboard link for admin users', () => {
      renderNav({ user: mockUsers.admin });
      const avatar = screen.getByTitle(/Logged in as/);
      fireEvent.click(avatar);
      
      expect(screen.getByText('🔧 Admin Dashboard')).toBeInTheDocument();
    });

    it('does not show admin link for regular users', () => {
      renderNav({ user: mockUsers.regular });
      const avatar = screen.getByTitle(/Logged in as/);
      fireEvent.click(avatar);
      
      expect(screen.queryByText('🔧 Admin Dashboard')).not.toBeInTheDocument();
    });

    it('navigates to profile page', () => {
      renderNav({ user: mockUsers.regular });
      const avatar = screen.getByTitle(/Logged in as/);
      fireEvent.click(avatar);
      
      const profileButton = screen.getByText('👤 My Profile');
      fireEvent.click(profileButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    it('navigates to companies page', () => {
      renderNav({ user: mockUsers.regular });
      const avatar = screen.getByTitle(/Logged in as/);
      fireEvent.click(avatar);
      
      const companiesButton = screen.getByText('🏢 Companies');
      fireEvent.click(companiesButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/companies');
    });

    it('closes dropdown when clicking outside', async () => {
      renderNav({ user: mockUsers.regular });
      const avatar = screen.getByTitle(/Logged in as/);
      fireEvent.click(avatar);
      
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      
      // Click outside
      fireEvent.mouseDown(document.body);
      
      await waitFor(() => {
        expect(screen.queryByText('My Profile')).not.toBeInTheDocument();
      });
    });

    it('handles logout with confirmation', () => {
      window.confirm = jest.fn(() => true);
      
      renderNav({ user: mockUsers.regular });
      const avatar = screen.getByTitle(/Logged in as/);
      fireEvent.click(avatar);
      
      const logoutButton = screen.getByText('🚪 Log out');
      fireEvent.click(logoutButton);
      
      expect(window.confirm).toHaveBeenCalled();
      expect(mockOnLogout).toHaveBeenCalled();
    });

    it('cancels logout when user declines', () => {
      window.confirm = jest.fn(() => false);
      
      renderNav({ user: mockUsers.regular });
      const avatar = screen.getByTitle(/Logged in as/);
      fireEvent.click(avatar);
      
      const logoutButton = screen.getByText('🚪 Log out');
      fireEvent.click(logoutButton);
      
      expect(window.confirm).toHaveBeenCalled();
      expect(mockOnLogout).not.toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('applies active class to login button on login page', () => {
      jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
        pathname: '/login',
      });
      
      renderNav();
      const loginButton = screen.getByText('Log in');
      expect(loginButton).toHaveClass('active');
    });

    it('applies active class to signup button on signup page', () => {
      jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
        pathname: '/signup',
      });
      
      renderNav();
      const signupButton = screen.getByText('Sign up');
      expect(signupButton).toHaveClass('active');
    });
  });

  describe('Edge Cases', () => {
    it('handles user without name', () => {
      const userWithoutName = { ...mockUsers.regular, name: '' };
      renderNav({ user: userWithoutName });
      
      const avatar = screen.getByTitle(/Logged in as/);
      expect(avatar).toHaveTextContent('U');
    });

    it('handles user without email', () => {
      const userWithoutEmail = { ...mockUsers.regular, email: '' };
      renderNav({ user: userWithoutEmail });
      
      const avatar = screen.getByTitle(/Logged in as/);
      fireEvent.click(avatar);
      
      expect(screen.queryByText('john@example.com')).not.toBeInTheDocument();
    });
  });
});