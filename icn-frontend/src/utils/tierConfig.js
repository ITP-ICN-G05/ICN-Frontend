// Tier feature constants
export const TIER_FEATURES = {
  // Free tier features
  BASIC_SEARCH: 'BASIC_SEARCH',
  COMPANY_BASIC_INFO: 'COMPANY_BASIC_INFO',
  COMPANY_CONTACT: 'COMPANY_CONTACT',
  
  // Plus tier features
  SAVED_SEARCHES: 'SAVED_SEARCHES',
  ADVANCED_FILTERS: 'ADVANCED_FILTERS',
  UNLIMITED_SEARCHES: 'UNLIMITED_SEARCHES',
  COMPANY_ABN: 'COMPANY_ABN',
  EXPORT_BASIC: 'EXPORT_BASIC',
  UNLIMITED_BOOKMARKS: 'UNLIMITED_BOOKMARKS',
  
  // Premium tier features
  COMPANY_REVENUE: 'COMPANY_REVENUE',
  COMPANY_EMPLOYEES: 'COMPANY_EMPLOYEES',
  COMPANY_OWNERSHIP: 'COMPANY_OWNERSHIP',
  DEMOGRAPHIC_FILTERS: 'DEMOGRAPHIC_FILTERS',
  EXPORT_FULL: 'EXPORT_FULL',
  API_ACCESS: 'API_ACCESS',
  PRIORITY_SUPPORT: 'PRIORITY_SUPPORT',
};

// Tier limit types
export const TIER_LIMITS = {
  BOOKMARK_LIMIT: 'BOOKMARK_LIMIT',
  SEARCH_LIMIT: 'SEARCH_LIMIT',
  EXPORT_LIMIT: 'EXPORT_LIMIT',
  SAVED_SEARCH_LIMIT: 'SAVED_SEARCH_LIMIT',
  COMPANY_VIEW_LIMIT: 'COMPANY_VIEW_LIMIT',
};

// Define feature arrays separately to avoid circular references
const FREE_FEATURES = [
  TIER_FEATURES.BASIC_SEARCH,
  TIER_FEATURES.COMPANY_BASIC_INFO,
  TIER_FEATURES.COMPANY_CONTACT,
];

const PLUS_FEATURES = [
  ...FREE_FEATURES,
  TIER_FEATURES.SAVED_SEARCHES,
  TIER_FEATURES.ADVANCED_FILTERS,
  TIER_FEATURES.UNLIMITED_SEARCHES,
  TIER_FEATURES.COMPANY_ABN,
  TIER_FEATURES.EXPORT_BASIC,
  TIER_FEATURES.UNLIMITED_BOOKMARKS,
];

const PREMIUM_FEATURES = [
  ...PLUS_FEATURES,
  TIER_FEATURES.COMPANY_REVENUE,
  TIER_FEATURES.COMPANY_EMPLOYEES,
  TIER_FEATURES.COMPANY_OWNERSHIP,
  TIER_FEATURES.DEMOGRAPHIC_FILTERS,
  TIER_FEATURES.EXPORT_FULL,
  TIER_FEATURES.API_ACCESS,
  TIER_FEATURES.PRIORITY_SUPPORT,
];

// Tier configurations
const TIER_CONFIG = {
  free: {
    features: FREE_FEATURES,
    limits: {
      [TIER_LIMITS.BOOKMARK_LIMIT]: 5,
      [TIER_LIMITS.SEARCH_LIMIT]: 50,
      [TIER_LIMITS.EXPORT_LIMIT]: 0,
      [TIER_LIMITS.SAVED_SEARCH_LIMIT]: 0,
      [TIER_LIMITS.COMPANY_VIEW_LIMIT]: 5,
    },
  },
  plus: {
    features: PLUS_FEATURES,
    limits: {
      [TIER_LIMITS.BOOKMARK_LIMIT]: -1, // unlimited
      [TIER_LIMITS.SEARCH_LIMIT]: -1,
      [TIER_LIMITS.EXPORT_LIMIT]: 100,
      [TIER_LIMITS.SAVED_SEARCH_LIMIT]: 10,
      [TIER_LIMITS.COMPANY_VIEW_LIMIT]: -1,
    },
  },
  premium: {
    features: PREMIUM_FEATURES,
    limits: {
      [TIER_LIMITS.BOOKMARK_LIMIT]: -1,
      [TIER_LIMITS.SEARCH_LIMIT]: -1,
      [TIER_LIMITS.EXPORT_LIMIT]: -1,
      [TIER_LIMITS.SAVED_SEARCH_LIMIT]: -1,
      [TIER_LIMITS.COMPANY_VIEW_LIMIT]: -1,
    },
  },
};

/**
 * Check if a tier has access to a specific feature
 */
export const checkTierAccess = (tier, feature) => {
  const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG.free;
  return tierConfig.features.includes(feature);
};

/**
 * Get the limit for a specific tier and limit type
 */
export const getTierLimit = (tier, limitType) => {
  const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG.free;
  return tierConfig.limits[limitType] || 0;
};

/**
 * Get all features for a tier
 */
export const getTierFeatures = (tier) => {
  const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG.free;
  return tierConfig.features;
};

/**
 * Get all limits for a tier
 */
export const getTierLimits = (tier) => {
  const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG.free;
  return tierConfig.limits;
};

/**
 * Check if a feature requires a higher tier
 */
export const getRequiredTier = (feature) => {
  if (FREE_FEATURES.includes(feature)) return 'free';
  if (PLUS_FEATURES.includes(feature)) return 'plus';
  if (PREMIUM_FEATURES.includes(feature)) return 'premium';
  return 'premium'; // Default to premium for unknown features
};

export default TIER_CONFIG;
