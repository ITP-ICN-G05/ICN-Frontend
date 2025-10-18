// src/services/geocodingService.js
// Real Google Maps Geocoding Service

class GeocodingService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  }

  /**
   * Geocode an address to get latitude and longitude
   * @param {string} address - The address to geocode
   * @returns {Promise<{lat: number, lng: number}>}
   */
  async geocodeAddress(address) {
    try {
      if (!this.apiKey) {
        throw new Error('Google Maps API key not configured');
      }

      const url = `${this.baseUrl}?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        // FIX: Add [0] to access first result in array
        const location = data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng,
          formattedAddress: data.results[0].formatted_address
        };
      } else if (data.status === 'ZERO_RESULTS') {
        throw new Error('Address not found');
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        throw new Error('Geocoding quota exceeded');
      } else if (data.status === 'REQUEST_DENIED') {
        throw new Error('Geocoding API request denied. Check your API key and restrictions.');
      } else if (data.status === 'INVALID_REQUEST') {
        throw new Error('Invalid geocoding request');
      } else {
        throw new Error(`Geocoding failed: ${data.status}`);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to get an address
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<string>}
   */
  async reverseGeocode(lat, lng) {
    try {
      if (!this.apiKey) {
        throw new Error('Google Maps API key not configured');
      }

      const url = `${this.baseUrl}?latlng=${lat},${lng}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        // FIX: Add [0] to access first result in array
        return {
          address: data.results[0].formatted_address,
          components: data.results[0].address_components
        };
      } else {
        throw new Error(`Reverse geocoding failed: ${data.status}`);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }

  /**
   * Batch geocode multiple addresses (with rate limiting)
   * @param {string[]} addresses - Array of addresses to geocode
   * @returns {Promise<Array<{address: string, lat: number, lng: number}>>}
   */
  async geocodeBatch(addresses) {
    const results = [];
    
    for (let i = 0; i < addresses.length; i++) {
      try {
        // Add delay to respect API rate limits (50 requests per second)
        if (i > 0) {
          await this.delay(50); // 50ms delay between requests
        }
        
        const coords = await this.geocodeAddress(addresses[i]);
        results.push({
          address: addresses[i],
          ...coords,
          success: true
        });
      } catch (error) {
        results.push({
          address: addresses[i],
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * @param {object} coord1 - {lat, lng}
   * @param {object} coord2 - {lat, lng}
   * @returns {number} Distance in kilometers
   */
  calculateDistance(coord1, coord2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(coord2.lat - coord1.lat);
    const dLng = this.toRad(coord2.lng - coord1.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(coord1.lat)) * 
      Math.cos(this.toRad(coord2.lat)) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get user's current location
   * @returns {Promise<{lat: number, lng: number}>}
   */
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  }
}

export const geocodingService = new GeocodingService();
export default geocodingService;