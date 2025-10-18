import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PricingPage from './PricingPage';
import { renderWithProviders, mockUsers, mockApiResponses } from '../../utils/testUtils';
import * as serviceFactory from '../../services/serviceFactory';

// Mock react-router-dom at the module level
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

jest.mock('../../services/serviceFactory');

describe('PricingPage', () => {
  let mockSubscriptionService;

  beforeEach(() => {
    // Clear mock calls between tests
    mockNavigate.mockClear();
    
    mockSubscriptionService = {
      updateSubscription: jest.fn(() => mockApiResponses.success({ success: true }))
    };
    
    serviceFactory.getSubscriptionService.mockReturnValue(mockSubscriptionService);
  });

  test('renders pricing page with header', () => {
    renderWithProviders(<PricingPage />);
    
    expect(screen.getByText('Choose the Right Plan for Your Business')).toBeInTheDocument();
    expect(screen.getByText(/Victoria's most comprehensive supplier database/i)).toBeInTheDocument();
  });

  test('displays all pricing tiers', () => {
    renderWithProviders(<PricingPage />);
    
    // Use getAllByText and check we have at least one of each
    expect(screen.getAllByText('Free').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Plus').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Premium').length).toBeGreaterThan(0);
  });

  test('switches between monthly and yearly billing', () => {
    renderWithProviders(<PricingPage />);
    
    const monthlyBtn = screen.getByText('Monthly');
    const yearlyBtn = screen.getByText('Yearly');
    
    expect(monthlyBtn).toHaveClass('active');
    
    fireEvent.click(yearlyBtn);
    expect(yearlyBtn).toHaveClass('active');
    expect(monthlyBtn).not.toHaveClass('active');
  });

  test('displays correct prices for monthly billing', () => {
    renderWithProviders(<PricingPage />);
    
    // Free plan - $0
    const freePrices = screen.getAllByText('0');
    expect(freePrices.length).toBeGreaterThan(0);
    
    // Plus plan - $49/month
    expect(screen.getByText('49')).toBeInTheDocument();
    
    // Premium plan - $149/month
    expect(screen.getByText('149')).toBeInTheDocument();
  });

  test('displays yearly pricing with savings badge', () => {
    renderWithProviders(<PricingPage />);
    
    fireEvent.click(screen.getByText('Yearly'));
    
    expect(screen.getByText(/Save up to 17%/i)).toBeInTheDocument();
  });

  test('shows "Most Popular" badge on Plus plan', () => {
    renderWithProviders(<PricingPage />);
    
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });

  test('displays current plan badge for logged-in user', () => {
    renderWithProviders(<PricingPage />, { user: mockUsers.plus });
    
    // Use getAllByText since there are multiple "Current Plan" elements
    const currentPlanElements = screen.getAllByText('Current Plan');
    expect(currentPlanElements.length).toBeGreaterThan(0);
  });

  test('redirects to signup when non-logged-in user selects plan', () => {
    renderWithProviders(<PricingPage />);
    
    // When not logged in, button says "Select Plan" not "Upgrade Now"
    const selectPlanBtns = screen.getAllByText('Select Plan');
    fireEvent.click(selectPlanBtns[0]); // Click Plus plan
    
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });

  test('opens payment modal for logged-in user', () => {
    renderWithProviders(<PricingPage />, { user: mockUsers.free });
    
    const upgradeBtn = screen.getAllByText('Upgrade Now')[0];
    fireEvent.click(upgradeBtn);
    
    expect(screen.getByText('Upgrade to Plus')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('1234 5678 9012 3456')).toBeInTheDocument();
  });

  test('closes payment modal', () => {
    renderWithProviders(<PricingPage />, { user: mockUsers.free });
    
    // Open modal
    const upgradeBtn = screen.getAllByText('Upgrade Now')[0];
    fireEvent.click(upgradeBtn);
    
    // Close modal - use getByRole for the close button to avoid ambiguity with limitation icons
    const closeBtn = screen.getByRole('button', { name: '×' });
    fireEvent.click(closeBtn);
    
    expect(screen.queryByText('Upgrade to Plus')).not.toBeInTheDocument();
  });

  test('handles payment submission', async () => {
    // Mock window.location.reload to avoid jsdom error
    delete window.location;
    window.location = { reload: jest.fn() };
    window.alert = jest.fn();
    
    renderWithProviders(<PricingPage />, { user: mockUsers.free });
    
    // Open payment modal
    fireEvent.click(screen.getAllByText('Upgrade Now')[0]);
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('1234 5678 9012 3456'), {
      target: { value: '4111111111111111' }
    });
    fireEvent.change(screen.getByPlaceholderText('MM/YY'), {
      target: { value: '12/25' }
    });
    fireEvent.change(screen.getByPlaceholderText('123'), {
      target: { value: '123' }
    });
    fireEvent.change(screen.getByPlaceholderText('John Smith'), {
      target: { value: 'Test User' }
    });
    
    // Submit
    fireEvent.click(screen.getByText('Complete Upgrade'));
    
    await waitFor(() => {
      expect(mockSubscriptionService.updateSubscription).toHaveBeenCalled();
    });
  });

  test('handles downgrade to free plan', () => {
    window.confirm = jest.fn(() => true);
    window.alert = jest.fn();
    // Mock window.location.reload to avoid jsdom error
    delete window.location;
    window.location = { reload: jest.fn() };
    
    renderWithProviders(<PricingPage />, { user: mockUsers.plus });
    
    const getStartedBtn = screen.getByText('Get Started');
    fireEvent.click(getStartedBtn);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('downgraded'));
  });

  test('prevents selecting current plan', () => {
    renderWithProviders(<PricingPage />, { user: mockUsers.plus });
    
    // Get the button specifically, not the badge
    const currentPlanBtn = screen.getByRole('button', { name: 'Current Plan' });
    
    // The button should be disabled when it's the current plan
    expect(currentPlanBtn).toBeDisabled();
  });

  test('displays comparison table', () => {
    renderWithProviders(<PricingPage />);
    
    expect(screen.getByText('Detailed Feature Comparison')).toBeInTheDocument();
    expect(screen.getByText('Company Views per Month')).toBeInTheDocument();
    expect(screen.getByText('Basic Search & Filters')).toBeInTheDocument();
    expect(screen.getByText('API Access')).toBeInTheDocument();
  });

  test('displays FAQ section', () => {
    renderWithProviders(<PricingPage />);
    
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    expect(screen.getByText('Can I change plans anytime?')).toBeInTheDocument();
    expect(screen.getByText('Is there a setup fee?')).toBeInTheDocument();
    expect(screen.getByText('What payment methods do you accept?')).toBeInTheDocument();
  });

  test('displays plan features correctly', () => {
    renderWithProviders(<PricingPage />);
    
    // Free plan features
    expect(screen.getByText('Basic search functionality')).toBeInTheDocument();
    expect(screen.getByText('View up to 5 companies per month')).toBeInTheDocument();
    
    // Plus plan features
    expect(screen.getByText('Unlimited company views')).toBeInTheDocument();
    expect(screen.getByText('Advanced search filters')).toBeInTheDocument();
    
    // Premium plan features
    expect(screen.getByText('API access (1000 calls/month)')).toBeInTheDocument();
    expect(screen.getByText('Priority support')).toBeInTheDocument();
  });

  test('displays plan limitations', () => {
    renderWithProviders(<PricingPage />);
    
    expect(screen.getByText('Limited company information')).toBeInTheDocument();
    // Multiple "No API access" elements exist, so just check that at least one exists
    expect(screen.getAllByText('No API access').length).toBeGreaterThan(0);
  });

  test('calculates yearly savings correctly', () => {
    renderWithProviders(<PricingPage />);
    
    fireEvent.click(screen.getByText('Yearly'));
    
    // Plus plan: $49 * 12 = $588, yearly = $490, savings = $98
    expect(screen.getByText('(Save $98)')).toBeInTheDocument();
    
    // Premium plan: $149 * 12 = $1788, yearly = $1490, savings = $298
    expect(screen.getByText('(Save $298)')).toBeInTheDocument();
  });

  test('displays correct billing info for yearly plan', () => {
    renderWithProviders(<PricingPage />);
    
    fireEvent.click(screen.getByText('Yearly'));
    
    expect(screen.getByText(/Billed \$490 yearly/i)).toBeInTheDocument();
    expect(screen.getByText(/Billed \$1490 yearly/i)).toBeInTheDocument();
  });

  test('displays security note in payment modal', () => {
    renderWithProviders(<PricingPage />, { user: mockUsers.free });
    
    fireEvent.click(screen.getAllByText('Upgrade Now')[0]);
    
    expect(screen.getByText(/Your payment information is secure and encrypted/i)).toBeInTheDocument();
  });

  test('handles payment error', async () => {
    mockSubscriptionService.updateSubscription.mockImplementation(() =>
      mockApiResponses.error('Payment failed')
    );
    window.alert = jest.fn();
    // Mock window.location.reload to avoid jsdom error
    delete window.location;
    window.location = { reload: jest.fn() };
    
    renderWithProviders(<PricingPage />, { user: mockUsers.free });
    
    // Open payment modal and submit
    fireEvent.click(screen.getAllByText('Upgrade Now')[0]);
    
    fireEvent.change(screen.getByPlaceholderText('1234 5678 9012 3456'), {
      target: { value: '4111111111111111' }
    });
    fireEvent.change(screen.getByPlaceholderText('MM/YY'), {
      target: { value: '12/25' }
    });
    fireEvent.change(screen.getByPlaceholderText('123'), {
      target: { value: '123' }
    });
    fireEvent.change(screen.getByPlaceholderText('John Smith'), {
      target: { value: 'Test User' }
    });
    
    fireEvent.click(screen.getByText('Complete Upgrade'));
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('failed'));
    });
  });

  test('displays correct tier for premium user', () => {
    renderWithProviders(<PricingPage />, { user: mockUsers.premium });
    
    // Multiple "Current Plan" elements, just verify at least one exists
    const currentPlanElements = screen.getAllByText('Current Plan');
    expect(currentPlanElements.length).toBeGreaterThan(0);
  });

  test('stores selected plan in localStorage when not logged in', () => {
    // Spy on localStorage.setItem
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    
    renderWithProviders(<PricingPage />);
    
    // When not logged in, button says "Select Plan" not "Upgrade Now"
    const selectPlanBtns = screen.getAllByText('Select Plan');
    fireEvent.click(selectPlanBtns[0]); // Click Plus plan
    
    expect(setItemSpy).toHaveBeenCalledWith('selectedPlan', 'plus');
    
    // Clean up
    setItemSpy.mockRestore();
  });
});