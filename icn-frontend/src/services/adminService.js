import api from './api';

export const adminService = {
  // Dashboard metrics
  getDashboardMetrics: () => api.get('/admin/dashboard/metrics'),
  
  // Company management
  getAllCompanies: (params) => api.get('/admin/companies', { params }),
  createCompany: (data) => api.post('/admin/companies', data),
  updateCompany: (id, data) => api.put(`/admin/companies/${id}`, data),
  deleteCompany: (id) => api.delete(`/admin/companies/${id}`),
  bulkImportCompanies: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/companies/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // User management
  getAllUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deactivateUser: (id) => api.patch(`/admin/users/${id}/deactivate`),
  reactivateUser: (id) => api.patch(`/admin/users/${id}/reactivate`),
  
  // Subscription management
  getSubscriptions: () => api.get('/admin/subscriptions'),
  updateSubscription: (id, data) => api.put(`/admin/subscriptions/${id}`, data),
  
  // Activity logs
  getActivityLogs: (params) => api.get('/admin/logs', { params }),
  
  // Content moderation
  getFlaggedContent: () => api.get('/admin/moderation/flagged'),
  approveContent: (id) => api.patch(`/admin/moderation/${id}/approve`),
  rejectContent: (id) => api.patch(`/admin/moderation/${id}/reject`),
};