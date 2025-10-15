export const TIER_LEVELS = {
    FREE: 'free',
    PLUS: 'plus',
    PREMIUM: 'premium'
  };
  
  export const TIER_FEATURES = {
    // Company data fields
    COMPANY_NAME: ['free', 'plus', 'premium'],
    COMPANY_ADDRESS: ['free', 'plus', 'premium'],
    COMPANY_WEBSITE: ['free', 'plus', 'premium'],
    COMPANY_SECTORS: ['free', 'plus', 'premium'],
    COMPANY_TYPE: ['free', 'plus', 'premium'],
    
    COMPANY_ABN: ['plus', 'premium'],
    COMPANY_SUMMARY: ['plus', 'premium'],
    COMPANY_CAPABILITIES: ['plus', 'premium'],
    COMPANY_SIZE: ['plus', 'premium'],
    COMPANY_CERTIFICATIONS: ['plus', 'premium'],
    
    COMPANY_REVENUE: ['premium'],
    COMPANY_EMPLOYEES: ['premium'],
    COMPANY_OWNERSHIP: ['premium'],
    COMPANY_LOCAL_CONTENT: ['premium'],
    
    // Features
    ADVANCED_SEARCH: ['plus', 'premium'],
    SAVED_SEARCHES: ['plus', 'premium'],
    UNLIMITED_VIEWS: ['plus', 'premium'],
    EXPORT_CSV: ['plus', 'premium'],
    EXPORT_PDF: ['premium'],
    API_ACCESS: ['premium'],
    
    // Limits
    MAX_MONTHLY_VIEWS: {
      free: 5,
      plus: -1, // unlimited
      premium: -1
    },
    MAX_SAVED_SEARCHES: {
      free: 0,
      plus: 10,
      premium: -1
    },
    MAX_BOOKMARKS: {
      free: 5,
      plus: 50,
      premium: -1
    }
  };
  
  export const checkTierAccess = (userTier, feature) => {
    const allowedTiers = TIER_FEATURES[feature];
    if (!allowedTiers) return false;
    return allowedTiers.includes(userTier);
  };
  
  export const getTierLimit = (userTier, limitType) => {
    const limits = TIER_FEATURES[limitType];
    if (!limits) return 0;
    return limits[userTier] || 0;
  };