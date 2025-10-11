import apiClient from './index';

export const adminService = {
  // User management
  getUsers: (params = {}) => 
    apiClient.get('/admin/users', { params }),
  
  getUserById: (id) => 
    apiClient.get(`/admin/users/${id}`),
  
  updateUser: (id, userData) => 
    apiClient.put(`/admin/users/${id}`, userData),
  
  suspendUser: (id, reason) => 
    apiClient.post(`/admin/users/${id}/suspend`, { reason }),
  
  reactivateUser: (id) => 
    apiClient.post(`/admin/users/${id}/reactivate`),
  
  deleteUser: (id) => 
    apiClient.delete(`/admin/users/${id}`),
  
  // Company management
  verifyCompany: (id) => 
    apiClient.post(`/admin/companies/${id}/verify`),
  
  rejectCompany: (id, reason) => 
    apiClient.post(`/admin/companies/${id}/reject`, { reason }),
  
  flagCompany: (id, reason) => 
    apiClient.post(`/admin/companies/${id}/flag`, { reason }),
  
  // Content moderation
  getReportedContent: (params = {}) => 
    apiClient.get('/admin/moderation/reports', { params }),
  
  moderateContent: (id, action, reason) => 
    apiClient.post(`/admin/moderation/${id}`, { action, reason }),
  
  // System configuration
  getSystemConfig: () => 
    apiClient.get('/admin/config'),
  
  updateSystemConfig: (config) => 
    apiClient.put('/admin/config', config),
  
  // Feature flags
  getFeatureFlags: () => 
    apiClient.get('/admin/features'),
  
  updateFeatureFlag: (feature, enabled) => 
    apiClient.put(`/admin/features/${feature}`, { enabled }),
  
  // Subscription management
  overrideSubscription: (userId, planId, duration) => 
    apiClient.post('/admin/subscriptions/override', { userId, planId, duration }),
  
  grantCredits: (userId, credits) => 
    apiClient.post('/admin/subscriptions/credits', { userId, credits }),
  
  // Analytics and monitoring
  getSystemHealth: () => 
    apiClient.get('/admin/health'),
  
  getSystemMetrics: () => 
    apiClient.get('/admin/metrics'),
  
  getErrorLogs: (params = {}) => 
    apiClient.get('/admin/logs/errors', { params }),
  
  getAuditLogs: (params = {}) => 
    apiClient.get('/admin/logs/audit', { params }),
  
  // Data management
  runDataSync: () => 
    apiClient.post('/admin/data/sync'),
  
  runDataBackup: () => 
    apiClient.post('/admin/data/backup'),
  
  runDataCleanup: () => 
    apiClient.post('/admin/data/cleanup'),
  
  // Announcements
  createAnnouncement: (announcement) => 
    apiClient.post('/admin/announcements', announcement),
  
  updateAnnouncement: (id, announcement) => 
    apiClient.put(`/admin/announcements/${id}`, announcement),
  
  deleteAnnouncement: (id) => 
    apiClient.delete(`/admin/announcements/${id}`),
};

// Export all services
export {
  authService,
  companyService,
  searchService,
  userService,
  subscriptionService,
  bookmarkService,
  exportService,
  analyticsService,
  adminService
};