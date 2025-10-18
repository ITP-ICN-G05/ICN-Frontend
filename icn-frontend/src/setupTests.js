import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// ============================================
// Mock axios FIRST (before any other imports)
// ============================================
jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    patch: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { 
        use: jest.fn((fulfilled, rejected) => 0), 
        eject: jest.fn() 
      },
      response: { 
        use: jest.fn((fulfilled, rejected) => 0), 
        eject: jest.fn() 
      }
    }
  };

  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockAxiosInstance),
      get: jest.fn(() => Promise.resolve({ data: {} })),
      post: jest.fn(() => Promise.resolve({ data: {} })),
      put: jest.fn(() => Promise.resolve({ data: {} })),
      delete: jest.fn(() => Promise.resolve({ data: {} })),
      patch: jest.fn(() => Promise.resolve({ data: {} })),
    }
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock Google Maps API - COMPLETE VERSION
global.google = {
  maps: {
    Map: jest.fn(function(element, options) {
      return {
        setCenter: jest.fn(),
        setZoom: jest.fn(),
        panTo: jest.fn(),
        fitBounds: jest.fn(),
        getZoom: jest.fn(() => 13),
        setOptions: jest.fn(), // CRITICAL: needed by @react-google-maps/api
        addListener: jest.fn(),
        getCenter: jest.fn(() => ({ 
          lat: () => -37.8136, 
          lng: () => 144.9631 
        })),
        getBounds: jest.fn(() => ({
          contains: jest.fn(() => true),
          getNorthEast: jest.fn(() => ({ lat: () => -37.8, lng: () => 145 })),
          getSouthWest: jest.fn(() => ({ lat: () => -37.9, lng: () => 144.9 })),
        })),
        getDiv: jest.fn(() => element),
        setMapTypeId: jest.fn(),
        controls: [],
      };
    }),
    Marker: jest.fn(function(options) {
      return {
        setMap: jest.fn(),
        setPosition: jest.fn(),
        setIcon: jest.fn(),
        addListener: jest.fn(),
        getPosition: jest.fn(() => options?.position),
      };
    }),
    MarkerF: jest.fn(),
    InfoWindow: jest.fn(function() {
      return {
        open: jest.fn(),
        close: jest.fn(),
        setContent: jest.fn(),
        setPosition: jest.fn(),
      };
    }),
    LatLng: jest.fn((lat, lng) => ({ 
      lat: () => lat, 
      lng: () => lng,
      equals: jest.fn(),
      toString: jest.fn(() => `(${lat}, ${lng})`),
    })),
    LatLngBounds: jest.fn(function() {
      return {
        extend: jest.fn(),
        contains: jest.fn(() => true),
        getNorthEast: jest.fn(),
        getSouthWest: jest.fn(),
      };
    }),
    Point: jest.fn((x, y) => ({ x, y })),
    Size: jest.fn((width, height) => ({ width, height })),
    Circle: jest.fn(),
    Polygon: jest.fn(),
    Polyline: jest.fn(),
    Rectangle: jest.fn(),
    OverlayView: jest.fn(),
    MapTypeId: {
      ROADMAP: 'roadmap',
      SATELLITE: 'satellite',
      HYBRID: 'hybrid',
      TERRAIN: 'terrain',
    },
    event: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addListenerOnce: jest.fn(),
      clearListeners: jest.fn(),
      clearInstanceListeners: jest.fn(),
      trigger: jest.fn(),
    },
    places: {
      AutocompleteService: jest.fn(),
      PlacesService: jest.fn(),
    },
  },
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock navigator.geolocation
global.navigator.geolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

// Suppress console errors and warnings in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
       args[0].includes('Warning: useLayoutEffect') ||
       args[0].includes('Not implemented: HTMLFormElement.prototype.submit') ||
       args[0].includes('Error: Not implemented: HTMLFormElement.prototype.submit') ||
       args[0].includes('The above error occurred') ||
       args[0].includes('Search error: TypeError: query.toLowerCase'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('React Router Future Flag Warning') ||
       args[0].includes('v7_startTransition') ||
       args[0].includes('v7_relativeSplatPath'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});