import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MobileDesignsPage from './MobileDesignsPage';
import { renderWithProviders } from '../../utils/testUtils';

describe('MobileDesignsPage', () => {
  test('renders mobile designs page with hero section', () => {
    render(<MobileDesignsPage />);
    
    expect(screen.getByText('Mobile Designs')).toBeInTheDocument();
    expect(screen.getByText(/Responsive and native mobile experiences/i)).toBeInTheDocument();
  });

  test('switches between device types', () => {
    render(<MobileDesignsPage />);
    
    const androidBtn = screen.getByText('Android');
    const tabletBtn = screen.getByText('Tablet');
    
    // Initially iPhone should be active
    expect(screen.getByText('iPhone 14')).toHaveClass('active');
    
    // Switch to Android
    fireEvent.click(androidBtn);
    expect(androidBtn).toHaveClass('active');
    
    // Switch to Tablet
    fireEvent.click(tabletBtn);
    expect(tabletBtn).toHaveClass('active');
  });

  test('switches between screen types', () => {
    render(<MobileDesignsPage />);
    
    // Initially home screen should be displayed
    expect(screen.getByText('ICN Navigator')).toBeInTheDocument();
    
    // Click search screen button
    const searchBtn = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchBtn);
    
    // Verify search screen is displayed
    expect(screen.getAllByPlaceholderText(/Search/i)[0]).toBeInTheDocument();
    
    // Click company screen button
    const companyBtn = screen.getByRole('button', { name: /Company Detail/i });
    fireEvent.click(companyBtn);
    
    // Verify company screen is displayed
    expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
    
    // Click profile screen button
    const profileBtn = screen.getByRole('button', { name: /Profile/i });
    fireEvent.click(profileBtn);
    
    // Verify profile screen is displayed
    expect(screen.getByText('John Smith')).toBeInTheDocument();
  });

  test('displays home screen with company cards', () => {
    render(<MobileDesignsPage />);
    
    expect(screen.getByText('ICN Navigator')).toBeInTheDocument();
    expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
    expect(screen.getByText('Global Supply Co')).toBeInTheDocument();
    expect(screen.getAllByText('✓ Verified')).toHaveLength(2);
  });

  test('displays search screen with categories', () => {
    render(<MobileDesignsPage />);
    
    const searchBtn = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchBtn);
    
    expect(screen.getByText('Manufacturing')).toBeInTheDocument();
    expect(screen.getByText('156 companies')).toBeInTheDocument();
    expect(screen.getByText('Suppliers')).toBeInTheDocument();
    expect(screen.getByText('89 companies')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('245 companies')).toBeInTheDocument();
  });

  test('displays company detail screen with tabs', () => {
    render(<MobileDesignsPage />);
    
    const companyBtn = screen.getByRole('button', { name: /Company Detail/i });
    fireEvent.click(companyBtn);
    
    expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
    
    // Use getAllByText for elements that appear multiple times
    const contactElements = screen.getAllByText('Contact');
    expect(contactElements.length).toBeGreaterThan(0);
    
    expect(screen.getByText('Bookmark')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  test('displays profile screen with user info', () => {
    render(<MobileDesignsPage />);
    
    const profileBtn = screen.getByRole('button', { name: /Profile/i });
    fireEvent.click(profileBtn);
    
    // Use getByRole for the header to be more specific
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('john.smith@company.com')).toBeInTheDocument();
    expect(screen.getByText('Free Account')).toBeInTheDocument();
  });

  test('displays app store section', () => {
    render(<MobileDesignsPage />);
    
    expect(screen.getByText('Download Our Mobile App')).toBeInTheDocument();
    expect(screen.getByText('Available on iOS and Android')).toBeInTheDocument();
    expect(screen.getByText('App Store')).toBeInTheDocument();
    expect(screen.getByText('Google Play')).toBeInTheDocument();
  });

  test('displays key features sidebar on desktop', () => {
    render(<MobileDesignsPage />);
    
    expect(screen.getByText(/Gesture Navigation/i)).toBeInTheDocument();
    expect(screen.getByText(/Location-Based Search/i)).toBeInTheDocument();
    expect(screen.getByText(/Push Notifications/i)).toBeInTheDocument();
    expect(screen.getByText(/Offline Mode/i)).toBeInTheDocument();
  });

  test('active screen button has correct styling', () => {
    render(<MobileDesignsPage />);
    
    // Query for the button element using getByRole
    const homeBtn = screen.getByRole('button', { name: /Home Screen/i });
    expect(homeBtn).toHaveClass('active');
    
    const searchBtn = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchBtn);
    
    expect(searchBtn).toHaveClass('active');
    expect(homeBtn).not.toHaveClass('active');
  });

  test('renders status bar in all screens', () => {
    render(<MobileDesignsPage />);
    
    // Check home screen
    expect(screen.getByText('9:41')).toBeInTheDocument();
    
    // Check search screen
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));
    expect(screen.getByText('9:41')).toBeInTheDocument();
    
    // Check company screen
    fireEvent.click(screen.getByRole('button', { name: /Company Detail/i }));
    expect(screen.getByText('9:41')).toBeInTheDocument();
    
    // Check profile screen
    fireEvent.click(screen.getByRole('button', { name: /Profile/i }));
    expect(screen.getByText('9:41')).toBeInTheDocument();
  });

  test('renders device frame with correct styling for each type', () => {
    const { container } = render(<MobileDesignsPage />);
    
    // iPhone frame
    expect(container.querySelector('.device-frame.iphone')).toBeInTheDocument();
    
    // Switch to Android
    fireEvent.click(screen.getByText('Android'));
    expect(container.querySelector('.device-frame.android')).toBeInTheDocument();
    
    // Switch to Tablet
    fireEvent.click(screen.getByText('Tablet'));
    expect(container.querySelector('.device-frame.tablet')).toBeInTheDocument();
  });

  test('displays bottom navigation on home screen', () => {
    render(<MobileDesignsPage />);
    
    const bottomNav = document.querySelector('.bottom-nav');
    expect(bottomNav).toBeInTheDocument();
    
    const navItems = bottomNav.querySelectorAll('.nav-item');
    expect(navItems).toHaveLength(5);
  });
});