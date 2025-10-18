// src/utils/testUtils.js
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Custom render function with all providers
export function renderWithProviders(
  ui,
  {
    initialEntries = ['/'],
    user = null,
    ...renderOptions
  } = {}
) {
  // Set up user in localStorage if provided
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', 'mock-token-123');
  }

  function Wrapper({ children }) {
    // Only use MemoryRouter - let individual tests provide their own context mocks
    return (
      <MemoryRouter 
        initialEntries={initialEntries}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        {children}
      </MemoryRouter>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    user,
  };
}

// Mock user data
export const mockUsers = {
  free: {
    id: 1,
    name: 'Free User',
    email: 'free@example.com',
    role: 'user',
    tier: 'free',
    onboardingComplete: true,
  },
  plus: {
    id: 2,
    name: 'Plus User',
    email: 'plus@example.com',
    role: 'user',
    tier: 'plus',
    onboardingComplete: true,
  },
  premium: {
    id: 3,
    name: 'Premium User',
    email: 'premium@example.com',
    role: 'user',
    tier: 'premium',
    onboardingComplete: true,
  },
  admin: {
    id: 4,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    tier: 'premium',
    onboardingComplete: true,
  },
  newUser: {
    id: 5,
    name: 'New User',
    email: 'new@example.com',
    role: 'user',
    tier: 'free',
    onboardingComplete: false,
  },
};

// Mock company data
export const mockCompanies = [
  {
    id: 1,
    name: 'Tech Solutions Ltd',
    type: 'Manufacturer',
    employees: 150,
    distance: 5.2,
    description: 'Leading technology manufacturer',
    sectors: ['Technology', 'Manufacturing'],
    capabilities: ['Design', 'Manufacturing', 'Assembly'],
    ownership: ['Female-owned'],
    verified: true,
    latitude: -37.8136,
    longitude: 144.9631,
  },
  {
    id: 2,
    name: 'Green Industries',
    type: 'Service Provider',
    employees: 50,
    distance: 12.5,
    description: 'Environmental solutions provider',
    sectors: ['Environment', 'Services'],
    capabilities: ['Consulting', 'Implementation'],
    ownership: ['Social Enterprise'],
    verified: false,
    latitude: -37.8200,
    longitude: 144.9700,
  },
];

// Mock search filters
export const mockFilters = {
  distance: 50,
  sectors: [],
  capabilities: [],
  size: '',
  ownership: [],
  verified: false,
};

// Wait for async updates
export const waitForAsync = () => 
  new Promise(resolve => setTimeout(resolve, 0));

// Mock API responses
export const mockApiResponses = {
  success: (data) => Promise.resolve({ data, status: 200 }),
  error: (message) => Promise.reject({ 
    response: { 
      data: { message },
      status: 400 
    } 
  }),
  networkError: () => Promise.reject(new Error('Network Error')),
};

// Mock geolocation
export const mockGeolocation = (success = true, coords = null) => {
  const defaultCoords = {
    latitude: -37.8136,
    longitude: 144.9631,
    accuracy: 10,
  };

  if (success) {
    navigator.geolocation.getCurrentPosition.mockImplementation((successCallback) => {
      successCallback({
        coords: coords || defaultCoords,
        timestamp: Date.now(),
      });
    });
  } else {
    navigator.geolocation.getCurrentPosition.mockImplementation((_, errorCallback) => {
      errorCallback({
        code: 1,
        message: 'User denied geolocation',
      });
    });
  }
};

// Helper to find by test id
export const getByTestId = (container, testId) => 
  container.querySelector(`[data-testid="${testId}"]`);

// Helper for async button clicks
export const clickAndWait = async (button, userEvent) => {
  await userEvent.click(button);
  await waitForAsync();
};