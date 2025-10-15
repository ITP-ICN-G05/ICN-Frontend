import api from './api';

export const savedSearchService = {
  // Get all saved searches for user
  getSavedSearches: () => api.get('/saved-searches'),
  
  // Save a new search
  saveSearch: (searchData) => api.post('/saved-searches', searchData),
  
  // Update saved search
  updateSearch: (id, searchData) => api.put(`/saved-searches/${id}`, searchData),
  
  // Delete saved search
  deleteSearch: (id) => api.delete(`/saved-searches/${id}`),
  
  // Execute saved search
  executeSearch: (id) => api.get(`/saved-searches/${id}/execute`),
  
  // Get search quota
  getSearchQuota: () => api.get('/saved-searches/quota'),
  
  // Toggle search alerts
  toggleAlerts: (id, enabled) => 
    api.patch(`/saved-searches/${id}/alerts`, { enabled }),
  
  // Get search statistics
  getSearchStats: (id) => api.get(`/saved-searches/${id}/stats`),
};