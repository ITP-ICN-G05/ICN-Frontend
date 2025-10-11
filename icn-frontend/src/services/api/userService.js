import apiClient from './index';

export const userService = {
  // User profile
  getProfile: () => 
    apiClient.get('/user/profile'),
  
  updateProfile: (profileData) => 
    apiClient.put('/user/profile', profileData),
  
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  deleteAvatar: () => 
    apiClient.delete('/user/avatar'),
  
  // Account settings
  changePassword: (currentPassword, newPassword) => 
    apiClient.post('/user/change-password', { currentPassword, newPassword }),
  
  updateEmail: (newEmail, password) => 
    apiClient.post('/user/change-email', { newEmail, password }),
  
  getPreferences: () => 
    apiClient.get('/user/preferences'),
  
  updatePreferences: (preferences) => 
    apiClient.put('/user/preferences', preferences),
  
  // Notifications
  getNotificationSettings: () => 
    apiClient.get('/user/notifications/settings'),
  
  updateNotificationSettings: (settings) => 
    apiClient.put('/user/notifications/settings', settings),
  
  getNotifications: (params = {}) => 
    apiClient.get('/user/notifications', { params }),
  
  markNotificationRead: (id) => 
    apiClient.put(`/user/notifications/${id}/read`),
  
  markAllNotificationsRead: () => 
    apiClient.put('/user/notifications/read-all'),
  
  // Activity
  getActivityLog: (params = {}) => 
    apiClient.get('/user/activity', { params }),
  
  getViewHistory: (params = {}) => 
    apiClient.get('/user/views', { params }),
  
  // Account management
  deleteAccount: (password) => 
    apiClient.delete('/user/account', { data: { password } }),
  
  exportUserData: () => 
    apiClient.get('/user/export', { responseType: 'blob' }),
  
  // Usage statistics
  getUsageStats: () => 
    apiClient.get('/user/stats'),
  
  getMonthlyViews: () => 
    apiClient.get('/user/stats/views'),
};
