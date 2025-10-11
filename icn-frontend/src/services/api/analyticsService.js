import apiClient from './index';

export const analyticsService = {
  // Dashboard analytics
  getDashboardStats: () => 
    apiClient.get('/analytics/dashboard'),
  
  // Search analytics
  getSearchAnalytics: (params = {}) => 
    apiClient.get('/analytics/search', { params }),
  
  getPopularSearches: (limit = 10) => 
    apiClient.get('/analytics/search/popular', { params: { limit } }),
  
  getSearchTrends: (period = '7d') => 
    apiClient.get('/analytics/search/trends', { params: { period } }),
  
  // Company analytics
  getCompanyViews: (companyId, period = '30d') => 
    apiClient.get(`/analytics/companies/${companyId}/views`, { params: { period } }),
  
  getTopViewedCompanies: (limit = 10, period = '7d') => 
    apiClient.get('/analytics/companies/top-viewed', { params: { limit, period } }),
  
  // User analytics
  getUserEngagement: (period = '30d') => 
    apiClient.get('/analytics/user/engagement', { params: { period } }),
  
  getUserActivity: (userId, period = '30d') => 
    apiClient.get(`/analytics/user/${userId}/activity`, { params: { period } }),
  
  // Sector analytics
  getSectorDistribution: () => 
    apiClient.get('/analytics/sectors/distribution'),
  
  getSectorTrends: (period = '30d') => 
    apiClient.get('/analytics/sectors/trends', { params: { period } }),
  
  // Geographic analytics
  getGeographicDistribution: () => 
    apiClient.get('/analytics/geographic/distribution'),
  
  getHeatmapData: (bounds) => 
    apiClient.get('/analytics/geographic/heatmap', { params: bounds }),
  
  // Supply chain analytics
  getSupplyChainGaps: (sector) => 
    apiClient.get('/analytics/supply-chain/gaps', { params: { sector } }),
  
  getSupplyChainDensity: (region) => 
    apiClient.get('/analytics/supply-chain/density', { params: { region } }),
  
  // Investment tracking (admin)
  getInvestmentMetrics: () => 
    apiClient.get('/analytics/investment/metrics'),
  
  getCostPerUser: () => 
    apiClient.get('/analytics/investment/cost-per-user'),
  
  // Custom analytics
  createCustomReport: (reportConfig) => 
    apiClient.post('/analytics/reports/custom', reportConfig),
  
  getCustomReports: () => 
    apiClient.get('/analytics/reports/custom'),
  
  // Track events
  trackEvent: (eventName, eventData = {}) => 
    apiClient.post('/analytics/events', { eventName, eventData }),
  
  trackPageView: (page, metadata = {}) => 
    apiClient.post('/analytics/pageviews', { page, metadata }),
};