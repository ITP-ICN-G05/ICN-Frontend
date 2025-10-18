import geocodingCacheService from './geocodingCacheService';

describe('geocodingCacheService', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('loadCache', () => {
    it('should load existing cache from localStorage', () => {
      const mockCache = {
        version: '1.0.0',
        entries: {
          'test-key': {
            latitude: -37.8136,
            longitude: 144.9631,
            timestamp: new Date().toISOString()
          }
        }
      };

      localStorage.setItem('icn_geocode_cache', JSON.stringify(mockCache));

      geocodingCacheService.loadCache();

      expect(geocodingCacheService.cache).toEqual(mockCache);
    });

    it('should create new cache if none exists', () => {
      geocodingCacheService.loadCache();

      expect(geocodingCacheService.cache).toHaveProperty('version', '1.0.0');
      expect(geocodingCacheService.cache).toHaveProperty('entries', {});
    });
  });

  describe('getCoordinatesWithCache', () => {
    it('should return cached coordinates', async () => {
      const address = '123 Test St, Melbourne VIC';
      const mockCache = {
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

      localStorage.setItem('icn_geocode_cache', JSON.stringify(mockCache));
      geocodingCacheService.loadCache();

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
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', () => {
      geocodingCacheService.cache = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        entries: {
          'addr1': { isGeocoded: true },
          'addr2': { isGeocoded: false }
        }
      };

      const stats = geocodingCacheService.getCacheStats();

      expect(stats.totalEntries).toBe(2);
      expect(stats.geocodedEntries).toBe(1);
      expect(stats.fallbackEntries).toBe(1);
    });
  });

  describe('clearCache', () => {
    it('should clear cache', () => {
      localStorage.setItem('icn_geocode_cache', 'test');
      
      geocodingCacheService.clearCache();

      expect(localStorage.getItem('icn_geocode_cache')).toBeNull();
    });
  });
});