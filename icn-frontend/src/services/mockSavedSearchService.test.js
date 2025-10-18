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
  });

  describe('deleteSearch', () => {
    it('should delete saved search', async () => {
      const search = await mockSavedSearchService.saveSearch({ name: 'To Delete' });
      const result = await mockSavedSearchService.deleteSearch(search.data.id);
      
      expect(result.success).toBe(true);
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
    });
  });

  describe('getSearchQuota', () => {
    it('should return search quota', async () => {
      const result = await mockSavedSearchService.getSearchQuota();
      
      expect(result.data).toHaveProperty('used');
      expect(result.data).toHaveProperty('limit');
      expect(result.data).toHaveProperty('remaining');
    });
  });

  describe('toggleAlerts', () => {
    it('should toggle alerts for search', async () => {
      const search = await mockSavedSearchService.saveSearch({ name: 'Alert Test' });
      const result = await mockSavedSearchService.toggleAlerts(search.data.id, true);
      
      expect(result.data.enableAlerts).toBe(true);
    });
  });
});