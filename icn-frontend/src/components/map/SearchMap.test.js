import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import SearchMap from './SearchMap';

const mockCompanies = [
  {
    id: 1,
    name: 'Company A',
    verified: true,
    latitude: -37.8136,
    longitude: 144.9631,
  },
  {
    id: 2,
    name: 'Company B',
    verified: false,
    latitude: -37.8200,
    longitude: 144.9700,
  },
];

const mockOnCompanySelect = jest.fn();

// Mock Google Maps
global.google = {
  maps: {
    Map: jest.fn(() => ({
      setCenter: jest.fn(),
      setZoom: jest.fn(),
      panTo: jest.fn(),
      fitBounds: jest.fn(),
      getZoom: jest.fn(() => 13),
    })),
    LatLng: jest.fn((lat, lng) => ({ lat, lng })),
    LatLngBounds: jest.fn(() => ({
      extend: jest.fn(),
    })),
    Point: jest.fn((x, y) => ({ x, y })),
    event: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
  },
};

describe('SearchMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    navigator.geolocation = {
      getCurrentPosition: jest.fn((success) =>
        success({
          coords: {
            latitude: -37.8136,
            longitude: 144.9631,
            accuracy: 10,
          },
        })
      ),
    };
  });

  it('renders map container', () => {
    const { container } = render(
      <SearchMap
        companies={mockCompanies}
        onCompanySelect={mockOnCompanySelect}
      />
    );
    
    expect(container.querySelector('[style*="height"]')).toBeInTheDocument();
  });

  it('displays loading message when Google Maps is not loaded', () => {
    const tempGoogle = global.google;
    global.google = undefined;
    
    render(
      <SearchMap
        companies={mockCompanies}
        onCompanySelect={mockOnCompanySelect}
      />
    );
    
    expect(screen.getByText('Loading Google Maps...')).toBeInTheDocument();
    
    global.google = tempGoogle;
  });

  it('requests user location on mount', () => {
    render(
      <SearchMap
        companies={mockCompanies}
        onCompanySelect={mockOnCompanySelect}
      />
    );
    
    expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
  });

  it('shows location loading banner', async () => {
    navigator.geolocation.getCurrentPosition = jest.fn();
    
    render(
      <SearchMap
        companies={mockCompanies}
        onCompanySelect={mockOnCompanySelect}
      />
    );
    
    expect(screen.getByText('Getting your location...')).toBeInTheDocument();
  });

  it('handles geolocation error', async () => {
    navigator.geolocation.getCurrentPosition = jest.fn((_, error) =>
      error({ message: 'Location denied' })
    );
    
    render(
      <SearchMap
        companies={mockCompanies}
        onCompanySelect={mockOnCompanySelect}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Location unavailable/)).toBeInTheDocument();
    });
  });

  it('displays My Location button when location available', async () => {
    render(
      <SearchMap
        companies={mockCompanies}
        onCompanySelect={mockOnCompanySelect}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('My Location')).toBeInTheDocument();
    });
  });

  it('displays Show All button when companies exist', async () => {
    render(
      <SearchMap
        companies={mockCompanies}
        onCompanySelect={mockOnCompanySelect}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Show All \(2\)/)).toBeInTheDocument();
    });
  });

  it('filters companies with valid coordinates', () => {
    const companiesWithInvalid = [
      ...mockCompanies,
      { id: 3, name: 'Invalid', latitude: null, longitude: null },
    ];
    
    render(
      <SearchMap
        companies={companiesWithInvalid}
        onCompanySelect={mockOnCompanySelect}
      />
    );
    
    // Should only show 2 companies
    expect(screen.queryByText(/Show All \(2\)/)).toBeInTheDocument();
  });

  it('handles empty companies array', () => {
    render(
      <SearchMap
        companies={[]}
        onCompanySelect={mockOnCompanySelect}
      />
    );
    
    expect(screen.queryByText(/Show All/)).not.toBeInTheDocument();
  });

  it('handles undefined companies prop', () => {
    expect(() => {
      render(<SearchMap onCompanySelect={mockOnCompanySelect} />);
    }).not.toThrow();
  });
});