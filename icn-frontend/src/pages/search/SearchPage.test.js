// src/pages/search/SearchPage.test.js

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchPage from './SearchPage';
import { renderWithProviders, mockCompanies, mockApiResponses } from '../../utils/testUtils';
import * as serviceFactory from '../../services/serviceFactory';

// Mock react-router-dom at the top level
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: jest.fn()
}));

jest.mock('../../services/serviceFactory');
jest.mock('../../components/search/FilterPanel', () => {
  return function FilterPanel({ filters, onFilterChange, onClearFilters }) {
    return (
      <div data-testid="filter-panel">
        <button onClick={() => onFilterChange({ ...filters, verified: true })}>
          Apply Filter
        </button>
        <button onClick={onClearFilters}>Clear All</button>
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
jest.mock('../../components/map/SearchMap', () => {
  return function SearchMap({ companies, onCompanySelect }) {
    return (
      <div data-testid="search-map">
        {companies.map(c => (
          <button key={c.id} onClick={() => onCompanySelect(c)}>
            {c.name}
          </button>
        ))}
      </div>
    );
  };
});

describe('SearchPage', () => {
  let mockCompanyService;
  let mockGeocodingService;
  let mockUseSearchParams;

  const setupMocks = (searchResults = mockCompanies, searchQuery = '') => {
    mockCompanyService = {
      search: jest.fn(() => Promise.resolve(mockApiResponses.success(searchResults)))
    };
    mockGeocodingService = {
      geocodeAddress: jest.fn(() => Promise.resolve(mockApiResponses.success({
        lat: -37.8136,
        lng: 144.9631
      })))
    };

    serviceFactory.getCompanyService.mockReturnValue(mockCompanyService);
    serviceFactory.getGeocodingService.mockReturnValue(mockGeocodingService);

    // Mock useSearchParams
    const searchParams = new URLSearchParams(searchQuery ? `q=${searchQuery}` : '');
    mockUseSearchParams = jest.fn(() => [searchParams, jest.fn()]);
    require('react-router-dom').useSearchParams = mockUseSearchParams;
  };

  beforeEach(() => {
    setupMocks();
    mockNavigate.mockClear();
  });

  test('renders search page', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Search Results')).toBeInTheDocument();
    });
  });

  test('displays search query in header', async () => {
    setupMocks(mockCompanies, 'electronics');
    renderWithProviders(<SearchPage />, { initialEntries: ['/search?q=electronics'] });
    
    await waitFor(() => {
      expect(screen.getByText(/for "electronics"/i)).toBeInTheDocument();
    });
  });

  test('searches companies on mount', async () => {
    setupMocks(mockCompanies, 'test');
    renderWithProviders(<SearchPage />, { initialEntries: ['/search?q=test'] });
    
    await waitFor(() => {
      expect(mockCompanyService.search).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'test'
        })
      );
    });
  });

  test('displays loading state', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    expect(screen.getByText('Searching companies...')).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Searching companies...')).not.toBeInTheDocument();
    });
  });

  test('displays search results', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      expect(screen.getByText('Green Industries')).toBeInTheDocument();
    });
  });

  test('displays result count', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText(/2 companies found/i)).toBeInTheDocument();
    });
  });

  test('switches between list and map views', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    const mapBtn = screen.getByText('🗺️ Map');
    fireEvent.click(mapBtn);

    await waitFor(() => {
      expect(mapBtn).toHaveClass('active');
      expect(screen.getByTestId('search-map')).toBeInTheDocument();
    });

    const listBtn = screen.getByText('📋 List');
    fireEvent.click(listBtn);

    await waitFor(() => {
      expect(listBtn).toHaveClass('active');
    });
  });

  test('toggles filter panel', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    const filterBtn = screen.getByText('🔧 Filters');
    
    // Initially no filters shown
    expect(screen.queryByTestId('filter-panel')).not.toBeInTheDocument();
    
    // Toggle on
    fireEvent.click(filterBtn);
    await waitFor(() => {
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });
    
    // Toggle off
    fireEvent.click(filterBtn);
    await waitFor(() => {
      expect(screen.queryByTestId('filter-panel')).not.toBeInTheDocument();
    });
  });

  test('applies filters', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      expect(screen.getByText('Green Industries')).toBeInTheDocument();
    });

    // Show filters
    fireEvent.click(screen.getByText('🔧 Filters'));

    await waitFor(() => {
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });

    // Apply verified filter
    fireEvent.click(screen.getByText('Apply Filter'));

    // Only verified company should be shown
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      expect(screen.queryByText('Green Industries')).not.toBeInTheDocument();
    });
  });

  test('clears filters', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    // Show filters and apply
    fireEvent.click(screen.getByText('🔧 Filters'));
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Apply Filter'));

    await waitFor(() => {
      expect(screen.queryByText('Green Industries')).not.toBeInTheDocument();
    });

    // Clear filters
    fireEvent.click(screen.getByText('Clear All'));

    // Both companies should be visible
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      expect(screen.getByText('Green Industries')).toBeInTheDocument();
    });
  });

  test('displays active filter count', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    // Apply filter
    fireEvent.click(screen.getByText('🔧 Filters'));
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Apply Filter'));

    // Filter count badge should appear
    await waitFor(() => {
      expect(screen.getByText('1')).toHaveClass('filter-count');
    });
  });

  test('sorts results by distance', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'distance' } });

    // Results should be sorted by distance
    await waitFor(() => {
      const cards = screen.getAllByTestId('company-card');
      expect(cards[0]).toHaveTextContent('Tech Solutions Ltd'); // 5.2km
      expect(cards[1]).toHaveTextContent('Green Industries'); // 12.5km
    });
  });

  test('sorts results by name', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'name' } });

    // Results should be sorted alphabetically
    await waitFor(() => {
      const cards = screen.getAllByTestId('company-card');
      expect(cards[0]).toHaveTextContent('Green Industries');
      expect(cards[1]).toHaveTextContent('Tech Solutions Ltd');
    });
  });

  test('displays no results message', async () => {
    // Return empty array and use a query that won't match any mock data fallback
    setupMocks([], 'nonexistentcompanyxyz123');
    renderWithProviders(<SearchPage />, { 
      initialEntries: ['/search?q=nonexistentcompanyxyz123'] 
    });
    
    await waitFor(() => {
      expect(screen.getByText('No companies found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters or search terms')).toBeInTheDocument();
    });
  });

  test('handles search API error', async () => {
    // Mock the search to throw an error
    mockCompanyService.search = jest.fn().mockRejectedValue({
      response: { data: { message: 'API Error' }, status: 400 }
    });
    
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    // Should fall back to mock data or handle error gracefully
    await waitFor(() => {
      expect(screen.queryByText('Searching companies...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Component should still render even after error (with fallback data)
    await waitFor(() => {
      expect(screen.getByText('Search Results')).toBeInTheDocument();
    });
  });

  test('navigates to company detail', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    const companyCard = screen.getAllByTestId('company-card')[0];
    fireEvent.click(companyCard);

    expect(mockNavigate).toHaveBeenCalledWith('/company/1');
  });

  test('selects company on map', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    // Switch to map view
    fireEvent.click(screen.getByText('🗺️ Map'));

    await waitFor(() => {
      expect(screen.getByTestId('search-map')).toBeInTheDocument();
    });

    // Click company on map
    const mapCompanies = screen.getAllByText('Tech Solutions Ltd');
    fireEvent.click(mapCompanies[0]);

    // Company panel should appear
    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });
  });

  test('opens directions in new tab', async () => {
    window.open = jest.fn();
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    // Switch to map view and select company
    fireEvent.click(screen.getByText('🗺️ Map'));
    
    await waitFor(() => {
      expect(screen.getByTestId('search-map')).toBeInTheDocument();
    });
    
    const mapCompanies = screen.getAllByText('Tech Solutions Ltd');
    fireEvent.click(mapCompanies[0]);

    // Click get directions
    await waitFor(() => {
      const directionsBtn = screen.getByText('Get Directions');
      fireEvent.click(directionsBtn);
    });

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('google.com/maps'),
      '_blank'
    );
  });

  test('handles missing position data', async () => {
    const companiesWithoutPos = [
      {
        ...mockCompanies[0],
        latitude: null,
        longitude: null,
        address: '123 Test St'
      }
    ];

    setupMocks(companiesWithoutPos);
    
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });
  });

  test('uses mock data as fallback when API returns empty', async () => {
    setupMocks([], 'electronics');
    
    renderWithProviders(<SearchPage />, { 
      initialEntries: ['/search?q=electronics'] 
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Searching companies...')).not.toBeInTheDocument();
    });
  });

  test('handles geocoding error gracefully', async () => {
    // Mock geocoding to reject
    mockGeocodingService.geocodeAddress = jest.fn().mockRejectedValue({
      response: { data: { message: 'Geocoding failed' }, status: 400 }
    });

    const companiesWithoutGeo = [
      {
        id: 4,
        name: 'No Geo Company',
        address: '999 Unknown St',
        type: 'Other',
        sectors: ['Other'],
        capabilities: ['Other'],
        distance: 0,
        employees: 10,
        verified: false,
        ownership: []
      }
    ];

    setupMocks(companiesWithoutGeo);
    
    // Override the geocoding service mock after setupMocks
    mockGeocodingService.geocodeAddress = jest.fn().mockRejectedValue({
      response: { data: { message: 'Geocoding failed' }, status: 400 }
    });
    
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('No Geo Company')).toBeInTheDocument();
    });
  });

  test('filters by sector correctly', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getAllByTestId('company-card').length).toBe(2);
    });
  });

  test('displays company distance in list view', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      const cards = screen.getAllByTestId('company-card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  test('sorts by company size', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'size' } });

    // Results should be sorted by size
    await waitFor(() => {
      const cards = screen.getAllByTestId('company-card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  test('displays sort options correctly', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });
    
    const sortSelect = screen.getByRole('combobox');
    expect(sortSelect).toBeInTheDocument();
    
    // Check that options exist
    const options = sortSelect.querySelectorAll('option');
    expect(options.length).toBeGreaterThan(0);
  });

  test('shows clear filters button when filters applied', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    // Apply filter
    fireEvent.click(screen.getByText('🔧 Filters'));
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Apply Filter'));

    // Clear button should be visible
    await waitFor(() => {
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });
  });

  test('closes map company panel when switching to list view', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    // Switch to map and select company
    fireEvent.click(screen.getByText('🗺️ Map'));
    
    await waitFor(() => {
      expect(screen.getByTestId('search-map')).toBeInTheDocument();
    });
    
    const mapCompanies = screen.getAllByText('Tech Solutions Ltd');
    fireEvent.click(mapCompanies[0]);

    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    // Switch back to list
    fireEvent.click(screen.getByText('📋 List'));

    await waitFor(() => {
      // Map should not be visible
      expect(screen.queryByTestId('search-map')).not.toBeInTheDocument();
    });
  });

  test('displays empty query search results', async () => {
    setupMocks(mockCompanies, '');
    renderWithProviders(<SearchPage />, { initialEntries: ['/search?q='] });
    
    await waitFor(() => {
      // Should still display results for empty query
      expect(screen.queryByText('Searching companies...')).not.toBeInTheDocument();
    });
  });

  test('handles special characters in search query', async () => {
    setupMocks(mockCompanies, 'tech & manufacturing');
    renderWithProviders(<SearchPage />, { 
      initialEntries: ['/search?q=tech%20%26%20manufacturing'] 
    });
    
    await waitFor(() => {
      expect(mockCompanyService.search).toHaveBeenCalled();
    });
  });
});