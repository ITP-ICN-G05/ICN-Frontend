import { mockCompanyService } from './mockCompanyService';

describe('mockCompanyService', () => {
  beforeEach(async () => {
    // Ensure data is loaded
    await mockCompanyService.loadICNData();
  });

  describe('loadICNData', () => {
    it('should load ICN data', async () => {
      const companies = await mockCompanyService.loadICNData();
      
      expect(companies).toBeInstanceOf(Array);
      expect(companies.length).toBeGreaterThan(0);
    });

    it('should not reload if already loaded', async () => {
      mockCompanyService.isLoaded = true;
      const companies = await mockCompanyService.loadICNData();
      
      expect(mockCompanyService.isLoaded).toBe(true);
    });
  });

  describe('getAll', () => {
    it('should return all companies', async () => {
      const result = await mockCompanyService.getAll();

      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result).toHaveProperty('total');
    });

    it('should filter by search term', async () => {
      const result = await mockCompanyService.getAll({ search: 'company' });

      expect(result.data).toBeInstanceOf(Array);
    });

    it('should filter by company type', async () => {
      const result = await mockCompanyService.getAll({ companyType: 'supplier' });

      result.data.forEach(company => {
        expect(company.companyType).toBe('supplier');
      });
    });

    it('should filter by state', async () => {
      const result = await mockCompanyService.getAll({ state: 'VIC' });

      result.data.forEach(company => {
        expect(company.billingAddress?.state).toBe('VIC');
      });
    });

    it('should apply pagination', async () => {
      const result = await mockCompanyService.getAll({ page: 1, limit: 10 });

      expect(result.data.length).toBeLessThanOrEqual(10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter by verification status', async () => {
      const result = await mockCompanyService.getAll({ verificationStatus: 'verified' });

      result.data.forEach(company => {
        expect(company.verificationStatus).toBe('verified');
      });
    });
  });

  describe('getById', () => {
    it('should return company by id', async () => {
      const companies = await mockCompanyService.getAll();
      const firstCompany = companies.data[0];

      const result = await mockCompanyService.getById(firstCompany.id);

      expect(result.id).toBe(firstCompany.id);
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('pastProjects');
    });

    it('should throw error for invalid id', async () => {
      await expect(
        mockCompanyService.getById('invalid-id-999')
      ).rejects.toThrow('Company not found');
    });
  });

  describe('search', () => {
    it('should search companies', async () => {
      const result = await mockCompanyService.search('company');

      expect(result.data).toBeInstanceOf(Array);
      expect(result).toHaveProperty('total');
    });

    it('should limit results to 50', async () => {
      const result = await mockCompanyService.search('test');

      expect(result.data.length).toBeLessThanOrEqual(50);
    });
  });

  describe('create', () => {
    it('should create new company', async () => {
      const newCompany = {
        name: 'New Test Co',
        address: '789 Test St',
        keySectors: ['Technology']
      };

      const result = await mockCompanyService.create(newCompany);

      expect(result.name).toBe('New Test Co');
      expect(result).toHaveProperty('id');
      expect(result.verificationStatus).toBe('unverified');
      expect(result.dataSource).toBe('manual');
    });
  });

  describe('update', () => {
    it('should update company', async () => {
      const companies = await mockCompanyService.getAll();
      const company = companies.data[0];

      const updates = { name: 'Updated Name' };
      const result = await mockCompanyService.update(company.id, updates);

      expect(result.name).toBe('Updated Name');
    });

    it('should throw error for invalid id', async () => {
      await expect(
        mockCompanyService.update('invalid-id', { name: 'Test' })
      ).rejects.toThrow('Company not found');
    });
  });

  describe('delete', () => {
    it('should delete company', async () => {
      const companies = await mockCompanyService.getAll();
      const initialCount = companies.data.length;
      const company = companies.data[0];

      const result = await mockCompanyService.delete(company.id);

      expect(result.success).toBe(true);
      
      const afterDelete = await mockCompanyService.getAll();
      expect(afterDelete.data.length).toBe(initialCount - 1);
    });

    it('should throw error for invalid id', async () => {
      await expect(
        mockCompanyService.delete('invalid-id')
      ).rejects.toThrow('Company not found');
    });
  });

  describe('getStatistics', () => {
    it('should return statistics', async () => {
      const stats = mockCompanyService.getStatistics();

      expect(stats).toHaveProperty('totalCompanies');
      expect(stats).toHaveProperty('verified');
      expect(stats).toHaveProperty('unverified');
      expect(stats).toHaveProperty('byState');
      expect(stats).toHaveProperty('bySector');
    });
  });
});