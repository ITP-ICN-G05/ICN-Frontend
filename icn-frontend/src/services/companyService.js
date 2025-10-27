// src/services/companyService.js
import api from './api';

class CompanyService {
  // GET /organisation/general - searchOrganisation
  async searchCompanies(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Required parameters
    queryParams.append('startLatitude', params.startLatitude ?? -90);
    queryParams.append('startLongitude', params.startLongitude ?? -180);
    queryParams.append('endLatitude', params.endLatitude ?? 90);
    queryParams.append('endLongitude', params.endLongitude ?? 180);
    
    // ALWAYS include skip and limit to avoid backend NullPointer
    queryParams.append('skip', params.skip ?? 0);
    queryParams.append('limit', params.limit ?? 100);

    // Optional parameters
    if (params.searchString) {
      queryParams.append('searchString', params.searchString);
    }
    if (params.filterParameters) {
      queryParams.append('filterParameters', JSON.stringify(params.filterParameters));
    }
    
    const response = await api.get(`/organisation/general?${queryParams.toString()}`);
    return response.data;
  }

  // GET /organisation/specific - searchOrganisationDetail
  async getById(organisationId) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 'guest';
    
    const response = await api.get(`/organisation/specific?organisationId=${organisationId}&user=${userId}`);
    return response.data;
  }

  // GET /organisation/generalByIds - loadBookMarks
  async getByIds(ids) {
    if (!ids || ids.length === 0) return [];
    
    const queryParams = new URLSearchParams();
    ids.forEach(id => queryParams.append('ids', id));
    
    const response = await api.get(`/organisation/generalByIds?${queryParams.toString()}`);
    return response.data;
  }

  // Helper method for compatibility
  async getAll(params = {}) {
    return this.searchCompanies({
      startLatitude: -90,
      startLongitude: -180,
      endLatitude: 90,
      endLongitude: 180,
      skip: params.skip || 0,    // Always provide skip
      limit: params.limit || 1000  // Always provide limit
    });
  }

  // Search with default Melbourne area
  async search(query) {
    return this.searchCompanies({
      searchString: query,
      startLatitude: -38.5,
      startLongitude: 144.5,
      endLatitude: -37.5,
      endLongitude: 145.5,
      limit: 100
    });
  }
}

export const companyService = new CompanyService();