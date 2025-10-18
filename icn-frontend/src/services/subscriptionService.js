import api from './api';

export const subscriptionService = {
  getCurrentSubscription: () => api.get('/subscription/current').then(r => r.data),
  
  getPlans: () => api.get('/subscription/plans').then(r => r.data),
  
  changePlan: (planId, billingCycle) => 
    api.post('/subscription/change', { planId, billingCycle }).then(r => r.data),
  
  cancelSubscription: () => api.post('/subscription/cancel').then(r => r.data),
  
  getUsageStats: () => api.get('/subscription/usage').then(r => r.data),
  
  checkFeatureAccess: (feature) => 
    api.get(`/subscription/feature-access/${feature}`).then(r => r.data),
};
