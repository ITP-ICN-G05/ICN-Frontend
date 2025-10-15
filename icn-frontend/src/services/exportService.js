import api from './api';

export const exportService = {
  // Export companies to CSV
  exportToCSV: async (companyIds, tierLevel) => {
    const response = await api.post('/export/csv', {
      companyIds,
      tierLevel
    }, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `companies-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
  
  // Export companies to PDF
  exportToPDF: async (companyIds, tierLevel) => {
    const response = await api.post('/export/pdf', {
      companyIds,
      tierLevel
    }, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `companies-export-${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
  
  // Get export quota for user
  getExportQuota: () => api.get('/export/quota'),
};