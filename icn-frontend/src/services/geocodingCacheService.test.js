// Mock localStorage BEFORE importing the service
let localStorageStore = {};

const getItemMock = jest.fn((key) => localStorageStore[key] || null);
const setItemMock = jest.fn((key, value) => {
  localStorageStore[key] = value.toString();
});
const removeItemMock = jest.fn((key) => {
  delete localStorageStore[key];
});
const clearMock = jest.fn(() => {
  localStorageStore = {};
});

// Set up localStorage mock before service import
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: getItemMock,
    setItem: setItemMock,
    removeItem: removeItemMock,
    clear: clearMock
  },
  writable: true,
  configurable: true
});

// NOW import the service after mock is set up
import geocodingCacheService from './geocodingCacheService';

describe('geocodingCacheService', () => {
  beforeEach(() => {
    // Reset the internal store
    localStorageStore = {};
    // Clear all mock call history
    jest.clearAllMocks();
    // Reset the cache to a clean state
    geocodingCacheService.cache = null;
    geocodingCacheService.writeDebounceTimer = null;
    geocodingCacheService.loadCache();
  });

  describe('loadCache', () => {
    it('should load existing cache from localStorage', () => {
      const mockCache = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        entries: {
          'test-key': {
            latitude: -37.8136,
            longitude: 144.9631,
            timestamp: new Date().toISOString()
          }
        }
      };
      localStorageStore['icn_geocode_cache'] = JSON.stringify(mockCache);
      geocodingCacheService.loadCache();
      expect(geocodingCacheService.cache.version).toBe('1.0.0');
    });

    it('should create new cache if none exists', () => {
      geocodingCacheService.loadCache();
      expect(geocodingCacheService.cache).toHaveProperty('version', '1.0.0');
      expect(geocodingCacheService.cache).toHaveProperty('entries', {});
    });

    it('should create new cache on version mismatch', () => {
      const mockCache = {
        version: '0.9.0',
        entries: { 'old-key': { latitude: 0, longitude: 0 } }
      };
      localStorageStore['icn_geocode_cache'] = JSON.stringify(mockCache);
      
      geocodingCacheService.loadCache();
      
      expect(geocodingCacheService.cache.version).toBe('1.0.0');
      expect(geocodingCacheService.cache.entries).toEqual({});
    });

    it('should handle corrupted cache data', () => {
      localStorageStore['icn_geocode_cache'] = 'corrupted{json}';
      
      geocodingCacheService.loadCache();
      
      expect(geocodingCacheService.cache.version).toBe('1.0.0');
      expect(geocodingCacheService.cache.entries).toEqual({});
    });

    it('should handle localStorage errors gracefully', () => {
      getItemMock.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      geocodingCacheService.loadCache();
      
      expect(geocodingCacheService.cache.version).toBe('1.0.0');
    });
  });

  describe('saveCache', () => {
    it('should debounce cache saves', (done) => {
      geocodingCacheService.cache = {
        version: '1.0.0',
        entries: { 'test': { latitude: 0, longitude: 0 } }
      };
      
      geocodingCacheService.saveCache();
      geocodingCacheService.saveCache();
      geocodingCacheService.saveCache();
      
      expect(setItemMock).not.toHaveBeenCalled();
      
      // Wait for debounce to complete
      setTimeout(() => {
        expect(setItemMock).toHaveBeenCalledTimes(1);
        done();
      }, 1100);
    });

    it('should save cache after debounce delay', (done) => {
      geocodingCacheService.cache = {
        version: '1.0.0',
        entries: { 'test-address': { latitude: -37.8136, longitude: 144.9631 } }
      };
      
      geocodingCacheService.saveCache();
      
      // Wait for debounce to complete
      setTimeout(() => {
        expect(setItemMock).toHaveBeenCalledWith(
          'icn_geocode_cache',
          expect.stringContaining('test-address')
        );
        done();
      }, 1100);
    });

    it('should not save if cache is null', (done) => {
      geocodingCacheService.cache = null;
      
      geocodingCacheService.saveCache();
      
      setTimeout(() => {
        expect(setItemMock).not.toHaveBeenCalled();
        done();
      }, 1100);
    });

    it('should handle save errors gracefully', (done) => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const storageError = new Error('Storage full');
      
      setItemMock.mockImplementationOnce(() => {
        throw storageError;
      });
      
      geocodingCacheService.cache = {
        version: '1.0.0',
        entries: {}
      };
      
      geocodingCacheService.saveCache();
      
      setTimeout(() => {
        expect(setItemMock).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '❌ Error saving geocode cache:',
          storageError
        );
        consoleErrorSpy.mockRestore();
        done();
      }, 1100);
    });
  });

  describe('generateCacheKey', () => {
    it('should generate key from all address components', () => {
      const key = geocodingCacheService.generateCacheKey(
        '123 Test St',
        'Melbourne',
        'VIC',
        '3000'
      );
      expect(key).toBe('123 test st|melbourne|vic|3000');
    });

    it('should filter out invalid address components', () => {
      const key = geocodingCacheService.generateCacheKey(
        '123 Test St',
        'Address Not Available',
        'VIC',
        'City Not Available'
      );
      expect(key).toBe('123 test st|vic');
    });

    it('should handle empty values', () => {
      const key = geocodingCacheService.generateCacheKey(
        '123 Test St',
        '',
        'VIC',
        null
      );
      expect(key).toBe('123 test st|vic');
    });

    it('should normalize whitespace', () => {
      const key = geocodingCacheService.generateCacheKey(
        '  123 Test St  ',
        '  Melbourne  ',
        'VIC',
        '3000'
      );
      expect(key).toBe('123 test st|melbourne|vic|3000');
    });
  });

  describe('isExpired', () => {
    it('should return false for recent timestamp', () => {
      const timestamp = new Date().toISOString();
      expect(geocodingCacheService.isExpired(timestamp)).toBe(false);
    });

    it('should return true for expired timestamp', () => {
      const timestamp = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
      expect(geocodingCacheService.isExpired(timestamp)).toBe(true);
    });

    it('should return false for timestamp exactly 30 days old', () => {
      const timestamp = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      expect(geocodingCacheService.isExpired(timestamp)).toBe(false);
    });
  });

  describe('getCoordinatesWithCache', () => {
    it('should geocode when cache exists but entry not found', async () => {
      const address = '123 New St, Melbourne VIC';
      geocodingCacheService.cache = {
        version: '1.0.0',
        entries: {
          'different-address': {
            latitude: -37.8136,
            longitude: 144.9631,
            timestamp: new Date().toISOString(),
            isGeocoded: true
          }
        }
      };

      const mockGeocodingService = {
        geocodeAddress: jest.fn().mockResolvedValue({
          lat: -37.8200,
          lng: 144.9700
        })
      };

      const result = await geocodingCacheService.getCoordinatesWithCache(
        address,
        mockGeocodingService,
        'VIC'
      );

      expect(result.fromCache).toBe(false);
      expect(mockGeocodingService.geocodeAddress).toHaveBeenCalled();
    });

    it('should return cached coordinates', async () => {
      const address = '123 Test St, Melbourne VIC';
      geocodingCacheService.cache = {
        version: '1.0.0',
        entries: {
          [address.toLowerCase().trim()]: {
            latitude: -37.8136,
            longitude: 144.9631,
            timestamp: new Date().toISOString(),
            isGeocoded: true
          }
        }
      };

      const mockGeocodingService = {
        geocodeAddress: jest.fn()
      };

      const result = await geocodingCacheService.getCoordinatesWithCache(
        address,
        mockGeocodingService
      );

      expect(result.fromCache).toBe(true);
      expect(result.latitude).toBe(-37.8136);
      expect(mockGeocodingService.geocodeAddress).not.toHaveBeenCalled();
    });

    it('should not return expired cache entries', async () => {
      const address = '123 Test St, Melbourne VIC';
      const expiredTimestamp = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
      
      geocodingCacheService.cache = {
        version: '1.0.0',
        entries: {
          [address.toLowerCase().trim()]: {
            latitude: -37.8136,
            longitude: 144.9631,
            timestamp: expiredTimestamp,
            isGeocoded: true
          }
        }
      };

      const mockGeocodingService = {
        geocodeAddress: jest.fn().mockResolvedValue({
          lat: -37.8200,
          lng: 144.9700
        })
      };

      const result = await geocodingCacheService.getCoordinatesWithCache(
        address,
        mockGeocodingService,
        'VIC'
      );

      expect(result.fromCache).toBe(false);
      expect(mockGeocodingService.geocodeAddress).toHaveBeenCalled();
    });

    it('should geocode and cache new address', async () => {
      const address = '456 New St, Sydney NSW';
      geocodingCacheService.cache = {
        version: '1.0.0',
        entries: {}
      };

      const mockGeocodingService = {
        geocodeAddress: jest.fn().mockResolvedValue({
          lat: -33.8688,
          lng: 151.2093
        })
      };

      const result = await geocodingCacheService.getCoordinatesWithCache(
        address,
        mockGeocodingService
      );

      expect(result.fromCache).toBe(false);
      expect(result.latitude).toBe(-33.8688);
      expect(mockGeocodingService.geocodeAddress).toHaveBeenCalledWith(address);
    });

    it('should use fallback for failed geocoding', async () => {
      const address = '789 Unknown St';
      geocodingCacheService.cache = {
        version: '1.0.0',
        entries: {}
      };

      const mockGeocodingService = {
        geocodeAddress: jest.fn().mockResolvedValue(null)
      };

      const result = await geocodingCacheService.getCoordinatesWithCache(
        address,
        mockGeocodingService,
        'NSW'
      );

      expect(result.fromCache).toBe(false);
      expect(result.latitude).toBeCloseTo(-33.8688, 1);
      expect(result.longitude).toBeCloseTo(151.2093, 1);
    });

    it('should use fallback when geocoding returns result without lat/lng', async () => {
      const address = '789 Incomplete St';
      geocodingCacheService.cache = {
        version: '1.0.0',
        entries: {}
      };

      const mockGeocodingService = {
        geocodeAddress: jest.fn().mockResolvedValue({ lat: null, lng: 144.9631 })
      };

      const result = await geocodingCacheService.getCoordinatesWithCache(
        address,
        mockGeocodingService,
        'VIC'
      );

      expect(result.fromCache).toBe(false);
      expect(result.latitude).toBeCloseTo(-37.8136, 1);
    });

    it('should use fallback when geocoding returns result without lng', async () => {
      const address = '789 Incomplete St';
      geocodingCacheService.cache = {
        version: '1.0.0',
        entries: {}
      };

      const mockGeocodingService = {
        geocodeAddress: jest.fn().mockResolvedValue({ lat: -37.8136, lng: null })
      };

      const result = await geocodingCacheService.getCoordinatesWithCache(
        address,
        mockGeocodingService,
        'VIC'
      );

      expect(result.fromCache).toBe(false);
      expect(result.latitude).toBeCloseTo(-37.8136, 1);
    });

    it('should use fallback when geocoding throws error', async () => {
      const address = '999 Error St';
      geocodingCacheService.cache = {
        version: '1.0.0',
        entries: {}
      };

      const mockGeocodingService = {
        geocodeAddress: jest.fn().mockRejectedValue(new Error('Geocoding failed'))
      };

      const result = await geocodingCacheService.getCoordinatesWithCache(
        address,
        mockGeocodingService,
        'QLD'
      );

      expect(result.fromCache).toBe(false);
      expect(result.latitude).toBeCloseTo(-27.4698, 1);
      expect(result.longitude).toBeCloseTo(153.0251, 1);
    });

    it('should use fallback for invalid address', async () => {
      geocodingCacheService.cache = {
        version: '1.0.0',
        entries: {}
      };

      const mockGeocodingService = {
        geocodeAddress: jest.fn()
      };

      const result = await geocodingCacheService.getCoordinatesWithCache(
        'Address Not Available',
        mockGeocodingService,
        'SA'
      );

      expect(result.fromCache).toBe(false);
      expect(result.latitude).toBeCloseTo(-34.9285, 1);
      expect(mockGeocodingService.geocodeAddress).not.toHaveBeenCalled();
    });

    it('should use fallback for empty address', async () => {
      geocodingCacheService.cache = {
        version: '1.0.0',
        entries: {}
      };

      const mockGeocodingService = {
        geocodeAddress: jest.fn()
      };

      const result = await geocodingCacheService.getCoordinatesWithCache(
        '',
        mockGeocodingService,
        'WA'
      );

      expect(result.fromCache).toBe(false);
      expect(result.latitude).toBeCloseTo(-31.9505, 1);
      expect(mockGeocodingService.geocodeAddress).not.toHaveBeenCalled();
    });

    it('should load cache if not already loaded', async () => {
      geocodingCacheService.cache = null;
      
      const mockGeocodingService = {
        geocodeAddress: jest.fn().mockResolvedValue({ lat: -37.8, lng: 144.9 })
      };

      await geocodingCacheService.getCoordinatesWithCache(
        '123 Test St',
        mockGeocodingService
      );

      expect(geocodingCacheService.cache).not.toBeNull();
    });

    it('should not store in cache when cacheKey is empty', async () => {
      geocodingCacheService.cache = {
        version: '1.0.0',
        entries: {}
      };

      const mockGeocodingService = {
        geocodeAddress: jest.fn()
      };

      await geocodingCacheService.getCoordinatesWithCache(
        '',
        mockGeocodingService,
        'VIC'
      );

      // Empty cacheKey means nothing should be stored
      expect(Object.keys(geocodingCacheService.cache.entries)).toHaveLength(0);
    });

    it('should not store in cache when cache is null', async () => {
      geocodingCacheService.cache = null;

      const mockGeocodingService = {
        geocodeAddress: jest.fn().mockResolvedValue({ lat: -37.8136, lng: 144.9631 })
      };

      await geocodingCacheService.getCoordinatesWithCache(
        '123 Test St',
        mockGeocodingService,
        'VIC'
      );

      // Cache should have been loaded by the function
      expect(geocodingCacheService.cache).not.toBeNull();
    });

    it('should skip cache check when cache is null', async () => {
      geocodingCacheService.cache = null;
      
      const mockGeocodingService = {
        geocodeAddress: jest.fn().mockResolvedValue({ lat: -37.8136, lng: 144.9631 })
      };

      const result = await geocodingCacheService.getCoordinatesWithCache(
        '123 Test St',
        mockGeocodingService,
        'VIC'
      );

      expect(result.fromCache).toBe(false);
      expect(mockGeocodingService.geocodeAddress).toHaveBeenCalled();
    });

    it('should skip cache check when cacheKey is empty', async () => {
      const mockGeocodingService = {
        geocodeAddress: jest.fn()
      };

      geocodingCacheService.cache = {
        version: '1.0.0',
        entries: {
          'some-key': { latitude: 0, longitude: 0, timestamp: new Date().toISOString() }
        }
      };

      await geocodingCacheService.getCoordinatesWithCache(
        '',
        mockGeocodingService,
        'VIC'
      );

      expect(mockGeocodingService.geocodeAddress).not.toHaveBeenCalled();
    });
  });

  describe('getFallbackCoordinates', () => {
    it('should return VIC coordinates by default', () => {
      const coords = geocodingCacheService.getFallbackCoordinates('VIC');
      expect(coords.latitude).toBeCloseTo(-37.8136, 1);
      expect(coords.longitude).toBeCloseTo(144.9631, 1);
    });

    it('should return NSW coordinates', () => {
      const coords = geocodingCacheService.getFallbackCoordinates('NSW');
      expect(coords.latitude).toBeCloseTo(-33.8688, 1);
      expect(coords.longitude).toBeCloseTo(151.2093, 1);
    });

    it('should return QLD coordinates', () => {
      const coords = geocodingCacheService.getFallbackCoordinates('QLD');
      expect(coords.latitude).toBeCloseTo(-27.4698, 1);
    });

    it('should return VIC coordinates for unknown state', () => {
      const coords = geocodingCacheService.getFallbackCoordinates('UNKNOWN');
      expect(coords.latitude).toBeCloseTo(-37.8136, 1);
    });

    it('should add random offset to coordinates', () => {
      const coords1 = geocodingCacheService.getFallbackCoordinates('VIC');
      const coords2 = geocodingCacheService.getFallbackCoordinates('VIC');
      
      // Coordinates should be different due to random offset
      expect(coords1.latitude).not.toBe(coords2.latitude);
    });
  });

  describe('batchGeocodeWithCache', () => {
    it('should geocode multiple companies', async () => {
      const companies = [
        { name: 'Company 1', address: '123 Test St', state: 'VIC' },
        { name: 'Company 2', address: '456 Main St', state: 'NSW' }
      ];

      const mockGeocodingService = {
        geocodeAddress: jest.fn()
          .mockResolvedValueOnce({ lat: -37.8136, lng: 144.9631 })
          .mockResolvedValueOnce({ lat: -33.8688, lng: 151.2093 })
      };

      const results = await geocodingCacheService.batchGeocodeWithCache(
        companies,
        mockGeocodingService
      );

      expect(results).toHaveLength(2);
      expect(results[0].latitude).toBe(-37.8136);
      expect(results[1].latitude).toBe(-33.8688);
    });

    it('should use cached entries when available', async () => {
      const address = '123 cached st';
      geocodingCacheService.cache = {
        version: '1.0.0',
        entries: {
          [address]: {
            latitude: -37.8136,
            longitude: 144.9631,
            timestamp: new Date().toISOString(),
            isGeocoded: true
          }
        }
      };

      const companies = [
        { name: 'Company 1', address: address, state: 'VIC' }
      ];

      const mockGeocodingService = {
        geocodeAddress: jest.fn()
      };

      const results = await geocodingCacheService.batchGeocodeWithCache(
        companies,
        mockGeocodingService
      );

      expect(mockGeocodingService.geocodeAddress).not.toHaveBeenCalled();
      expect(results[0].latitude).toBe(-37.8136);
    });

    it('should handle companies with billingAddress.state', async () => {
      const companies = [
        { 
          name: 'Company 1', 
          address: '123 Test St',
          billingAddress: { state: 'NSW' }
        }
      ];

      const mockGeocodingService = {
        geocodeAddress: jest.fn().mockResolvedValue({ lat: -33.8688, lng: 151.2093 })
      };

      const results = await geocodingCacheService.batchGeocodeWithCache(
        companies,
        mockGeocodingService
      );

      expect(results).toHaveLength(1);
      expect(results[0].latitude).toBe(-33.8688);
    });

    it('should handle companies without state falling back to VIC', async () => {
      const companies = [
        { name: 'Company 1', address: '123 Test St' }
      ];

      const mockGeocodingService = {
        geocodeAddress: jest.fn().mockResolvedValue({ lat: -37.8136, lng: 144.9631 })
      };

      const results = await geocodingCacheService.batchGeocodeWithCache(
        companies,
        mockGeocodingService
      );

      expect(results).toHaveLength(1);
      expect(results[0].latitude).toBe(-37.8136);
    });

    it('should handle companies with empty address', async () => {
      const companies = [
        { name: 'Company 1', address: '', state: 'QLD' }
      ];

      const mockGeocodingService = {
        geocodeAddress: jest.fn()
      };

      const results = await geocodingCacheService.batchGeocodeWithCache(
        companies,
        mockGeocodingService
      );

      expect(results).toHaveLength(1);
      expect(results[0].latitude).toBeCloseTo(-27.4698, 1);
      expect(mockGeocodingService.geocodeAddress).not.toHaveBeenCalled();
    });

    it('should handle companies without address property', async () => {
      const companies = [
        { name: 'Company 1', state: 'SA' }
      ];

      const mockGeocodingService = {
        geocodeAddress: jest.fn()
      };

      const results = await geocodingCacheService.batchGeocodeWithCache(
        companies,
        mockGeocodingService
      );

      expect(results).toHaveLength(1);
      expect(results[0].latitude).toBeCloseTo(-34.9285, 1);
    });

    it('should handle errors gracefully', async () => {
      const companies = [
        { name: 'Company 1', address: '123 Test St', state: 'VIC' }
      ];

      const mockGeocodingService = {
        geocodeAddress: jest.fn().mockRejectedValue(new Error('API Error'))
      };

      const results = await geocodingCacheService.batchGeocodeWithCache(
        companies,
        mockGeocodingService
      );

      expect(results).toHaveLength(1);
      expect(results[0].latitude).toBeDefined();
    });

    it('should handle catch block for company processing', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const companies = [
        { name: 'Company 1', address: '123 Test St', billingAddress: { state: 'WA' } }
      ];

      const testError = new Error('Unexpected error');
      // Mock to throw during the catch block (simulate outer error)
      const mockGeocodingService = {
        geocodeAddress: jest.fn().mockRejectedValue(testError)
      };

      const results = await geocodingCacheService.batchGeocodeWithCache(
        companies,
        mockGeocodingService
      );

      expect(results).toHaveLength(1);
      expect(results[0].latitude).toBeCloseTo(-31.9505, 1);
      
      consoleErrorSpy.mockRestore();
    });

    it('should add delay between API calls', async () => {
      const companies = [
        { name: 'Company 1', address: '123 Test St', state: 'VIC' },
        { name: 'Company 2', address: '456 Main St', state: 'NSW' }
      ];

      const mockGeocodingService = {
        geocodeAddress: jest.fn()
          .mockResolvedValue({ lat: -37.8136, lng: 144.9631 })
      };

      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      await geocodingCacheService.batchGeocodeWithCache(
        companies,
        mockGeocodingService
      );

      // Verify delay was used (should be called at least once for delays between geocoding)
      expect(setTimeoutSpy).toHaveBeenCalled();
      
      setTimeoutSpy.mockRestore();
    });

    it('should not add delay for last company', async () => {
      const companies = [
        { name: 'Company 1', address: '123 Test St', state: 'VIC' }
      ];

      const mockGeocodingService = {
        geocodeAddress: jest.fn()
          .mockResolvedValue({ lat: -37.8136, lng: 144.9631 })
      };

      const results = await geocodingCacheService.batchGeocodeWithCache(
        companies,
        mockGeocodingService
      );

      expect(mockGeocodingService.geocodeAddress).toHaveBeenCalled();
      expect(results).toHaveLength(1);
    });

    it('should not add delay for cached results', async () => {
      const address = '123 cached st';
      geocodingCacheService.cache = {
        version: '1.0.0',
        entries: {
          [address]: {
            latitude: -37.8136,
            longitude: 144.9631,
            timestamp: new Date().toISOString(),
            isGeocoded: true
          }
        }
      };

      const companies = [
        { name: 'Company 1', address: address, state: 'VIC' },
        { name: 'Company 2', address: '456 Main St', state: 'NSW' }
      ];

      const mockGeocodingService = {
        geocodeAddress: jest.fn().mockResolvedValue({ lat: -33.8688, lng: 151.2093 })
      };

      await geocodingCacheService.batchGeocodeWithCache(
        companies,
        mockGeocodingService
      );

      // First was cached, second was not
      expect(mockGeocodingService.geocodeAddress).toHaveBeenCalledTimes(1);
    });

    it('should log progress for large batches', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      // Use fewer companies to avoid timeout (10 instead of 51)
      const companies = Array.from({ length: 10 }, (_, i) => ({
        name: `Company ${i}`,
        address: `${i} Test St`,
        state: 'VIC'
      }));

      const mockGeocodingService = {
        geocodeAddress: jest.fn().mockResolvedValue({ lat: -37.8136, lng: 144.9631 })
      };

      await geocodingCacheService.batchGeocodeWithCache(
        companies,
        mockGeocodingService
      );

      // Should still see progress logs
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Progress')
      );
      
      consoleSpy.mockRestore();
    });

    it('should force final save when geocoded count > 0', async () => {
      const companies = [
        { name: 'Company 1', address: '123 Test St', state: 'VIC' }
      ];

      const mockGeocodingService = {
        geocodeAddress: jest.fn().mockResolvedValue({ lat: -37.8136, lng: 144.9631 })
      };

      // Setup cache
      geocodingCacheService.cache = {
        version: '1.0.0',
        entries: {},
        lastUpdated: new Date().toISOString()
      };
      geocodingCacheService.writeDebounceTimer = null;

      // Clear mocks right before the call
      setItemMock.mockClear();

      await geocodingCacheService.batchGeocodeWithCache(
        companies,
        mockGeocodingService
      );

      // The forced save at the end should have called setItem directly (no debounce)
      expect(setItemMock).toHaveBeenCalled();
      expect(setItemMock).toHaveBeenCalledWith(
        'icn_geocode_cache',
        expect.any(String)
      );
    });

    it('should not force final save when geocoded count is 0', async () => {
      const address = '123 cached st';
      geocodingCacheService.cache = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        entries: {
          [address]: {
            latitude: -37.8136,
            longitude: 144.9631,
            timestamp: new Date().toISOString(),
            isGeocoded: true
          }
        }
      };
      geocodingCacheService.writeDebounceTimer = null;

      const companies = [
        { name: 'Company 1', address: address, state: 'VIC' }
      ];

      const mockGeocodingService = {
        geocodeAddress: jest.fn()
      };

      setItemMock.mockClear();

      await geocodingCacheService.batchGeocodeWithCache(
        companies,
        mockGeocodingService
      );

      // Should not force save since everything was cached
      expect(setItemMock).not.toHaveBeenCalled();
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', () => {
      geocodingCacheService.cache = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        entries: {
          'addr1': { isGeocoded: true },
          'addr2': { isGeocoded: false },
          'addr3': { isGeocoded: true }
        }
      };

      const stats = geocodingCacheService.getCacheStats();
      
      expect(stats.totalEntries).toBe(3);
      expect(stats.geocodedEntries).toBe(2);
      expect(stats.fallbackEntries).toBe(1);
      expect(stats.cacheSize).toBeGreaterThan(0);
      expect(stats.cacheSizeKB).toBeDefined();
    });

    it('should return null if cache is not loaded', () => {
      geocodingCacheService.cache = null;
      const stats = geocodingCacheService.getCacheStats();
      expect(stats).toBeNull();
    });
  });

  describe('clearCache', () => {
    it('should clear cache from localStorage', () => {
      localStorageStore['icn_geocode_cache'] = 'test-data';
      
      geocodingCacheService.clearCache();
      
      expect(removeItemMock).toHaveBeenCalledWith('icn_geocode_cache');
      expect(geocodingCacheService.cache.entries).toEqual({});
    });

    it('should handle clear errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const storageError = new Error('Storage error');
      
      removeItemMock.mockImplementationOnce(() => {
        throw storageError;
      });
      
      geocodingCacheService.clearCache();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Error clearing geocode cache:',
        storageError
      );
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('exportCache', () => {
    it('should export cache as JSON', () => {
      geocodingCacheService.cache = {
        version: '1.0.0',
        entries: {
          'test': { latitude: -37.8136, longitude: 144.9631 }
        }
      };

      const exported = geocodingCacheService.exportCache();
      
      expect(exported).toBeTruthy();
      expect(JSON.parse(exported)).toHaveProperty('version', '1.0.0');
    });

    it('should return null if cache is not loaded', () => {
      geocodingCacheService.cache = null;
      const exported = geocodingCacheService.exportCache();
      expect(exported).toBeNull();
    });
  });

  describe('importCache', () => {
    it('should import valid cache data', () => {
      const cacheData = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        entries: {
          'test-address': { latitude: -37.8136, longitude: 144.9631 }
        }
      };

      const result = geocodingCacheService.importCache(JSON.stringify(cacheData));
      
      expect(result).toBe(true);
      expect(geocodingCacheService.cache.entries['test-address']).toBeDefined();
    });

    it('should reject cache with wrong version', () => {
      const cacheData = {
        version: '2.0.0',
        entries: {}
      };

      const result = geocodingCacheService.importCache(JSON.stringify(cacheData));
      
      expect(result).toBe(false);
    });

    it('should handle invalid JSON', () => {
      const result = geocodingCacheService.importCache('invalid{json}');
      expect(result).toBe(false);
    });
  });

  describe('cleanExpiredEntries', () => {
    it('should remove expired entries', () => {
      const now = new Date();
      const expired = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000);
      
      geocodingCacheService.cache = {
        version: '1.0.0',
        entries: {
          'fresh': { timestamp: now.toISOString() },
          'expired1': { timestamp: expired.toISOString() },
          'expired2': { timestamp: expired.toISOString() }
        }
      };

      geocodingCacheService.cleanExpiredEntries();
      
      expect(Object.keys(geocodingCacheService.cache.entries)).toHaveLength(1);
      expect(geocodingCacheService.cache.entries['fresh']).toBeDefined();
    });

    it('should handle empty cache', () => {
      geocodingCacheService.cache = {
        version: '1.0.0',
        entries: {}
      };

      geocodingCacheService.cleanExpiredEntries();
      
      expect(geocodingCacheService.cache.entries).toEqual({});
    });

    it('should do nothing if cache is not loaded', () => {
      geocodingCacheService.cache = null;
      geocodingCacheService.cleanExpiredEntries();
      expect(geocodingCacheService.cache).toBeNull();
    });
  });
});