import api from './api';

export const bookmarkService = {
  // Get user's bookmarked companies
  getUserBookmarks: () => api.get('/bookmarks'),
  
  // Add a bookmark
  addBookmark: (companyId) => api.post('/bookmarks', { companyId }),
  
  // Remove a bookmark
  removeBookmark: (companyId) => api.delete(`/bookmarks/${companyId}`),
  
  // Check if company is bookmarked
  isBookmarked: (companyId) => api.get(`/bookmarks/check/${companyId}`),
  
  // Get bookmark statistics
  getBookmarkStats: () => api.get('/bookmarks/stats'),
};