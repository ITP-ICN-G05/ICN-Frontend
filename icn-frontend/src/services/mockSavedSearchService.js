import { checkTierAccess, getTierLimit } from '../utils/tierConfig';
import { TIER_FEATURES, TIER_LIMITS } from '../utils/tierConfig';

class MockSavedSearchService {
  constructor() {
    this.savedSearches = new Map(); // userId -> array of saved searches
  }
  
  async getSavedSearches() {
    await this.delay(400);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      throw new Error('User not authenticated');
    }
    
    const searches = this.savedSearches.get(user.id) || [];
    
    return { data: searches };
  }
  
  async saveSearch(searchData) {
    await this.delay(500);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      throw new Error('User not authenticated');
    }
    
    // Check tier access
    if (!checkTierAccess(user.tier, TIER_FEATURES.SAVED_SEARCHES)) {
      throw new Error('Saved searches not available in free tier. Upgrade to Plus or Premium to save searches.');
    }
    
    const userSearches = this.savedSearches.get(user.id) || [];
    const limit = getTierLimit(user.tier, TIER_LIMITS.SAVED_SEARCH_LIMIT);
    
    if (limit > 0 && userSearches.length >= limit) {
      throw new Error(`Saved search limit reached (${limit} searches max). Upgrade to Premium for unlimited saved searches.`);
    }
    
    const newSearch = {
      id: 'search_' + Date.now(),
      name: searchData.name || `Search ${new Date().toLocaleDateString()}`,
      query: searchData.query || '',
      filters: searchData.filters || {},
      resultCount: searchData.resultCount || 0,
      userId: user.id,
      createdAt: new Date().toISOString(),
      lastExecuted: null,
      enableAlerts: false
    };
    
    userSearches.push(newSearch);
    this.savedSearches.set(user.id, userSearches);
    
    return { data: newSearch };
  }
  
  async updateSearch(id, searchData) {
    await this.delay(400);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userSearches = this.savedSearches.get(user.id) || [];
    
    const index = userSearches.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Saved search not found');
    }
    
    userSearches[index] = { ...userSearches[index], ...searchData };
    
    return { data: userSearches[index] };
  }
  
  async deleteSearch(id) {
    await this.delay(300);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userSearches = this.savedSearches.get(user.id) || [];
    
    const filtered = userSearches.filter(s => s.id !== id);
    this.savedSearches.set(user.id, filtered);
    
    return { success: true };
  }
  
  async executeSearch(id) {
    await this.delay(600);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userSearches = this.savedSearches.get(user.id) || [];
    
    const search = userSearches.find(s => s.id === id);
    if (!search) {
      throw new Error('Saved search not found');
    }
    
    // Update last executed time
    search.lastExecuted = new Date().toISOString();
    
    // Return redirect URL instead of executing search directly
    const params = new URLSearchParams();
    if (search.query) params.set('q', search.query);
    
    return {
      data: {
        redirectUrl: `/search?${params.toString()}`,
        searchParams: search.filters,
        query: search.query
      }
    };
  }
  
  async getSearchQuota() {
    await this.delay(200);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const limit = getTierLimit(user.tier, TIER_LIMITS.SAVED_SEARCH_LIMIT);
    const userSearches = this.savedSearches.get(user.id) || [];
    
    return {
      data: {
        used: userSearches.length,
        limit: limit,
        remaining: limit === -1 ? -1 : Math.max(0, limit - userSearches.length)
      }
    };
  }
  
  async toggleAlerts(id, enabled) {
    await this.delay(300);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userSearches = this.savedSearches.get(user.id) || [];
    
    const search = userSearches.find(s => s.id === id);
    if (!search) {
      throw new Error('Saved search not found');
    }
    
    search.enableAlerts = enabled;
    
    return { data: search };
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockSavedSearchService = new MockSavedSearchService();
