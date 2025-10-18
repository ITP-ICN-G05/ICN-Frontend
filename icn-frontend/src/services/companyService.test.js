import { companyService } from './companyService';
import api from './api';

jest.mock('./api');

describe('companyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all companies', async () => {
      const mockCompanies = { data: [{ id: '1', name: 'Test Co' }] };
      api.get.mockResolvedValue(mockCompanies);

      const result = await companyService.getAll({ page: 1 });

      expect(api.get).toHaveBeenCalledWith('/companies', { params: { page: 1 } });
      expect(result).toEqual(mockCompanies.data);
    });

    it('should handle empty params', async () => {
      const mockCompanies = { data: [] };
      api.get.mockResolvedValue(mockCompanies);

      const result = await companyService.getAll();

      expect(api.get).toHaveBeenCalledWith('/companies', { params: {} });
    });
  });

  describe('getById', () => {
    it('should fetch company by id', async () => {
      const mockCompany = { data: { id: '1', name: 'Test Co' } };
      api.get.mockResolvedValue(mockCompany);

      const result = await companyService.getById('1');

      expect(api.get).toHaveBeenCalledWith('/companies/1');
      expect(result).toEqual(mockCompany.data);
    });

    it('should handle not found errors', async () => {
      api.get.mockRejectedValue(new Error('Company not found'));

      await expect(companyService.getById('999')).rejects.toThrow('Company not found');
    });
  });

  describe('create', () => {
    it('should create a new company', async () => {
      const newCompany = { name: 'New Co', address: '123 St' };
      const mockResponse = { data: { id: '1', ...newCompany } };
      api.post.mockResolvedValue(mockResponse);

      const result = await companyService.create(newCompany);

      expect(api.post).toHaveBeenCalledWith('/companies', newCompany);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('update', () => {
    it('should update a company', async () => {
      const updates = { name: 'Updated Co' };
      const mockResponse = { data: { id: '1', ...updates } };
      api.put.mockResolvedValue(mockResponse);

      const result = await companyService.update('1', updates);

      expect(api.put).toHaveBeenCalledWith('/companies/1', updates);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('delete', () => {
    it('should delete a company', async () => {
      const mockResponse = { data: { success: true } };
      api.delete.mockResolvedValue(mockResponse);

      const result = await companyService.delete('1');

      expect(api.delete).toHaveBeenCalledWith('/companies/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('search', () => {
    it('should search companies', async () => {
      const mockResults = { data: [{ id: '1', name: 'Test Co' }] };
      api.get.mockResolvedValue(mockResults);

      const result = await companyService.search('test');

      expect(api.get).toHaveBeenCalledWith('/companies/search?q=test');
      expect(result).toEqual(mockResults.data);
    });
  });
});