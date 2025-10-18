import { subscriptionService } from './subscriptionService';
import api from './api';

jest.mock('./api');

describe('subscriptionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentSubscription', () => {
    it('should fetch current subscription', async () => {
      const sub = { data: { tier: 'premium', status: 'active' } };
      api.get.mockResolvedValue({ data: sub });

      const result = await subscriptionService.getCurrentSubscription();

      expect(api.get).toHaveBeenCalledWith('/subscription/current');
      expect(result).toEqual(sub);
    });
  });

  describe('getPlans', () => {
    it('should fetch available plans', async () => {
      const plans = { data: [{ id: 'free' }, { id: 'plus' }] };
      api.get.mockResolvedValue({ data: plans });

      const result = await subscriptionService.getPlans();

      expect(api.get).toHaveBeenCalledWith('/subscription/plans');
      expect(result).toEqual(plans);
    });
  });

  describe('changePlan', () => {
    it('should change subscription plan', async () => {
      const newSub = { data: { tier: 'premium' } };
      api.post.mockResolvedValue({ data: newSub });

      const result = await subscriptionService.changePlan('premium', 'monthly');

      expect(api.post).toHaveBeenCalledWith('/subscription/change', {
        planId: 'premium',
        billingCycle: 'monthly'
      });
      expect(result).toEqual(newSub);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription', async () => {
      api.post.mockResolvedValue({ data: { success: true } });

      const result = await subscriptionService.cancelSubscription();

      expect(api.post).toHaveBeenCalledWith('/subscription/cancel');
    });
  });

  describe('getUsageStats', () => {
    it('should fetch usage statistics', async () => {
      const stats = { data: { searches: 10, exports: 5 } };
      api.get.mockResolvedValue({ data: stats });

      const result = await subscriptionService.getUsageStats();

      expect(api.get).toHaveBeenCalledWith('/subscription/usage');
      expect(result).toEqual(stats);
    });
  });

  describe('checkFeatureAccess', () => {
    it('should check feature access', async () => {
      api.get.mockResolvedValue({ data: { hasAccess: true } });

      const result = await subscriptionService.checkFeatureAccess('export');

      expect(api.get).toHaveBeenCalledWith('/subscription/feature-access/export');
    });
  });
});