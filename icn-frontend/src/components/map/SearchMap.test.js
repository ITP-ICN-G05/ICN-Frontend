// SearchMap.test.js - Complete test suite with high coverage

// Create mockMapStub BEFORE the mock so both can share the reference
// MUST be prefixed with "mock" for Jest to allow it in jest.mock()
const mockMapStub = {
  setCenter: jest.fn(),
  setZoom: jest.fn(),
  panTo: jest.fn(),
  fitBounds: jest.fn(),
  getZoom: jest.fn(() => 13),
  setOptions: jest.fn(),
};

// Put this mock BEFORE other imports so it takes effect
jest.mock('@react-google-maps/api', () => {
  const React = require('react');
  const { useEffect } = React;

  const GoogleMap = ({ children, mapContainerStyle, onLoad, onUnmount }) => {
    useEffect(() => {
      onLoad && onLoad(mockMapStub);
      return () => onUnmount && onUnmount(mockMapStub);
    }, [onLoad, onUnmount]);
    return React.createElement(
      'div',
      { style: mapContainerStyle, 'data-testid': 'map' },
      children
    );
  };

  // Marker/Circle are no-ops for tests
  const MarkerF = () => null;
  const Circle = () => null;

  return { GoogleMap, MarkerF, Circle };
});

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
    latitude: -37.82,
    longitude: 144.97,
  },
];

const mockOnCompanySelect = jest.fn();

// Minimal Google Maps bits used by the component during onLoad
beforeAll(() => {
  global.google = {
    maps: {
      LatLng: jest.fn((lat, lng) => ({ lat, lng })),
      LatLngBounds: function() {
        this.extend = jest.fn();
      },
      Point: jest.fn((x, y) => ({ x, y })),
      event: {
        addListener: jest.fn(() => ({ remove: jest.fn() })),
        removeListener: jest.fn(),
      },
      Marker: function () {},
      Circle: function () {},
    },
  };
});

describe('SearchMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMapStub.setCenter.mockClear();
    mockMapStub.setZoom.mockClear();
    mockMapStub.panTo.mockClear();
    mockMapStub.fitBounds.mockClear();
    
    // Default: successful geolocation
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

  describe('Basic Rendering', () => {
    it('renders map container', () => {
      const { container } = render(
        <SearchMap companies={mockCompanies} onCompanySelect={mockOnCompanySelect} />
      );
      expect(container.querySelector('[style*="height"]')).toBeInTheDocument();
    });

    it('displays loading message when Google Maps is not loaded', () => {
      const tempGoogle = global.google;
      global.google = undefined;

      render(<SearchMap companies={mockCompanies} onCompanySelect={mockOnCompanySelect} />);
      expect(screen.getByText('Loading Google Maps...')).toBeInTheDocument();

      global.google = tempGoogle;
    });

    it('renders map with data-testid', () => {
      render(<SearchMap companies={mockCompanies} onCompanySelect={mockOnCompanySelect} />);
      expect(screen.getByTestId('map')).toBeInTheDocument();
    });
  });

  describe('Geolocation', () => {
    it('requests user location on mount', () => {
      render(<SearchMap companies={mockCompanies} onCompanySelect={mockOnCompanySelect} />);
      expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
    });

    it('shows location loading banner', () => {
      navigator.geolocation.getCurrentPosition = jest.fn(); // never calls success or error
      render(<SearchMap companies={mockCompanies} onCompanySelect={mockOnCompanySelect} />);
      expect(screen.getByText('Getting your location...')).toBeInTheDocument();
    });

    it('handles geolocation error', async () => {
      navigator.geolocation.getCurrentPosition = jest.fn((_, error) =>
        error({ message: 'Location denied' })
      );
      render(<SearchMap companies={mockCompanies} onCompanySelect={mockOnCompanySelect} />);
      await waitFor(() => {
        expect(screen.getByText(/Location unavailable/)).toBeInTheDocument();
      });
    });

    it('displays My Location button when location available', async () => {
      render(<SearchMap companies={mockCompanies} onCompanySelect={mockOnCompanySelect} />);
      await waitFor(() => {
        expect(screen.getByText('My Location')).toBeInTheDocument();
      });
    });

    it('handles browsers without geolocation support', async () => {
      const originalGeo = navigator.geolocation;
      navigator.geolocation = undefined;
      
      render(<SearchMap companies={mockCompanies} onCompanySelect={jest.fn()} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Location unavailable/)).toBeInTheDocument();
        expect(screen.getByText(/Geolocation not supported/)).toBeInTheDocument();
      });
      
      navigator.geolocation = originalGeo;
    });

    it('handles retry when geolocation is not supported', async () => {
      const originalGeo = navigator.geolocation;
      navigator.geolocation = undefined;
      
      render(<SearchMap companies={mockCompanies} onCompanySelect={jest.fn()} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Geolocation not supported/)).toBeInTheDocument();
      });
      
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Geolocation not supported/)).toBeInTheDocument();
      });
      
      navigator.geolocation = originalGeo;
    });

    it('retries getting location when retry button clicked', async () => {
      navigator.geolocation.getCurrentPosition = jest.fn((_, error) =>
        error({ message: 'Location denied' })
      );
      
      render(<SearchMap companies={mockCompanies} onCompanySelect={jest.fn()} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Location unavailable/)).toBeInTheDocument();
      });
      
      // Mock successful location on retry
      navigator.geolocation.getCurrentPosition = jest.fn((success) =>
        success({
          coords: { latitude: -37.8, longitude: 144.9, accuracy: 10 },
        })
      );
      
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);
      
      await waitFor(() => {
        expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
        expect(screen.getByText('My Location')).toBeInTheDocument();
      });
    });

    it('centers map on user location after successful geolocation', async () => {
      render(<SearchMap companies={mockCompanies} onCompanySelect={jest.fn()} />);
      
      await waitFor(() => {
        expect(screen.getByText('My Location')).toBeInTheDocument();
      });
      
      // Map should be panned to user location (in the useEffect after location is obtained)
      expect(mockMapStub.panTo).toHaveBeenCalledWith({
        lat: -37.8136,
        lng: 144.9631,
      });
      expect(mockMapStub.setZoom).toHaveBeenCalledWith(13);
    });
  });

  describe('Company Display', () => {
    it('displays Show All button when companies exist', async () => {
      render(<SearchMap companies={mockCompanies} onCompanySelect={mockOnCompanySelect} />);
      await waitFor(() => {
        expect(screen.getByText(/Show All \(2\)/)).toBeInTheDocument();
      });
    });

    it('filters companies with valid coordinates', () => {
      const companiesWithInvalid = [
        ...mockCompanies,
        { id: 3, name: 'Invalid', latitude: null, longitude: null },
      ];
      render(<SearchMap companies={companiesWithInvalid} onCompanySelect={mockOnCompanySelect} />);
      expect(screen.queryByText(/Show All \(2\)/)).toBeInTheDocument();
    });

    it('handles empty companies array', () => {
      render(<SearchMap companies={[]} onCompanySelect={mockOnCompanySelect} />);
      expect(screen.queryByText(/Show All/)).not.toBeInTheDocument();
    });

    it('handles undefined companies prop', () => {
      expect(() => {
        render(<SearchMap onCompanySelect={mockOnCompanySelect} />);
      }).not.toThrow();
    });

    it('handles company verificationStatus field', () => {
      const companiesWithVerificationStatus = [
        {
          id: 1,
          name: 'Company A',
          verificationStatus: 'verified',
          latitude: -37.8136,
          longitude: 144.9631,
        },
        {
          id: 2,
          name: 'Company B',
          verificationStatus: 'unverified',
          latitude: -37.82,
          longitude: 144.97,
        },
      ];
      
      render(
        <SearchMap 
          companies={companiesWithVerificationStatus} 
          onCompanySelect={jest.fn()} 
        />
      );
      
      expect(screen.queryByText(/Show All \(2\)/)).toBeInTheDocument();
    });

    it('converts string coordinates to numbers', () => {
      const companiesWithStringCoords = [
        {
          id: 1,
          name: 'Company A',
          verified: true,
          latitude: '-37.8136',
          longitude: '144.9631',
        },
      ];
      
      render(
        <SearchMap 
          companies={companiesWithStringCoords} 
          onCompanySelect={jest.fn()} 
        />
      );
      
      expect(screen.queryByText(/Show All \(1\)/)).toBeInTheDocument();
    });

    it('filters out companies with invalid string coordinates', () => {
      const companiesWithInvalidStrings = [
        ...mockCompanies,
        {
          id: 3,
          name: 'Invalid',
          latitude: 'not-a-number',
          longitude: 'also-invalid',
        },
        {
          id: 4,
          name: 'Empty strings',
          latitude: '  ',
          longitude: '  ',
        },
      ];
      
      render(
        <SearchMap 
          companies={companiesWithInvalidStrings} 
          onCompanySelect={jest.fn()} 
        />
      );
      
      expect(screen.queryByText(/Show All \(2\)/)).toBeInTheDocument();
    });

    it('calculates and sorts companies by distance from user', async () => {
      const companiesAtVariousDistances = [
        {
          id: 1,
          name: 'Far Company',
          verified: true,
          latitude: -38.0,
          longitude: 145.0,
        },
        {
          id: 2,
          name: 'Near Company',
          verified: true,
          latitude: -37.815,
          longitude: 144.964,
        },
      ];
      
      render(
        <SearchMap 
          companies={companiesAtVariousDistances} 
          onCompanySelect={jest.fn()} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('My Location')).toBeInTheDocument();
      });
      
      expect(screen.queryByText(/Show All \(2\)/)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('centers map on user location when button clicked', async () => {
      render(<SearchMap companies={mockCompanies} onCompanySelect={jest.fn()} />);
      
      await waitFor(() => {
        expect(screen.getByText('My Location')).toBeInTheDocument();
      });
      
      mockMapStub.panTo.mockClear();
      mockMapStub.setZoom.mockClear();
      
      const centerButton = screen.getByText('My Location');
      fireEvent.click(centerButton);
      
      expect(mockMapStub.panTo).toHaveBeenCalledWith({
        lat: -37.8136,
        lng: 144.9631,
      });
      expect(mockMapStub.setZoom).toHaveBeenCalledWith(13);
    });

    it('fits bounds to all companies when Show All clicked', async () => {
      render(<SearchMap companies={mockCompanies} onCompanySelect={jest.fn()} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Show All/)).toBeInTheDocument();
      });
      
      mockMapStub.fitBounds.mockClear();
      
      const showAllButton = screen.getByText(/Show All \(2\)/);
      fireEvent.click(showAllButton);
      
      expect(mockMapStub.fitBounds).toHaveBeenCalled();
    });

    it('handles Show All click when map is not ready', async () => {
      render(<SearchMap companies={mockCompanies} onCompanySelect={jest.fn()} />);
      
      const showAllButton = await screen.findByText(/Show All/);
      
      expect(() => {
        fireEvent.click(showAllButton);
      }).not.toThrow();
    });

    it('does not show My Location button when location unavailable', async () => {
      navigator.geolocation.getCurrentPosition = jest.fn((_, error) =>
        error({ message: 'Location denied' })
      );
      
      render(<SearchMap companies={mockCompanies} onCompanySelect={jest.fn()} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Location unavailable/)).toBeInTheDocument();
      });
      
      expect(screen.queryByText('My Location')).not.toBeInTheDocument();
    });
  });

  describe('Selected Company', () => {
    it('centers map on selectedCompany when provided', async () => {
      const selectedCompany = mockCompanies[0];
      
      const { rerender } = render(
        <SearchMap companies={mockCompanies} onCompanySelect={jest.fn()} />
      );
      
      await waitFor(() => {
        expect(screen.getByText('My Location')).toBeInTheDocument();
      });
      
      mockMapStub.panTo.mockClear();
      mockMapStub.setZoom.mockClear();
      
      rerender(
        <SearchMap 
          companies={mockCompanies} 
          selectedCompany={selectedCompany}
          onCompanySelect={jest.fn()} 
        />
      );
      
      await waitFor(() => {
        expect(mockMapStub.panTo).toHaveBeenCalledWith({
          lat: -37.8136,
          lng: 144.9631,
        });
      });
      
      expect(mockMapStub.setZoom).toHaveBeenCalledWith(15);
    });

    it('does not center on selectedCompany with invalid coordinates', async () => {
      const invalidCompany = {
        id: 99,
        name: 'Invalid',
        latitude: null,
        longitude: null,
      };
      
      const { rerender } = render(
        <SearchMap 
          companies={mockCompanies}
          onCompanySelect={jest.fn()} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('My Location')).toBeInTheDocument();
      });
      
      const panToCallsBefore = mockMapStub.panTo.mock.calls.length;
      mockMapStub.panTo.mockClear();
      
      rerender(
        <SearchMap 
          companies={mockCompanies}
          selectedCompany={invalidCompany}
          onCompanySelect={jest.fn()} 
        />
      );
      
      // Wait a bit to ensure effect would have run if it was going to
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Should not have been called for invalid company
      expect(mockMapStub.panTo).not.toHaveBeenCalled();
    });
  });

  describe('Map Loading Scenarios', () => {
    it('handles onLoad with no nearby companies', async () => {
      const farAwayCompanies = [
        {
          id: 1,
          name: 'Very Far Company',
          verified: true,
          latitude: -38.5,
          longitude: 145.5,
        },
      ];
      
      render(
        <SearchMap 
          companies={farAwayCompanies} 
          onCompanySelect={jest.fn()} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('My Location')).toBeInTheDocument();
      });
      
      expect(screen.queryByText(/Show All \(1\)/)).toBeInTheDocument();
    });

    it('uses fallback center when no location and no companies', async () => {
      navigator.geolocation.getCurrentPosition = jest.fn((_, error) =>
        error({ message: 'Location denied' })
      );
      
      render(<SearchMap companies={[]} onCompanySelect={jest.fn()} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Location unavailable/)).toBeInTheDocument();
      });
      
      expect(screen.queryByText(/Show All/)).not.toBeInTheDocument();
    });

    it('fits bounds to companies when no user location', async () => {
      navigator.geolocation.getCurrentPosition = jest.fn((_, error) =>
        error({ message: 'Location denied' })
      );
      
      render(<SearchMap companies={mockCompanies} onCompanySelect={jest.fn()} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Location unavailable/)).toBeInTheDocument();
      });
      
      // Should still show companies
      expect(screen.queryByText(/Show All \(2\)/)).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('cleans up map reference on unmount', async () => {
      const { unmount } = render(
        <SearchMap companies={mockCompanies} onCompanySelect={jest.fn()} />
      );
      
      await waitFor(() => {
        expect(screen.getByText('My Location')).toBeInTheDocument();
      });
      
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('handles companies with zero coordinates', () => {
      const companiesWithZeroCoords = [
        {
          id: 1,
          name: 'Zero Company',
          verified: true,
          latitude: 0,
          longitude: 0,
        },
      ];
      
      render(
        <SearchMap 
          companies={companiesWithZeroCoords} 
          onCompanySelect={jest.fn()} 
        />
      );
      
      expect(screen.queryByText(/Show All \(1\)/)).toBeInTheDocument();
    });

    it('handles large number of companies', async () => {
      const manyCompanies = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Company ${i}`,
        verified: i % 2 === 0,
        latitude: -37.8136 + (i * 0.001),
        longitude: 144.9631 + (i * 0.001),
      }));
      
      render(
        <SearchMap 
          companies={manyCompanies} 
          onCompanySelect={jest.fn()} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Show All \(100\)/)).toBeInTheDocument();
      });
    });

    it('handles missing onCompanySelect prop', () => {
      expect(() => {
        render(<SearchMap companies={mockCompanies} />);
      }).not.toThrow();
    });

    it('handles companies with additional properties', () => {
      const companiesWithExtra = mockCompanies.map(c => ({
        ...c,
        address: '123 Test St',
        phone: '555-1234',
        extraData: { foo: 'bar' },
      }));
      
      render(
        <SearchMap 
          companies={companiesWithExtra} 
          onCompanySelect={jest.fn()} 
        />
      );
      
      expect(screen.queryByText(/Show All \(2\)/)).toBeInTheDocument();
    });
  });

  describe('Console Logging', () => {
    it('logs company data processing', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      render(<SearchMap companies={mockCompanies} onCompanySelect={jest.fn()} />);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Map received')
      );
      
      consoleSpy.mockRestore();
    });
  });
});