import { useState, useEffect } from 'react';
import { checkTierAccess, getTierLimit } from '../utils/tierConfig';

export const useTierAccess = () => {
  const [userTier, setUserTier] = useState('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeTier = () => {
      try {
        const userStr = localStorage.getItem('user');
        
        if (!userStr || userStr === '') {
          setUserTier('free');
          return;
        }

        const user = JSON.parse(userStr);
        
        if (user && user.tier) {
          setUserTier(user.tier);
        } else {
          setUserTier('free');
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        setUserTier('free');
      } finally {
        setLoading(false);
      }
    };

    initializeTier();
  }, []);

  const hasAccess = (feature) => {
    return checkTierAccess(userTier, feature);
  };

  const getLimit = (limitType) => {
    return getTierLimit(userTier, limitType);
  };

  const isRestricted = (feature) => {
    return !hasAccess(feature);
  };

  const canUpgrade = () => {
    return userTier !== 'premium';
  };

  return {
    userTier,
    loading,
    hasAccess,
    getLimit,
    isRestricted,
    canUpgrade,
  };
};