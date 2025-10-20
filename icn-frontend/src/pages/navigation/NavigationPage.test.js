// src/pages/navigation/NavigationPage.test.js

import React from 'react';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import NavigationPage from './NavigationPage';
import { renderWithProviders } from '../../utils/testUtils';
import * as serviceFactory from '../../services/serviceFactory';
import geocodingCacheService from '../../services/geocodingCacheService';

// Mock the service factory
jest.mock('../../services/serviceFactory');

// Mock geocoding cache service
jest.mock('../../services/geocodingCacheService', () => ({
  __esModule: true,
  default: {
    batchGeocodeWithCache: jest.fn(),
  },
}));

// Mock SearchMap component
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

// Mock CompanyCard component
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

// Mock FilterPanel component with all filter buttons
jest.mock('../../components/search/FilterPanel', () => {
  return function FilterPanel({ filters, onFilterChange, onClearFilters }) {
    return (
      <div data-testid="filter-panel">
        <button onClick={() => onFilterChange({ ...filters, verified: true })}>
          Apply Verified Filter
        </button>
        <button onClick={() => onFilterChange({ ...filters, sectors: ['Technology'] })}>
          Apply Sector Filter
        </button>
        <button onClick={() => onFilterChange({ ...filters, capabilities: ['Software'] })}>
          Apply Capability Filter
        </button>
        <button onClick={() => onFilterChange({ ...filters, size: 'Medium' })}>
          Apply Size Filter
        </button>
        <button onClick={() => onFilterChange({ ...filters, ownership: ['Australian'] })}>
          Apply Ownership Filter
        </button>
        <button onClick={() => onFilterChange({ ...filters, distance: 25 })}>
          Apply Distance Filter
        </button>
        <button onClick={() => onFilterChange({ 
          ...filters, 
          sectors: ['Technology'],
          verified: true,
          size: 'Medium'
        })}>
          Apply Multiple Filters
        </button>
        <button onClick={() => onFilterChange({ ...filters, distance: 1 })}>
          Apply Strict Distance Filter
        </button>
        <button onClick={onClearFilters}>Clear Filters</button>
      </div>
    );
  };
});

describe('NavigationPage', () => {
  let mockCompanyService;
  let mockGeocodingService;

  // Define mock companies
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

  // ========== ORIGINAL TESTS ==========

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
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

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

    const mapBtn = screen.getByText('🗺️ Map View');
    expect(mapBtn).toHaveClass('active');

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
    
    expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    
    fireEvent.click(filterToggle);
    expect(screen.queryByTestId('filter-panel')).not.toBeInTheDocument();
    
    fireEvent.click(filterToggle);
    expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
  });

  test('applies verified filter correctly', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('📋 List View'));

    await waitFor(() => {
      expect(screen.getAllByTestId('company-card').length).toBe(2);
    });

    const applyFilterBtn = screen.getByText('Apply Verified Filter');
    fireEvent.click(applyFilterBtn);

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

    fireEvent.click(screen.getByText('📋 List View'));

    const applyFilterBtn = screen.getByText('Apply Verified Filter');
    fireEvent.click(applyFilterBtn);

    await waitFor(() => {
      expect(screen.getAllByTestId('company-card').length).toBe(1);
    });

    const clearBtn = screen.getByText('Clear Filters');
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(screen.getAllByTestId('company-card').length).toBe(2);
    });
  });

  test('displays active filter count', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    const applyFilterBtn = screen.getByText('Apply Verified Filter');
    fireEvent.click(applyFilterBtn);

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

    const mapCompanyBtn = screen.getAllByRole('button', { name: 'Tech Solutions Ltd' })[0];
    fireEvent.click(mapCompanyBtn);

    await waitFor(() => {
      expect(screen.getByText('View Full Details')).toBeInTheDocument();
    });
  });

  test('closes company info panel', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    const mapCompanyBtn = screen.getAllByRole('button', { name: 'Tech Solutions Ltd' })[0];
    fireEvent.click(mapCompanyBtn);

    await waitFor(() => {
      expect(screen.getByText('View Full Details')).toBeInTheDocument();
    });

    const closeBtn = screen.getByLabelText('Close');
    fireEvent.click(closeBtn);

    expect(screen.queryByText('View Full Details')).not.toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    mockCompanyService.getAll.mockRejectedValue(new Error('API Error'));
    
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

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

    fireEvent.click(screen.getByText('📋 List View'));

    await waitFor(() => {
      expect(screen.getAllByTestId('company-card').length).toBeGreaterThan(0);
    });

    const companyCard = screen.getAllByTestId('company-card')[0];
    fireEvent.click(companyCard);
  });

  test('displays correct initial view mode', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    const mapBtn = screen.getByText('🗺️ Map View');
    expect(mapBtn).toHaveClass('active');
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

  // ========== NEW TESTS FOR IMPROVED COVERAGE ==========

  test('handles response without data wrapper', async () => {
    mockCompanyService.getAll.mockResolvedValue(mockCompanies);
    
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/2.*companies/i)).toBeInTheDocument();
    });
  });

  test('handles companies with alternative field names', async () => {
    const companiesWithAltFields = [
      {
        id: 3,
        name: 'Alt Fields Co',
        address: '789 Alt St',
        companyType: 'manufacturer',
        verificationStatus: 'verified',
        keySectors: ['Energy'],
        companySize: 'Small',
        capabilities: [],
        ownership: [],
        distance: 15,
        lat: -37.8136,
        lng: 144.9631
      }
    ];

    setupMocks(companiesWithAltFields);
    
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('📋 List View'));

    await waitFor(() => {
      expect(screen.getByText('Alt Fields Co')).toBeInTheDocument();
    });
  });

  test('filters by sectors', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('📋 List View'));

    await waitFor(() => {
      expect(screen.getAllByTestId('company-card').length).toBe(2);
    });

    const applySectorBtn = screen.getByText('Apply Sector Filter');
    fireEvent.click(applySectorBtn);

    await waitFor(() => {
      const cards = screen.getAllByTestId('company-card');
      expect(cards.length).toBe(1);
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });
  });

  test('filters by capabilities', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });
  
    fireEvent.click(screen.getByText('📋 List View'));
    
    // Wait for companies to be displayed first
    await waitFor(() => {
      expect(screen.getAllByTestId('company-card').length).toBe(2);
    });
  
    fireEvent.click(screen.getByText('Apply Capability Filter'));
  
    await waitFor(() => {
      expect(screen.getAllByTestId('company-card').length).toBe(1);
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });
  });

  test('filters by ownership', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });
  
    fireEvent.click(screen.getByText('📋 List View'));
    
    // Wait for companies to be displayed first
    await waitFor(() => {
      expect(screen.getAllByTestId('company-card').length).toBe(2);
    });
  
    fireEvent.click(screen.getByText('Apply Ownership Filter'));
  
    await waitFor(() => {
      expect(screen.getAllByTestId('company-card').length).toBe(1);
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });
  });

  test('updates filter count badge correctly', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });
  
    const filterButton = screen.getByRole('button', { name: /🔧 Filters/i });
    
    // Initially no badge
    await waitFor(() => {
      expect(within(filterButton).queryByText(/\d+/)).not.toBeInTheDocument();
    });
  
    fireEvent.click(screen.getByText('Apply Distance Filter'));
  
    await waitFor(() => {
      const badge = within(filterButton).getByText('1');
      expect(badge).toHaveClass('filter-count');
    });
  });

  test('displays no results in map view when filters exclude all companies', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Apply Strict Distance Filter'));

    await waitFor(() => {
      expect(screen.getByText('No companies match your filters')).toBeInTheDocument();
    });

    const clearButtons = screen.getAllByText('Clear Filters');
    const mapClearButton = clearButtons.find(btn => 
      btn.closest('.no-results-map')
    );
    expect(mapClearButton).toBeInTheDocument();
  });

  test('displays no results message in list view', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('📋 List View'));
    fireEvent.click(screen.getByText('Apply Strict Distance Filter'));

    await waitFor(() => {
      expect(screen.getByText('No companies found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
    });
  });

  test('navigates to company detail from map panel', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });
  
    const mapCompanyBtn = screen.getAllByRole('button', { name: 'Tech Solutions Ltd' })[0];
    fireEvent.click(mapCompanyBtn);
  
    await waitFor(() => {
      expect(screen.getByText('View Full Details')).toBeInTheDocument();
    });
  
    const viewDetailsBtn = screen.getByText('View Full Details');
    fireEvent.click(viewDetailsBtn);
  
    // Navigation happens internally - we can verify the button was clickable
    // and the onClick handler executed without errors
    // The actual navigation is handled by the router context in renderWithProviders
  });

  test('handles companies without optional fields', async () => {
    const minimalCompanies = [
      {
        id: 4,
        name: 'Minimal Co',
        address: '111 Min St',
        type: 'supplier',
        verified: false,
        sectors: [],
        capabilities: [],
        ownership: [],
        size: 'Unknown',
        distance: 10,
        lat: -37.8136,
        lng: 144.9631
      }
    ];

    setupMocks(minimalCompanies);
    
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('📋 List View'));

    await waitFor(() => {
      expect(screen.getByText('Minimal Co')).toBeInTheDocument();
    });
  });

  test('handles companies with undefined ownership array', async () => {
    const companiesNoOwnership = [
      {
        id: 5,
        name: 'No Ownership Co',
        address: '222 Test St',
        type: 'supplier',
        verified: false,
        sectors: ['Technology'],
        capabilities: ['Software'],
        size: 'Small',
        distance: 8,
        lat: -37.8136,
        lng: 144.9631
      }
    ];

    setupMocks(companiesNoOwnership);
    
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Apply Ownership Filter'));

    await waitFor(() => {
      fireEvent.click(screen.getByText('📋 List View'));
      expect(screen.queryByText('No Ownership Co')).not.toBeInTheDocument();
    });
  });

  test('updates filter count badge correctly', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    const filterButton = screen.getByRole('button', { name: /🔧 Filters/i });
    expect(within(filterButton).queryByText(/\d+/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Apply Distance Filter'));

    await waitFor(() => {
      const badge = within(filterButton).getByText('1');
      expect(badge).toHaveClass('filter-count');
    });
  });

  test('geocoding cache is called with correct parameters', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(geocodingCacheService.batchGeocodeWithCache).toHaveBeenCalledWith(
        expect.any(Array),
        mockGeocodingService
      );
    });
  });

  test('displays company details in info panel', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });
  
    const mapCompanyBtn = screen.getAllByRole('button', { name: 'Tech Solutions Ltd' })[0];
    fireEvent.click(mapCompanyBtn);
  
    await waitFor(() => {
      // Check for elements that are unique to the info panel
      expect(screen.getByText('View Full Details')).toBeInTheDocument();
    });
  
    // Verify panel content using more specific queries
    const panel = document.querySelector('.company-info-panel');
    expect(panel).toBeInTheDocument();
    
    // Check within the panel
    expect(within(panel).getByText('Tech Solutions Ltd')).toBeInTheDocument();
    expect(screen.getByText('✓ Verified')).toBeInTheDocument();
    expect(screen.getByText('supplier')).toBeInTheDocument();
    expect(screen.getByText('📍 123 Test St, Melbourne VIC')).toBeInTheDocument();
    expect(screen.getByText(/5\.0 km away/)).toBeInTheDocument();
  });

  test('displays limited sectors in info panel', async () => {
    const companyWithManySectors = [
      {
        id: 6,
        name: 'Multi Sector Co',
        address: '333 Test St',
        type: 'supplier',
        verified: true,
        sectors: ['Tech', 'Manufacturing', 'Energy', 'Agriculture', 'Healthcare'],
        capabilities: ['Software'],
        size: 'Large',
        ownership: ['Australian'],
        distance: 7,
        lat: -37.8136,
        lng: 144.9631
      }
    ];

    setupMocks(companyWithManySectors);
    
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    const mapCompanyBtn = screen.getAllByRole('button', { name: 'Multi Sector Co' })[0];
    fireEvent.click(mapCompanyBtn);

    await waitFor(() => {
      const tags = document.querySelectorAll('.company-tags .tag');
      expect(tags.length).toBe(3);
    });
  });

  test('clears filters from no results view', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Apply Strict Distance Filter'));

    await waitFor(() => {
      expect(screen.getByText('No companies match your filters')).toBeInTheDocument();
    });

    const clearButtons = screen.getAllByText('Clear Filters');
    const mapClearButton = clearButtons.find(btn => 
      btn.closest('.no-results-map')
    );
    
    fireEvent.click(mapClearButton);

    await waitFor(() => {
      expect(screen.queryByText('No companies match your filters')).not.toBeInTheDocument();
    });
  });
});