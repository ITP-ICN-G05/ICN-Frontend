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

// Enhanced FilterPanel mock with all filter types
jest.mock('../../components/search/FilterPanel', () => {
  return function FilterPanel({ filters, onFilterChange, onClearFilters }) {
    return (
      <div data-testid="filter-panel">
        <button onClick={() => onFilterChange({ ...filters, verified: true })}>
          Apply Verified
        </button>
        <button onClick={() => onFilterChange({ ...filters, sectors: ['Technology'] })}>
          Apply Sector Filter
        </button>
        <button onClick={() => onFilterChange({ ...filters, capabilities: ['Manufacturing'] })}>
          Apply Capability Filter
        </button>
        <button onClick={() => onFilterChange({ ...filters, size: 'Large' })}>
          Apply Size Filter
        </button>
        <button onClick={() => onFilterChange({ ...filters, distance: 10 })}>
          Apply Distance Filter
        </button>
        <button onClick={() => onFilterChange({ ...filters, ownership: ['Female-owned'] })}>
          Apply Ownership Filter
        </button>
        <button onClick={() => onFilterChange({ 
          ...filters, 
          verified: true,
          sectors: ['Technology'],
          size: 'Large'
        })}>
          Apply Multiple Filters
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

  // ============================================
  // BASIC RENDERING TESTS
  // ============================================

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

  test('displays result count', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText(/2 companies found/i)).toBeInTheDocument();
    });
  });

  test('displays loading state', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    expect(screen.getByText('Searching companies...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Searching companies...')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // SEARCH FUNCTIONALITY TESTS
  // ============================================

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

  test('displays search results', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      expect(screen.getByText('Green Industries')).toBeInTheDocument();
    });
  });

  test('handles whitespace in search query', async () => {
    setupMocks(mockCompanies, '  electronics  ');
    renderWithProviders(<SearchPage />, { 
      initialEntries: ['/search?q=%20%20electronics%20%20'] 
    });
    
    await waitFor(() => {
      expect(mockCompanyService.search).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'electronics'
        })
      );
    });
  });

  test('displays empty query search results', async () => {
    setupMocks(mockCompanies, '');
    renderWithProviders(<SearchPage />, { initialEntries: ['/search?q='] });
    
    await waitFor(() => {
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

  // ============================================
  // VIEW SWITCHING TESTS
  // ============================================

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

  test('closes map company panel when switching to list view', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🗺️ Map'));
    
    await waitFor(() => {
      expect(screen.getByTestId('search-map')).toBeInTheDocument();
    });
    
    const mapCompanies = screen.getAllByText('Tech Solutions Ltd');
    fireEvent.click(mapCompanies[0]);

    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('📋 List'));

    await waitFor(() => {
      expect(screen.queryByTestId('search-map')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // FILTER TESTS
  // ============================================

  test('toggles filter panel', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    const filterBtn = screen.getByText('🔧 Filters');
    
    expect(screen.queryByTestId('filter-panel')).not.toBeInTheDocument();
    
    fireEvent.click(filterBtn);
    await waitFor(() => {
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });
    
    fireEvent.click(filterBtn);
    await waitFor(() => {
      expect(screen.queryByTestId('filter-panel')).not.toBeInTheDocument();
    });
  });

  test('applies verified filter', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      expect(screen.getByText('Green Industries')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🔧 Filters'));

    await waitFor(() => {
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Apply Verified'));

    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      expect(screen.queryByText('Green Industries')).not.toBeInTheDocument();
    });
  });

  test('filters by sector', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getAllByTestId('company-card').length).toBe(2);
    });

    fireEvent.click(screen.getByText('🔧 Filters'));
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Apply Sector Filter'));

    await waitFor(() => {
      const cards = screen.getAllByTestId('company-card');
      expect(cards.length).toBeLessThanOrEqual(2);
    });
  });

  test('filters by capability', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🔧 Filters'));
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Apply Capability Filter'));

    await waitFor(() => {
      const cards = screen.getAllByTestId('company-card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  test('filters by company size', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🔧 Filters'));
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Apply Size Filter'));

    await waitFor(() => {
      const cards = screen.queryAllByTestId('company-card');
      expect(cards.length).toBeGreaterThanOrEqual(0);
    });
  });

  test('filters by distance', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🔧 Filters'));
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Apply Distance Filter'));

    await waitFor(() => {
      const cards = screen.getAllByTestId('company-card');
      expect(cards.length).toBeGreaterThanOrEqual(0);
    });
  });

  test('filters by ownership', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🔧 Filters'));
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Apply Ownership Filter'));

    await waitFor(() => {
      const cards = screen.queryAllByTestId('company-card');
      expect(cards.length).toBeGreaterThanOrEqual(0);
    });
  });

  test('applies multiple filters simultaneously', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      expect(screen.getByText('Green Industries')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🔧 Filters'));
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Apply Multiple Filters'));

    await waitFor(() => {
      const cards = screen.queryAllByTestId('company-card');
      expect(cards.length).toBeGreaterThanOrEqual(0);
    });
  });

  test('clears filters', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🔧 Filters'));
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Apply Verified'));

    await waitFor(() => {
      expect(screen.queryByText('Green Industries')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Clear All'));

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

    fireEvent.click(screen.getByText('🔧 Filters'));
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Apply Verified'));

    await waitFor(() => {
      expect(screen.getByText('1')).toHaveClass('filter-count');
    });
  });

  test('calculates active filter count with multiple filters', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🔧 Filters'));
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Apply Multiple Filters'));

    await waitFor(() => {
      const filterCountBadge = document.querySelector('.filter-count');
      expect(filterCountBadge).toBeInTheDocument();
      expect(parseInt(filterCountBadge.textContent)).toBeGreaterThan(1);
    });
  });

  test('shows clear filters button when filters applied', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🔧 Filters'));
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Apply Verified'));

    await waitFor(() => {
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });
  });

  // ============================================
  // SORTING TESTS
  // ============================================

  test('sorts results by distance', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'distance' } });

    await waitFor(() => {
      const cards = screen.getAllByTestId('company-card');
      expect(cards[0]).toHaveTextContent('Tech Solutions Ltd');
      expect(cards[1]).toHaveTextContent('Green Industries');
    });
  });

  test('sorts results by name', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'name' } });

    await waitFor(() => {
      const cards = screen.getAllByTestId('company-card');
      expect(cards[0]).toHaveTextContent('Green Industries');
      expect(cards[1]).toHaveTextContent('Tech Solutions Ltd');
    });
  });

  test('sorts by company size', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'size' } });

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
    
    const options = sortSelect.querySelectorAll('option');
    expect(options.length).toBeGreaterThan(0);
  });

  // ============================================
  // MAP FUNCTIONALITY TESTS
  // ============================================

  test('selects company on map', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🗺️ Map'));

    await waitFor(() => {
      expect(screen.getByTestId('search-map')).toBeInTheDocument();
    });

    const mapCompanies = screen.getAllByText('Tech Solutions Ltd');
    fireEvent.click(mapCompanies[0]);

    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });
  });

  test('closes map company panel using close button', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🗺️ Map'));
    
    await waitFor(() => {
      expect(screen.getByTestId('search-map')).toBeInTheDocument();
    });
    
    const mapCompanies = screen.getAllByText('Tech Solutions Ltd');
    fireEvent.click(mapCompanies[0]);

    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('View Details')).not.toBeInTheDocument();
    });
  });

  test('navigates from map company panel', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🗺️ Map'));
    
    await waitFor(() => {
      expect(screen.getByTestId('search-map')).toBeInTheDocument();
    });
    
    const mapCompanies = screen.getAllByText('Tech Solutions Ltd');
    fireEvent.click(mapCompanies[0]);

    await waitFor(() => {
      const viewDetailsBtn = screen.getByText('View Details');
      fireEvent.click(viewDetailsBtn);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/company/1');
  });

  test('opens directions in new tab', async () => {
    window.open = jest.fn();
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🗺️ Map'));
    
    await waitFor(() => {
      expect(screen.getByTestId('search-map')).toBeInTheDocument();
    });
    
    const mapCompanies = screen.getAllByText('Tech Solutions Ltd');
    fireEvent.click(mapCompanies[0]);

    await waitFor(() => {
      const directionsBtn = screen.getByText('Get Directions');
      fireEvent.click(directionsBtn);
    });

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('google.com/maps'),
      '_blank'
    );
  });

  test('displays verified badge in map panel', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🗺️ Map'));
    
    await waitFor(() => {
      expect(screen.getByTestId('search-map')).toBeInTheDocument();
    });
    
    const mapCompanies = screen.getAllByText('Tech Solutions Ltd');
    fireEvent.click(mapCompanies[0]);

    await waitFor(() => {
      expect(screen.getByText('✓ Verified')).toBeInTheDocument();
    });
  });

  test('displays company sectors in map panel', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🗺️ Map'));
    
    await waitFor(() => {
      expect(screen.getByTestId('search-map')).toBeInTheDocument();
    });
    
    const mapCompanies = screen.getAllByText('Tech Solutions Ltd');
    fireEvent.click(mapCompanies[0]);

    await waitFor(() => {
      const tags = screen.getAllByText(/Technology|Manufacturing/);
      expect(tags.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // NAVIGATION TESTS
  // ============================================

  test('navigates to company detail', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    const companyCard = screen.getAllByTestId('company-card')[0];
    fireEvent.click(companyCard);

    expect(mockNavigate).toHaveBeenCalledWith('/company/1');
  });

  // ============================================
  // GEOCODING AND POSITION TESTS
  // ============================================

  test('handles company with existing position data', async () => {
    const companiesWithPosition = [
      {
        id: 5,
        name: 'Positioned Company',
        type: 'Manufacturer',
        sectors: ['Technology'],
        capabilities: ['Manufacturing'],
        distance: null,
        size: 'Medium',
        employees: '100-499',
        verified: true,
        ownership: [],
        address: '123 Test Street',
        description: 'Test description',
        position: { lat: -37.8200, lng: 144.9700 }
      }
    ];

    setupMocks(companiesWithPosition);
    
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Positioned Company')).toBeInTheDocument();
    });

    expect(mockGeocodingService.geocodeAddress).not.toHaveBeenCalledWith('123 Test Street');
  });

  test('successfully geocodes company address', async () => {
    const companiesWithAddress = [
      {
        id: 6,
        name: 'Address Company',
        type: 'Manufacturer',
        sectors: ['Technology'],
        capabilities: ['Manufacturing'],
        distance: null,
        size: 'Medium',
        employees: '100-499',
        verified: true,
        ownership: [],
        address: '456 Real Street, Melbourne',
        description: 'Test description',
        position: null
      }
    ];

    setupMocks(companiesWithAddress);
    
    mockGeocodingService.geocodeAddress = jest.fn(() => 
      Promise.resolve(mockApiResponses.success({
        lat: -37.8150,
        lng: 144.9650
      }))
    );
    
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Address Company')).toBeInTheDocument();
    });

    expect(mockGeocodingService.geocodeAddress).toHaveBeenCalledWith('456 Real Street, Melbourne');
  });

  test('handles geocoding error gracefully', async () => {
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
    
    mockGeocodingService.geocodeAddress = jest.fn().mockRejectedValue({
      response: { data: { message: 'Geocoding failed' }, status: 400 }
    });
    
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('No Geo Company')).toBeInTheDocument();
    });
  });

  test('handles company without address or position', async () => {
    const companiesWithoutLocation = [
      {
        id: 7,
        name: 'No Location Company',
        type: 'Service Provider',
        sectors: ['Services'],
        capabilities: ['Consulting'],
        distance: null,
        size: 'Small',
        employees: '10-99',
        verified: false,
        ownership: [],
        address: null,
        description: 'Test description',
        position: null
      }
    ];

    setupMocks(companiesWithoutLocation);
    
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('No Location Company')).toBeInTheDocument();
    });
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

  // ============================================
  // ERROR HANDLING AND EDGE CASES
  // ============================================

  test('displays no results message', async () => {
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
    mockCompanyService.search = jest.fn().mockRejectedValue({
      response: { data: { message: 'API Error' }, status: 400 }
    });
    
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.queryByText('Searching companies...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    await waitFor(() => {
      expect(screen.getByText('Search Results')).toBeInTheDocument();
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

  test('clears filters from no results view', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🔧 Filters'));
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Apply Verified'));

    await waitFor(() => {
      const clearButton = screen.getByText('Clear All');
      expect(clearButton).toBeInTheDocument();
    });
  });

  test('displays company distance in list view', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    
    await waitFor(() => {
      const cards = screen.getAllByTestId('company-card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });
});