import {
    TIER_FEATURES,
    TIER_LIMITS,
    checkTierAccess,
    getTierLimit,
    getTierFeatures,
    getTierLimits,
    getRequiredTier,
  } from './tierConfig';
  
  describe('tierConfig', () => {
    describe('TIER_FEATURES constants', () => {
      it('should define all free tier features', () => {
        expect(TIER_FEATURES.BASIC_SEARCH).toBe('BASIC_SEARCH');
        expect(TIER_FEATURES.COMPANY_BASIC_INFO).toBe('COMPANY_BASIC_INFO');
        expect(TIER_FEATURES.COMPANY_CONTACT).toBe('COMPANY_CONTACT');
      });
  
      it('should define all plus tier features', () => {
        expect(TIER_FEATURES.SAVED_SEARCHES).toBe('SAVED_SEARCHES');
        expect(TIER_FEATURES.ADVANCED_FILTERS).toBe('ADVANCED_FILTERS');
        expect(TIER_FEATURES.UNLIMITED_SEARCHES).toBe('UNLIMITED_SEARCHES');
        expect(TIER_FEATURES.COMPANY_ABN).toBe('COMPANY_ABN');
        expect(TIER_FEATURES.EXPORT_BASIC).toBe('EXPORT_BASIC');
        expect(TIER_FEATURES.UNLIMITED_BOOKMARKS).toBe('UNLIMITED_BOOKMARKS');
      });
  
      it('should define all premium tier features', () => {
        expect(TIER_FEATURES.COMPANY_REVENUE).toBe('COMPANY_REVENUE');
        expect(TIER_FEATURES.COMPANY_EMPLOYEES).toBe('COMPANY_EMPLOYEES');
        expect(TIER_FEATURES.COMPANY_OWNERSHIP).toBe('COMPANY_OWNERSHIP');
        expect(TIER_FEATURES.DEMOGRAPHIC_FILTERS).toBe('DEMOGRAPHIC_FILTERS');
        expect(TIER_FEATURES.EXPORT_FULL).toBe('EXPORT_FULL');
        expect(TIER_FEATURES.API_ACCESS).toBe('API_ACCESS');
        expect(TIER_FEATURES.PRIORITY_SUPPORT).toBe('PRIORITY_SUPPORT');
      });
    });
  
    describe('TIER_LIMITS constants', () => {
      it('should define all limit types', () => {
        expect(TIER_LIMITS.BOOKMARK_LIMIT).toBe('BOOKMARK_LIMIT');
        expect(TIER_LIMITS.SEARCH_LIMIT).toBe('SEARCH_LIMIT');
        expect(TIER_LIMITS.EXPORT_LIMIT).toBe('EXPORT_LIMIT');
        expect(TIER_LIMITS.SAVED_SEARCH_LIMIT).toBe('SAVED_SEARCH_LIMIT');
        expect(TIER_LIMITS.COMPANY_VIEW_LIMIT).toBe('COMPANY_VIEW_LIMIT');
      });
    });
  
    describe('checkTierAccess', () => {
      describe('free tier', () => {
        it('should have access to basic features', () => {
          expect(checkTierAccess('free', TIER_FEATURES.BASIC_SEARCH)).toBe(true);
          expect(checkTierAccess('free', TIER_FEATURES.COMPANY_BASIC_INFO)).toBe(true);
          expect(checkTierAccess('free', TIER_FEATURES.COMPANY_CONTACT)).toBe(true);
        });
  
        it('should not have access to plus features', () => {
          expect(checkTierAccess('free', TIER_FEATURES.SAVED_SEARCHES)).toBe(false);
          expect(checkTierAccess('free', TIER_FEATURES.ADVANCED_FILTERS)).toBe(false);
          expect(checkTierAccess('free', TIER_FEATURES.UNLIMITED_SEARCHES)).toBe(false);
          expect(checkTierAccess('free', TIER_FEATURES.COMPANY_ABN)).toBe(false);
          expect(checkTierAccess('free', TIER_FEATURES.EXPORT_BASIC)).toBe(false);
          expect(checkTierAccess('free', TIER_FEATURES.UNLIMITED_BOOKMARKS)).toBe(false);
        });
  
        it('should not have access to premium features', () => {
          expect(checkTierAccess('free', TIER_FEATURES.COMPANY_REVENUE)).toBe(false);
          expect(checkTierAccess('free', TIER_FEATURES.COMPANY_EMPLOYEES)).toBe(false);
          expect(checkTierAccess('free', TIER_FEATURES.COMPANY_OWNERSHIP)).toBe(false);
          expect(checkTierAccess('free', TIER_FEATURES.DEMOGRAPHIC_FILTERS)).toBe(false);
          expect(checkTierAccess('free', TIER_FEATURES.EXPORT_FULL)).toBe(false);
          expect(checkTierAccess('free', TIER_FEATURES.API_ACCESS)).toBe(false);
          expect(checkTierAccess('free', TIER_FEATURES.PRIORITY_SUPPORT)).toBe(false);
        });
      });
  
      describe('plus tier', () => {
        it('should have access to free features', () => {
          expect(checkTierAccess('plus', TIER_FEATURES.BASIC_SEARCH)).toBe(true);
          expect(checkTierAccess('plus', TIER_FEATURES.COMPANY_BASIC_INFO)).toBe(true);
          expect(checkTierAccess('plus', TIER_FEATURES.COMPANY_CONTACT)).toBe(true);
        });
  
        it('should have access to plus features', () => {
          expect(checkTierAccess('plus', TIER_FEATURES.SAVED_SEARCHES)).toBe(true);
          expect(checkTierAccess('plus', TIER_FEATURES.ADVANCED_FILTERS)).toBe(true);
          expect(checkTierAccess('plus', TIER_FEATURES.UNLIMITED_SEARCHES)).toBe(true);
          expect(checkTierAccess('plus', TIER_FEATURES.COMPANY_ABN)).toBe(true);
          expect(checkTierAccess('plus', TIER_FEATURES.EXPORT_BASIC)).toBe(true);
          expect(checkTierAccess('plus', TIER_FEATURES.UNLIMITED_BOOKMARKS)).toBe(true);
        });
  
        it('should not have access to premium features', () => {
          expect(checkTierAccess('plus', TIER_FEATURES.COMPANY_REVENUE)).toBe(false);
          expect(checkTierAccess('plus', TIER_FEATURES.COMPANY_EMPLOYEES)).toBe(false);
          expect(checkTierAccess('plus', TIER_FEATURES.COMPANY_OWNERSHIP)).toBe(false);
          expect(checkTierAccess('plus', TIER_FEATURES.DEMOGRAPHIC_FILTERS)).toBe(false);
          expect(checkTierAccess('plus', TIER_FEATURES.EXPORT_FULL)).toBe(false);
          expect(checkTierAccess('plus', TIER_FEATURES.API_ACCESS)).toBe(false);
          expect(checkTierAccess('plus', TIER_FEATURES.PRIORITY_SUPPORT)).toBe(false);
        });
      });
  
      describe('premium tier', () => {
        it('should have access to all features', () => {
          // Free features
          expect(checkTierAccess('premium', TIER_FEATURES.BASIC_SEARCH)).toBe(true);
          expect(checkTierAccess('premium', TIER_FEATURES.COMPANY_BASIC_INFO)).toBe(true);
          expect(checkTierAccess('premium', TIER_FEATURES.COMPANY_CONTACT)).toBe(true);
          
          // Plus features
          expect(checkTierAccess('premium', TIER_FEATURES.SAVED_SEARCHES)).toBe(true);
          expect(checkTierAccess('premium', TIER_FEATURES.ADVANCED_FILTERS)).toBe(true);
          expect(checkTierAccess('premium', TIER_FEATURES.UNLIMITED_SEARCHES)).toBe(true);
          expect(checkTierAccess('premium', TIER_FEATURES.COMPANY_ABN)).toBe(true);
          expect(checkTierAccess('premium', TIER_FEATURES.EXPORT_BASIC)).toBe(true);
          expect(checkTierAccess('premium', TIER_FEATURES.UNLIMITED_BOOKMARKS)).toBe(true);
          
          // Premium features
          expect(checkTierAccess('premium', TIER_FEATURES.COMPANY_REVENUE)).toBe(true);
          expect(checkTierAccess('premium', TIER_FEATURES.COMPANY_EMPLOYEES)).toBe(true);
          expect(checkTierAccess('premium', TIER_FEATURES.COMPANY_OWNERSHIP)).toBe(true);
          expect(checkTierAccess('premium', TIER_FEATURES.DEMOGRAPHIC_FILTERS)).toBe(true);
          expect(checkTierAccess('premium', TIER_FEATURES.EXPORT_FULL)).toBe(true);
          expect(checkTierAccess('premium', TIER_FEATURES.API_ACCESS)).toBe(true);
          expect(checkTierAccess('premium', TIER_FEATURES.PRIORITY_SUPPORT)).toBe(true);
        });
      });
  
      describe('invalid tier', () => {
        it('should default to free tier for invalid tier name', () => {
          expect(checkTierAccess('invalid', TIER_FEATURES.BASIC_SEARCH)).toBe(true);
          expect(checkTierAccess('invalid', TIER_FEATURES.SAVED_SEARCHES)).toBe(false);
          expect(checkTierAccess('invalid', TIER_FEATURES.API_ACCESS)).toBe(false);
        });
  
        it('should default to free tier for null', () => {
          expect(checkTierAccess(null, TIER_FEATURES.BASIC_SEARCH)).toBe(true);
          expect(checkTierAccess(null, TIER_FEATURES.SAVED_SEARCHES)).toBe(false);
        });
  
        it('should default to free tier for undefined', () => {
          expect(checkTierAccess(undefined, TIER_FEATURES.BASIC_SEARCH)).toBe(true);
          expect(checkTierAccess(undefined, TIER_FEATURES.SAVED_SEARCHES)).toBe(false);
        });
      });
    });
  
    describe('getTierLimit', () => {
      describe('free tier limits', () => {
        it('should return correct limits', () => {
          expect(getTierLimit('free', TIER_LIMITS.BOOKMARK_LIMIT)).toBe(5);
          expect(getTierLimit('free', TIER_LIMITS.SEARCH_LIMIT)).toBe(50);
          expect(getTierLimit('free', TIER_LIMITS.EXPORT_LIMIT)).toBe(0);
          expect(getTierLimit('free', TIER_LIMITS.SAVED_SEARCH_LIMIT)).toBe(0);
          expect(getTierLimit('free', TIER_LIMITS.COMPANY_VIEW_LIMIT)).toBe(5);
        });
      });
  
      describe('plus tier limits', () => {
        it('should return correct limits', () => {
          expect(getTierLimit('plus', TIER_LIMITS.BOOKMARK_LIMIT)).toBe(-1);
          expect(getTierLimit('plus', TIER_LIMITS.SEARCH_LIMIT)).toBe(-1);
          expect(getTierLimit('plus', TIER_LIMITS.EXPORT_LIMIT)).toBe(100);
          expect(getTierLimit('plus', TIER_LIMITS.SAVED_SEARCH_LIMIT)).toBe(10);
          expect(getTierLimit('plus', TIER_LIMITS.COMPANY_VIEW_LIMIT)).toBe(-1);
        });
      });
  
      describe('premium tier limits', () => {
        it('should return unlimited (-1) for all limits', () => {
          expect(getTierLimit('premium', TIER_LIMITS.BOOKMARK_LIMIT)).toBe(-1);
          expect(getTierLimit('premium', TIER_LIMITS.SEARCH_LIMIT)).toBe(-1);
          expect(getTierLimit('premium', TIER_LIMITS.EXPORT_LIMIT)).toBe(-1);
          expect(getTierLimit('premium', TIER_LIMITS.SAVED_SEARCH_LIMIT)).toBe(-1);
          expect(getTierLimit('premium', TIER_LIMITS.COMPANY_VIEW_LIMIT)).toBe(-1);
        });
      });
  
      describe('invalid inputs', () => {
        it('should return 0 for invalid tier', () => {
          expect(getTierLimit('invalid', TIER_LIMITS.BOOKMARK_LIMIT)).toBe(5);
        });
  
        it('should return 0 for invalid limit type', () => {
          expect(getTierLimit('free', 'INVALID_LIMIT')).toBe(0);
          expect(getTierLimit('plus', 'INVALID_LIMIT')).toBe(0);
          expect(getTierLimit('premium', 'INVALID_LIMIT')).toBe(0);
        });
  
        it('should handle null tier', () => {
          expect(getTierLimit(null, TIER_LIMITS.BOOKMARK_LIMIT)).toBe(5);
        });
  
        it('should handle undefined tier', () => {
          expect(getTierLimit(undefined, TIER_LIMITS.BOOKMARK_LIMIT)).toBe(5);
        });
      });
    });
  
    describe('getTierFeatures', () => {
      it('should return all features for free tier', () => {
        const features = getTierFeatures('free');
        expect(features).toContain(TIER_FEATURES.BASIC_SEARCH);
        expect(features).toContain(TIER_FEATURES.COMPANY_BASIC_INFO);
        expect(features).toContain(TIER_FEATURES.COMPANY_CONTACT);
        expect(features.length).toBe(3);
      });
  
      it('should return all features for plus tier', () => {
        const features = getTierFeatures('plus');
        expect(features).toContain(TIER_FEATURES.BASIC_SEARCH);
        expect(features).toContain(TIER_FEATURES.SAVED_SEARCHES);
        expect(features).toContain(TIER_FEATURES.ADVANCED_FILTERS);
        expect(features).toContain(TIER_FEATURES.UNLIMITED_BOOKMARKS);
        expect(features.length).toBe(9);
      });
  
      it('should return all features for premium tier', () => {
        const features = getTierFeatures('premium');
        expect(features).toContain(TIER_FEATURES.BASIC_SEARCH);
        expect(features).toContain(TIER_FEATURES.SAVED_SEARCHES);
        expect(features).toContain(TIER_FEATURES.API_ACCESS);
        expect(features).toContain(TIER_FEATURES.PRIORITY_SUPPORT);
        expect(features.length).toBe(16);
      });
  
      it('should default to free tier for invalid tier', () => {
        const features = getTierFeatures('invalid');
        expect(features).toContain(TIER_FEATURES.BASIC_SEARCH);
        expect(features.length).toBe(3);
      });
    });
  
    describe('getTierLimits', () => {
      it('should return all limits for free tier', () => {
        const limits = getTierLimits('free');
        expect(limits[TIER_LIMITS.BOOKMARK_LIMIT]).toBe(5);
        expect(limits[TIER_LIMITS.SEARCH_LIMIT]).toBe(50);
        expect(limits[TIER_LIMITS.EXPORT_LIMIT]).toBe(0);
        expect(limits[TIER_LIMITS.SAVED_SEARCH_LIMIT]).toBe(0);
        expect(limits[TIER_LIMITS.COMPANY_VIEW_LIMIT]).toBe(5);
      });
  
      it('should return all limits for plus tier', () => {
        const limits = getTierLimits('plus');
        expect(limits[TIER_LIMITS.BOOKMARK_LIMIT]).toBe(-1);
        expect(limits[TIER_LIMITS.SEARCH_LIMIT]).toBe(-1);
        expect(limits[TIER_LIMITS.EXPORT_LIMIT]).toBe(100);
        expect(limits[TIER_LIMITS.SAVED_SEARCH_LIMIT]).toBe(10);
        expect(limits[TIER_LIMITS.COMPANY_VIEW_LIMIT]).toBe(-1);
      });
  
      it('should return all limits for premium tier', () => {
        const limits = getTierLimits('premium');
        expect(limits[TIER_LIMITS.BOOKMARK_LIMIT]).toBe(-1);
        expect(limits[TIER_LIMITS.SEARCH_LIMIT]).toBe(-1);
        expect(limits[TIER_LIMITS.EXPORT_LIMIT]).toBe(-1);
        expect(limits[TIER_LIMITS.SAVED_SEARCH_LIMIT]).toBe(-1);
        expect(limits[TIER_LIMITS.COMPANY_VIEW_LIMIT]).toBe(-1);
      });
  
      it('should default to free tier for invalid tier', () => {
        const limits = getTierLimits('invalid');
        expect(limits[TIER_LIMITS.BOOKMARK_LIMIT]).toBe(5);
      });
    });
  
    describe('getRequiredTier', () => {
      it('should return free for free tier features', () => {
        expect(getRequiredTier(TIER_FEATURES.BASIC_SEARCH)).toBe('free');
        expect(getRequiredTier(TIER_FEATURES.COMPANY_BASIC_INFO)).toBe('free');
        expect(getRequiredTier(TIER_FEATURES.COMPANY_CONTACT)).toBe('free');
      });
  
      it('should return plus for plus tier features', () => {
        expect(getRequiredTier(TIER_FEATURES.SAVED_SEARCHES)).toBe('plus');
        expect(getRequiredTier(TIER_FEATURES.ADVANCED_FILTERS)).toBe('plus');
        expect(getRequiredTier(TIER_FEATURES.UNLIMITED_SEARCHES)).toBe('plus');
        expect(getRequiredTier(TIER_FEATURES.COMPANY_ABN)).toBe('plus');
        expect(getRequiredTier(TIER_FEATURES.EXPORT_BASIC)).toBe('plus');
        expect(getRequiredTier(TIER_FEATURES.UNLIMITED_BOOKMARKS)).toBe('plus');
      });
  
      it('should return premium for premium tier features', () => {
        expect(getRequiredTier(TIER_FEATURES.COMPANY_REVENUE)).toBe('premium');
        expect(getRequiredTier(TIER_FEATURES.COMPANY_EMPLOYEES)).toBe('premium');
        expect(getRequiredTier(TIER_FEATURES.COMPANY_OWNERSHIP)).toBe('premium');
        expect(getRequiredTier(TIER_FEATURES.DEMOGRAPHIC_FILTERS)).toBe('premium');
        expect(getRequiredTier(TIER_FEATURES.EXPORT_FULL)).toBe('premium');
        expect(getRequiredTier(TIER_FEATURES.API_ACCESS)).toBe('premium');
        expect(getRequiredTier(TIER_FEATURES.PRIORITY_SUPPORT)).toBe('premium');
      });
  
      it('should return premium for unknown features', () => {
        expect(getRequiredTier('UNKNOWN_FEATURE')).toBe('premium');
        expect(getRequiredTier('RANDOM_FEATURE')).toBe('premium');
        expect(getRequiredTier('')).toBe('premium');
      });
  
      it('should handle null and undefined', () => {
        expect(getRequiredTier(null)).toBe('premium');
        expect(getRequiredTier(undefined)).toBe('premium');
      });
    });
  
    describe('tier hierarchy', () => {
      it('should maintain proper feature inheritance', () => {
        const freeFeatures = getTierFeatures('free');
        const plusFeatures = getTierFeatures('plus');
        const premiumFeatures = getTierFeatures('premium');
  
        // Plus should include all free features
        freeFeatures.forEach(feature => {
          expect(plusFeatures).toContain(feature);
        });
  
        // Premium should include all plus features
        plusFeatures.forEach(feature => {
          expect(premiumFeatures).toContain(feature);
        });
      });
  
      it('should have increasing limits as tiers increase', () => {
        const freeLimits = getTierLimits('free');
        const plusLimits = getTierLimits('plus');
        const premiumLimits = getTierLimits('premium');
  
        // Plus limits should be >= free limits (treating -1 as unlimited)
        expect(plusLimits[TIER_LIMITS.BOOKMARK_LIMIT]).toBe(-1);
        expect(plusLimits[TIER_LIMITS.SEARCH_LIMIT]).toBe(-1);
        expect(plusLimits[TIER_LIMITS.EXPORT_LIMIT]).toBeGreaterThan(
          freeLimits[TIER_LIMITS.EXPORT_LIMIT]
        );
  
        // Premium should have unlimited everything
        Object.values(TIER_LIMITS).forEach(limitType => {
          expect(premiumLimits[limitType]).toBe(-1);
        });
      });
    });
  
    describe('integration scenarios', () => {
      it('should properly restrict free users', () => {
        expect(checkTierAccess('free', TIER_FEATURES.SAVED_SEARCHES)).toBe(false);
        expect(getTierLimit('free', TIER_LIMITS.BOOKMARK_LIMIT)).toBe(5);
        expect(getRequiredTier(TIER_FEATURES.SAVED_SEARCHES)).toBe('plus');
      });
  
      it('should allow plus users appropriate access', () => {
        expect(checkTierAccess('plus', TIER_FEATURES.SAVED_SEARCHES)).toBe(true);
        expect(checkTierAccess('plus', TIER_FEATURES.API_ACCESS)).toBe(false);
        expect(getTierLimit('plus', TIER_LIMITS.BOOKMARK_LIMIT)).toBe(-1);
        expect(getTierLimit('plus', TIER_LIMITS.SAVED_SEARCH_LIMIT)).toBe(10);
      });
  
      it('should give premium users full access', () => {
        const allFeatures = [
          ...Object.values(TIER_FEATURES)
        ];
        
        allFeatures.forEach(feature => {
          expect(checkTierAccess('premium', feature)).toBe(true);
        });
  
        Object.values(TIER_LIMITS).forEach(limitType => {
          expect(getTierLimit('premium', limitType)).toBe(-1);
        });
      });
    });
  });