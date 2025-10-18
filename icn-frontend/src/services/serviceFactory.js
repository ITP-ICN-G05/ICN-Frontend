import { config } from '../config/environment';

// Import your existing services
import api from './api';
import authService from './authService';
import { companyService } from './companyService';
import { bookmarkService } from './bookmarkService';
import { savedSearchService } from './savedSearchService';
import { subscriptionService } from './subscriptionService';
import { exportService } from './exportService';
import { adminService } from './adminService';
import geocodingService from './geocodingService';

// Import mock services
import { mockAuthService } from './mockAuthService';
import { mockCompanyService } from './mockCompanyService';
import { mockBookmarkService } from './mockBookmarkService';
import { mockSavedSearchService } from './mockSavedSearchService';
import { mockSubscriptionService } from './mockSubscriptionService';
import { mockExportService } from './mockExportService';
import { mockAdminService } from './mockAdminService';

const USE_MOCK = true;

export const getService = (serviceName) => {
  if (USE_MOCK) {
    const mockServices = {
      auth: mockAuthService,
      company: mockCompanyService,
      bookmark: mockBookmarkService,
      savedSearch: mockSavedSearchService,
      subscription: mockSubscriptionService,
      export: mockExportService,
      admin: mockAdminService,
      geocoding: geocodingService,
    };
    return mockServices[serviceName] || api;
  }
  
  // Return real services
  const realServices = {
    auth: authService,
    company: companyService,
    bookmark: bookmarkService,
    savedSearch: savedSearchService,
    subscription: subscriptionService,
    export: exportService,
    admin: adminService,
    geocoding: geocodingService,
  };
  
  return realServices[serviceName] || api;
};

// Export individual service getters for convenience
export const getAuthService = () => getService('auth');
export const getCompanyService = () => getService('company');
export const getBookmarkService = () => getService('bookmark');
export const getSavedSearchService = () => getService('savedSearch');
export const getSubscriptionService = () => getService('subscription');
export const getExportService = () => getService('export');
export const getAdminService = () => getService('admin');
export const getGeocodingService = () => getService('geocoding');
