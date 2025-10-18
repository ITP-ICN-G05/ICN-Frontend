import { checkTierAccess, getTierLimit } from '../utils/tierConfig';
import { TIER_FEATURES, TIER_LIMITS } from '../utils/tierConfig';

class MockBookmarkService {
  constructor() {
    this.bookmarks = new Map(); // userId -> Set of companyIds
  }
  
  async getUserBookmarks() {
    await this.delay(400);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      throw new Error('User not authenticated');
    }
    
    const userBookmarks = this.bookmarks.get(user.id) || new Set();
    
    // Get full company data for bookmarks
    const { mockCompanyService } = await import('./mockCompanyService');
    const companies = [];
    
    for (const companyId of userBookmarks) {
      try {
        const company = await mockCompanyService.getById(companyId);
        companies.push(company);
      } catch (err) {
        console.error('Failed to load bookmarked company:', companyId);
      }
    }
    
    return { data: companies };
  }
  
  async addBookmark(companyId) {
    await this.delay(300);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      throw new Error('User not authenticated');
    }
    
    // Check tier access and limits
    const userBookmarks = this.bookmarks.get(user.id) || new Set();
    const limit = getTierLimit(user.tier, TIER_LIMITS.BOOKMARK_LIMIT);
    
    if (limit > 0 && userBookmarks.size >= limit) {
      throw new Error(`Bookmark limit reached (${limit} bookmarks max). Upgrade your plan to bookmark more companies.`);
    }
    
    if (!this.bookmarks.has(user.id)) {
      this.bookmarks.set(user.id, new Set());
    }
    
    this.bookmarks.get(user.id).add(companyId);
    
    return { success: true };
  }
  
  async removeBookmark(companyId) {
    await this.delay(300);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      throw new Error('User not authenticated');
    }
    
    if (this.bookmarks.has(user.id)) {
      this.bookmarks.get(user.id).delete(companyId);
    }
    
    return { success: true };
  }
  
  async isBookmarked(companyId) {
    await this.delay(200);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      return { data: false };
    }
    
    const userBookmarks = this.bookmarks.get(user.id) || new Set();
    return { data: userBookmarks.has(companyId) };
  }
  
  async getBookmarkStats() {
    await this.delay(300);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      throw new Error('User not authenticated');
    }
    
    const userBookmarks = this.bookmarks.get(user.id) || new Set();
    const limit = getTierLimit(user.tier, TIER_LIMITS.BOOKMARK_LIMIT);
    
    return {
      data: {
        total: userBookmarks.size,
        limit: limit,
        remaining: limit === -1 ? -1 : Math.max(0, limit - userBookmarks.size)
      }
    };
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockBookmarkService = new MockBookmarkService();
