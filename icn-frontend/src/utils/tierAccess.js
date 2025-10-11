/**
 * Utility for managing feature access based on user subscription tier
 * Implements the three-tier subscription model: Free, Plus, Premium
 */

const TIER_LEVELS = {
    FREE: 'free',
    PLUS: 'plus',
    PREMIUM: 'premium'
  };
  
  const TIER_HIERARCHY = {
    [TIER_LEVELS.FREE]: 0,
    [TIER_LEVELS.PLUS]: 1,
    [TIER_LEVELS.PREMIUM]: 2
  };
  
  /**
   * Feature access configuration based on user stories and requirements
   */
  const FEATURE_ACCESS = {
    // Search & Filter Features
    basicSearch: [TIER_LEVELS.FREE, TIER_LEVELS.PLUS, TIER_LEVELS.PREMIUM],
    advancedFilters: [TIER_LEVELS.PLUS, TIER_LEVELS.PREMIUM],
    demographicFilters: [TIER_LEVELS.PREMIUM], // Female-owned, First Nations-owned
    revenueFilter: [TIER_LEVELS.PREMIUM],
    certificationFilter: [TIER_LEVELS.PLUS, TIER_LEVELS.PREMIUM],
    companySizeFilter: [TIER_LEVELS.PLUS, TIER_LEVELS.PREMIUM],
    
    // Company View Limits
    monthlyViewLimit: {
      [TIER_LEVELS.FREE]: 5,
      [TIER_LEVELS.PLUS]: -1, // Unlimited
      [TIER_LEVELS.PREMIUM]: -1 // Unlimited
    },
    
    // Export Capabilities
    basicExport: [TIER_LEVELS.FREE, TIER_LEVELS.PLUS, TIER_LEVELS.PREMIUM], // Name & contact only
    standardExport: [TIER_LEVELS.PLUS, TIER_LEVELS.PREMIUM], // Limited fields
    fullExport: [TIER_LEVELS.PREMIUM], // All company information
    
    // Saved Searches & Bookmarks
    savedSearches: {
      [TIER_LEVELS.FREE]: 0,
      [TIER_LEVELS.PLUS]: 10,
      [TIER_LEVELS.PREMIUM]: -1 // Unlimited
    },
    bookmarkFolders: {
      [TIER_LEVELS.FREE]: 1,
      [TIER_LEVELS.PLUS]: 5,
      [TIER_LEVELS.PREMIUM]: -1 // Unlimited
    },
    
    // Data Access
    viewABN: [TIER_LEVELS.PLUS, TIER_LEVELS.PREMIUM],
    viewRevenue: [TIER_LEVELS.PREMIUM],
    viewEmployeeCount: [TIER_LEVELS.PREMIUM],
    viewDiversityMarkers: [TIER_LEVELS.PREMIUM],
    viewCertifications: [TIER_LEVELS.PREMIUM],
    viewLocalContent: [TIER_LEVELS.PREMIUM],
    viewCompanySummary: [TIER_LEVELS.PLUS, TIER_LEVELS.PREMIUM],
    viewCapabilityTypes: [TIER_LEVELS.PLUS, TIER_LEVELS.PREMIUM],
    
    // Communication & Support
    icnChat: [TIER_LEVELS.PLUS, TIER_LEVELS.PREMIUM],
    prioritySupport: [TIER_LEVELS.PREMIUM],
    emailSupport: [TIER_LEVELS.FREE, TIER_LEVELS.PLUS, TIER_LEVELS.PREMIUM],
    
    // API & Integration
    apiAccess: [TIER_LEVELS.PREMIUM],
    gatewayLinks: [TIER_LEVELS.PLUS, TIER_LEVELS.PREMIUM],
    
    // Other Features
    newsTab: [TIER_LEVELS.FREE, TIER_LEVELS.PLUS, TIER_LEVELS.PREMIUM],
    shareableLinks: [TIER_LEVELS.PLUS, TIER_LEVELS.PREMIUM],
    bulkOperations: [TIER_LEVELS.PREMIUM]
  };
  
  /**
   * Check if user has access to a specific feature
   * @param {string} feature - Feature name from FEATURE_ACCESS
   * @param {string} userTier - User's subscription tier
   * @returns {boolean} - Whether user has access
   */
  export const hasFeatureAccess = (feature, userTier = TIER_LEVELS.FREE) => {
    const normalizedTier = (userTier || TIER_LEVELS.FREE).toLowerCase();
    const accessList = FEATURE_ACCESS[feature];
    
    if (!accessList) {
      console.warn(`Feature "${feature}" not found in access configuration`);
      return false;
    }
    
    // If it's an array of allowed tiers
    if (Array.isArray(accessList)) {
      return accessList.includes(normalizedTier);
    }
    
    // If it's an object with tier-specific values (like limits)
    if (typeof accessList === 'object') {
      return accessList.hasOwnProperty(normalizedTier);
    }
    
    return false;
  };
  
  /**
   * Get feature limit for a specific tier
   * @param {string} feature - Feature name with limits
   * @param {string} userTier - User's subscription tier
   * @returns {number} - Limit value (-1 means unlimited, 0 means not available)
   */
  export const getFeatureLimit = (feature, userTier = TIER_LEVELS.FREE) => {
    const normalizedTier = (userTier || TIER_LEVELS.FREE).toLowerCase();
    const limitConfig = FEATURE_ACCESS[feature];
    
    if (!limitConfig || typeof limitConfig !== 'object') {
      console.warn(`Feature limit "${feature}" not found or not configured properly`);
      return 0;
    }
    
    return limitConfig[normalizedTier] !== undefined ? limitConfig[normalizedTier] : 0;
  };
  
  /**
   * Check if user tier meets minimum requirement
   * @param {string} requiredTier - Minimum required tier
   * @param {string} userTier - User's current tier
   * @returns {boolean} - Whether user meets requirement
   */
  export const meetsTierRequirement = (requiredTier, userTier = TIER_LEVELS.FREE) => {
    const normalizedUserTier = (userTier || TIER_LEVELS.FREE).toLowerCase();
    const normalizedRequiredTier = (requiredTier || TIER_LEVELS.FREE).toLowerCase();
    
    const userLevel = TIER_HIERARCHY[normalizedUserTier];
    const requiredLevel = TIER_HIERARCHY[normalizedRequiredTier];
    
    if (userLevel === undefined || requiredLevel === undefined) {
      console.warn('Invalid tier comparison');
      return false;
    }
    
    return userLevel >= requiredLevel;
  };
  
  /**
   * Get list of features available for a tier
   * @param {string} userTier - User's subscription tier
   * @returns {array} - List of available feature names
   */
  export const getAvailableFeatures = (userTier = TIER_LEVELS.FREE) => {
    const normalizedTier = (userTier || TIER_LEVELS.FREE).toLowerCase();
    const availableFeatures = [];
    
    Object.keys(FEATURE_ACCESS).forEach(feature => {
      if (hasFeatureAccess(feature, normalizedTier)) {
        availableFeatures.push(feature);
      }
    });
    
    return availableFeatures;
  };
  
  /**
   * Get upgrade benefits - features user would gain by upgrading
   * @param {string} currentTier - User's current tier
   * @param {string} targetTier - Tier to upgrade to
   * @returns {array} - List of new features
   */
  export const getUpgradeBenefits = (currentTier = TIER_LEVELS.FREE, targetTier = TIER_LEVELS.PLUS) => {
    const currentFeatures = getAvailableFeatures(currentTier);
    const targetFeatures = getAvailableFeatures(targetTier);
    
    return targetFeatures.filter(feature => !currentFeatures.includes(feature));
  };
  
  /**
   * Format tier name for display
   * @param {string} tier - Tier identifier
   * @returns {string} - Formatted tier name
   */
  export const formatTierName = (tier) => {
    const tierMap = {
      [TIER_LEVELS.FREE]: 'Free',
      [TIER_LEVELS.PLUS]: 'Plus',
      [TIER_LEVELS.PREMIUM]: 'Premium'
    };
    
    return tierMap[tier?.toLowerCase()] || 'Unknown';
  };
  
  /**
   * Get tier badge color class
   * @param {string} tier - Tier identifier
   * @returns {string} - CSS class for tier badge
   */
  export const getTierBadgeClass = (tier) => {
    const classMap = {
      [TIER_LEVELS.FREE]: 'tier-free',
      [TIER_LEVELS.PLUS]: 'tier-plus',
      [TIER_LEVELS.PREMIUM]: 'tier-premium'
    };
    
    return classMap[tier?.toLowerCase()] || 'tier-free';
  };
  
  /**
   * Check if user has exceeded monthly view limit
   * @param {string} userTier - User's subscription tier
   * @param {number} currentViews - Current month's view count
   * @returns {boolean} - Whether limit is exceeded
   */
  export const hasExceededViewLimit = (userTier, currentViews) => {
    const limit = getFeatureLimit('monthlyViewLimit', userTier);
    
    // -1 means unlimited
    if (limit === -1) return false;
    
    return currentViews >= limit;
  };
  
  /**
   * Get remaining views for the month
   * @param {string} userTier - User's subscription tier
   * @param {number} currentViews - Current month's view count
   * @returns {number|string} - Remaining views or "Unlimited"
   */
  export const getRemainingViews = (userTier, currentViews) => {
    const limit = getFeatureLimit('monthlyViewLimit', userTier);
    
    if (limit === -1) return 'Unlimited';
    if (limit === 0) return 0;
    
    const remaining = limit - currentViews;
    return remaining > 0 ? remaining : 0;
  };
  
  // Export tier constants for use in other files
  export const TIERS = TIER_LEVELS;
  
  // Default export with all utilities
  export default {
    TIERS,
    hasFeatureAccess,
    getFeatureLimit,
    meetsTierRequirement,
    getAvailableFeatures,
    getUpgradeBenefits,
    formatTierName,
    getTierBadgeClass,
    hasExceededViewLimit,
    getRemainingViews
  };