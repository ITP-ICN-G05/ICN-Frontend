import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';

// Create mock functions for the bookmark service
const mockGetUserBookmarks = jest.fn();
const mockAddBookmark = jest.fn();
const mockRemoveBookmark = jest.fn();

// Mock the entire serviceFactory module
jest.mock('../services/serviceFactory', () => ({
  getBookmarkService: () => ({
    getUserBookmarks: mockGetUserBookmarks,
    addBookmark: mockAddBookmark,
    removeBookmark: mockRemoveBookmark,
  }),
}));

// Import AFTER mocking
import { BookmarkProvider, useBookmarks } from './BookmarkContext';

describe('BookmarkContext', () => {
  let localStorageMock;

  beforeEach(() => {
    // Clear mock call history
    mockGetUserBookmarks.mockClear();
    mockAddBookmark.mockClear();
    mockRemoveBookmark.mockClear();

    // Mock localStorage
    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn(),
    };
    global.localStorage = localStorageMock;
  });

  const wrapper = ({ children }) => <BookmarkProvider>{children}</BookmarkProvider>;

  describe('useBookmarks hook', () => {
    it('should throw error when used outside BookmarkProvider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      expect(() => {
        renderHook(() => useBookmarks());
      }).toThrow('useBookmarks must be used within BookmarkProvider');
      
      consoleSpy.mockRestore();
    });

    it('should provide bookmark context when used within provider', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ id: 1, tier: 'free' }));
      mockGetUserBookmarks.mockResolvedValue({ data: [] });

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current).toHaveProperty('bookmarks');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('addBookmark');
      expect(result.current).toHaveProperty('removeBookmark');
      expect(result.current).toHaveProperty('isBookmarked');
      expect(result.current).toHaveProperty('getBookmarkCount');
      expect(result.current).toHaveProperty('reloadBookmarks');
    });
  });

  describe('loadBookmarks', () => {
    it('should load bookmarks on mount when user exists', async () => {
      const mockBookmarks = [
        { id: 1, name: 'Company A' },
        { id: 2, name: 'Company B' },
      ];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ id: 1, tier: 'free' }));
      mockGetUserBookmarks.mockResolvedValue({ data: mockBookmarks });

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.bookmarks).toEqual(mockBookmarks);
      expect(mockGetUserBookmarks).toHaveBeenCalledTimes(1);
    });

    it('should handle response without data wrapper', async () => {
      const mockBookmarks = [{ id: 1, name: 'Company A' }];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ id: 1, tier: 'free' }));
      mockGetUserBookmarks.mockResolvedValue(mockBookmarks);

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => expect(result.current.bookmarks).toEqual(mockBookmarks));
    });

    it('should set empty array when no user in localStorage', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => expect(result.current.bookmarks).toEqual([]));

      expect(mockGetUserBookmarks).not.toHaveBeenCalled();
    });

    it('should handle loading error', async () => {
      const errorMessage = 'Failed to load bookmarks';
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockRejectedValue(new Error(errorMessage));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => expect(result.current.error).toBe(errorMessage));

      expect(result.current.bookmarks).toEqual([]);
      expect(result.current.loading).toBe(false);
      consoleSpy.mockRestore();
    });

    it('should handle non-array response', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: null });

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => expect(result.current.bookmarks).toEqual([]));
    });
  });

  describe('addBookmark', () => {
    it('should add bookmark successfully', async () => {
      const company = { id: 3, name: 'Company C' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: [] });
      mockAddBookmark.mockResolvedValue({});

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      let success;
      await act(async () => {
        success = await result.current.addBookmark(company);
      });

      expect(success).toBe(true);
      expect(result.current.bookmarks).toContainEqual(company);
      expect(mockAddBookmark).toHaveBeenCalledWith(3);
    });

    it('should handle add bookmark error', async () => {
      const company = { id: 3, name: 'Company C' };
      const errorMessage = 'Failed to add bookmark';
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: [] });
      mockAddBookmark.mockRejectedValue(new Error(errorMessage));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      await expect(act(async () => {
        await result.current.addBookmark(company);
      })).rejects.toThrow(errorMessage);

      expect(result.current.error).toBe(errorMessage);
      consoleSpy.mockRestore();
    });
  });

  describe('removeBookmark', () => {
    it('should remove bookmark successfully', async () => {
      const mockBookmarks = [
        { id: 1, name: 'Company A' },
        { id: 2, name: 'Company B' },
      ];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: mockBookmarks });
      mockRemoveBookmark.mockResolvedValue({});

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => expect(result.current.bookmarks).toEqual(mockBookmarks));

      let success;
      await act(async () => {
        success = await result.current.removeBookmark(1);
      });

      expect(success).toBe(true);
      expect(result.current.bookmarks).toEqual([{ id: 2, name: 'Company B' }]);
      expect(mockRemoveBookmark).toHaveBeenCalledWith(1);
    });

    it('should handle remove bookmark error', async () => {
      const errorMessage = 'Failed to remove bookmark';
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: [{ id: 1 }] });
      mockRemoveBookmark.mockRejectedValue(new Error(errorMessage));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      await expect(act(async () => {
        await result.current.removeBookmark(1);
      })).rejects.toThrow(errorMessage);

      expect(result.current.error).toBe(errorMessage);
      consoleSpy.mockRestore();
    });
  });

  describe('isBookmarked', () => {
    it('should return true for bookmarked company', async () => {
      const mockBookmarks = [{ id: 1, name: 'Company A' }];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: mockBookmarks });

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => expect(result.current.bookmarks).toEqual(mockBookmarks));

      expect(result.current.isBookmarked(1)).toBe(true);
    });

    it('should return false for non-bookmarked company', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: [] });

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isBookmarked(999)).toBe(false);
    });
  });

  describe('getBookmarkCount', () => {
    it('should return correct bookmark count', async () => {
      const mockBookmarks = [
        { id: 1, name: 'Company A' },
        { id: 2, name: 'Company B' },
        { id: 3, name: 'Company C' },
      ];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: mockBookmarks });

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => expect(result.current.bookmarks).toEqual(mockBookmarks));

      expect(result.current.getBookmarkCount()).toBe(3);
    });

    it('should return 0 for empty bookmarks', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: [] });

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.getBookmarkCount()).toBe(0);
    });
  });

  describe('reloadBookmarks', () => {
    it('should reload bookmarks when called', async () => {
      const initialBookmarks = [{ id: 1, name: 'Company A' }];
      const updatedBookmarks = [
        { id: 1, name: 'Company A' },
        { id: 2, name: 'Company B' },
      ];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ id: 1 }));
      mockGetUserBookmarks
        .mockResolvedValueOnce({ data: initialBookmarks })
        .mockResolvedValueOnce({ data: updatedBookmarks });

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => expect(result.current.bookmarks).toEqual(initialBookmarks));

      await act(async () => {
        await result.current.reloadBookmarks();
      });

      expect(result.current.bookmarks).toEqual(updatedBookmarks);
      expect(mockGetUserBookmarks).toHaveBeenCalledTimes(2);
    });
  });
});