import { mockSavedSearchService } from './mockSavedSearchService';

describe('mockSavedSearchService', () => {
  beforeEach(() => {
    localStorage.clear();
    mockSavedSearchService.savedSearches = new Map();
    
    // Mock delay to speed up all tests
    mockSavedSearchService.delay = () => Promise.resolve();
    
    const user = { id: '1', tier: 'plus' };
    localStorage.setItem('user', JSON.stringify(user));
  });

  describe('getSavedSearches', () => {
    it('should return empty array for new user', async () => {
      const result = await mockSavedSearchService.getSavedSearches();
      expect(result.data).toEqual([]);
    });

    it('should require authentication', async () => {
      localStorage.clear();
      
      await expect(
        mockSavedSearchService.getSavedSearches()
      ).rejects.toThrow('User not authenticated');
    });
  });

  describe('saveSearch', () => {
    it('should save search for plus tier', async () => {
      const searchData = {
        name: 'My Search',
        query: 'test',
        filters: { sector: 'Technology' }
      };
      
      const result = await mockSavedSearchService.saveSearch(searchData);
      
      expect(result.data.name).toBe('My Search');
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('createdAt');
    });

    it('should reject for free tier', async () => {
      const user = { id: '1', tier: 'free' };
      localStorage.setItem('user', JSON.stringify(user));
      
      await expect(
        mockSavedSearchService.saveSearch({ name: 'Test' })
      ).rejects.toThrow('not available in free tier');
    });

    it('should enforce tier limits', async () => {
      const user = { id: '1', tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user));
      
      // Plus tier limit is 10
      for (let i = 0; i < 10; i++) {
        await mockSavedSearchService.saveSearch({ name: `Search ${i}` });
      }
      
      await expect(
        mockSavedSearchService.saveSearch({ name: 'Search 11' })
      ).rejects.toThrow('Saved search limit reached');
    });

    it('should generate default name when name not provided', async () => {
      const result = await mockSavedSearchService.saveSearch({
        query: 'test'
      });
      
      expect(result.data.name).toMatch(/^Search \d/);
    });

    it('should use default values for optional fields', async () => {
      const result = await mockSavedSearchService.saveSearch({
        name: 'Minimal Search'
      });
      
      expect(result.data.query).toBe('');
      expect(result.data.filters).toEqual({});
      expect(result.data.resultCount).toBe(0);
      expect(result.data.enableAlerts).toBe(false);
      expect(result.data.lastExecuted).toBe(null);
    });

    it('should require authentication for saving', async () => {
      localStorage.clear();
      
      await expect(
        mockSavedSearchService.saveSearch({ name: 'Test' })
      ).rejects.toThrow('User not authenticated');
    });

    it('should include userId in saved search', async () => {
      const result = await mockSavedSearchService.saveSearch({
        name: 'User Test',
        query: 'test'
      });
      
      expect(result.data.userId).toBe('1');
    });
  });

  describe('updateSearch', () => {
    it('should update saved search', async () => {
      const search = await mockSavedSearchService.saveSearch({ name: 'Original' });
      const result = await mockSavedSearchService.updateSearch(search.data.id, { name: 'Updated' });
      
      expect(result.data.name).toBe('Updated');
    });

    it('should throw error for invalid id', async () => {
      await expect(
        mockSavedSearchService.updateSearch('invalid-id', { name: 'Test' })
      ).rejects.toThrow('Saved search not found');
    });

    it('should preserve unchanged fields when updating', async () => {
      const search = await mockSavedSearchService.saveSearch({ 
        name: 'Original',
        query: 'test query',
        filters: { sector: 'Tech' }
      });
      
      const result = await mockSavedSearchService.updateSearch(search.data.id, { 
        name: 'Updated' 
      });
      
      expect(result.data.name).toBe('Updated');
      expect(result.data.query).toBe('test query');
      expect(result.data.filters).toEqual({ sector: 'Tech' });
    });
  });

  describe('deleteSearch', () => {
    it('should delete saved search', async () => {
      const search = await mockSavedSearchService.saveSearch({ name: 'To Delete' });
      const result = await mockSavedSearchService.deleteSearch(search.data.id);
      
      expect(result.success).toBe(true);
      
      const searches = await mockSavedSearchService.getSavedSearches();
      expect(searches.data.length).toBe(0);
    });

    it('should handle deleting non-existent search gracefully', async () => {
      const result = await mockSavedSearchService.deleteSearch('non-existent-id');
      
      expect(result.success).toBe(true);
    });

    it('should only delete specified search', async () => {
      // Save 3 searches
      await mockSavedSearchService.saveSearch({ name: 'Search 1' });
      const search2 = await mockSavedSearchService.saveSearch({ name: 'Search 2' });
      await mockSavedSearchService.saveSearch({ name: 'Search 3' });
      
      // Delete the middle one
      await mockSavedSearchService.deleteSearch(search2.data.id);
      
      // Check that only 2 remain and Search 2 is gone
      const searches = await mockSavedSearchService.getSavedSearches();
      expect(searches.data.length).toBe(2);
      expect(searches.data.find(s => s.name === 'Search 2')).toBeUndefined();
      expect(searches.data.find(s => s.name === 'Search 1')).toBeDefined();
      expect(searches.data.find(s => s.name === 'Search 3')).toBeDefined();
    });
  });

  describe('executeSearch', () => {
    it('should execute saved search', async () => {
      const searchData = {
        name: 'Execute Test',
        query: 'technology'
      };
      
      const search = await mockSavedSearchService.saveSearch(searchData);
      const result = await mockSavedSearchService.executeSearch(search.data.id);
      
      expect(result.data).toHaveProperty('redirectUrl');
      expect(result.data.query).toBe('technology');
      expect(result.data.redirectUrl).toContain('q=technology');
    });

    it('should handle search without query parameter', async () => {
      const searchData = {
        name: 'No Query Test',
        query: '',
        filters: { sector: 'Tech' }
      };
      
      const search = await mockSavedSearchService.saveSearch(searchData);
      const result = await mockSavedSearchService.executeSearch(search.data.id);
      
      expect(result.data.redirectUrl).toBe('/search?');
      expect(result.data.query).toBe('');
    });

    it('should throw error when executing non-existent search', async () => {
      await expect(
        mockSavedSearchService.executeSearch('invalid-id')
      ).rejects.toThrow('Saved search not found');
    });

    it('should update lastExecuted timestamp', async () => {
      const search = await mockSavedSearchService.saveSearch({ 
        name: 'Timestamp Test',
        query: 'test'
      });
      
      expect(search.data.lastExecuted).toBe(null);
      
      await mockSavedSearchService.executeSearch(search.data.id);
      
      const searches = await mockSavedSearchService.getSavedSearches();
      const executedSearch = searches.data.find(s => s.id === search.data.id);
      
      expect(executedSearch.lastExecuted).not.toBe(null);
      expect(executedSearch.lastExecuted).toBeTruthy();
    });

    it('should return search filters in result', async () => {
      const searchData = {
        name: 'Filter Test',
        query: 'test',
        filters: { sector: 'Technology', location: 'US' }
      };
      
      const search = await mockSavedSearchService.saveSearch(searchData);
      const result = await mockSavedSearchService.executeSearch(search.data.id);
      
      expect(result.data.searchParams).toEqual({ sector: 'Technology', location: 'US' });
    });
  });

  describe('getSearchQuota', () => {
    it('should return search quota', async () => {
      const result = await mockSavedSearchService.getSearchQuota();
      
      expect(result.data).toHaveProperty('used');
      expect(result.data).toHaveProperty('limit');
      expect(result.data).toHaveProperty('remaining');
    });

    it('should calculate correct quota values', async () => {
      await mockSavedSearchService.saveSearch({ name: 'Search 1' });
      await mockSavedSearchService.saveSearch({ name: 'Search 2' });
      await mockSavedSearchService.saveSearch({ name: 'Search 3' });
      
      const result = await mockSavedSearchService.getSearchQuota();
      
      expect(result.data.used).toBe(3);
      expect(result.data.limit).toBe(10); // Plus tier limit
      expect(result.data.remaining).toBe(7);
    });

    it('should handle unlimited quota for premium tier', async () => {
      const user = { id: '1', tier: 'premium' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockSavedSearchService.getSearchQuota();
      
      expect(result.data.limit).toBe(-1);
      expect(result.data.remaining).toBe(-1);
    });

    it('should return zero remaining when limit reached', async () => {
      const user = { id: '1', tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user));
      
      // Create 10 searches (plus tier limit)
      for (let i = 0; i < 10; i++) {
        await mockSavedSearchService.saveSearch({ name: `Search ${i}` });
      }
      
      const result = await mockSavedSearchService.getSearchQuota();
      
      expect(result.data.used).toBe(10);
      expect(result.data.remaining).toBe(0);
    });
  });

  describe('toggleAlerts', () => {
    it('should toggle alerts for search', async () => {
      const search = await mockSavedSearchService.saveSearch({ name: 'Alert Test' });
      const result = await mockSavedSearchService.toggleAlerts(search.data.id, true);
      
      expect(result.data.enableAlerts).toBe(true);
    });

    it('should throw error when toggling alerts for non-existent search', async () => {
      await expect(
        mockSavedSearchService.toggleAlerts('invalid-id', true)
      ).rejects.toThrow('Saved search not found');
    });

    it('should toggle alerts to false', async () => {
      const search = await mockSavedSearchService.saveSearch({ name: 'Alert Test' });
      
      await mockSavedSearchService.toggleAlerts(search.data.id, true);
      const result = await mockSavedSearchService.toggleAlerts(search.data.id, false);
      
      expect(result.data.enableAlerts).toBe(false);
    });

    it('should persist alert state', async () => {
      const search = await mockSavedSearchService.saveSearch({ name: 'Alert Test' });
      await mockSavedSearchService.toggleAlerts(search.data.id, true);
      
      const searches = await mockSavedSearchService.getSavedSearches();
      const updatedSearch = searches.data.find(s => s.id === search.data.id);
      
      expect(updatedSearch.enableAlerts).toBe(true);
    });
  });

  describe('user isolation', () => {
    it('should isolate searches between different users', async () => {
      const user1 = { id: '1', tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user1));
      
      await mockSavedSearchService.saveSearch({ name: 'User 1 Search' });
      
      const user2 = { id: '2', tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user2));
      
      const result = await mockSavedSearchService.getSavedSearches();
      expect(result.data.length).toBe(0);
    });

    it('should not allow updating another users search', async () => {
      const user1 = { id: '1', tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user1));
      
      const search = await mockSavedSearchService.saveSearch({ name: 'User 1 Search' });
      
      const user2 = { id: '2', tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user2));
      
      await expect(
        mockSavedSearchService.updateSearch(search.data.id, { name: 'Hacked' })
      ).rejects.toThrow('Saved search not found');
    });
  });
});