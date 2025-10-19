import geocodingService from './geocodingService';

describe('geocodingService', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    process.env.REACT_APP_GOOGLE_MAPS_KEY = 'test-api-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('geocodeAddress', () => {
    it('should geocode an address successfully', async () => {
      const mockResponse = {
        status: 'OK',
        results: [{
          geometry: { location: { lat: -37.8136, lng: 144.9631 } },
          formatted_address: '123 Test St, Melbourne VIC 3000'
        }]
      };

      global.fetch.mockResolvedValue({
        json: async () => mockResponse
      });

      const result = await geocodingService.geocodeAddress('123 Test St');
      
      expect(result).toEqual({
        lat: -37.8136,
        lng: 144.9631,
        formattedAddress: '123 Test St, Melbourne VIC 3000'
      });
    });

    it('should handle ZERO_RESULTS', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch.mockResolvedValue({
        json: async () => ({ status: 'ZERO_RESULTS' })
      });

      await expect(
        geocodingService.geocodeAddress('invalid address')
      ).rejects.toThrow('Address not found');

      consoleErrorSpy.mockRestore();
    });

    it('should handle OVER_QUERY_LIMIT', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch.mockResolvedValue({
        json: async () => ({ status: 'OVER_QUERY_LIMIT' })
      });

      await expect(
        geocodingService.geocodeAddress('test')
      ).rejects.toThrow('Geocoding quota exceeded');

      consoleErrorSpy.mockRestore();
    });

    it('should handle REQUEST_DENIED', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch.mockResolvedValue({
        json: async () => ({ status: 'REQUEST_DENIED' })
      });

      await expect(
        geocodingService.geocodeAddress('test')
      ).rejects.toThrow('Geocoding API request denied. Check your API key and restrictions.');

      consoleErrorSpy.mockRestore();
    });

    it('should handle INVALID_REQUEST', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch.mockResolvedValue({
        json: async () => ({ status: 'INVALID_REQUEST' })
      });

      await expect(
        geocodingService.geocodeAddress('test')
      ).rejects.toThrow('Invalid geocoding request');

      consoleErrorSpy.mockRestore();
    });

    it('should handle unknown status codes', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch.mockResolvedValue({
        json: async () => ({ status: 'UNKNOWN_ERROR' })
      });

      await expect(
        geocodingService.geocodeAddress('test')
      ).rejects.toThrow('Geocoding failed: UNKNOWN_ERROR');

      consoleErrorSpy.mockRestore();
    });

    it('should handle missing API key', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const originalKey = geocodingService.apiKey;
      geocodingService.apiKey = undefined;

      await expect(
        geocodingService.geocodeAddress('test')
      ).rejects.toThrow('Google Maps API key not configured');

      geocodingService.apiKey = originalKey;
      consoleErrorSpy.mockRestore();
    });
  });

  describe('reverseGeocode', () => {
    it('should reverse geocode coordinates', async () => {
      const mockResponse = {
        status: 'OK',
        results: [{
          formatted_address: '123 Test St, Melbourne VIC 3000',
          address_components: []
        }]
      };

      global.fetch.mockResolvedValue({
        json: async () => mockResponse
      });

      const result = await geocodingService.reverseGeocode(-37.8136, 144.9631);
      
      expect(result).toEqual({
        address: '123 Test St, Melbourne VIC 3000',
        components: []
      });
    });

    it('should handle missing API key in reverse geocode', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const originalKey = geocodingService.apiKey;
      geocodingService.apiKey = undefined;

      await expect(
        geocodingService.reverseGeocode(-37.8136, 144.9631)
      ).rejects.toThrow('Google Maps API key not configured');

      geocodingService.apiKey = originalKey;
      consoleErrorSpy.mockRestore();
    });

    it('should handle reverse geocode errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch.mockResolvedValue({
        json: async () => ({ status: 'ZERO_RESULTS' })
      });

      await expect(
        geocodingService.reverseGeocode(-37.8136, 144.9631)
      ).rejects.toThrow('Reverse geocoding failed');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('geocodeBatch', () => {
    it('should batch geocode multiple addresses', async () => {
      const mockResponse = {
        status: 'OK',
        results: [{
          geometry: { location: { lat: -37.8136, lng: 144.9631 } },
          formatted_address: '123 Test St, Melbourne VIC 3000'
        }]
      };

      global.fetch.mockResolvedValue({
        json: async () => mockResponse
      });

      const addresses = ['123 Test St', '456 Main St'];
      const results = await geocodingService.geocodeBatch(addresses);
      
      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[0].lat).toBe(-37.8136);
      expect(results[0].lng).toBe(144.9631);
      expect(results[1].success).toBe(true);
    });

    it('should handle batch geocoding failures gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch
        .mockResolvedValueOnce({
          json: async () => ({ 
            status: 'OK', 
            results: [{ 
              geometry: { location: { lat: -37.8136, lng: 144.9631 } },
              formatted_address: '123 Test St'
            }]
          })
        })
        .mockResolvedValueOnce({
          json: async () => ({ status: 'ZERO_RESULTS' })
        });

      const results = await geocodingService.geocodeBatch(['valid', 'invalid']);
      
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBeDefined();

      consoleErrorSpy.mockRestore();
    });

    it('should handle empty address array', async () => {
      const results = await geocodingService.geocodeBatch([]);
      
      expect(results).toHaveLength(0);
      expect(results).toEqual([]);
    });

    it('should process multiple addresses with delays', async () => {
      const mockResponse = {
        status: 'OK',
        results: [{
          geometry: { location: { lat: -37.8136, lng: 144.9631 } },
          formatted_address: '123 Test St'
        }]
      };

      global.fetch.mockResolvedValue({
        json: async () => mockResponse
      });

      const startTime = Date.now();
      const results = await geocodingService.geocodeBatch(['addr1', 'addr2', 'addr3']);
      const duration = Date.now() - startTime;
      
      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);
      // Should have delays between requests (at least 100ms for 2 delays)
      expect(duration).toBeGreaterThan(50);
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between coordinates', () => {
      const coord1 = { lat: -37.8136, lng: 144.9631 };
      const coord2 = { lat: -37.8240, lng: 144.9755 };
      
      const distance = geocodingService.calculateDistance(coord1, coord2);
      
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(2);
    });

    it('should return 0 for same coordinates', () => {
      const coord = { lat: -37.8136, lng: 144.9631 };
      
      const distance = geocodingService.calculateDistance(coord, coord);
      
      expect(distance).toBe(0);
    });
  });

  describe('getCurrentLocation', () => {
    it('should get current location', async () => {
      const mockGeolocation = {
        getCurrentPosition: jest.fn((success) => {
          success({
            coords: {
              latitude: -37.8136,
              longitude: 144.9631
            }
          });
        })
      };

      global.navigator.geolocation = mockGeolocation;

      const result = await geocodingService.getCurrentLocation();
      
      expect(result).toEqual({
        lat: -37.8136,
        lng: 144.9631
      });
    });

    it('should handle geolocation not supported', async () => {
      global.navigator.geolocation = undefined;

      await expect(
        geocodingService.getCurrentLocation()
      ).rejects.toThrow('Geolocation not supported');
    });

    it('should handle geolocation errors', async () => {
      const mockGeolocation = {
        getCurrentPosition: jest.fn((success, error) => {
          error(new Error('Permission denied'));
        })
      };

      global.navigator.geolocation = mockGeolocation;

      await expect(
        geocodingService.getCurrentLocation()
      ).rejects.toThrow('Permission denied');
    });
  });
});