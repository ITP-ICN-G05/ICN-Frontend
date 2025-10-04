import api from './api';

export const companyService = {
  // Get all companies with optional filters
  getAll: (params = {}) => api.get('/companies', { params }),
  
  // Get a single company by ID
  getById: (id) => api.get(`/companies/${id}`),
  
  // Create a new company
  create: (data) => api.post('/companies', data),
  
  // Update an existing company
  update: (id, data) => api.put(`/companies/${id}`, data),
  
  // Delete a company
  delete: (id) => api.delete(`/companies/${id}`),
  
  // Search companies
  search: (query) => api.get(`/companies/search?q=${query}`),
};
