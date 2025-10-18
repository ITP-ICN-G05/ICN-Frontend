// src/services/geocodingCacheService.js
// Geocoding cache service - converted from React Native to Web

const CACHE_KEY = 'icn_geocode_cache';
const CACHE_VERSION = '1.0.0';
const CACHE_EXPIRY_DAYS = 30; // Re-geocode after 30 days

class GeocodingCacheService {
  constructor() {
    this.cache = null;
    this.pendingWrites = new Set();
    this.writeDebounceTimer = null;
    this.loadCache();
  }
  
  /**
   * Load cache from localStorage
   */
  loadCache() {
    try {
      const cacheData = localStorage.getItem(CACHE_KEY);
      if (cacheData) {
        const parsedCache = JSON.parse(cacheData);
        
        // Check version compatibility
        if (parsedCache.version === CACHE_VERSION) {
          this.cache = parsedCache;
          console.log(`✅ Loaded geocode cache with ${Object.keys(parsedCache.entries).length} entries`);
        } else {
          console.log('⚠️ Cache version mismatch, creating new cache');
          this.cache = this.createEmptyCache();
        }
      } else {
        console.log('📦 No geocode cache found, creating new one');
        this.cache = this.createEmptyCache();
      }
    } catch (error) {
      console.error('❌ Error loading geocode cache:', error);
      this.cache = this.createEmptyCache();
    }
  }
  
  /**
   * Create empty cache structure
   */
  createEmptyCache() {
    return {
      version: CACHE_VERSION,
      lastUpdated: new Date().toISOString(),
      entries: {}
    };
  }
  
  /**
   * Save cache to localStorage (debounced)
   */
  saveCache() {
    // Debounce writes to avoid excessive storage operations
    if (this.writeDebounceTimer) {
      clearTimeout(this.writeDebounceTimer);
    }
    
    this.writeDebounceTimer = setTimeout(() => {
      try {
        if (this.cache) {
          this.cache.lastUpdated = new Date().toISOString();
          localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
          console.log(`💾 Saved geocode cache with ${Object.keys(this.cache.entries).length} entries`);
        }
      } catch (error) {
        console.error('❌ Error saving geocode cache:', error);
      }
    }, 1000); // Save after 1 second of inactivity
  }
  
  /**
   * Generate cache key from address components
   */
  generateCacheKey(street, city, state, postcode) {
    // Create a normalized key from address components
    const parts = [street, city, state, postcode]
      .filter(part => part && part !== 'Address Not Available' && part !== 'City Not Available')
      .map(part => part.trim().toLowerCase());
    
    return parts.join('|');
  }
  
  /**
   * Check if cache entry is expired
   */
  isExpired(timestamp) {
    const entryDate = new Date(timestamp);
    const now = new Date();
    const daysDiff = (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff > CACHE_EXPIRY_DAYS;
  }
  
  /**
   * Get coordinates with caching
   * @param {string} address - Full address string
   * @param {object} geocodingService - Your geocoding service instance
   * @param {string} state - State for fallback coordinates
   * @returns {Promise<{latitude: number, longitude: number, fromCache: boolean}>}
   */
  async getCoordinatesWithCache(address, geocodingService, state = 'VIC') {
    // Ensure cache is loaded
    if (!this.cache) {
      this.loadCache();
    }
    
    // Use address as cache key
    const cacheKey = address.toLowerCase().trim();
    
    // Check cache
    if (this.cache && cacheKey) {
      const cachedEntry = this.cache.entries[cacheKey];
      
      if (cachedEntry && !this.isExpired(cachedEntry.timestamp)) {
        console.log(`💾 Cache HIT: ${address.substring(0, 40)}...`);
        return {
          latitude: cachedEntry.latitude,
          longitude: cachedEntry.longitude,
          fromCache: true
        };
      }
    }
    
    // Not in cache - geocode it
    let result = { latitude: null, longitude: null };
    let isGeocoded = false;
    
    if (address && address !== 'Address Not Available') {
      try {
        console.log(`🔍 Geocoding: ${address.substring(0, 40)}...`);
        const geocodeResult = await geocodingService.geocodeAddress(address);
        
        if (geocodeResult && geocodeResult.lat && geocodeResult.lng) {
          result = { latitude: geocodeResult.lat, longitude: geocodeResult.lng };
          isGeocoded = true;
        } else {
          // Geocoding failed, use fallback
          console.warn(`⚠️ Geocoding failed for ${address.substring(0, 40)}..., using fallback`);
          result = this.getFallbackCoordinates(state);
        }
      } catch (error) {
        console.warn(`⚠️ Geocoding error for ${address.substring(0, 40)}..., using fallback:`, error.message);
        result = this.getFallbackCoordinates(state);
      }
    } else {
      // No valid address, use fallback
      result = this.getFallbackCoordinates(state);
    }
    
    // Store in cache
    if (this.cache && cacheKey) {
      this.cache.entries[cacheKey] = {
        address: address,
        latitude: result.latitude,
        longitude: result.longitude,
        timestamp: new Date().toISOString(),
        isGeocoded
      };
      
      // Save cache (debounced)
      this.saveCache();
    }
    
    return {
      ...result,
      fromCache: false
    };
  }
  
  /**
   * Get fallback coordinates based on state
   */
  getFallbackCoordinates(state) {
    const stateCoordinates = {
      'VIC': { latitude: -37.8136, longitude: 144.9631 },
      'NSW': { latitude: -33.8688, longitude: 151.2093 },
      'QLD': { latitude: -27.4698, longitude: 153.0251 },
      'SA': { latitude: -34.9285, longitude: 138.6007 },
      'WA': { latitude: -31.9505, longitude: 115.8605 },
      'NT': { latitude: -12.4634, longitude: 130.8456 },
      'TAS': { latitude: -42.8821, longitude: 147.3272 },
      'ACT': { latitude: -35.2809, longitude: 149.1300 }
    };
    
    const coords = stateCoordinates[state] || stateCoordinates['VIC'];
    
    // Add small random offset
    return {
      latitude: coords.latitude + (Math.random() - 0.5) * 0.1,
      longitude: coords.longitude + (Math.random() - 0.5) * 0.1
    };
  }
  
  /**
   * Batch geocode with caching
   * @param {Array} companies - Array of company objects with address property
   * @param {object} geocodingService - Your geocoding service instance
   * @returns {Promise<Array>} Array of companies with coordinates
   */
  async batchGeocodeWithCache(companies, geocodingService) {
    const results = [];
    let geocodedCount = 0;
    let cachedCount = 0;
    
    console.log(`\n🚀 Starting batch geocoding for ${companies.length} companies...`);
    
    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      
      try {
        const result = await this.getCoordinatesWithCache(
          company.address || '',
          geocodingService,
          company.billingAddress?.state || company.state || 'VIC'
        );
        
        const updatedCompany = {
          ...company,
          latitude: result.latitude,
          longitude: result.longitude,
          position: {
            lat: result.latitude,
            lng: result.longitude
          }
        };
        
        results.push(updatedCompany);
        
        if (result.fromCache) {
          cachedCount++;
        } else {
          geocodedCount++;
        }
        
        // Log progress every 50 addresses
        if ((i + 1) % 50 === 0 || i === companies.length - 1) {
          console.log(`📍 Progress: ${i + 1}/${companies.length} (${cachedCount} cached, ${geocodedCount} geocoded)`);
        }
        
        // Add delay between API calls to avoid rate limiting
        if (!result.fromCache && i < companies.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
        }
      } catch (error) {
        console.error(`❌ Error processing ${company.name}:`, error);
        // Add with fallback coordinates
        results.push({
          ...company,
          ...this.getFallbackCoordinates(company.billingAddress?.state || 'VIC'),
          position: {
            lat: -37.8136 + (Math.random() - 0.5) * 0.1,
            lng: 144.9631 + (Math.random() - 0.5) * 0.1
          }
        });
      }
    }
    
    console.log(`\n✅ Batch geocoding complete!`);
    console.log(`   💾 ${cachedCount} from cache (instant)`);
    console.log(`   🌐 ${geocodedCount} geocoded (API calls)`);
    console.log(`   ⏱️ Saved ~${(geocodedCount * 0.2).toFixed(1)}s by using cache\n`);
    
    // Force final save
    if (geocodedCount > 0 && this.cache) {
      clearTimeout(this.writeDebounceTimer);
      this.cache.lastUpdated = new Date().toISOString();
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
    }
    
    return results;
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    if (!this.cache) return null;
    
    const entries = Object.values(this.cache.entries);
    const geocodedEntries = entries.filter(e => e.isGeocoded).length;
    const fallbackEntries = entries.filter(e => !e.isGeocoded).length;
    
    return {
      totalEntries: entries.length,
      geocodedEntries,
      fallbackEntries,
      cacheSize: JSON.stringify(this.cache).length,
      cacheSizeKB: (JSON.stringify(this.cache).length / 1024).toFixed(2),
      lastUpdated: this.cache.lastUpdated
    };
  }
  
  /**
   * Clear the cache
   */
  clearCache() {
    try {
      localStorage.removeItem(CACHE_KEY);
      this.cache = this.createEmptyCache();
      console.log('🗑️ Geocode cache cleared');
    } catch (error) {
      console.error('❌ Error clearing geocode cache:', error);
    }
  }
  
  /**
   * Export cache to JSON (for debugging or backup)
   */
  exportCache() {
    if (!this.cache) return null;
    return JSON.stringify(this.cache, null, 2);
  }
  
  /**
   * Import cache from JSON
   */
  importCache(jsonData) {
    try {
      const parsedCache = JSON.parse(jsonData);
      if (parsedCache.version === CACHE_VERSION) {
        this.cache = parsedCache;
        this.saveCache();
        console.log(`✅ Imported ${Object.keys(parsedCache.entries).length} cache entries`);
        return true;
      } else {
        console.error('❌ Cache version mismatch during import');
        return false;
      }
    } catch (error) {
      console.error('❌ Error importing cache:', error);
      return false;
    }
  }
  
  /**
   * Remove expired entries
   */
  cleanExpiredEntries() {
    if (!this.cache) return;
    
    const entries = this.cache.entries;
    let removedCount = 0;
    
    Object.keys(entries).forEach(key => {
      if (this.isExpired(entries[key].timestamp)) {
        delete entries[key];
        removedCount++;
      }
    });
    
    if (removedCount > 0) {
      this.saveCache();
      console.log(`🧹 Removed ${removedCount} expired cache entries`);
    }
  }
}

// Create and export singleton instance
const geocodingCacheService = new GeocodingCacheService();

// Make it accessible from browser console for debugging
if (typeof window !== 'undefined') {
  window.geocodingCache = geocodingCacheService;
}

export default geocodingCacheService;