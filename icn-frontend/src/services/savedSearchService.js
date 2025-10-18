import api from './api';

export const savedSearchService = {
  // Get all saved searches for user
  getSavedSearches: () => api.get('/saved-searches').then(r => r.data),
  
  // Save a new search
  saveSearch: (searchData) => api.post('/saved-searches', searchData).then(r => r.data),
  
  // Update saved search
  updateSearch: (id, searchData) => api.put(`/saved-searches/${id}`, searchData).then(r => r.data),
  
  // Delete saved search
  deleteSearch: (id) => api.delete(`/saved-searches/${id}`).then(r => r.data),
  
  // Execute saved search
  executeSearch: (id) => api.get(`/saved-searches/${id}/execute`).then(r => r.data),
  
  // Get search quota
  getSearchQuota: () => api.get('/saved-searches/quota').then(r => r.data),
  
  // Toggle search alerts
  toggleAlerts: (id, enabled) => 
    api.patch(`/saved-searches/${id}/alerts`, { enabled }).then(r => r.data),
  
  // Get search statistics
  getSearchStats: (id) => api.get(`/saved-searches/${id}/stats`).then(r => r.data),
};
