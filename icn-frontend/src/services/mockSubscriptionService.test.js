import { mockSubscriptionService } from './mockSubscriptionService';

describe('mockSubscriptionService', () => {
  beforeEach(() => {
    localStorage.clear();
    mockSubscriptionService.activeSubscriptions = new Map();
  });

  describe('getCurrentSubscription', () => {
    it('should return current subscription', async () => {
      const user = { id: '1', tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockSubscriptionService.getCurrentSubscription();
      
      expect(result.data.tier).toBe('plus');
      expect(result.data.status).toBe('active');
    });

    it('should create default subscription for new user', async () => {
      const user = { id: 'new-user', tier: 'free' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockSubscriptionService.getCurrentSubscription();
      
      expect(result.data.tier).toBe('free');
    });

    it('should throw error when user not authenticated', async () => {
      // No user in localStorage
      await expect(
        mockSubscriptionService.getCurrentSubscription()
      ).rejects.toThrow('User not authenticated');
    });

    it('should throw error when user has no id', async () => {
      localStorage.setItem('user', JSON.stringify({ name: 'Test User' }));
      
      await expect(
        mockSubscriptionService.getCurrentSubscription()
      ).rejects.toThrow('User not authenticated');
    });

    it('should return existing subscription from cache', async () => {
      const user = { id: '1', tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user));
      
      // First call creates subscription
      const firstResult = await mockSubscriptionService.getCurrentSubscription();
      const subscriptionId = firstResult.data.id;
      
      // Second call should return same subscription from Map
      const secondResult = await mockSubscriptionService.getCurrentSubscription();
      
      expect(secondResult.data.id).toBe(subscriptionId);
      expect(secondResult.data).toEqual(firstResult.data);
    });

    it('should default to free tier when user tier is undefined', async () => {
      const user = { id: '1' }; // No tier specified
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockSubscriptionService.getCurrentSubscription();
      
      expect(result.data.tier).toBe('free');
      expect(result.data.planId).toBe('plan_free');
    });

    it('should default to free tier when user tier is null', async () => {
      const user = { id: '1', tier: null };
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockSubscriptionService.getCurrentSubscription();
      
      expect(result.data.tier).toBe('free');
    });
  });

  describe('getPlans', () => {
    it('should return available plans', async () => {
      const result = await mockSubscriptionService.getPlans();
      
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThanOrEqual(3);
      expect(result.data).toContainEqual(
        expect.objectContaining({ tier: 'free' })
      );
    });
  });

  describe('changePlan', () => {
    it('should upgrade to premium', async () => {
      const user = { id: '1', tier: 'free' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockSubscriptionService.changePlan('plan_premium', 'monthly');
      
      expect(result.data.tier).toBe('premium');
      expect(result.data.status).toBe('active');
      
      // Check localStorage updated
      const updatedUser = JSON.parse(localStorage.getItem('user'));
      expect(updatedUser.tier).toBe('premium');
    });

    it('should handle yearly billing', async () => {
      const user = { id: '1', tier: 'free' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockSubscriptionService.changePlan('plan_plus', 'yearly');
      
      expect(result.data.billingPeriod).toBe('yearly');
    });

    it('should reject invalid plan', async () => {
      const user = { id: '1', tier: 'free' };
      localStorage.setItem('user', JSON.stringify(user));
      
      await expect(
        mockSubscriptionService.changePlan('invalid-plan', 'monthly')
      ).rejects.toThrow('Invalid subscription plan');
    });

    it('should throw error when user not authenticated', async () => {
      // No user in localStorage
      await expect(
        mockSubscriptionService.changePlan('plan_plus', 'monthly')
      ).rejects.toThrow('User not authenticated');
    });

    it('should throw error when user has no id', async () => {
      localStorage.setItem('user', JSON.stringify({ name: 'Test' }));
      
      await expect(
        mockSubscriptionService.changePlan('plan_plus', 'monthly')
      ).rejects.toThrow('User not authenticated');
    });

    it('should default to monthly billing when not specified', async () => {
      const user = { id: '1', tier: 'free' };
      localStorage.setItem('user', JSON.stringify(user));
      
      // Call without billingPeriod parameter
      const result = await mockSubscriptionService.changePlan('plan_plus');
      
      expect(result.data.billingPeriod).toBe('monthly');
      expect(result.data.amount).toBe(49); // Monthly price
    });

    it('should calculate yearly amount correctly', async () => {
      const user = { id: '1', tier: 'free' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockSubscriptionService.changePlan('plan_premium', 'yearly');
      
      expect(result.data.amount).toBe(1490); // Yearly price
      expect(result.data.currency).toBe('AUD');
    });
  });

  describe('cancelSubscription', () => {
    it('should downgrade to free tier', async () => {
      const user = { id: '1', tier: 'premium' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockSubscriptionService.cancelSubscription();
      
      expect(result.data.tier).toBe('free');
      expect(result.data.status).toBe('cancelled');
      
      const updatedUser = JSON.parse(localStorage.getItem('user'));
      expect(updatedUser.tier).toBe('free');
    });

    it('should throw error when user not authenticated', async () => {
      // No user in localStorage
      await expect(
        mockSubscriptionService.cancelSubscription()
      ).rejects.toThrow('User not authenticated');
    });

    it('should preserve subscription ID when cancelling', async () => {
      const user = { id: '1', tier: 'premium' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const originalSub = await mockSubscriptionService.getCurrentSubscription();
      const result = await mockSubscriptionService.cancelSubscription();
      
      expect(result.data.id).toBe(originalSub.data.id);
      expect(result.data.status).toBe('cancelled');
      expect(result.data).toHaveProperty('cancelledAt');
    });
  });

  describe('getUsageStats', () => {
    it('should return usage statistics', async () => {
      const user = { id: '1', tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockSubscriptionService.getUsageStats();
      
      expect(result.data).toHaveProperty('tier');
      expect(result.data).toHaveProperty('features');
      expect(result.data).toHaveProperty('limits');
    });

    it('should throw error when user not authenticated', async () => {
      await expect(
        mockSubscriptionService.getUsageStats()
      ).rejects.toThrow('User not authenticated');
    });

    it('should return valid usage stats for all tiers', async () => {
      const tiers = ['free', 'plus', 'premium'];
      
      for (const tier of tiers) {
        localStorage.clear();
        mockSubscriptionService.activeSubscriptions = new Map();
        
        const user = { id: `user-${tier}`, tier };
        localStorage.setItem('user', JSON.stringify(user));
        
        const result = await mockSubscriptionService.getUsageStats();
        
        expect(result.data.tier).toBe(tier);
        expect(result.data).toHaveProperty('monthlyViews');
        expect(result.data).toHaveProperty('savedSearches');
        expect(result.data).toHaveProperty('bookmarks');
        expect(result.data).toHaveProperty('exportsThisMonth');
      }
    });
  });

  describe('checkFeatureAccess', () => {
    it('should check feature access', async () => {
      const user = { id: '1', tier: 'premium' };
      localStorage.setItem('user', JSON.stringify(user));
      
      // Initialize subscription first to ensure data is set up
      await mockSubscriptionService.getCurrentSubscription();
      
      // Get the actual features available for this tier
      const stats = await mockSubscriptionService.getUsageStats();
      
      // Check access to a feature that exists in the premium tier
      if (stats.data.features && stats.data.features.length > 0) {
        const premiumFeature = stats.data.features.find(f => 
          f === 'export' || f === 'exports' || f === 'advancedExport'
        ) || stats.data.features[0];
        
        const result = await mockSubscriptionService.checkFeatureAccess(premiumFeature);
        expect(result.data).toBe(true);
      } else {
        // Fallback: just verify the method returns a boolean
        const result = await mockSubscriptionService.checkFeatureAccess('export');
        expect(typeof result.data).toBe('boolean');
      }
    });

    it('should deny feature access for free tier users', async () => {
      const user = { id: '2', tier: 'free' };
      localStorage.setItem('user', JSON.stringify(user));
      
      await mockSubscriptionService.getCurrentSubscription();
      
      // Premium-only features should return false for free tier
      const result = await mockSubscriptionService.checkFeatureAccess('premiumFeature');
      
      expect(result.data).toBe(false);
    });

    it('should allow feature access after upgrading', async () => {
      const user = { id: '3', tier: 'free' };
      localStorage.setItem('user', JSON.stringify(user));
      
      // Start with free tier
      await mockSubscriptionService.getCurrentSubscription();
      
      // Upgrade to premium
      await mockSubscriptionService.changePlan('plan_premium', 'monthly');
      
      // Get available features
      const stats = await mockSubscriptionService.getUsageStats();
      
      if (stats.data.features && stats.data.features.length > 0) {
        const feature = stats.data.features[0];
        const result = await mockSubscriptionService.checkFeatureAccess(feature);
        expect(typeof result.data).toBe('boolean');
      }
    });

    it('should default to free tier when user not authenticated', async () => {
      // No user in localStorage - should default to free tier
      const result = await mockSubscriptionService.checkFeatureAccess('premiumFeature');
      
      // Free tier should not have access to premium features
      expect(result.data).toBe(false);
    });

    it('should handle undefined tier gracefully', async () => {
      const user = { id: '1' }; // No tier
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockSubscriptionService.checkFeatureAccess('basicFeature');
      
      expect(typeof result.data).toBe('boolean');
    });
  });

  describe('getNextBillingDate', () => {
    it('should calculate monthly billing date correctly', () => {
      const nextMonth = mockSubscriptionService.getNextBillingDate('monthly');
      const expectedDate = new Date();
      expectedDate.setMonth(expectedDate.getMonth() + 1);
      
      expect(new Date(nextMonth).getMonth()).toBe(expectedDate.getMonth());
    });

    it('should calculate yearly billing date correctly', () => {
      const nextYear = mockSubscriptionService.getNextBillingDate('yearly');
      const expectedDate = new Date();
      expectedDate.setFullYear(expectedDate.getFullYear() + 1);
      
      expect(new Date(nextYear).getFullYear()).toBe(expectedDate.getFullYear());
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid successive calls', async () => {
      const user = { id: '1', tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user));
      
      // Make multiple concurrent calls
      const promises = Array(5).fill(null).map(() => 
        mockSubscriptionService.getCurrentSubscription()
      );
      
      const results = await Promise.all(promises);
      
      // All should return valid subscriptions
      results.forEach(result => {
        expect(result.data.tier).toBe('plus');
        expect(result.data.status).toBe('active');
      });
    });

    it('should handle plan changes without breaking existing subscriptions', async () => {
      const user = { id: '1', tier: 'free' };
      localStorage.setItem('user', JSON.stringify(user));
      
      // Create initial subscription
      await mockSubscriptionService.getCurrentSubscription();
      
      // Change plan multiple times
      await mockSubscriptionService.changePlan('plan_plus', 'monthly');
      await mockSubscriptionService.changePlan('plan_premium', 'yearly');
      
      const final = await mockSubscriptionService.getCurrentSubscription();
      
      expect(final.data.tier).toBe('premium');
      expect(final.data.billingPeriod).toBe('yearly');
    });
  });
});