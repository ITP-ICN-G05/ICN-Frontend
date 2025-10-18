import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  it('renders with default title', () => {
    render(<Header />);
    expect(screen.getByText('ICN Navigator')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<Header title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Companies')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('displays user information when user is provided', () => {
    const user = { name: 'John Doe' };
    render(<Header user={user} />);
    
    expect(screen.getByText(/Welcome, John Doe/)).toBeInTheDocument();
  });

  it('does not display user info when user is not provided', () => {
    render(<Header />);
    
    expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument();
  });

  it('navigation links have correct href attributes', () => {
    render(<Header />);
    
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('Companies').closest('a')).toHaveAttribute('href', '/companies');
    expect(screen.getByText('Search').closest('a')).toHaveAttribute('href', '/search');
    expect(screen.getByText('Profile').closest('a')).toHaveAttribute('href', '/profile');
  });

  it('applies correct CSS class', () => {
    const { container } = render(<Header />);
    expect(container.querySelector('.header')).toBeInTheDocument();
  });

  it('renders header container with correct structure', () => {
    const { container } = render(<Header />);
    
    const header = container.querySelector('.header');
    const headerContainer = header.querySelector('.header-container');
    const headerNav = header.querySelector('.header-nav');
    
    expect(header).toBeInTheDocument();
    expect(headerContainer).toBeInTheDocument();
    expect(headerNav).toBeInTheDocument();
  });
});