import { mockBookmarkService } from './mockBookmarkService';

describe('mockBookmarkService', () => {
  beforeEach(() => {
    localStorage.clear();
    mockBookmarkService.bookmarks.clear();
    
    // Setup mock user with 'free' tier
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

    it('should handle errors loading bookmarked companies', async () => {
      // Mock the company service to throw an error
      const { mockCompanyService } = await import('./mockCompanyService');
      const originalGetById = mockCompanyService.getById;
      mockCompanyService.getById = jest.fn().mockRejectedValue(new Error('Company not found'));
      
      await mockBookmarkService.addBookmark('invalid_company');
      const result = await mockBookmarkService.getUserBookmarks();
      
      // Should return empty array and log error, not throw
      expect(result.data).toEqual([]);
      
      // Restore
      mockCompanyService.getById = originalGetById;
    });
  });

  describe('addBookmark', () => {
    it('should add bookmark for authenticated user', async () => {
      const result = await mockBookmarkService.addBookmark('company123');
      
      expect(result.success).toBe(true);
    });

    it('should require authentication', async () => {
      localStorage.clear();
      
      await expect(
        mockBookmarkService.addBookmark('company123')
      ).rejects.toThrow('User not authenticated');
    });

    it('should enforce tier limits', async () => {
      // Free tier limit is 5
      for (let i = 0; i < 5; i++) {
        await mockBookmarkService.addBookmark(`company${i}`);
      }
      
      await expect(
        mockBookmarkService.addBookmark('company6')
      ).rejects.toThrow('Bookmark limit reached');
    });

    it('should allow bookmark when at limit minus one', async () => {
      // Add 4 bookmarks (free tier limit is 5)
      for (let i = 0; i < 4; i++) {
        await mockBookmarkService.addBookmark(`company${i}`);
      }
      
      // 5th should work
      const result = await mockBookmarkService.addBookmark('company4');
      expect(result.success).toBe(true);
      
      // 6th should fail
      await expect(
        mockBookmarkService.addBookmark('company5')
      ).rejects.toThrow('Bookmark limit reached');
    });

    it('should allow unlimited bookmarks for premium', async () => {
      const user = { id: '1', tier: 'premium' };
      localStorage.setItem('user', JSON.stringify(user));
      
      // Add 12 bookmarks to test unlimited tier
      for (let i = 0; i < 12; i++) {
        const result = await mockBookmarkService.addBookmark(`premium_company${i}`);
        expect(result.success).toBe(true);
      }
      
      // Verify the results
      const stats = await mockBookmarkService.getBookmarkStats();
      expect(stats.data.total).toBe(12);
      expect(stats.data.limit).toBe(-1); // -1 indicates unlimited
      expect(stats.data.remaining).toBe(-1); // unlimited remaining
    });

    it('should not create duplicate bookmarks', async () => {
      await mockBookmarkService.addBookmark('company123');
      await mockBookmarkService.addBookmark('company123'); // Same ID
      
      const stats = await mockBookmarkService.getBookmarkStats();
      expect(stats.data.total).toBe(1); // Should still be 1, not 2
    });
  });

  describe('removeBookmark', () => {
    it('should remove bookmark', async () => {
      await mockBookmarkService.addBookmark('company123');
      const result = await mockBookmarkService.removeBookmark('company123');
      
      expect(result.success).toBe(true);
      
      // Verify it's actually removed
      const isBookmarked = await mockBookmarkService.isBookmarked('company123');
      expect(isBookmarked.data).toBe(false);
    });

    it('should handle removing bookmark when user has none', async () => {
      const result = await mockBookmarkService.removeBookmark('company999');
      expect(result.success).toBe(true); // Should succeed silently
    });

    it('should require authentication', async () => {
      localStorage.clear();
      
      await expect(
        mockBookmarkService.removeBookmark('company123')
      ).rejects.toThrow('User not authenticated');
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

    it('should return false when not authenticated', async () => {
      localStorage.clear();
      const result = await mockBookmarkService.isBookmarked('company123');
      expect(result.data).toBe(false);
    });
  });

  describe('getBookmarkStats', () => {
    it('should return bookmark statistics', async () => {
      await mockBookmarkService.addBookmark('stats_company1');
      await mockBookmarkService.addBookmark('stats_company2');
      
      const result = await mockBookmarkService.getBookmarkStats();
      
      expect(result.data.total).toBe(2);
      expect(result.data.limit).toBe(5); // Free tier limit
      expect(result.data.remaining).toBe(3); // 5 - 2 = 3
    });

    it('should return unlimited stats for premium tier', async () => {
      const user = { id: '1', tier: 'premium' };
      localStorage.setItem('user', JSON.stringify(user));
      
      await mockBookmarkService.addBookmark('premium1');
      await mockBookmarkService.addBookmark('premium2');
      
      const result = await mockBookmarkService.getBookmarkStats();
      
      expect(result.data.total).toBe(2);
      expect(result.data.limit).toBe(-1); // Unlimited
      expect(result.data.remaining).toBe(-1); // Unlimited
    });

    it('should show zero remaining when at limit', async () => {
      // Add 5 bookmarks (free tier limit)
      for (let i = 0; i < 5; i++) {
        await mockBookmarkService.addBookmark(`limit_company${i}`);
      }
      
      const result = await mockBookmarkService.getBookmarkStats();
      
      expect(result.data.total).toBe(5);
      expect(result.data.limit).toBe(5);
      expect(result.data.remaining).toBe(0);
    });

    it('should require authentication', async () => {
      localStorage.clear();
      
      await expect(
        mockBookmarkService.getBookmarkStats()
      ).rejects.toThrow('User not authenticated');
    });
  });
});