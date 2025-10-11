import apiClient from './index';

export const bookmarkService = {
  // Bookmarks
  getBookmarks: (params = {}) => 
    apiClient.get('/bookmarks', { params }),
  
  addBookmark: (companyId, folderId = null) => 
    apiClient.post('/bookmarks', { companyId, folderId }),
  
  removeBookmark: (id) => 
    apiClient.delete(`/bookmarks/${id}`),
  
  moveBookmark: (id, folderId) => 
    apiClient.put(`/bookmarks/${id}/move`, { folderId }),
  
  // Bookmark folders
  getFolders: () => 
    apiClient.get('/bookmarks/folders'),
  
  createFolder: (name, description = '') => 
    apiClient.post('/bookmarks/folders', { name, description }),
  
  updateFolder: (id, data) => 
    apiClient.put(`/bookmarks/folders/${id}`, data),
  
  deleteFolder: (id) => 
    apiClient.delete(`/bookmarks/folders/${id}`),
  
  // Bulk operations
  bulkAddBookmarks: (companyIds, folderId = null) => 
    apiClient.post('/bookmarks/bulk', { companyIds, folderId }),
  
  bulkRemoveBookmarks: (bookmarkIds) => 
    apiClient.delete('/bookmarks/bulk', { data: { bookmarkIds } }),
  
  bulkMoveBookmarks: (bookmarkIds, folderId) => 
    apiClient.put('/bookmarks/bulk/move', { bookmarkIds, folderId }),
  
  // Import/Export
  exportBookmarks: (format = 'json') => 
    apiClient.get('/bookmarks/export', { 
      params: { format },
      responseType: format === 'json' ? 'json' : 'blob'
    }),
  
  importBookmarks: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/bookmarks/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};