// Mock dependencies at the file level
jest.mock('./api');
jest.mock('./authService');
jest.mock('./companyService');
jest.mock('./bookmarkService');
jest.mock('./savedSearchService');
jest.mock('./subscriptionService');
jest.mock('./exportService');
jest.mock('./adminService');

import { mockAuthService } from './mockAuthService';
import { mockCompanyService } from './mockCompanyService';
import { mockBookmarkService } from './mockBookmarkService';
import { mockSavedSearchService } from './mockSavedSearchService';
import { mockSubscriptionService } from './mockSubscriptionService';
import { mockExportService } from './mockExportService';
import { mockAdminService } from './mockAdminService';
import geocodingService from './geocodingService';

describe('serviceFactory', () => {
  describe('with USE_MOCK = true (default)', () => {
    it('should return mock auth service', () => {
      delete process.env.REACT_APP_USE_MOCK;
      const { getService } = require('./serviceFactory');
      expect(getService('auth')).toBe(mockAuthService);
    });

    it('should return mock company service', () => {
      const { getService } = require('./serviceFactory');
      expect(getService('company')).toBe(mockCompanyService);
    });

    it('should return mock bookmark service', () => {
      const { getService } = require('./serviceFactory');
      expect(getService('bookmark')).toBe(mockBookmarkService);
    });

    it('should return mock saved search service', () => {
      const { getService } = require('./serviceFactory');
      expect(getService('savedSearch')).toBe(mockSavedSearchService);
    });

    it('should return mock subscription service', () => {
      const { getService } = require('./serviceFactory');
      expect(getService('subscription')).toBe(mockSubscriptionService);
    });

    it('should return mock export service', () => {
      const { getService } = require('./serviceFactory');
      expect(getService('export')).toBe(mockExportService);
    });

    it('should return mock admin service', () => {
      const { getService } = require('./serviceFactory');
      expect(getService('admin')).toBe(mockAdminService);
    });

    it('should return geocoding service', () => {
      const { getService } = require('./serviceFactory');
      expect(getService('geocoding')).toBe(geocodingService);
    });

    it('should return api for unknown service', () => {
      const { getService } = require('./serviceFactory');
      const api = require('./api').default;
      expect(getService('unknown')).toBe(api);
    });

    describe('convenience getters', () => {
      it('getAuthService should return auth service', () => {
        const { getAuthService } = require('./serviceFactory');
        expect(getAuthService()).toBe(mockAuthService);
      });

      it('getCompanyService should return company service', () => {
        const { getCompanyService } = require('./serviceFactory');
        expect(getCompanyService()).toBe(mockCompanyService);
      });

      it('getBookmarkService should return bookmark service', () => {
        const { getBookmarkService } = require('./serviceFactory');
        expect(getBookmarkService()).toBe(mockBookmarkService);
      });

      it('getSavedSearchService should return saved search service', () => {
        const { getSavedSearchService } = require('./serviceFactory');
        expect(getSavedSearchService()).toBe(mockSavedSearchService);
      });

      it('getSubscriptionService should return subscription service', () => {
        const { getSubscriptionService } = require('./serviceFactory');
        expect(getSubscriptionService()).toBe(mockSubscriptionService);
      });

      it('getExportService should return export service', () => {
        const { getExportService } = require('./serviceFactory');
        expect(getExportService()).toBe(mockExportService);
      });

      it('getAdminService should return admin service', () => {
        const { getAdminService } = require('./serviceFactory');
        expect(getAdminService()).toBe(mockAdminService);
      });

      it('getGeocodingService should return geocoding service', () => {
        const { getGeocodingService } = require('./serviceFactory');
        expect(getGeocodingService()).toBe(geocodingService);
      });
    });
  });

  describe('with USE_MOCK = false', () => {
    beforeAll(() => {
      process.env.REACT_APP_USE_MOCK = 'false';
      jest.resetModules();
    });

    afterAll(() => {
      delete process.env.REACT_APP_USE_MOCK;
      jest.resetModules();
    });

    it('should return real auth service', () => {
      const { getService } = require('./serviceFactory');
      const authService = require('./authService').default;
      expect(getService('auth')).toBe(authService);
    });

    it('should return real company service', () => {
      const { getService } = require('./serviceFactory');
      const { companyService } = require('./companyService');
      expect(getService('company')).toBe(companyService);
    });

    it('should return real bookmark service', () => {
      const { getService } = require('./serviceFactory');
      const { bookmarkService } = require('./bookmarkService');
      expect(getService('bookmark')).toBe(bookmarkService);
    });

    it('should return real saved search service', () => {
      const { getService } = require('./serviceFactory');
      const { savedSearchService } = require('./savedSearchService');
      expect(getService('savedSearch')).toBe(savedSearchService);
    });

    it('should return real subscription service', () => {
      const { getService } = require('./serviceFactory');
      const { subscriptionService } = require('./subscriptionService');
      expect(getService('subscription')).toBe(subscriptionService);
    });

    it('should return real export service', () => {
      const { getService } = require('./serviceFactory');
      const { exportService } = require('./exportService');
      expect(getService('export')).toBe(exportService);
    });

    it('should return real admin service', () => {
      const { getService } = require('./serviceFactory');
      const { adminService } = require('./adminService');
      expect(getService('admin')).toBe(adminService);
    });

    it('should return geocoding service', () => {
      const { getService } = require('./serviceFactory');
      const geocodingService = require('./geocodingService').default; // FIX: Import fresh
      expect(getService('geocoding')).toBe(geocodingService);
    });

    it('should return api for unknown service', () => {
      const { getService } = require('./serviceFactory');
      const api = require('./api').default;
      expect(getService('unknown')).toBe(api);
    });

    describe('convenience getters', () => {
      it('getAuthService should return real auth service', () => {
        const { getAuthService } = require('./serviceFactory');
        const authService = require('./authService').default;
        expect(getAuthService()).toBe(authService);
      });

      it('getCompanyService should return real company service', () => {
        const { getCompanyService } = require('./serviceFactory');
        const { companyService } = require('./companyService');
        expect(getCompanyService()).toBe(companyService);
      });

      it('getBookmarkService should return real bookmark service', () => {
        const { getBookmarkService } = require('./serviceFactory');
        const { bookmarkService } = require('./bookmarkService');
        expect(getBookmarkService()).toBe(bookmarkService);
      });

      it('getSavedSearchService should return real saved search service', () => {
        const { getSavedSearchService } = require('./serviceFactory');
        const { savedSearchService } = require('./savedSearchService');
        expect(getSavedSearchService()).toBe(savedSearchService);
      });

      it('getSubscriptionService should return real subscription service', () => {
        const { getSubscriptionService } = require('./serviceFactory');
        const { subscriptionService } = require('./subscriptionService');
        expect(getSubscriptionService()).toBe(subscriptionService);
      });

      it('getExportService should return real export service', () => {
        const { getExportService } = require('./serviceFactory');
        const { exportService } = require('./exportService');
        expect(getExportService()).toBe(exportService);
      });

      it('getAdminService should return real admin service', () => {
        const { getAdminService } = require('./serviceFactory');
        const { adminService } = require('./adminService');
        expect(getAdminService()).toBe(adminService);
      });

      it('getGeocodingService should return real geocoding service', () => {
        const { getGeocodingService } = require('./serviceFactory');
        const geocodingService = require('./geocodingService').default; // FIX: Import fresh
        expect(getGeocodingService()).toBe(geocodingService);
      });
    });
  });
});