import { renderHook, waitFor } from '@testing-library/react';
import { useTierAccess } from './useTierAccess';
import { checkTierAccess, getTierLimit } from '../utils/tierConfig';

jest.mock('../utils/tierConfig');

describe('useTierAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage with proper implementation
    const localStorageMock = (() => {
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
        })
      };
    })();

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    // Default mock implementations
    checkTierAccess.mockReturnValue(true);
    getTierLimit.mockReturnValue(10);
  });

  describe('initialization', () => {
    it('should initialize with free tier when no user in localStorage', async () => {
      window.localStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useTierAccess());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.userTier).toBe('free');
    });

    it('should initialize with user tier from localStorage', async () => {
      window.localStorage.getItem.mockReturnValue(
        JSON.stringify({ id: 1, name: 'John', tier: 'premium' })
      );

      const { result } = renderHook(() => useTierAccess());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.userTier).toBe('premium');
    });

    it('should handle plus tier', async () => {
      window.localStorage.getItem.mockReturnValue(
        JSON.stringify({ id: 1, tier: 'plus' })
      );

      const { result } = renderHook(() => useTierAccess());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.userTier).toBe('plus');
    });

    it('should default to free tier if user object has no tier', async () => {
      window.localStorage.getItem.mockReturnValue(
        JSON.stringify({ id: 1, name: 'John' })
      );

      const { result } = renderHook(() => useTierAccess());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.userTier).toBe('free');
    });

    it('should start with loading true and then set to false', async () => {
      window.localStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useTierAccess());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('hasAccess', () => {
    it('should check tier access for a feature', async () => {
      window.localStorage.getItem.mockReturnValue(
        JSON.stringify({ id: 1, tier: 'plus' })
      );
      checkTierAccess.mockReturnValue(true);

      const { result } = renderHook(() => useTierAccess());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const hasAccess = result.current.hasAccess('SAVED_SEARCHES');

      expect(hasAccess).toBe(true);
      expect(checkTierAccess).toHaveBeenCalledWith('plus', 'SAVED_SEARCHES');
    });

    it('should return false when user lacks access', async () => {
      window.localStorage.getItem.mockReturnValue(
        JSON.stringify({ id: 1, tier: 'free' })
      );
      checkTierAccess.mockReturnValue(false);

      const { result } = renderHook(() => useTierAccess());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const hasAccess = result.current.hasAccess('COMPANY_REVENUE');

      expect(hasAccess).toBe(false);
      expect(checkTierAccess).toHaveBeenCalledWith('free', 'COMPANY_REVENUE');
    });

    it('should work with premium tier features', async () => {
      window.localStorage.getItem.mockReturnValue(
        JSON.stringify({ id: 1, tier: 'premium' })
      );
      checkTierAccess.mockReturnValue(true);

      const { result } = renderHook(() => useTierAccess());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const hasAccess = result.current.hasAccess('API_ACCESS');

      expect(hasAccess).toBe(true);
      expect(checkTierAccess).toHaveBeenCalledWith('premium', 'API_ACCESS');
    });
  });

  describe('getLimit', () => {
    it('should get tier limit for a limit type', async () => {
      window.localStorage.getItem.mockReturnValue(
        JSON.stringify({ id: 1, tier: 'plus' })
      );
      getTierLimit.mockReturnValue(100);

      const { result } = renderHook(() => useTierAccess());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const limit = result.current.getLimit('EXPORT_LIMIT');

      expect(limit).toBe(100);
      expect(getTierLimit).toHaveBeenCalledWith('plus', 'EXPORT_LIMIT');
    });

    it('should return -1 for unlimited features', async () => {
      window.localStorage.getItem.mockReturnValue(
        JSON.stringify({ id: 1, tier: 'premium' })
      );
      getTierLimit.mockReturnValue(-1);

      const { result } = renderHook(() => useTierAccess());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const limit = result.current.getLimit('BOOKMARK_LIMIT');

      expect(limit).toBe(-1);
      expect(getTierLimit).toHaveBeenCalledWith('premium', 'BOOKMARK_LIMIT');
    });

    it('should work for free tier limits', async () => {
      window.localStorage.getItem.mockReturnValue(null);
      getTierLimit.mockReturnValue(5);

      const { result } = renderHook(() => useTierAccess());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const limit = result.current.getLimit('BOOKMARK_LIMIT');

      expect(limit).toBe(5);
      expect(getTierLimit).toHaveBeenCalledWith('free', 'BOOKMARK_LIMIT');
    });
  });

  describe('isRestricted', () => {
    it('should return true when user lacks access', async () => {
      window.localStorage.getItem.mockReturnValue(
        JSON.stringify({ id: 1, tier: 'free' })
      );
      checkTierAccess.mockReturnValue(false);

      const { result } = renderHook(() => useTierAccess());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const isRestricted = result.current.isRestricted('SAVED_SEARCHES');

      expect(isRestricted).toBe(true);
      expect(checkTierAccess).toHaveBeenCalledWith('free', 'SAVED_SEARCHES');
    });

    it('should return false when user has access', async () => {
      window.localStorage.getItem.mockReturnValue(
        JSON.stringify({ id: 1, tier: 'plus' })
      );
      checkTierAccess.mockReturnValue(true);

      const { result } = renderHook(() => useTierAccess());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const isRestricted = result.current.isRestricted('SAVED_SEARCHES');

      expect(isRestricted).toBe(false);
      expect(checkTierAccess).toHaveBeenCalledWith('plus', 'SAVED_SEARCHES');
    });
  });

  describe('canUpgrade', () => {
    it('should return true for free tier', async () => {
      window.localStorage.getItem.mockReturnValue(
        JSON.stringify({ id: 1, tier: 'free' })
      );

      const { result } = renderHook(() => useTierAccess());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.canUpgrade()).toBe(true);
    });

    it('should return true for plus tier', async () => {
      window.localStorage.getItem.mockReturnValue(
        JSON.stringify({ id: 1, tier: 'plus' })
      );

      const { result } = renderHook(() => useTierAccess());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.canUpgrade()).toBe(true);
    });

    it('should return false for premium tier', async () => {
      window.localStorage.getItem.mockReturnValue(
        JSON.stringify({ id: 1, tier: 'premium' })
      );

      const { result } = renderHook(() => useTierAccess());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.canUpgrade()).toBe(false);
    });
  });

  describe('hook return values', () => {
    it('should provide all expected properties', async () => {
      window.localStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useTierAccess());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current).toHaveProperty('userTier');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('hasAccess');
      expect(result.current).toHaveProperty('getLimit');
      expect(result.current).toHaveProperty('isRestricted');
      expect(result.current).toHaveProperty('canUpgrade');
      expect(typeof result.current.hasAccess).toBe('function');
      expect(typeof result.current.getLimit).toBe('function');
      expect(typeof result.current.isRestricted).toBe('function');
      expect(typeof result.current.canUpgrade).toBe('function');
    });
  });

  describe('localStorage edge cases', () => {
    it('should handle invalid JSON in localStorage', async () => {
      window.localStorage.getItem.mockReturnValue('invalid json');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useTierAccess());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.userTier).toBe('free');
      consoleSpy.mockRestore();
    });

    it('should handle empty string in localStorage', async () => {
      window.localStorage.getItem.mockReturnValue('');

      const { result } = renderHook(() => useTierAccess());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.userTier).toBe('free');
    });
  });
});