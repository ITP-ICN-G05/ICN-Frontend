import { useState, useEffect, useCallback, useRef } from 'react';
import { savedSearchService } from '../services/savedSearchService';
import { useTierAccess } from './useTierAccess';
import { getTierLimit } from '../utils/tierConfig';

export const useSavedSearches = () => {
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quota, setQuota] = useState({ used: 0, limit: 0 });
  const { userTier } = useTierAccess();
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadSavedSearches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await savedSearchService.getSavedSearches();
      // Handle case where response might be undefined or malformed
      const data = response?.data || [];
      if (isMountedRef.current) {
        setSavedSearches(data);
        setError(null);
      }
      // Always return data, even if unmounted
      return data;
    } catch (err) {
      console.error('Error loading saved searches:', err);
      if (isMountedRef.current) {
        setError(err.message);
      }
      return [];
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const loadQuota = useCallback(async (currentSearches) => {
    try {
      const response = await savedSearchService.getSearchQuota();
      if (isMountedRef.current) {
        setQuota(response.data);
      }
    } catch (err) {
      console.error('Error loading quota:', err);
      if (isMountedRef.current) {
        const limit = getTierLimit(userTier, 'MAX_SAVED_SEARCHES');
        // Use the passed currentSearches instead of stale closure
        setQuota({ used: currentSearches.length, limit });
      }
    }
  }, [userTier]);

  useEffect(() => {
    const initializeData = async () => {
      // Load searches and get the data
      const searchesData = await loadSavedSearches();
      // Then load quota with the freshly loaded searches
      if (isMountedRef.current) {
        await loadQuota(searchesData);
      }
    };
    
    initializeData();
  }, [userTier, loadSavedSearches, loadQuota]);

  const saveSearch = useCallback(async (searchData) => {
    if (quota.limit !== -1 && quota.used >= quota.limit) {
      throw new Error(`Search limit reached (${quota.limit} searches max)`);
    }
    
    try {
      const response = await savedSearchService.saveSearch(searchData);
      if (isMountedRef.current) {
        setSavedSearches(prev => [...prev, response.data]);
        setQuota(prev => ({ ...prev, used: prev.used + 1 }));
      }
      return response.data;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message);
      }
      throw err;
    }
  }, [quota.limit, quota.used]);

  const deleteSearch = useCallback(async (id) => {
    try {
      await savedSearchService.deleteSearch(id);
      if (isMountedRef.current) {
        setSavedSearches(prev => prev.filter(s => s.id !== id));
        setQuota(prev => ({ ...prev, used: Math.max(0, prev.used - 1) }));
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message);
      }
      throw err;
    }
  }, []);

  const canSaveSearch = useCallback(() => {
    return userTier !== 'free' && (quota.limit === -1 || quota.used < quota.limit);
  }, [userTier, quota.limit, quota.used]);

  return {
    savedSearches,
    loading,
    error,
    quota,
    saveSearch,
    deleteSearch,
    canSaveSearch,
    reloadSearches: loadSavedSearches,
  };
};