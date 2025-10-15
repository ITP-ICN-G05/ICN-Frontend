import api from './api';

export const subscriptionService = {
  getCurrentTier: () => api.get('/subscription/current'),
  
  getAvailablePlans: () => api.get('/subscription/plans'),
  
  upgradePlan: (planId, billingCycle) => 
    api.post('/subscription/upgrade', { planId, billingCycle }),
  
  downgradePlan: (planId) => 
    api.post('/subscription/downgrade', { planId }),
  
  cancelSubscription: () => api.post('/subscription/cancel'),
  
  getUsageStats: () => api.get('/subscription/usage'),
  
  checkFeatureAccess: (feature) => 
    api.get(`/subscription/feature-access/${feature}`),
};