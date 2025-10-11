import apiClient from './index';

export const exportService = {
  // Company exports
  exportCompany: (id, format = 'pdf', tier = 'free') => {
    const endpoint = `/export/company/${id}`;
    const params = { format, tier };
    return apiClient.get(endpoint, { 
      params,
      responseType: 'blob'
    });
  },
  
  exportCompanies: (ids, format = 'excel', tier = 'free') => 
    apiClient.post('/export/companies', 
      { ids, format, tier },
      { responseType: 'blob' }
    ),
  
  // Search results export
  exportSearchResults: (searchParams, format = 'excel', tier = 'free') => 
    apiClient.post('/export/search', 
      { searchParams, format, tier },
      { responseType: 'blob' }
    ),
  
  // Report generation
  generateReport: (type, params, format = 'pdf') => 
    apiClient.post('/export/report', 
      { type, params, format },
      { responseType: 'blob' }
    ),
  
  // Available export fields based on tier
  getExportFields: (tier = 'free') => 
    apiClient.get('/export/fields', { params: { tier } }),
  
  // Export templates
  getExportTemplates: () => 
    apiClient.get('/export/templates'),
  
  createExportTemplate: (template) => 
    apiClient.post('/export/templates', template),
  
  updateExportTemplate: (id, template) => 
    apiClient.put(`/export/templates/${id}`, template),
  
  deleteExportTemplate: (id) => 
    apiClient.delete(`/export/templates/${id}`),
  
  // Export history
  getExportHistory: (params = {}) => 
    apiClient.get('/export/history', { params }),
  
  // Download previous export
  downloadExport: (exportId) => 
    apiClient.get(`/export/download/${exportId}`, { responseType: 'blob' }),
};