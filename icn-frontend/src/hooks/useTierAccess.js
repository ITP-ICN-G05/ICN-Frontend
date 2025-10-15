import { useState, useEffect } from 'react';
import { checkTierAccess, getTierLimit } from '../utils/tierConfig';

export const useTierAccess = () => {
  const [userTier, setUserTier] = useState('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.tier) {
      setUserTier(user.tier);
    }
    setLoading(false);
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