import { 
    getService, 
    getAuthService, 
    getCompanyService,
    getBookmarkService,
    getSavedSearchService,
    getSubscriptionService,
    getExportService,
    getAdminService,
    getGeocodingService
  } from './serviceFactory';
  import { mockAuthService } from './mockAuthService';
  import { mockCompanyService } from './mockCompanyService';
  import { mockBookmarkService } from './mockBookmarkService';
  import { mockSavedSearchService } from './mockSavedSearchService';
  import { mockSubscriptionService } from './mockSubscriptionService';
  import { mockExportService } from './mockExportService';
  import { mockAdminService } from './mockAdminService';
  import geocodingService from './geocodingService';
  
  describe('serviceFactory', () => {
    describe('getService', () => {
      it('should return auth service', () => {
        const service = getService('auth');
        expect(service).toBe(mockAuthService);
      });
  
      it('should return company service', () => {
        const service = getService('company');
        expect(service).toBe(mockCompanyService);
      });
  
      it('should return bookmark service', () => {
        const service = getService('bookmark');
        expect(service).toBe(mockBookmarkService);
      });
  
      it('should return saved search service', () => {
        const service = getService('savedSearch');
        expect(service).toBe(mockSavedSearchService);
      });
  
      it('should return subscription service', () => {
        const service = getService('subscription');
        expect(service).toBe(mockSubscriptionService);
      });
  
      it('should return export service', () => {
        const service = getService('export');
        expect(service).toBe(mockExportService);
      });
  
      it('should return admin service', () => {
        const service = getService('admin');
        expect(service).toBe(mockAdminService);
      });
  
      it('should return geocoding service', () => {
        const service = getService('geocoding');
        expect(service).toBe(geocodingService);
      });
    });
  
    describe('convenience getters', () => {
      it('getAuthService should return auth service', () => {
        expect(getAuthService()).toBe(mockAuthService);
      });
  
      it('getCompanyService should return company service', () => {
        expect(getCompanyService()).toBe(mockCompanyService);
      });
  
      it('getBookmarkService should return bookmark service', () => {
        expect(getBookmarkService()).toBe(mockBookmarkService);
      });
  
      it('getSavedSearchService should return saved search service', () => {
        expect(getSavedSearchService()).toBe(mockSavedSearchService);
      });
  
      it('getSubscriptionService should return subscription service', () => {
        expect(getSubscriptionService()).toBe(mockSubscriptionService);
      });
  
      it('getExportService should return export service', () => {
        expect(getExportService()).toBe(mockExportService);
      });
  
      it('getAdminService should return admin service', () => {
        expect(getAdminService()).toBe(mockAdminService);
      });
  
      it('getGeocodingService should return geocoding service', () => {
        expect(getGeocodingService()).toBe(geocodingService);
      });
    });
  });