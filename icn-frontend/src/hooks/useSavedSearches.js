import { useState, useEffect } from 'react';
import { savedSearchService } from '../services/savedSearchService';
import { useTierAccess } from './useTierAccess';
import { getTierLimit } from '../utils/tierConfig';

export const useSavedSearches = () => {
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quota, setQuota] = useState({ used: 0, limit: 0 });
  const { userTier } = useTierAccess();

  useEffect(() => {
    loadSavedSearches();
    loadQuota();
  }, [userTier]);

  const loadSavedSearches = async () => {
    setLoading(true);
    try {
      const response = await savedSearchService.getSavedSearches();
      setSavedSearches(response.data);
    } catch (err) {
      console.error('Error loading saved searches:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadQuota = async () => {
    try {
      const response = await savedSearchService.getSearchQuota();
      setQuota(response.data);
    } catch (err) {
      console.error('Error loading quota:', err);
      const limit = getTierLimit(userTier, 'MAX_SAVED_SEARCHES');
      setQuota({ used: savedSearches.length, limit });
    }
  };

  const saveSearch = async (searchData) => {
    if (quota.limit !== -1 && quota.used >= quota.limit) {
      throw new Error(`Search limit reached (${quota.limit} searches max)`);
    }
    
    try {
      const response = await savedSearchService.saveSearch(searchData);
      setSavedSearches([...savedSearches, response.data]);
      setQuota({ ...quota, used: quota.used + 1 });
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteSearch = async (id) => {
    try {
      await savedSearchService.deleteSearch(id);
      setSavedSearches(savedSearches.filter(s => s.id !== id));
      setQuota({ ...quota, used: Math.max(0, quota.used - 1) });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const canSaveSearch = () => {
    return userTier !== 'free' && (quota.limit === -1 || quota.used < quota.limit);
  };

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