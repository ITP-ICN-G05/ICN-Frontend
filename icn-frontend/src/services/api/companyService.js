import apiClient from './index';

export const companyService = {
  // Company CRUD operations
  getAll: (params = {}) => {
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 20,
      sort: params.sort || 'name',
      order: params.order || 'asc',
      ...params.filters
    };
    return apiClient.get('/companies', { params: queryParams });
  },
  
  getById: (id) => 
    apiClient.get(`/companies/${id}`),
  
  create: (companyData) => 
    apiClient.post('/companies', companyData),
  
  update: (id, companyData) => 
    apiClient.put(`/companies/${id}`, companyData),
  
  delete: (id) => 
    apiClient.delete(`/companies/${id}`),
  
  // Company details
  getCapabilities: (id) => 
    apiClient.get(`/companies/${id}/capabilities`),
  
  getCertifications: (id) => 
    apiClient.get(`/companies/${id}/certifications`),
  
  getProducts: (id) => 
    apiClient.get(`/companies/${id}/products`),
  
  getServices: (id) => 
    apiClient.get(`/companies/${id}/services`),
  
  getDocuments: (id) => 
    apiClient.get(`/companies/${id}/documents`),
  
  // Company relationships
  getSimilarCompanies: (id, limit = 5) => 
    apiClient.get(`/companies/${id}/similar`, { params: { limit } }),
  
  getSupplyChainRelations: (id) => 
    apiClient.get(`/companies/${id}/supply-chain`),
  
  // Company statistics
  getStatistics: (id) => 
    apiClient.get(`/companies/${id}/statistics`),
  
  // Verification
  requestVerification: (id, documents) => 
    apiClient.post(`/companies/${id}/verify`, { documents }),
  
  // Contact
  contactCompany: (id, message) => 
    apiClient.post(`/companies/${id}/contact`, message),
  
  // Bulk operations
  bulkImport: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/companies/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  bulkExport: (filters) => 
    apiClient.post('/companies/export', filters, { responseType: 'blob' }),
};

// ============================================
// src/services/api/searchService.js
// ============================================

import apiClient from './index';

export const searchService = {
  // Basic search
  search: (query, filters = {}) => {
    const params = {
      q: query,
      ...filters,
      page: filters.page || 1,
      limit: filters.limit || 20
    };
    return apiClient.get('/search', { params });
  },
  
  // Advanced search with multiple criteria
  advancedSearch: (criteria) => 
    apiClient.post('/search/advanced', criteria),
  
  // Search suggestions
  getSuggestions: (query) => 
    apiClient.get('/search/suggestions', { params: { q: query } }),
  
  // Saved searches
  saveSearch: (searchData) => 
    apiClient.post('/search/saved', searchData),
  
  getSavedSearches: () => 
    apiClient.get('/search/saved'),
  
  updateSavedSearch: (id, searchData) => 
    apiClient.put(`/search/saved/${id}`, searchData),
  
  deleteSavedSearch: (id) => 
    apiClient.delete(`/search/saved/${id}`),
  
  runSavedSearch: (id) => 
    apiClient.get(`/search/saved/${id}/run`),
  
  // Search history
  getSearchHistory: (limit = 10) => 
    apiClient.get('/search/history', { params: { limit } }),
  
  clearSearchHistory: () => 
    apiClient.delete('/search/history'),
  
  // Filters and facets
  getAvailableFilters: () => 
    apiClient.get('/search/filters'),
  
  getSectors: () => 
    apiClient.get('/search/sectors'),
  
  getCapabilities: () => 
    apiClient.get('/search/capabilities'),
  
  getCertifications: () => 
    apiClient.get('/search/certifications'),
  
  // Location-based search
  searchByLocation: (lat, lng, radius, filters = {}) => 
    apiClient.get('/search/location', {
      params: { lat, lng, radius, ...filters }
    }),
  
  // Map data
  getMapData: (bounds, filters = {}) => 
    apiClient.get('/search/map', {
      params: { 
        north: bounds.north,
        south: bounds.south,
        east: bounds.east,
        west: bounds.west,
        ...filters
      }
    }),
};
