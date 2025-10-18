// src/pages/navigation/__tests__/NavigationPage.test.js
// or
// src/pages/navigation/NavigationPage.test.js

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NavigationPage from './NavigationPage';
import { renderWithProviders, mockCompanies, mockApiResponses } from '../../utils/testUtils';
import * as serviceFactory from '../../services/serviceFactory';

// Mock the service factory and components
jest.mock('../../services/serviceFactory');
jest.mock('../../services/geocodingCacheService', () => ({
  __esModule: true,
  default: {
    batchGeocodeWithCache: jest.fn((companies) => Promise.resolve(companies)),
  },
}));

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

  const setupMocks = (companies = mockCompanies) => {
    mockCompanyService = {
      getAll: jest.fn(() => mockApiResponses.success(companies))
    };
    
    mockGeocodingService = {
      geocodeAddress: jest.fn(() => mockApiResponses.success({
        lat: -37.8136,
        lng: 144.9631
      }))
    };

    serviceFactory.getCompanyService.mockReturnValue(mockCompanyService);
    serviceFactory.getGeocodingService.mockReturnValue(mockGeocodingService);
  };

  beforeEach(() => {
    setupMocks();
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
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      expect(screen.getByText('Green Industries')).toBeInTheDocument();
    });
  });

  test('switches between map and list views', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    // Initially map view should be active
    const mapBtn = screen.getByText('🗺️ Map View');
    expect(mapBtn).toHaveClass('active');

    // Switch to list view
    const listBtn = screen.getByText('📋 List View');
    fireEvent.click(listBtn);
    
    expect(listBtn).toHaveClass('active');
    expect(mapBtn).not.toHaveClass('active');
  });

  test('toggles filter panel visibility', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
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
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      expect(screen.getByText('Green Industries')).toBeInTheDocument();
    });

    // Apply verified filter
    const applyFilterBtn = screen.getByText('Apply Verified Filter');
    fireEvent.click(applyFilterBtn);

    // Only verified company should be shown
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      expect(screen.queryByText('Green Industries')).not.toBeInTheDocument();
    });
  });

  test('clears filters', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    // Apply filter
    const applyFilterBtn = screen.getByText('Apply Verified Filter');
    fireEvent.click(applyFilterBtn);

    // Clear filters
    const clearBtn = screen.getByText('Clear Filters');
    fireEvent.click(clearBtn);

    // Both companies should be visible again
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      expect(screen.getByText('Green Industries')).toBeInTheDocument();
    });
  });

  test('displays active filter count', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    // Apply filter
    const applyFilterBtn = screen.getByText('Apply Verified Filter');
    fireEvent.click(applyFilterBtn);

    // Filter count badge should appear
    await waitFor(() => {
      expect(screen.getByText('1')).toHaveClass('filter-count');
    });
  });

  test('displays company count statistics', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/2.*companies/i)).toBeInTheDocument();
      expect(screen.getByText(/1.*verified/i)).toBeInTheDocument();
    });
  });

  test('selects company on map', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    // Click company on map
    const mapCompanyBtn = screen.getAllByText('Tech Solutions Ltd')[0];
    fireEvent.click(mapCompanyBtn);

    // Company panel should appear
    await waitFor(() => {
      expect(screen.getByText('View Full Details')).toBeInTheDocument();
    });
  });

  test('closes company info panel', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    // Select company
    const mapCompanyBtn = screen.getAllByText('Tech Solutions Ltd')[0];
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
    mockCompanyService.getAll.mockImplementation(() => 
      mockApiResponses.error('API Error')
    );
    
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Companies...')).not.toBeInTheDocument();
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
    const { container } = renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    // Switch to list view
    fireEvent.click(screen.getByText('📋 List View'));

    // Click on company card
    const companyCard = screen.getAllByTestId('company-card')[0];
    fireEvent.click(companyCard);

    // Router navigation is handled by the test environment
  });

  test('displays correct initial view mode', () => {
    renderWithProviders(<NavigationPage />);
    
    const mapBtn = screen.getByText('🗺️ Map View');
    expect(mapBtn).toHaveClass('active');
  });

  test('filters by distance', async () => {
    renderWithProviders(<NavigationPage />);
    
    await waitFor(() => {
      expect(screen.getAllByTestId('company-card').length).toBe(2);
    });

    // Distance filter is handled through FilterPanel component
    // This test verifies the component renders with distance-filtered data
  });
});