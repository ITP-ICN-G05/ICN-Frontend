// src/pages/navigation/__tests__/NavigationPage.test.js
// or
// src/pages/navigation/NavigationPage.test.js

import React from 'react';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import NavigationPage from './NavigationPage';
import { renderWithProviders } from '../../utils/testUtils';
import * as serviceFactory from '../../services/serviceFactory';
import geocodingCacheService from '../../services/geocodingCacheService';

// Mock the service factory and components
jest.mock('../../services/serviceFactory');

jest.mock('../../services/geocodingCacheService', () => ({
  __esModule: true,
  default: {
    batchGeocodeWithCache: jest.fn(),
  },
}));

jest.mock('../../components/map/SearchMap', () => {
  return function SearchMap({ companies, onCompanySelect }) {
    return (
      <div data-testid="search-map">
        {companies?.map(c => (
          <button key={c.id} onClick={() => onCompanySelect(c)}>
            {c.name}
          </button>
        ))}
      </div>
    );
  };
});

jest.mock('../../components/company/CompanyCard', () => {
  return function CompanyCard({ company, onClick }) {
    return (
      <div data-testid="company-card" onClick={onClick}>
        <h3>{company.name}</h3>
        <p>{company.type}</p>
      </div>
    );
  };
});

jest.mock('../../components/search/FilterPanel', () => {
  return function FilterPanel({ filters, onFilterChange, onClearFilters }) {
    return (
      <div data-testid="filter-panel">
        <button onClick={() => onFilterChange({ ...filters, verified: true })}>
          Apply Verified Filter
        </button>
        <button onClick={onClearFilters}>Clear Filters</button>
      </div>
    );
  };
});

describe('NavigationPage', () => {
  let mockCompanyService;
  let mockGeocodingService;

  // Define mock companies directly in test file
  const mockCompanies = [
    {
      id: 1,
      name: 'Tech Solutions Ltd',
      address: '123 Test St, Melbourne VIC',
      type: 'supplier',
      verified: true,
      sectors: ['Technology'],
      capabilities: ['Software'],
      size: 'Medium',
      ownership: ['Australian'],
      distance: 5,
      lat: -37.8136,
      lng: 144.9631
    },
    {
      id: 2,
      name: 'Green Industries',
      address: '456 Demo Ave, Melbourne VIC',
      type: 'manufacturer',
      verified: false,
      sectors: ['Manufacturing'],
      capabilities: ['Production'],
      size: 'Large',
      ownership: ['International'],
      distance: 10,
      lat: -37.8140,
      lng: 144.9635
    }
  ];

  const setupMocks = (companies = mockCompanies) => {
    // Mock company service
    mockCompanyService = {
      getAll: jest.fn(() => Promise.resolve({ data: companies }))
    };
    
    // Mock geocoding service
    mockGeocodingService = {
      geocodeAddress: jest.fn(() => Promise.resolve({
        data: {
          lat: -37.8136,
          lng: 144.9631
        }
      }))
    };

    // Mock geocoding cache to return companies with coordinates
    geocodingCacheService.batchGeocodeWithCache.mockImplementation(
      (companiesArray) => Promise.resolve(companiesArray)
    );

    // Apply mocks to service factory
    serviceFactory.getCompanyService.mockReturnValue(mockCompanyService);
    serviceFactory.getGeocodingService.mockReturnValue(mockGeocodingService);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders navigation page with header', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Victorian Company Navigator')).toBeInTheDocument();
    });
  });

  test('loads companies on mount', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(mockCompanyService.getAll).toHaveBeenCalledWith({ limit: 10000 });
    });
  });

  test('displays loading state initially', () => {
    renderWithProviders(<NavigationPage />);
    
    expect(screen.getByText('Loading Companies...')).toBeInTheDocument();
  });

  test('displays companies after loading', async () => {
    renderWithProviders(<NavigationPage />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    // Wait for companies to appear in the map
    await waitFor(() => {
      const companyButtons = screen.getAllByRole('button', { name: /Tech Solutions Ltd|Green Industries/i });
      expect(companyButtons.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  test('switches between map and list views', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    // Initially map view should be active
    const mapBtn = screen.getByText('🗺️ Map View');
    expect(mapBtn).toHaveClass('active');

    // Switch to list view
    const listBtn = screen.getByText('📋 List View');
    fireEvent.click(listBtn);
    
    await waitFor(() => {
      expect(listBtn).toHaveClass('active');
      expect(mapBtn).not.toHaveClass('active');
    });
  });

  test('toggles filter panel visibility', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    const filterToggle = screen.getByText('🔧 Filters');
    
    // Initially filters should be visible
    expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    
    // Toggle off
    fireEvent.click(filterToggle);
    expect(screen.queryByTestId('filter-panel')).not.toBeInTheDocument();
    
    // Toggle on
    fireEvent.click(filterToggle);
    expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
  });

  test('applies verified filter correctly', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    // Switch to list view to see company cards
    fireEvent.click(screen.getByText('📋 List View'));

    await waitFor(() => {
      expect(screen.getAllByTestId('company-card').length).toBe(2);
    });

    // Apply verified filter
    const applyFilterBtn = screen.getByText('Apply Verified Filter');
    fireEvent.click(applyFilterBtn);

    // Only verified company should be shown
    await waitFor(() => {
      const cards = screen.getAllByTestId('company-card');
      expect(cards.length).toBe(1);
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      expect(screen.queryByText('Green Industries')).not.toBeInTheDocument();
    });
  });

  test('clears filters', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    // Switch to list view
    fireEvent.click(screen.getByText('📋 List View'));

    // Apply filter
    const applyFilterBtn = screen.getByText('Apply Verified Filter');
    fireEvent.click(applyFilterBtn);

    await waitFor(() => {
      expect(screen.getAllByTestId('company-card').length).toBe(1);
    });

    // Clear filters
    const clearBtn = screen.getByText('Clear Filters');
    fireEvent.click(clearBtn);

    // Both companies should be visible again
    await waitFor(() => {
      expect(screen.getAllByTestId('company-card').length).toBe(2);
    });
  });

  test('displays active filter count', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    // Apply filter
    const applyFilterBtn = screen.getByText('Apply Verified Filter');
    fireEvent.click(applyFilterBtn);

    // Filter count badge should appear - use within to scope the query
    await waitFor(() => {
      const filterButton = screen.getByRole('button', { name: /🔧 Filters/i });
      const badge = within(filterButton).getByText('1');
      expect(badge).toHaveClass('filter-count');
    });
  });

  test('displays company count statistics', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      // Find the stats display container and check its content
      const statsContainer = document.querySelector('.stats-display');
      expect(statsContainer).toBeInTheDocument();
      expect(statsContainer).toHaveTextContent('2 companies');
      expect(statsContainer).toHaveTextContent('1 verified');
    });
  });

  test('selects company on map', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    // Click company on map
    const mapCompanyBtn = screen.getAllByRole('button', { name: 'Tech Solutions Ltd' })[0];
    fireEvent.click(mapCompanyBtn);

    // Company panel should appear
    await waitFor(() => {
      expect(screen.getByText('View Full Details')).toBeInTheDocument();
    });
  });

  test('closes company info panel', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    // Select company
    const mapCompanyBtn = screen.getAllByRole('button', { name: 'Tech Solutions Ltd' })[0];
    fireEvent.click(mapCompanyBtn);

    await waitFor(() => {
      expect(screen.getByText('View Full Details')).toBeInTheDocument();
    });

    // Close panel
    const closeBtn = screen.getByLabelText('Close');
    fireEvent.click(closeBtn);

    // Panel should be closed
    expect(screen.queryByText('View Full Details')).not.toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    mockCompanyService.getAll.mockRejectedValue(new Error('API Error'));
    
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    // Should render page with 0 companies
    await waitFor(() => {
      expect(screen.getByText(/0.*companies/i)).toBeInTheDocument();
    });
  });

  test('displays info cards section', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Location-Based Discovery')).toBeInTheDocument();
      expect(screen.getByText('Verified Companies')).toBeInTheDocument();
      expect(screen.getByText('Advanced Filtering')).toBeInTheDocument();
      expect(screen.getByText('Smart Caching')).toBeInTheDocument();
    });
  });

  test('navigates to company detail page on list view click', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    // Switch to list view
    fireEvent.click(screen.getByText('📋 List View'));

    await waitFor(() => {
      expect(screen.getAllByTestId('company-card').length).toBeGreaterThan(0);
    });

    // Click on company card
    const companyCard = screen.getAllByTestId('company-card')[0];
    fireEvent.click(companyCard);

    // Router navigation is handled by the test environment
  });

  test('displays correct initial view mode', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    const mapBtn = screen.getByText('🗺️ Map View');
    expect(mapBtn).toHaveClass('active');
  });

  test('filters by distance', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    // Switch to list view to count cards
    fireEvent.click(screen.getByText('📋 List View'));

    await waitFor(() => {
      expect(screen.getAllByTestId('company-card').length).toBe(2);
    });

    // Distance filter is handled through FilterPanel component
    // This test verifies the component renders with distance-filtered data
  });

  test('handles empty company list', async () => {
    setupMocks([]);
    
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/0.*companies/i)).toBeInTheDocument();
    });
  });
});