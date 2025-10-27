// src/services/serviceFactory.js
import { config } from '../config/environment';

// Import real services
import api from './api';
import authService from './authService';
import { companyService } from './companyService';
import { bookmarkService } from './bookmarkService';
import { savedSearchService } from './savedSearchService';
import { subscriptionService } from './subscriptionService';
import { exportService } from './exportService';
import { adminService } from './adminService';

// Import mock services
import { mockAuthService } from './mockAuthService';
import { mockCompanyService } from './mockCompanyService';
import { mockBookmarkService } from './mockBookmarkService';
import { mockSavedSearchService } from './mockSavedSearchService';
import { mockSubscriptionService } from './mockSubscriptionService';
import { mockExportService } from './mockExportService';
import { mockAdminService } from './mockAdminService';

// Import geocoding service (ONLY for mock mode)
import geocodingService from './geocodingService';

// Import ICN data service (for mock mode)
import icnDataService from './icnDataService';

// Determine if we should use mock services
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true' || 
                 (process.env.NODE_ENV === 'development' && 
                  process.env.REACT_APP_USE_MOCK !== 'false');

console.log(`🔧 Service Factory initialized in ${USE_MOCK ? 'MOCK' : 'REAL'} mode`);
console.log(`📡 Backend URL: ${process.env.REACT_APP_API_URL || 'http://54.242.81.107:8080'}`);

/**
 * Service factory to get the appropriate service (mock or real)
 */
export const getService = (serviceName) => {
  if (USE_MOCK) {
    // Mock mode - uses local data and needs geocoding
    const mockServices = {
      auth: mockAuthService,
      company: mockCompanyService,
      bookmark: mockBookmarkService,
      savedSearch: mockSavedSearchService,
      subscription: mockSubscriptionService,
      export: mockExportService,
      admin: mockAdminService,
      geocoding: geocodingService,  // Geocoding ONLY available in mock mode
      icnData: icnDataService,       // ICN data for mock mode
      api: api
    };
    
    return mockServices[serviceName] || api;
  }
  
  // Real mode - database already has coordinates, no geocoding needed
  const realServices = {
    auth: authService,
    company: companyService,
    bookmark: bookmarkService,
    savedSearch: savedSearchService,
    subscription: subscriptionService,
    export: exportService,
    admin: adminService,
    geocoding: null,  // NOT needed - coordinates come from database
    icnData: null,    // NOT needed - data comes from backend
    api: api
  };
  
  // Special handling for geocoding in real mode
  if (serviceName === 'geocoding') {
    console.warn('⚠️ Geocoding service not needed in REAL mode - coordinates come from database');
    return {
      // Return a stub that uses database coordinates
      getCompanyCoordinates: async (company) => {
        // Database already has coordinates
        if (company.latitude && company.longitude) {
          return { lat: company.latitude, lng: company.longitude, fromDatabase: true };
        }
        if (company.coord?.coordinates) {
          return { lat: company.coord.coordinates[1], lng: company.coord.coordinates[0], fromDatabase: true };
        }
        if (company.lontitude && company.latitude) {
          return { lat: company.latitude, lng: company.lontitude, fromDatabase: true };
        }
        // Fallback to state center if no coordinates
        return { lat: -37.8136, lng: 144.9631, fromDatabase: true };
      },
      batchGeocodeCompanies: async (companies) => companies, // No processing needed
      calculateDistance: (coord1, coord2) => {
        const R = 6371;
        const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
        const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return Math.round(R * c * 10) / 10;
      }
    };
  }
  
  return realServices[serviceName] || api;
};

/**
 * Service getters with mode awareness
 */
export const getAuthService = () => getService('auth');
export const getCompanyService = () => getService('company');
export const getBookmarkService = () => getService('bookmark');
export const getSavedSearchService = () => getService('savedSearch');
export const getSubscriptionService = () => getService('subscription');
export const getExportService = () => getService('export');
export const getAdminService = () => getService('admin');

// Geocoding service getter with warning for real mode
export const getGeocodingService = () => {
  if (!USE_MOCK) {
    console.info('ℹ️ Using database coordinates (no geocoding API calls)');
  }
  return getService('geocoding');
};

// ICN Data service getter (mock only)
export const getICNDataService = () => {
  if (!USE_MOCK) {
    console.warn('⚠️ ICN Data service not available in REAL mode - use company service instead');
    return null;
  }
  return getService('icnData');
};

export const getApiInstance = () => getService('api');

/**
 * Check service availability
 */
export const checkServiceAvailability = async () => {
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://54.242.81.107:8080';
    
    if (USE_MOCK) {
      return {
        available: true,
        status: 200,
        mode: 'mock',
        backend: 'local',
        geocoding: 'enabled',
        message: 'Using local mock data with geocoding service'
      };
    }
    
    const response = await fetch(`${apiUrl}/api/health`, {
      method: 'GET',
      timeout: 5000
    });
    
    return {
      available: response.ok,
      status: response.status,
      mode: 'real',
      backend: apiUrl,
      geocoding: 'not-needed',
      message: 'Using real backend with database coordinates'
    };
  } catch (error) {
    return {
      available: false,
      status: 0,
      mode: USE_MOCK ? 'mock' : 'real',
      backend: USE_MOCK ? 'local' : (process.env.REACT_APP_API_URL || 'http://54.242.81.107:8080'),
      geocoding: USE_MOCK ? 'enabled' : 'not-needed',
      error: error.message
    };
  }
};

/**
 * Get service configuration
 */
export const getServiceConfig = () => {
  return {
    mode: USE_MOCK ? 'mock' : 'real',
    apiUrl: USE_MOCK ? 'local' : (process.env.REACT_APP_API_URL || 'http://54.242.81.107:8080'),
    timeout: 30000,
    environment: process.env.NODE_ENV,
    geocoding: USE_MOCK ? 'enabled' : 'database-only',
    dataSource: USE_MOCK ? 'ICN JSON file' : 'Backend database',
    features: {
      onboarding: config.ENABLE_ONBOARDING,
      analytics: config.ENABLE_ANALYTICS,
      chat: config.ENABLE_CHAT
    }
  };
};

/**
 * Initialize services
 */
export const initializeServices = async () => {
  console.log('🚀 Initializing services...');
  
  if (USE_MOCK) {
    console.log('📁 Mock mode: Using local ICN data with geocoding service');
    
    // Initialize ICN data for mock mode
    if (icnDataService && !icnDataService.isDataLoaded()) {
      await icnDataService.loadData();
    }
    
    // Initialize geocoding cache for mock mode
    if (geocodingService.initCache) {
      await geocodingService.initCache();
    }
  } else {
    console.log('🌐 Real mode: Using backend database (coordinates included)');
    
    // Check backend availability
    const availability = await checkServiceAvailability();
    if (!availability.available) {
      console.error('⚠️ Backend service unavailable:', availability);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('💡 Consider using mock mode: REACT_APP_USE_MOCK=true');
      }
    }
  }
  
  console.log('✅ Services initialized successfully');
  return true;
};

// Export for debugging
export const isUsingMockServices = () => USE_MOCK;

// Default export
export default {
  getService,
  getAuthService,
  getCompanyService,
  getBookmarkService,
  getSavedSearchService,
  getSubscriptionService,
  getExportService,
  getAdminService,
  getGeocodingService,
  getICNDataService,
  getApiInstance,
  checkServiceAvailability,
  getServiceConfig,
  initializeServices,
  isUsingMockServices
};