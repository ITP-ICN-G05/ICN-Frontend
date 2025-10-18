import { savedSearchService } from './savedSearchService';
import api from './api';

jest.mock('./api');

describe('savedSearchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSavedSearches', () => {
    it('should fetch saved searches', async () => {
      const searches = { data: [{ id: '1', name: 'My Search' }] };
      api.get.mockResolvedValue({ data: searches });

      const result = await savedSearchService.getSavedSearches();

      expect(api.get).toHaveBeenCalledWith('/saved-searches');
      expect(result).toEqual(searches);
    });
  });

  describe('saveSearch', () => {
    it('should save a new search', async () => {
      const searchData = { name: 'Test Search', query: 'test' };
      const saved = { data: { id: '1', ...searchData } };
      api.post.mockResolvedValue({ data: saved });

      const result = await savedSearchService.saveSearch(searchData);

      expect(api.post).toHaveBeenCalledWith('/saved-searches', searchData);
      expect(result).toEqual(saved);
    });
  });

  describe('updateSearch', () => {
    it('should update saved search', async () => {
      const updates = { name: 'Updated Search' };
      api.put.mockResolvedValue({ data: { id: '1', ...updates } });

      const result = await savedSearchService.updateSearch('1', updates);

      expect(api.put).toHaveBeenCalledWith('/saved-searches/1', updates);
    });
  });

  describe('deleteSearch', () => {
    it('should delete saved search', async () => {
      api.delete.mockResolvedValue({ data: { success: true } });

      const result = await savedSearchService.deleteSearch('1');

      expect(api.delete).toHaveBeenCalledWith('/saved-searches/1');
    });
  });

  describe('executeSearch', () => {
    it('should execute saved search', async () => {
      const searchResults = { data: { results: [] } };
      api.get.mockResolvedValue({ data: searchResults });

      const result = await savedSearchService.executeSearch('1');

      expect(api.get).toHaveBeenCalledWith('/saved-searches/1/execute');
    });
  });

  describe('toggleAlerts', () => {
    it('should toggle search alerts', async () => {
      api.patch.mockResolvedValue({ data: { enabled: true } });

      const result = await savedSearchService.toggleAlerts('1', true);

      expect(api.patch).toHaveBeenCalledWith('/saved-searches/1/alerts', { enabled: true });
    });
  });

  describe('getSearchQuota', () => {
    it('should fetch search quota', async () => {
      const quota = { data: { limit: 10, used: 3 } };
      api.get.mockResolvedValue({ data: quota });

      const result = await savedSearchService.getSearchQuota();

      expect(api.get).toHaveBeenCalledWith('/saved-searches/quota');
      expect(result).toEqual(quota);
    });
  });

  describe('getSearchStats', () => {
    it('should fetch search statistics', async () => {
      const stats = { data: { executions: 5, lastRun: '2025-01-01' } };
      api.get.mockResolvedValue({ data: stats });

      const result = await savedSearchService.getSearchStats('1');

      expect(api.get).toHaveBeenCalledWith('/saved-searches/1/stats');
      expect(result).toEqual(stats);
    });
  });
});