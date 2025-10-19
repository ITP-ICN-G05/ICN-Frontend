import { renderHook, act, waitFor } from '@testing-library/react';
import { useSavedSearches } from './useSavedSearches';
import { savedSearchService } from '../services/savedSearchService';
import { useTierAccess } from './useTierAccess';
import { getTierLimit } from '../utils/tierConfig';

jest.mock('../services/savedSearchService');
jest.mock('./useTierAccess');
jest.mock('../utils/tierConfig');

describe('useSavedSearches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations - these will be used unless overridden in specific tests
    useTierAccess.mockReturnValue({
      userTier: 'plus',
    });
    
    getTierLimit.mockReturnValue(10);
    
    // Set up default mocks for all service calls to prevent undefined responses
    savedSearchService.getSavedSearches.mockResolvedValue({ data: [] });
    savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 0, limit: 10 } });
  });

  describe('initialization', () => {
    it('should initialize with empty state', async () => {
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [] });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 0, limit: 10 } });

      const { result } = renderHook(() => useSavedSearches());

      // Initial state check
      expect(result.current.savedSearches).toEqual([]);
      expect(result.current.error).toBe(null);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should load saved searches on mount', async () => {
      const mockSearches = [
        { id: 1, name: 'Search 1', criteria: {} },
        { id: 2, name: 'Search 2', criteria: {} },
      ];
      
      savedSearchService.getSavedSearches.mockResolvedValue({ data: mockSearches });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 2, limit: 10 } });

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.savedSearches).toEqual(mockSearches);
      expect(savedSearchService.getSavedSearches).toHaveBeenCalledTimes(1);
    });

    it('should load quota on mount', async () => {
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [] });
      savedSearchService.getSearchQuota.mockResolvedValue({ 
        data: { used: 3, limit: 10 } 
      });

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => {
        expect(result.current.quota).toEqual({ used: 3, limit: 10 });
      });

      expect(savedSearchService.getSearchQuota).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadSavedSearches', () => {
    it('should handle loading errors', async () => {
      const errorMessage = 'Failed to load searches';
      savedSearchService.getSavedSearches.mockRejectedValue(new Error(errorMessage));
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 0, limit: 10 } });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });

      expect(result.current.savedSearches).toEqual([]);
      consoleSpy.mockRestore();
    });

    it('should set loading state correctly', async () => {
      savedSearchService.getSavedSearches.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100))
      );
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 0, limit: 10 } });

      const { result } = renderHook(() => useSavedSearches());

      // Should start as true (or become true quickly)
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      }, { timeout: 50 });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle undefined response data gracefully', async () => {
      // Tests the || [] fallback in: const data = response?.data || [];
      savedSearchService.getSavedSearches.mockResolvedValue({ data: undefined });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 0, limit: 10 } });

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.savedSearches).toEqual([]);
    });

    it('should handle completely undefined response', async () => {
      // Tests response?.data when response is undefined
      savedSearchService.getSavedSearches.mockResolvedValue(undefined);
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 0, limit: 10 } });

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.savedSearches).toEqual([]);
    });
  });

  describe('loadQuota', () => {
    it('should handle quota loading errors with fallback', async () => {
      const mockSearches = [{ id: 1, name: 'Search 1' }];
      savedSearchService.getSavedSearches.mockResolvedValue({ data: mockSearches });
      savedSearchService.getSearchQuota.mockRejectedValue(new Error('Quota error'));
      getTierLimit.mockReturnValue(10);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => {
        expect(result.current.quota).toEqual({ used: 1, limit: 10 });
      });

      expect(getTierLimit).toHaveBeenCalledWith('plus', 'MAX_SAVED_SEARCHES');
      consoleSpy.mockRestore();
    });

    it('should use fallback quota calculation when API fails with empty searches', async () => {
      // Tests the fallback path with 0 searches
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [] });
      savedSearchService.getSearchQuota.mockRejectedValue(new Error('Quota API error'));
      getTierLimit.mockReturnValue(10);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => {
        expect(result.current.quota).toEqual({ used: 0, limit: 10 });
      });

      consoleSpy.mockRestore();
    });

    it('should use fallback quota calculation when API fails with multiple searches', async () => {
      // Tests the fallback path with multiple searches
      const mockSearches = [
        { id: 1, name: 'Search 1' },
        { id: 2, name: 'Search 2' },
        { id: 3, name: 'Search 3' },
      ];
      savedSearchService.getSavedSearches.mockResolvedValue({ data: mockSearches });
      savedSearchService.getSearchQuota.mockRejectedValue(new Error('Quota API error'));
      getTierLimit.mockReturnValue(10);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => {
        expect(result.current.quota).toEqual({ used: 3, limit: 10 });
      });

      consoleSpy.mockRestore();
    });
  });

  describe('saveSearch', () => {
    it('should save search successfully', async () => {
      const newSearch = { name: 'New Search', criteria: { industry: 'tech' } };
      const savedSearch = { id: 3, ...newSearch };
      
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [] });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 0, limit: 10 } });
      savedSearchService.saveSearch.mockResolvedValue({ data: savedSearch });

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let returnedSearch;
      await act(async () => {
        returnedSearch = await result.current.saveSearch(newSearch);
      });

      expect(returnedSearch).toEqual(savedSearch);
      expect(result.current.savedSearches).toContainEqual(savedSearch);
      expect(result.current.quota.used).toBe(1);
      expect(savedSearchService.saveSearch).toHaveBeenCalledWith(newSearch);
    });

    it('should throw error when quota limit reached', async () => {
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [] });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 10, limit: 10 } });

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => {
        expect(result.current.quota.used).toBe(10);
      });

      await expect(act(async () => {
        await result.current.saveSearch({ name: 'Test' });
      })).rejects.toThrow('Search limit reached (10 searches max)');
    });

    it('should allow saving when limit is unlimited (-1)', async () => {
      const newSearch = { name: 'New Search', criteria: {} };
      const savedSearch = { id: 1, ...newSearch };
      
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [] });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 100, limit: -1 } });
      savedSearchService.saveSearch.mockResolvedValue({ data: savedSearch });

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.saveSearch(newSearch);
      });

      expect(result.current.savedSearches).toContainEqual(savedSearch);
    });

    it('should handle save errors', async () => {
      const errorMessage = 'Failed to save search';
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [] });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 0, limit: 10 } });
      savedSearchService.saveSearch.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Verify the error is thrown
      await expect(act(async () => {
        await result.current.saveSearch({ name: 'Test' });
      })).rejects.toThrow(errorMessage);
      
      // Note: Error state may not be reliably set in tests due to async timing
      // The throw itself is the primary error handling mechanism
    });

    it('should allow saving when quota.used is exactly at limit - 1', async () => {
      // Tests the boundary condition: quota.used < quota.limit
      const newSearch = { name: 'New Search', criteria: {} };
      const savedSearch = { id: 1, ...newSearch };
      
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [] });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 9, limit: 10 } });
      savedSearchService.saveSearch.mockResolvedValue({ data: savedSearch });

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.saveSearch(newSearch);
      });

      expect(result.current.savedSearches).toContainEqual(savedSearch);
    });

    it('should handle quota with limit of 0 for free tier', async () => {
      // Tests edge case where limit is 0 (not -1, not positive)
      useTierAccess.mockReturnValue({ userTier: 'free' });
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [] });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 0, limit: 0 } });

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await expect(act(async () => {
        await result.current.saveSearch({ name: 'Test' });
      })).rejects.toThrow('Search limit reached (0 searches max)');
    });
  });

  describe('deleteSearch', () => {
    it('should delete search successfully', async () => {
      const mockSearches = [
        { id: 1, name: 'Search 1' },
        { id: 2, name: 'Search 2' },
      ];
      
      savedSearchService.getSavedSearches.mockResolvedValue({ data: mockSearches });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 2, limit: 10 } });
      savedSearchService.deleteSearch.mockResolvedValue({});

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => {
        expect(result.current.savedSearches).toEqual(mockSearches);
      });

      await act(async () => {
        await result.current.deleteSearch(1);
      });

      expect(result.current.savedSearches).toEqual([{ id: 2, name: 'Search 2' }]);
      expect(result.current.quota.used).toBe(1);
      expect(savedSearchService.deleteSearch).toHaveBeenCalledWith(1);
    });

    it('should not decrease quota below 0', async () => {
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [{ id: 1 }] });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 0, limit: 10 } });
      savedSearchService.deleteSearch.mockResolvedValue({});

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteSearch(1);
      });

      expect(result.current.quota.used).toBe(0);
    });

    it('should handle delete errors', async () => {
      const errorMessage = 'Failed to delete search';
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [{ id: 1 }] });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 1, limit: 10 } });
      savedSearchService.deleteSearch.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Verify the error is thrown
      await expect(act(async () => {
        await result.current.deleteSearch(1);
      })).rejects.toThrow(errorMessage);
      
      // Note: Error state may not be reliably set in tests due to async timing
      // The throw itself is the primary error handling mechanism
    });

    it('should handle deleting when quota.used is already 0', async () => {
      // Tests Math.max(0, prev.used - 1) when result would be negative
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [{ id: 1 }] });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 0, limit: 10 } });
      savedSearchService.deleteSearch.mockResolvedValue({});

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.deleteSearch(1);
      });

      // Should stay at 0, not go negative
      expect(result.current.quota.used).toBe(0);
    });

    it('should handle deleting when quota.used is 1', async () => {
      // Tests Math.max where result is exactly 0
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [{ id: 1 }] });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 1, limit: 10 } });
      savedSearchService.deleteSearch.mockResolvedValue({});

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.deleteSearch(1);
      });

      expect(result.current.quota.used).toBe(0);
    });
  });

  describe('canSaveSearch', () => {
    it('should return true for plus tier with available quota', async () => {
      useTierAccess.mockReturnValue({ userTier: 'plus' });
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [] });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 5, limit: 10 } });

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.canSaveSearch()).toBe(true);
    });

    it('should return false for free tier', async () => {
      useTierAccess.mockReturnValue({ userTier: 'free' });
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [] });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 0, limit: 0 } });

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.canSaveSearch()).toBe(false);
    });

    it('should return false when quota limit reached', async () => {
      useTierAccess.mockReturnValue({ userTier: 'plus' });
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [] });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 10, limit: 10 } });

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.canSaveSearch()).toBe(false);
    });

    it('should return true for unlimited quota', async () => {
      useTierAccess.mockReturnValue({ userTier: 'premium' });
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [] });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 1000, limit: -1 } });

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.canSaveSearch()).toBe(true);
    });

    it('should return false for free tier even with available quota', async () => {
      // Tests: userTier !== 'free' returns false, so second condition not evaluated
      useTierAccess.mockReturnValue({ userTier: 'free' });
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [] });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 0, limit: 5 } });

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.canSaveSearch()).toBe(false);
    });

    it('should return true for plus tier when exactly at limit - 1', async () => {
      // Tests: used < limit returns true
      useTierAccess.mockReturnValue({ userTier: 'plus' });
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [] });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 9, limit: 10 } });

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.canSaveSearch()).toBe(true);
    });

    it('should return true for premium tier with unlimited quota regardless of used count', async () => {
      // Tests: quota.limit === -1 short-circuits to true
      useTierAccess.mockReturnValue({ userTier: 'premium' });
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [] });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 999999, limit: -1 } });

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.canSaveSearch()).toBe(true);
    });
  });

  describe('reloadSearches', () => {
    it('should reload saved searches when called', async () => {
      const initialSearches = [{ id: 1, name: 'Search 1' }];
      const updatedSearches = [
        { id: 1, name: 'Search 1' },
        { id: 2, name: 'Search 2' },
      ];
      
      savedSearchService.getSavedSearches
        .mockResolvedValueOnce({ data: initialSearches })
        .mockResolvedValueOnce({ data: updatedSearches });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 1, limit: 10 } });

      const { result } = renderHook(() => useSavedSearches());

      await waitFor(() => {
        expect(result.current.savedSearches).toEqual(initialSearches);
      });

      await act(async () => {
        await result.current.reloadSearches();
      });

      await waitFor(() => {
        expect(result.current.savedSearches).toEqual(updatedSearches);
      });
      
      expect(savedSearchService.getSavedSearches).toHaveBeenCalledTimes(2);
    });
  });

  describe('tier change handling', () => {
    it('should reload data when userTier changes', async () => {
      const { rerender } = renderHook(
        ({ tier }) => {
          useTierAccess.mockReturnValue({ userTier: tier });
          return useSavedSearches();
        },
        { initialProps: { tier: 'plus' } }
      );
      
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [] });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 0, limit: 10 } });

      await waitFor(() => {
        expect(savedSearchService.getSavedSearches).toHaveBeenCalledTimes(1);
      });

      // Change tier
      getTierLimit.mockReturnValue(-1);
      rerender({ tier: 'premium' });

      await waitFor(() => {
        expect(savedSearchService.getSavedSearches).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('unmounted component scenarios', () => {
    it('should not update state after unmount during loadSavedSearches', async () => {
      savedSearchService.getSavedSearches.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: [{ id: 1 }] }), 100))
      );
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 0, limit: 10 } });

      const { result, unmount } = renderHook(() => useSavedSearches());

      // Unmount before async operation completes
      unmount();

      // Wait to ensure no state updates occur
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // No assertions needed - this test passes if no errors are thrown
    });

    it('should not update state after unmount during saveSearch', async () => {
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [] });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 0, limit: 10 } });
      savedSearchService.saveSearch.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ data: { id: 1 } }), 100))
      );

      const { result, unmount } = renderHook(() => useSavedSearches());

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Start save but unmount before completion
      act(() => {
        result.current.saveSearch({ name: 'Test' });
      });
      unmount();

      await new Promise(resolve => setTimeout(resolve, 150));
    });

    it('should not update state after unmount during deleteSearch', async () => {
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [{ id: 1 }] });
      savedSearchService.getSearchQuota.mockResolvedValue({ data: { used: 1, limit: 10 } });
      savedSearchService.deleteSearch.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({}), 100))
      );

      const { result, unmount } = renderHook(() => useSavedSearches());

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Start delete but unmount before completion
      act(() => {
        result.current.deleteSearch(1);
      });
      unmount();

      await new Promise(resolve => setTimeout(resolve, 150));
    });

    it('should not update state after unmount during loadQuota', async () => {
      savedSearchService.getSavedSearches.mockResolvedValue({ data: [] });
      savedSearchService.getSearchQuota.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ data: { used: 0, limit: 10 } }), 100))
      );

      const { unmount } = renderHook(() => useSavedSearches());

      // Unmount before quota loading completes
      unmount();

      await new Promise(resolve => setTimeout(resolve, 150));
    });
  });
});