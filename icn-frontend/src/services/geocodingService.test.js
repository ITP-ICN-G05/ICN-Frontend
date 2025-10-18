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
      // Suppress expected console.error
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
      // Suppress expected console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch.mockResolvedValue({
        json: async () => ({ status: 'OVER_QUERY_LIMIT' })
      });

      await expect(
        geocodingService.geocodeAddress('test')
      ).rejects.toThrow('Geocoding quota exceeded');

      consoleErrorSpy.mockRestore();
    });

    it('should handle missing API key', async () => {
      // Suppress expected console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Temporarily remove the API key from the instance
      const originalKey = geocodingService.apiKey;
      geocodingService.apiKey = undefined;

      await expect(
        geocodingService.geocodeAddress('test')
      ).rejects.toThrow('Google Maps API key not configured');

      // Restore the key
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
  });

  describe('calculateDistance', () => {
    it('should calculate distance between coordinates', () => {
      const coord1 = { lat: -37.8136, lng: 144.9631 };
      const coord2 = { lat: -37.8240, lng: 144.9755 };
      
      const distance = geocodingService.calculateDistance(coord1, coord2);
      
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(2);
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
  });
});