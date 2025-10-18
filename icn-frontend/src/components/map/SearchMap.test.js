// Put this mock BEFORE other imports so it takes effect
jest.mock('@react-google-maps/api', () => {
  const React = require('react');
  const { useEffect } = React;

  // A stable stub that acts like a Map instance
  const mapStub = {
    setCenter: jest.fn(),
    setZoom: jest.fn(),
    panTo: jest.fn(),
    fitBounds: jest.fn(),
    getZoom: jest.fn(() => 13),
    setOptions: jest.fn(),
  };

  const GoogleMap = ({ children, mapContainerStyle, onLoad, onUnmount }) => {
    useEffect(() => {
      onLoad && onLoad(mapStub);
      return () => onUnmount && onUnmount(mapStub);
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
      LatLngBounds: jest.fn(() => ({
        extend: jest.fn(),
      })),
      Point: jest.fn((x, y) => ({ x, y })),
      event: {
        addListener: jest.fn(() => ({ remove: jest.fn() })),
        removeListener: jest.fn(),
      },
      // Optional: define Marker/Circle presence so guards pass (not required)
      Marker: function () {},
      Circle: function () {},
    },
  };
});

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
      <SearchMap companies={mockCompanies} onCompanySelect={mockOnCompanySelect} />
    );
    expect(container.querySelector('[style*="height"]')).toBeInTheDocument();
  });

  it('displays loading message when Google Maps is not loaded', () => {
    const tempGoogle = global.google;
    // Simulate Maps not yet loaded
    // @ts-ignore
    global.google = undefined;

    render(<SearchMap companies={mockCompanies} onCompanySelect={mockOnCompanySelect} />);
    expect(screen.getByText('Loading Google Maps...')).toBeInTheDocument();

    global.google = tempGoogle;
  });

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
});
