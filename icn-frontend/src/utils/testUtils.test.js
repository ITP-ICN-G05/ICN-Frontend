// src/utils/testUtils.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import {
  renderWithProviders,
  mockUsers,
  mockCompanies,
  mockFilters,
  waitForAsync,
  mockApiResponses,
  mockGeolocation,
  getByTestId,
  clickAndWait,
} from './testUtils';

// Test component for renderWithProviders
const TestComponent = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  
  return (
    <div>
      <h1>Test Component</h1>
      <p data-testid="user-name">{user.name || 'No user'}</p>
      <p data-testid="user-email">{user.email || 'No email'}</p>
      <p data-testid="user-tier">{user.tier || 'No tier'}</p>
      <p data-testid="token">{token || 'No token'}</p>
    </div>
  );
};

// Test component with router - FIXED: Use useLocation hook
const RouterTestComponent = () => {
  const location = useLocation();
  
  return (
    <div>
      <h1>Router Test</h1>
      <p data-testid="path">{location.pathname}</p>
    </div>
  );
};

// Test component for click testing - FIXED: Use functional setState
const ClickTestComponent = () => {
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 100));
    setCount(prevCount => prevCount + 1); // Fixed: Use functional update
    setLoading(false);
  };

  return (
    <div>
      <button onClick={handleClick}>
        {loading ? 'Loading...' : 'Click me'}
      </button>
      <p data-testid="count">{count}</p>
    </div>
  );
};

describe('testUtils', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('renderWithProviders', () => {
    test('renders component without user', () => {
      renderWithProviders(<TestComponent />);
      
      expect(screen.getByText('Test Component')).toBeInTheDocument();
      expect(screen.getByTestId('user-name')).toHaveTextContent('No user');
      expect(screen.getByTestId('token')).toHaveTextContent('No token');
    });

    test('renders component with user', () => {
      const user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        tier: 'premium',
      };

      renderWithProviders(<TestComponent />, { user });
      
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('user-tier')).toHaveTextContent('premium');
      expect(screen.getByTestId('token')).toHaveTextContent('mock-token-123');
    });

    test('sets user in localStorage when provided', () => {
      const user = mockUsers.premium;
      renderWithProviders(<TestComponent />, { user });
      
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const storedToken = localStorage.getItem('token');
      
      expect(storedUser).toEqual(user);
      expect(storedToken).toBe('mock-token-123');
    });

    test('supports custom initial entries for router', () => {
      renderWithProviders(<RouterTestComponent />, {
        initialEntries: ['/companies/123'],
      });
      
      expect(screen.getByTestId('path')).toHaveTextContent('/companies/123');
    });

    test('returns user in result', () => {
      const user = mockUsers.free;
      const result = renderWithProviders(<TestComponent />, { user });
      
      expect(result.user).toEqual(user);
    });

    test('passes through additional render options', () => {
      const { container } = renderWithProviders(<TestComponent />, {
        user: mockUsers.free,
      });
      
      expect(container).toBeTruthy();
      expect(container.querySelector('h1')).toHaveTextContent('Test Component');
    });

    test('wraps component with MemoryRouter', () => {
      const { container } = renderWithProviders(<RouterTestComponent />);
      
      // Component should render without router errors
      expect(container.querySelector('h1')).toHaveTextContent('Router Test');
    });
  });

  describe('mockUsers', () => {
    test('contains free user with correct properties', () => {
      expect(mockUsers.free).toEqual({
        id: 1,
        name: 'Free User',
        email: 'free@example.com',
        role: 'user',
        tier: 'free',
        onboardingComplete: true,
      });
    });

    test('contains plus user with correct properties', () => {
      expect(mockUsers.plus).toEqual({
        id: 2,
        name: 'Plus User',
        email: 'plus@example.com',
        role: 'user',
        tier: 'plus',
        onboardingComplete: true,
      });
    });

    test('contains premium user with correct properties', () => {
      expect(mockUsers.premium).toEqual({
        id: 3,
        name: 'Premium User',
        email: 'premium@example.com',
        role: 'user',
        tier: 'premium',
        onboardingComplete: true,
      });
    });

    test('contains admin user with correct properties', () => {
      expect(mockUsers.admin).toEqual({
        id: 4,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        tier: 'premium',
        onboardingComplete: true,
      });
    });

    test('contains new user with onboarding incomplete', () => {
      expect(mockUsers.newUser).toEqual({
        id: 5,
        name: 'New User',
        email: 'new@example.com',
        role: 'user',
        tier: 'free',
        onboardingComplete: false,
      });
    });

    test('all users have required fields', () => {
      Object.values(mockUsers).forEach(user => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
        expect(user).toHaveProperty('tier');
        expect(user).toHaveProperty('onboardingComplete');
      });
    });
  });

  describe('mockCompanies', () => {
    test('contains array of company objects', () => {
      expect(Array.isArray(mockCompanies)).toBe(true);
      expect(mockCompanies.length).toBeGreaterThan(0);
    });

    test('first company has all required properties', () => {
      const company = mockCompanies[0];
      
      expect(company).toHaveProperty('id');
      expect(company).toHaveProperty('name');
      expect(company).toHaveProperty('type');
      expect(company).toHaveProperty('employees');
      expect(company).toHaveProperty('distance');
      expect(company).toHaveProperty('description');
      expect(company).toHaveProperty('sectors');
      expect(company).toHaveProperty('capabilities');
      expect(company).toHaveProperty('ownership');
      expect(company).toHaveProperty('verified');
      expect(company).toHaveProperty('latitude');
      expect(company).toHaveProperty('longitude');
    });

    test('contains verified and unverified companies', () => {
      const hasVerified = mockCompanies.some(c => c.verified === true);
      const hasUnverified = mockCompanies.some(c => c.verified === false);
      
      expect(hasVerified).toBe(true);
      expect(hasUnverified).toBe(true);
    });

    test('companies have valid coordinate values', () => {
      mockCompanies.forEach(company => {
        expect(company.latitude).toBeGreaterThan(-90);
        expect(company.latitude).toBeLessThan(90);
        expect(company.longitude).toBeGreaterThan(-180);
        expect(company.longitude).toBeLessThan(180);
      });
    });

    test('companies have array properties', () => {
      mockCompanies.forEach(company => {
        expect(Array.isArray(company.sectors)).toBe(true);
        expect(Array.isArray(company.capabilities)).toBe(true);
        expect(Array.isArray(company.ownership)).toBe(true);
      });
    });
  });

  describe('mockFilters', () => {
    test('has default filter structure', () => {
      expect(mockFilters).toEqual({
        distance: 50,
        sectors: [],
        capabilities: [],
        size: '',
        ownership: [],
        verified: false,
      });
    });

    test('all filter properties are correct types', () => {
      expect(typeof mockFilters.distance).toBe('number');
      expect(Array.isArray(mockFilters.sectors)).toBe(true);
      expect(Array.isArray(mockFilters.capabilities)).toBe(true);
      expect(typeof mockFilters.size).toBe('string');
      expect(Array.isArray(mockFilters.ownership)).toBe(true);
      expect(typeof mockFilters.verified).toBe('boolean');
    });
  });

  describe('waitForAsync', () => {
    test('resolves after a microtask', async () => {
      let resolved = false;
      
      const promise = waitForAsync().then(() => {
        resolved = true;
      });
      
      expect(resolved).toBe(false);
      
      await promise;
      
      expect(resolved).toBe(true);
    });

    test('can be used with await', async () => {
      const start = Date.now();
      await waitForAsync();
      const end = Date.now();
      
      // Should resolve almost immediately (within 10ms)
      expect(end - start).toBeLessThan(10);
    });

    test('allows state updates to complete', async () => {
      const TestAsyncComponent = () => {
        const [value, setValue] = React.useState('initial');
        
        React.useEffect(() => {
          setValue('updated');
        }, []);
        
        return <div data-testid="value">{value}</div>;
      };
      
      render(<TestAsyncComponent />);
      
      await waitForAsync();
      
      expect(screen.getByTestId('value')).toHaveTextContent('updated');
    });
  });

  describe('mockApiResponses', () => {
    test('success returns resolved promise with data', async () => {
      const data = { id: 1, name: 'Test' };
      const response = await mockApiResponses.success(data);
      
      expect(response).toEqual({
        data: { id: 1, name: 'Test' },
        status: 200,
      });
    });

    test('error returns rejected promise with error response', async () => {
      const errorMessage = 'Something went wrong';
      
      await expect(mockApiResponses.error(errorMessage)).rejects.toEqual({
        response: {
          data: { message: errorMessage },
          status: 400,
        },
      });
    });

    test('networkError returns rejected promise with Error', async () => {
      await expect(mockApiResponses.networkError()).rejects.toThrow('Network Error');
    });

    test('success can be used with different data types', async () => {
      const stringData = 'test string';
      const arrayData = [1, 2, 3];
      const nullData = null;
      
      expect((await mockApiResponses.success(stringData)).data).toBe(stringData);
      expect((await mockApiResponses.success(arrayData)).data).toEqual(arrayData);
      expect((await mockApiResponses.success(nullData)).data).toBeNull();
    });

    test('error can be used with different messages', async () => {
      const messages = ['Error 1', 'Error 2', 'Validation failed'];
      
      for (const message of messages) {
        await expect(mockApiResponses.error(message))
          .rejects
          .toMatchObject({
            response: {
              data: { message },
            },
          });
      }
    });
  });

  describe('mockGeolocation', () => {
    beforeEach(() => {
      // Mock navigator.geolocation
      global.navigator.geolocation = {
        getCurrentPosition: jest.fn(),
      };
    });

    test('mocks successful geolocation with default coords', () => {
      mockGeolocation(true);
      
      const successCallback = jest.fn();
      navigator.geolocation.getCurrentPosition(successCallback);
      
      expect(successCallback).toHaveBeenCalledWith({
        coords: {
          latitude: -37.8136,
          longitude: 144.9631,
          accuracy: 10,
        },
        timestamp: expect.any(Number),
      });
    });

    test('mocks successful geolocation with custom coords', () => {
      const customCoords = {
        latitude: -33.8688,
        longitude: 151.2093,
        accuracy: 5,
      };
      
      mockGeolocation(true, customCoords);
      
      const successCallback = jest.fn();
      navigator.geolocation.getCurrentPosition(successCallback);
      
      expect(successCallback).toHaveBeenCalledWith({
        coords: customCoords,
        timestamp: expect.any(Number),
      });
    });

    test('mocks failed geolocation', () => {
      mockGeolocation(false);
      
      const successCallback = jest.fn();
      const errorCallback = jest.fn();
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
      
      expect(errorCallback).toHaveBeenCalledWith({
        code: 1,
        message: 'User denied geolocation',
      });
      expect(successCallback).not.toHaveBeenCalled();
    });

    test('can be called multiple times with different configs', () => {
      // First call - success
      mockGeolocation(true);
      const callback1 = jest.fn();
      navigator.geolocation.getCurrentPosition(callback1);
      expect(callback1).toHaveBeenCalled();
      
      // Second call - failure
      mockGeolocation(false);
      const callback2 = jest.fn();
      const errorCallback2 = jest.fn();
      navigator.geolocation.getCurrentPosition(callback2, errorCallback2);
      expect(errorCallback2).toHaveBeenCalled();
    });
  });

  describe('getByTestId', () => {
    test('finds element by test id', () => {
      const { container } = render(
        <div>
          <span data-testid="test-element">Found me!</span>
        </div>
      );
      
      const element = getByTestId(container, 'test-element');
      
      expect(element).toBeTruthy();
      expect(element.textContent).toBe('Found me!');
    });

    test('returns null for non-existent test id', () => {
      const { container } = render(<div>No test id here</div>);
      
      const element = getByTestId(container, 'non-existent');
      
      expect(element).toBeNull();
    });

    test('finds nested elements', () => {
      const { container } = render(
        <div>
          <div>
            <div>
              <span data-testid="deeply-nested">Deep element</span>
            </div>
          </div>
        </div>
      );
      
      const element = getByTestId(container, 'deeply-nested');
      
      expect(element).toBeTruthy();
      expect(element.textContent).toBe('Deep element');
    });

    test('finds first element when multiple have same test id', () => {
      const { container } = render(
        <div>
          <span data-testid="duplicate">First</span>
          <span data-testid="duplicate">Second</span>
        </div>
      );
      
      const element = getByTestId(container, 'duplicate');
      
      expect(element.textContent).toBe('First');
    });
  });

  describe('clickAndWait', () => {
    test('clicks button and waits for async updates', async () => {
      const user = userEvent.setup();
      render(<ClickTestComponent />);
      
      const button = screen.getByRole('button');
      expect(screen.getByTestId('count')).toHaveTextContent('0');
      
      await clickAndWait(button, user);
      
      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('1');
      });
    });

    test('waits for loading state to complete', async () => {
      const user = userEvent.setup();
      render(<ClickTestComponent />);
      
      const button = screen.getByRole('button');
      
      await clickAndWait(button, user);
      
      await waitFor(() => {
        expect(button).toHaveTextContent('Click me');
      });
    });

    test('can be called multiple times', async () => {
      const user = userEvent.setup();
      render(<ClickTestComponent />);
      
      const button = screen.getByRole('button');
      
      await clickAndWait(button, user);
      await clickAndWait(button, user);
      await clickAndWait(button, user);
      
      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('3');
      });
    });

    test('handles buttons that trigger immediate updates', async () => {
      const ImmediateComponent = () => {
        const [clicked, setClicked] = React.useState(false);
        return (
          <div>
            <button onClick={() => setClicked(true)}>Click</button>
            <p data-testid="status">{clicked ? 'Clicked' : 'Not clicked'}</p>
          </div>
        );
      };
      
      const user = userEvent.setup();
      render(<ImmediateComponent />);
      
      const button = screen.getByRole('button');
      
      await clickAndWait(button, user);
      
      expect(screen.getByTestId('status')).toHaveTextContent('Clicked');
    });
  });

  describe('Integration - Using multiple utilities together', () => {
    test('renderWithProviders works with clickAndWait', async () => {
      const UserAwareComponent = () => {
        const [count, setCount] = React.useState(0);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        return (
          <div>
            <p data-testid="user-tier">{user.tier}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <p data-testid="count">{count}</p>
          </div>
        );
      };
      
      const userEventInstance = userEvent.setup();
      renderWithProviders(<UserAwareComponent />, {
        user: mockUsers.premium,
      });
      
      expect(screen.getByTestId('user-tier')).toHaveTextContent('premium');
      
      const button = screen.getByRole('button');
      await clickAndWait(button, userEventInstance);
      
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });

    test('mockApiResponses can be used with renderWithProviders', async () => {
      const ApiComponent = () => {
        const [data, setData] = React.useState(null);
        const [error, setError] = React.useState(null);
        
        const fetchData = async () => {
          try {
            const response = await mockApiResponses.success({ message: 'Success!' });
            setData(response.data);
          } catch (err) {
            setError(err.message);
          }
        };
        
        return (
          <div>
            <button onClick={fetchData}>Fetch</button>
            {data && <p data-testid="data">{data.message}</p>}
            {error && <p data-testid="error">{error}</p>}
          </div>
        );
      };
      
      const userEventInstance = userEvent.setup();
      renderWithProviders(<ApiComponent />, {
        user: mockUsers.free,
      });
      
      const button = screen.getByRole('button');
      await clickAndWait(button, userEventInstance);
      
      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('Success!');
      });
    });

    test('all mock data is accessible together', () => {
      expect(mockUsers).toBeDefined();
      expect(mockCompanies).toBeDefined();
      expect(mockFilters).toBeDefined();
      
      // Can use them together
      const user = mockUsers.premium;
      const company = mockCompanies[0];
      const filters = { ...mockFilters, verified: true };
      
      expect(user.tier).toBe('premium');
      expect(company.name).toBe('Tech Solutions Ltd');
      expect(filters.verified).toBe(true);
    });
  });
});