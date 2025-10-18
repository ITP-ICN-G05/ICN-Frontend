import { checkTierAccess, getTierFeatures, getTierLimits } from '../utils/tierConfig';

const SUBSCRIPTION_PLANS = {
  free: {
    id: 'plan_free',
    name: 'Free',
    tier: 'free',
    price: 0,
    monthlyPrice: 0,
    yearlyPrice: 0,
  },
  plus: {
    id: 'plan_plus',
    name: 'Plus',
    tier: 'plus',
    monthlyPrice: 49,
    yearlyPrice: 490,
  },
  premium: {
    id: 'plan_premium',
    name: 'Premium',
    tier: 'premium',
    monthlyPrice: 149,
    yearlyPrice: 1490,
  }
};

class MockSubscriptionService {
  constructor() {
    this.activeSubscriptions = new Map();
  }
  
  async getCurrentSubscription() {
    await this.delay(500);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      throw new Error('User not authenticated');
    }
    
    let subscription = this.activeSubscriptions.get(user.id);
    
    if (!subscription) {
      // Create default subscription based on user tier
      subscription = {
        id: 'sub_' + user.tier + '_' + user.id,
        userId: user.id,
        tier: user.tier || 'free',
        planId: SUBSCRIPTION_PLANS[user.tier || 'free'].id,
        status: 'active',
        startDate: new Date().toISOString(),
        currentPeriodEnd: this.getNextBillingDate('monthly'),
        billingPeriod: 'monthly',
        autoRenew: user.tier !== 'free',
        features: getTierFeatures(user.tier || 'free'),
        limits: getTierLimits(user.tier || 'free')
      };
      this.activeSubscriptions.set(user.id, subscription);
    }
    
    return { data: subscription };
  }
  
  async getPlans() {
    await this.delay(300);
    return { data: Object.values(SUBSCRIPTION_PLANS) };
  }
  
  async changePlan(planId, billingPeriod = 'monthly') {
    await this.delay(1000);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      throw new Error('User not authenticated');
    }
    
    const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId);
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }
    
    const subscription = {
      id: 'sub_' + Date.now(),
      userId: user.id,
      tier: plan.tier,
      planId: plan.id,
      status: 'active',
      startDate: new Date().toISOString(),
      currentPeriodEnd: this.getNextBillingDate(billingPeriod),
      billingPeriod,
      amount: billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice,
      currency: 'AUD',
      autoRenew: true,
      features: getTierFeatures(plan.tier),
      limits: getTierLimits(plan.tier)
    };
    
    this.activeSubscriptions.set(user.id, subscription);
    
    // Update user tier in localStorage
    user.tier = plan.tier;
    localStorage.setItem('user', JSON.stringify(user));
    
    return { data: subscription };
  }
  
  async cancelSubscription() {
    await this.delay(600);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const currentSub = await this.getCurrentSubscription();
    
    // Downgrade to free
    const freeSub = {
      ...currentSub.data,
      tier: 'free',
      planId: SUBSCRIPTION_PLANS.free.id,
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      autoRenew: false,
      features: getTierFeatures('free'),
      limits: getTierLimits('free')
    };
    
    this.activeSubscriptions.set(user.id, freeSub);
    
    // Update user tier
    user.tier = 'free';
    localStorage.setItem('user', JSON.stringify(user));
    
    return { data: freeSub };
  }
  
  async getUsageStats() {
    await this.delay(400);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const subscription = await this.getCurrentSubscription();
    
    return {
      data: {
        tier: subscription.data.tier,
        monthlyViews: Math.floor(Math.random() * 100),
        savedSearches: Math.floor(Math.random() * 10),
        bookmarks: Math.floor(Math.random() * 20),
        exportsThisMonth: Math.floor(Math.random() * 5),
        features: subscription.data.features,
        limits: subscription.data.limits
      }
    };
  }
  
  async checkFeatureAccess(feature) {
    await this.delay(200);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return { data: checkTierAccess(user.tier || 'free', feature) };
  }
  
  getNextBillingDate(billingPeriod) {
    const date = new Date();
    if (billingPeriod === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    } else {
      date.setFullYear(date.getFullYear() + 1);
    }
    return date.toISOString();
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockSubscriptionService = new MockSubscriptionService();
