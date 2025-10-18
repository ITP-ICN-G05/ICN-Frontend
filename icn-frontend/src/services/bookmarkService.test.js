import { bookmarkService } from './bookmarkService';
import api from './api';

jest.mock('./api');

describe('bookmarkService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserBookmarks', () => {
    it('should fetch user bookmarks', async () => {
      const mockBookmarks = { data: [{ id: '1', name: 'Test Co' }] };
      api.get.mockResolvedValue(mockBookmarks);

      const result = await bookmarkService.getUserBookmarks();

      expect(api.get).toHaveBeenCalledWith('/bookmarks');
      expect(result).toEqual(mockBookmarks);
    });
  });

  describe('addBookmark', () => {
    it('should add a bookmark', async () => {
      const mockResponse = { data: { success: true } };
      api.post.mockResolvedValue(mockResponse);

      const result = await bookmarkService.addBookmark('company123');

      expect(api.post).toHaveBeenCalledWith('/bookmarks', { companyId: 'company123' });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('removeBookmark', () => {
    it('should remove a bookmark', async () => {
      const mockResponse = { data: { success: true } };
      api.delete.mockResolvedValue(mockResponse);

      const result = await bookmarkService.removeBookmark('company123');

      expect(api.delete).toHaveBeenCalledWith('/bookmarks/company123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('isBookmarked', () => {
    it('should check if company is bookmarked', async () => {
      const mockResponse = { data: true };
      api.get.mockResolvedValue(mockResponse);

      const result = await bookmarkService.isBookmarked('company123');

      expect(api.get).toHaveBeenCalledWith('/bookmarks/check/company123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getBookmarkStats', () => {
    it('should fetch bookmark statistics', async () => {
      const mockStats = { data: { total: 5, limit: 10 } };
      api.get.mockResolvedValue(mockStats);

      const result = await bookmarkService.getBookmarkStats();

      expect(api.get).toHaveBeenCalledWith('/bookmarks/stats');
      expect(result).toEqual(mockStats);
    });
  });
});