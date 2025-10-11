import apiClient from './index';

export const subscriptionService = {
  // Subscription plans
  getPlans: () => 
    apiClient.get('/subscriptions/plans'),
  
  getCurrentSubscription: () => 
    apiClient.get('/subscriptions/current'),
  
  // Subscription management
  subscribe: (planId, paymentMethod, billingCycle = 'monthly') => 
    apiClient.post('/subscriptions/subscribe', {
      planId,
      paymentMethod,
      billingCycle
    }),
  
  updateSubscription: (planId, billingCycle) => 
    apiClient.put('/subscriptions/update', { planId, billingCycle }),
  
  cancelSubscription: (reason) => 
    apiClient.post('/subscriptions/cancel', { reason }),
  
  reactivateSubscription: () => 
    apiClient.post('/subscriptions/reactivate'),
  
  // Payment methods
  getPaymentMethods: () => 
    apiClient.get('/subscriptions/payment-methods'),
  
  addPaymentMethod: (paymentMethod) => 
    apiClient.post('/subscriptions/payment-methods', paymentMethod),
  
  updatePaymentMethod: (id, paymentMethod) => 
    apiClient.put(`/subscriptions/payment-methods/${id}`, paymentMethod),
  
  deletePaymentMethod: (id) => 
    apiClient.delete(`/subscriptions/payment-methods/${id}`),
  
  setDefaultPaymentMethod: (id) => 
    apiClient.put(`/subscriptions/payment-methods/${id}/default`),
  
  // Billing
  getBillingHistory: (params = {}) => 
    apiClient.get('/subscriptions/billing/history', { params }),
  
  getInvoice: (id) => 
    apiClient.get(`/subscriptions/billing/invoices/${id}`, { responseType: 'blob' }),
  
  getUpcomingInvoice: () => 
    apiClient.get('/subscriptions/billing/upcoming'),
  
  // Usage and limits
  getUsageLimits: () => 
    apiClient.get('/subscriptions/usage/limits'),
  
  getCurrentUsage: () => 
    apiClient.get('/subscriptions/usage/current'),
  
  // Promo codes
  validatePromoCode: (code) => 
    apiClient.post('/subscriptions/promo/validate', { code }),
  
  applyPromoCode: (code) => 
    apiClient.post('/subscriptions/promo/apply', { code }),
};