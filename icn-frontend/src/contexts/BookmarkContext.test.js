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

    // Create localStorage mock
    localStorageMock = (() => {
      let store = {};
      return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
          store[key] = value.toString();
        }),
        clear: jest.fn(() => {
          store = {};
        }),
        removeItem: jest.fn((key) => {
          delete store[key];
        }),
      };
    })();

    // Mock both global and window.localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
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
      localStorageMock.setItem('user', JSON.stringify({ id: 1, tier: 'free' }));
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

  describe('initial state', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      expect(result.current.bookmarks).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('loadBookmarks', () => {
    it('should set loading to true during fetch', async () => {
      localStorageMock.setItem('user', JSON.stringify({ id: 1 }));
      
      let resolvePromise;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockGetUserBookmarks.mockReturnValue(promise);

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      // Check loading is true while promise is pending
      await waitFor(() => expect(result.current.loading).toBe(true));
      
      // Resolve the promise
      await act(async () => {
        resolvePromise({ data: [] });
        await promise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should load bookmarks on mount when user exists', async () => {
      const mockBookmarks = [
        { id: 1, name: 'Company A' },
        { id: 2, name: 'Company B' },
      ];
      
      localStorageMock.setItem('user', JSON.stringify({ id: 1, tier: 'free' }));
      mockGetUserBookmarks.mockResolvedValue({ data: mockBookmarks });

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => {
        expect(result.current.bookmarks).toEqual(mockBookmarks);
        expect(result.current.loading).toBe(false);
      });

      expect(mockGetUserBookmarks).toHaveBeenCalledTimes(1);
    });

    it('should handle response without data wrapper', async () => {
      const mockBookmarks = [{ id: 1, name: 'Company A' }];
      
      localStorageMock.setItem('user', JSON.stringify({ id: 1, tier: 'free' }));
      mockGetUserBookmarks.mockResolvedValue(mockBookmarks);

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => {
        expect(result.current.bookmarks).toEqual(mockBookmarks);
        expect(result.current.loading).toBe(false);
      });
    });

    it('should set empty array when no user in localStorage', async () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => expect(result.current.bookmarks).toEqual([]));

      expect(mockGetUserBookmarks).not.toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
    });

    it('should handle loading error', async () => {
      const errorMessage = 'Failed to load bookmarks';
      localStorageMock.setItem('user', JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockRejectedValue(new Error(errorMessage));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.bookmarks).toEqual([]);
      consoleSpy.mockRestore();
    });

    it('should handle non-array response', async () => {
      localStorageMock.setItem('user', JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: null });

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => {
        expect(result.current.bookmarks).toEqual([]);
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle invalid JSON in localStorage', async () => {
      // Manually override getItem for this test to return invalid JSON
      localStorageMock.getItem.mockReturnValue('invalid json{');
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.bookmarks).toEqual([]);
      expect(result.current.error).toBeTruthy();
      consoleSpy.mockRestore();
    });

    it('should handle empty string in localStorage', async () => {
      localStorageMock.setItem('user', '');
      
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.bookmarks).toEqual([]);
      expect(mockGetUserBookmarks).not.toHaveBeenCalled();
    });

    it('should clear error state on successful reload', async () => {
      localStorageMock.setItem('user', JSON.stringify({ id: 1 }));
      mockGetUserBookmarks
        .mockRejectedValueOnce(new Error('Initial error'))
        .mockResolvedValueOnce({ data: [] });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBe('Initial error');
      });

      await act(async () => {
        await result.current.reloadBookmarks();
      });

      await waitFor(() => {
        expect(result.current.error).toBe(null);
        expect(result.current.bookmarks).toEqual([]);
      });

      consoleSpy.mockRestore();
    });
  });

  describe('addBookmark', () => {
    it('should add bookmark successfully', async () => {
      const company = { id: 3, name: 'Company C' };
      localStorageMock.setItem('user', JSON.stringify({ id: 1 }));
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

    it('should return true on successful add', async () => {
      const company = { id: 1, name: 'Test' };
      localStorageMock.setItem('user', JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: [] });
      mockAddBookmark.mockResolvedValue({});

      const { result } = renderHook(() => useBookmarks(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));

      let returnValue;
      await act(async () => {
        returnValue = await result.current.addBookmark(company);
      });

      expect(returnValue).toBe(true);
    });

    it('should handle add bookmark error', async () => {
      const company = { id: 3, name: 'Company C' };
      const errorMessage = 'Failed to add bookmark';
      
      localStorageMock.setItem('user', JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: [] });
      mockAddBookmark.mockRejectedValue(new Error(errorMessage));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Call addBookmark and expect it to throw
      let thrownError = null;
      try {
        await act(async () => {
          await result.current.addBookmark(company);
        });
      } catch (err) {
        thrownError = err;
      }

      // Verify error was thrown with correct message
      expect(thrownError).toBeTruthy();
      expect(thrownError.message).toBe(errorMessage);

      consoleSpy.mockRestore();
    });

    it('should not add duplicate bookmarks on error', async () => {
      const company = { id: 3, name: 'Company C' };
      localStorageMock.setItem('user', JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: [] });
      mockAddBookmark.mockRejectedValue(new Error('Failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      try {
        await act(async () => {
          await result.current.addBookmark(company);
        });
      } catch (err) {
        // Expected to throw
      }

      expect(result.current.bookmarks).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  describe('removeBookmark', () => {
    it('should remove bookmark successfully', async () => {
      const mockBookmarks = [
        { id: 1, name: 'Company A' },
        { id: 2, name: 'Company B' },
      ];
      
      localStorageMock.setItem('user', JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: mockBookmarks });
      mockRemoveBookmark.mockResolvedValue({});

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => {
        expect(result.current.bookmarks).toEqual(mockBookmarks);
        expect(result.current.loading).toBe(false);
      });

      let success;
      await act(async () => {
        success = await result.current.removeBookmark(1);
      });

      expect(success).toBe(true);
      expect(result.current.bookmarks).toEqual([{ id: 2, name: 'Company B' }]);
      expect(mockRemoveBookmark).toHaveBeenCalledWith(1);
    });

    it('should return true on successful remove', async () => {
      const mockBookmarks = [{ id: 1, name: 'Company A' }];
      localStorageMock.setItem('user', JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: mockBookmarks });
      mockRemoveBookmark.mockResolvedValue({});

      const { result } = renderHook(() => useBookmarks(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));

      let returnValue;
      await act(async () => {
        returnValue = await result.current.removeBookmark(1);
      });

      expect(returnValue).toBe(true);
    });

    it('should handle removing non-existent bookmark', async () => {
      const mockBookmarks = [{ id: 1, name: 'Company A' }];
      localStorageMock.setItem('user', JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: mockBookmarks });
      mockRemoveBookmark.mockResolvedValue({});

      const { result } = renderHook(() => useBookmarks(), { wrapper });
      await waitFor(() => {
        expect(result.current.bookmarks).toEqual(mockBookmarks);
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.removeBookmark(999); // Non-existent ID
      });

      // Bookmarks should remain unchanged
      expect(result.current.bookmarks).toEqual(mockBookmarks);
    });

    it('should handle remove bookmark error', async () => {
      const errorMessage = 'Failed to remove bookmark';
      
      localStorageMock.setItem('user', JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: [{ id: 1 }] });
      mockRemoveBookmark.mockRejectedValue(new Error(errorMessage));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Call removeBookmark and expect it to throw
      let thrownError = null;
      try {
        await act(async () => {
          await result.current.removeBookmark(1);
        });
      } catch (err) {
        thrownError = err;
      }

      // Verify error was thrown with correct message
      expect(thrownError).toBeTruthy();
      expect(thrownError.message).toBe(errorMessage);

      consoleSpy.mockRestore();
    });

    it('should not remove bookmark from state on error', async () => {
      const mockBookmarks = [{ id: 1, name: 'Company A' }];
      localStorageMock.setItem('user', JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: mockBookmarks });
      mockRemoveBookmark.mockRejectedValue(new Error('Failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => {
        expect(result.current.bookmarks).toEqual(mockBookmarks);
        expect(result.current.loading).toBe(false);
      });

      try {
        await act(async () => {
          await result.current.removeBookmark(1);
        });
      } catch (err) {
        // Expected to throw
      }

      expect(result.current.bookmarks).toEqual(mockBookmarks);
      consoleSpy.mockRestore();
    });
  });

  describe('isBookmarked', () => {
    it('should return true for bookmarked company', async () => {
      const mockBookmarks = [{ id: 1, name: 'Company A' }];
      
      localStorageMock.setItem('user', JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: mockBookmarks });

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => {
        expect(result.current.bookmarks).toEqual(mockBookmarks);
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isBookmarked(1)).toBe(true);
    });

    it('should return false for non-bookmarked company', async () => {
      localStorageMock.setItem('user', JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: [] });

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isBookmarked(999)).toBe(false);
    });

    it('should return false for null/undefined id', async () => {
      const mockBookmarks = [{ id: 1, name: 'Company A' }];
      localStorageMock.setItem('user', JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: mockBookmarks });

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => {
        expect(result.current.bookmarks).toEqual(mockBookmarks);
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isBookmarked(null)).toBe(false);
      expect(result.current.isBookmarked(undefined)).toBe(false);
    });
  });

  describe('getBookmarkCount', () => {
    it('should return correct bookmark count', async () => {
      const mockBookmarks = [
        { id: 1, name: 'Company A' },
        { id: 2, name: 'Company B' },
        { id: 3, name: 'Company C' },
      ];
      
      localStorageMock.setItem('user', JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: mockBookmarks });

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => {
        expect(result.current.bookmarks).toEqual(mockBookmarks);
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.getBookmarkCount()).toBe(3);
    });

    it('should return 0 for empty bookmarks', async () => {
      localStorageMock.setItem('user', JSON.stringify({ id: 1 }));
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
      
      localStorageMock.setItem('user', JSON.stringify({ id: 1 }));
      mockGetUserBookmarks
        .mockResolvedValueOnce({ data: initialBookmarks })
        .mockResolvedValueOnce({ data: updatedBookmarks });

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => {
        expect(result.current.bookmarks).toEqual(initialBookmarks);
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.reloadBookmarks();
      });

      await waitFor(() => {
        expect(result.current.bookmarks).toEqual(updatedBookmarks);
      });

      expect(mockGetUserBookmarks).toHaveBeenCalledTimes(2);
    });

    it('should set loading state during reload', async () => {
      localStorageMock.setItem('user', JSON.stringify({ id: 1 }));
      mockGetUserBookmarks.mockResolvedValue({ data: [] });

      const { result } = renderHook(() => useBookmarks(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      let loadingWasTrue = false;
      
      // Create a promise that we control
      let resolvePromise;
      const controlledPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      mockGetUserBookmarks.mockReturnValue(controlledPromise);

      // Start the reload
      act(() => {
        result.current.reloadBookmarks();
      });

      // Check if loading became true
      await waitFor(() => {
        if (result.current.loading === true) {
          loadingWasTrue = true;
        }
        return result.current.loading === true;
      });

      // Now resolve the promise
      await act(async () => {
        resolvePromise({ data: [] });
        await controlledPromise;
      });

      expect(loadingWasTrue).toBe(true);
      expect(result.current.loading).toBe(false);
    });
  });
});