import api from './api';

export const companyService = {
  // Get all companies with optional filters
  getAll: (params = {}) => api.get('/companies', { params }).then(r => r.data),
  
  // Get a single company by ID
  getById: (id) => api.get(`/companies/${id}`).then(r => r.data),
  
  // Create a new company
  create: (data) => api.post('/companies', data).then(r => r.data),
  
  // Update an existing company
  update: (id, data) => api.put(`/companies/${id}`, data).then(r => r.data),
  
  // Delete a company
  delete: (id) => api.delete(`/companies/${id}`).then(r => r.data),
  
  // Search companies
  search: (query) => api.get(`/companies/search?q=${query}`).then(r => r.data),
};
