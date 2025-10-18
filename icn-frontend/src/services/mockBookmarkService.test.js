import { mockBookmarkService } from './mockBookmarkService';

describe('mockBookmarkService', () => {
  beforeEach(() => {
    localStorage.clear();
    mockBookmarkService.bookmarks.clear(); // CHANGED: Use .clear() instead of = new Map()
    
    // CHANGED: Setup mock user with 'free' tier instead of 'plus'
    const user = { id: '1', tier: 'free' };
    localStorage.setItem('user', JSON.stringify(user));
  });

  describe('getUserBookmarks', () => {
    it('should return empty array for new user', async () => {
      const result = await mockBookmarkService.getUserBookmarks();
      expect(result.data).toEqual([]);
    });

    it('should require authentication', async () => {
      localStorage.clear();
      
      await expect(
        mockBookmarkService.getUserBookmarks()
      ).rejects.toThrow('User not authenticated');
    });
  });

  describe('addBookmark', () => {
    it('should add bookmark for authenticated user', async () => {
      const result = await mockBookmarkService.addBookmark('company123');
      
      expect(result.success).toBe(true);
    });

    it('should enforce tier limits', async () => {
      // REMOVED: const user = { id: '1', tier: 'free' }; (already set in beforeEach)
      // REMOVED: localStorage.setItem('user', JSON.stringify(user));
      
      // Free tier limit is 5
      for (let i = 0; i < 5; i++) {
        await mockBookmarkService.addBookmark(`company${i}`);
      }
      
      await expect(
        mockBookmarkService.addBookmark('company6')
      ).rejects.toThrow('Bookmark limit reached');
    });

    // MAJOR CHANGES IN THIS TEST:
    it('should allow unlimited bookmarks for premium', async () => {
      const user = { id: '1', tier: 'premium' };
      localStorage.setItem('user', JSON.stringify(user));
      
      // CHANGED: Reduced from 100 to 12 to stay under 5s timeout (12 × 300ms + 300ms = ~4s)
      // CHANGED: Use unique prefix 'premium_company' instead of 'company'
      for (let i = 0; i < 12; i++) {
        const result = await mockBookmarkService.addBookmark(`premium_company${i}`);
        expect(result.success).toBe(true);
      }
      
      // ADDED: Verify the results
      const stats = await mockBookmarkService.getBookmarkStats();
      expect(stats.data.total).toBe(12);
      expect(stats.data.limit).toBe(-1); // -1 indicates unlimited
    });
  });

  describe('removeBookmark', () => {
    it('should remove bookmark', async () => {
      await mockBookmarkService.addBookmark('company123');
      const result = await mockBookmarkService.removeBookmark('company123');
      
      expect(result.success).toBe(true);
    });
  });

  describe('isBookmarked', () => {
    it('should check if bookmarked', async () => {
      await mockBookmarkService.addBookmark('company123');
      
      const result = await mockBookmarkService.isBookmarked('company123');
      expect(result.data).toBe(true);
    });

    it('should return false for non-bookmarked', async () => {
      const result = await mockBookmarkService.isBookmarked('company999');
      expect(result.data).toBe(false);
    });
  });

  describe('getBookmarkStats', () => {
    it('should return bookmark statistics', async () => {
      // CHANGED: Use unique prefix 'stats_company' to avoid conflicts
      await mockBookmarkService.addBookmark('stats_company1');
      await mockBookmarkService.addBookmark('stats_company2');
      
      const result = await mockBookmarkService.getBookmarkStats();
      
      expect(result.data.total).toBe(2);
      // CHANGED: Expect specific value 5 (free tier limit) instead of just > 0
      expect(result.data.limit).toBe(5);
      // ADDED: Also check remaining count
      expect(result.data.remaining).toBe(3);
    });
  });
});