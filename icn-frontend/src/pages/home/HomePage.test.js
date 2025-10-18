import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../home/HomePage';
import * as serviceFactory from '../../services/serviceFactory';

jest.mock('../../services/serviceFactory');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('HomePage', () => {
  const mockCompanyService = {
    getAll: jest.fn(),
  };

  const mockNearbyCompanies = [
    {
      id: 1,
      name: 'TechCorp Industries',
      type: 'Manufacturer',
      distance: '2.3km',
      verified: true
    },
    {
      id: 2,
      name: 'Global Supply Co',
      type: 'Item Supplier',
      distance: '4.1km',
      verified: true
    },
    {
      id: 3,
      name: 'ServiceMax Pro',
      type: 'Service Provider',
      distance: '5.7km',
      verified: false
    }
  ];

  // Suppress console logs during tests
  const originalConsoleLog = console.log;
  const originalConsoleGroup = console.group;
  const originalConsoleError = console.error;

  beforeAll(() => {
    // Suppress console.log and console.group from MockCompanyService
    console.log = jest.fn();
    console.group = jest.fn();
  });

  afterAll(() => {
    // Restore original console methods
    console.log = originalConsoleLog;
    console.group = originalConsoleGroup;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    serviceFactory.getCompanyService.mockReturnValue(mockCompanyService);
    mockCompanyService.getAll.mockResolvedValue({
      data: mockNearbyCompanies
    });
  });

  const renderComponent = async (dataStats = null) => {
    const result = render(
      <BrowserRouter>
        <HomePage dataStats={dataStats} />
      </BrowserRouter>
    );
    // Wait for initial async operations to complete
    await waitFor(() => {
      expect(mockCompanyService.getAll).toHaveBeenCalled();
    });
    return result;
  };

  test('renders hero section', async () => {
    await renderComponent();
    
    expect(screen.getByText(/find capable local/i)).toBeInTheDocument();
    expect(screen.getByText(/suppliers in minutes/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search companies/i)).toBeInTheDocument();
  });

  test('renders search bar', async () => {
    await renderComponent();
    
    const searchInput = screen.getByPlaceholderText(/search companies/i);
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    expect(searchInput).toBeInTheDocument();
    expect(searchButton).toBeInTheDocument();
  });

  test('handles search submission', async () => {
    await renderComponent();
    
    const searchInput = screen.getByPlaceholderText(/search companies/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(searchInput, { target: { value: 'manufacturers' } });
    fireEvent.click(searchButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('/search?q=')
    );
  });

  test('does not search with empty query', async () => {
    await renderComponent();
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('renders sector chips', async () => {
    await renderComponent();
    
    expect(screen.getByText('Service Provider')).toBeInTheDocument();
    expect(screen.getByText('Item Supplier')).toBeInTheDocument();
    expect(screen.getByText('Manufacturer')).toBeInTheDocument();
    expect(screen.getByText('Retailer')).toBeInTheDocument();
    expect(screen.getByText('Component')).toBeInTheDocument();
    expect(screen.getByText('Both')).toBeInTheDocument();
  });

  test('handles sector chip click', async () => {
    await renderComponent();
    
    // Scope the query to the sector chips section to avoid the company cards
    const sectorChips = document.querySelector('.sector-chips');
    const manufacturerChip = within(sectorChips).getByText('Manufacturer');
    fireEvent.click(manufacturerChip);

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('/companies?sector=')
    );
  });

  test('renders trust indicators section', async () => {
    await renderComponent();
    
    expect(screen.getByText('Buyer-focused')).toBeInTheDocument();
    expect(screen.getByText('Trust & speed')).toBeInTheDocument();
    expect(screen.getByText('Supplier-friendly')).toBeInTheDocument();
  });

  test('renders nearby companies section', async () => {
    await renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Companies Near You')).toBeInTheDocument();
      expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
      expect(screen.getByText('Global Supply Co')).toBeInTheDocument();
      expect(screen.getByText('ServiceMax Pro')).toBeInTheDocument();
    });
  });

  test('displays verified badges for verified companies', async () => {
    await renderComponent();
    
    await waitFor(() => {
      const verifiedBadges = screen.getAllByText('✓ Verified');
      expect(verifiedBadges.length).toBe(2); // TechCorp and Global Supply
    });
  });

  test('handles view details button click', async () => {
    await renderComponent();
    
    await waitFor(() => {
      const viewButtons = screen.getAllByText('View Details');
      expect(viewButtons.length).toBeGreaterThan(0);
    });

    const viewButtons = screen.getAllByText('View Details');
    fireEvent.click(viewButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/company/1');
  });

  test('renders how it works section', async () => {
    await renderComponent();
    
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Search or Browse')).toBeInTheDocument();
    expect(screen.getByText('Filter & Compare')).toBeInTheDocument();
    expect(screen.getByText('Connect')).toBeInTheDocument();
  });

  test('renders CTA section', async () => {
    await renderComponent();
    
    expect(screen.getByText(/ready to find your next supplier/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get started free/i })).toBeInTheDocument();
  });

  test('handles get started button click', async () => {
    await renderComponent();
    
    const getStartedButton = screen.getByRole('button', { name: /get started free/i });
    fireEvent.click(getStartedButton);

    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });

  test('displays company distances', async () => {
    await renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/2.3km/)).toBeInTheDocument();
      expect(screen.getByText(/4.1km/)).toBeInTheDocument();
      expect(screen.getByText(/5.7km/)).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    // Suppress console.error for this specific test since we expect an error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockCompanyService.getAll.mockRejectedValue(new Error('API Error'));
    
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    // Wait for the error to be handled
    await waitFor(() => {
      expect(mockCompanyService.getAll).toHaveBeenCalled();
    });
    
    // Should still render the page
    expect(screen.getByText(/find capable local/i)).toBeInTheDocument();
    
    // Should show fallback data
    await waitFor(() => {
      expect(screen.getByText('Companies Near You')).toBeInTheDocument();
    });

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  test('searches when pressing enter in search input', async () => {
    await renderComponent();
    
    const searchInput = screen.getByPlaceholderText(/search companies/i);
    
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.submit(searchInput.closest('form'));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('/search?q=test%20query')
    );
  });

  test('displays sector counts', async () => {
    await renderComponent();
    
    expect(screen.getByText('245')).toBeInTheDocument(); // Service Provider count
    expect(screen.getByText('189')).toBeInTheDocument(); // Item Supplier count
    expect(screen.getByText('156')).toBeInTheDocument(); // Manufacturer count
  });

  test('renders hero map placeholder', async () => {
    await renderComponent();
    
    const mapPlaceholder = document.querySelector('.hero-map-placeholder');
    expect(mapPlaceholder).toBeInTheDocument();
  });

  test('renders with data stats', async () => {
    const dataStats = {
      totalCompanies: 2716,
      verified: 1500,
      sectors: 12
    };
    
    await renderComponent(dataStats);
    
    expect(screen.getByText(/find capable local/i)).toBeInTheDocument();
  });

  test('loads nearby companies on mount', async () => {
    await renderComponent();
    
    await waitFor(() => {
      expect(mockCompanyService.getAll).toHaveBeenCalledWith({
        limit: 3,
        nearby: true
      });
    });
  });

  test('transforms API data correctly', async () => {
    mockCompanyService.getAll.mockResolvedValue({
      data: [{
        id: 1,
        name: 'Test Company',
        companyType: 'Manufacturer',
        verificationStatus: 'verified'
      }]
    });
    
    await renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Test Company')).toBeInTheDocument();
    });

    // Use within to scope the query to the nearby section
    const nearbySection = screen.getByText('Companies Near You').closest('.nearby-section');
    const companyCards = within(nearbySection).getAllByText('Manufacturer');
    
    // Should find the company type in the nearby companies section
    expect(companyCards.length).toBeGreaterThan(0);
  });

  test('handles empty company list', async () => {
    mockCompanyService.getAll.mockResolvedValue({
      data: []
    });
    
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(mockCompanyService.getAll).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Companies Near You')).toBeInTheDocument();
    });
  });

  test('displays company types correctly', async () => {
    await renderComponent();
    
    // Wait for nearby companies to load
    await waitFor(() => {
      expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
    });

    // Use within to scope queries to the nearby section
    const nearbySection = screen.getByText('Companies Near You').closest('.nearby-section');
    
    expect(within(nearbySection).getByText('Manufacturer')).toBeInTheDocument();
    expect(within(nearbySection).getByText('Item Supplier')).toBeInTheDocument();
    expect(within(nearbySection).getByText('Service Provider')).toBeInTheDocument();
  });
});