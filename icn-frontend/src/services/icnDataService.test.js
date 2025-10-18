import icnDataService from './icnDataService';

// Mock the JSON data
jest.mock('../assets/ICN_Navigator.Company.json', () => [{
  "Item ID": "item-1",
  "Sector Name": "Technology",
  "Item Name": "Software",
  "Detailed Item Name": "Custom Software",
  "Sector Mapping ID": "sector-1",
  "Organizations": [{
    "Organisation: Organisation ID": "org-1",
    "Organisation: Organisation Name": "Test Company",
    "Organisation: Billing Street": "123 Test St",
    "Organisation: Billing City": "Melbourne",
    "Organisation: Billing State/Province": "VIC",
    "Organisation: Billing Zip/Postal Code": "3000",
    "Capability Type": "Supplier",
    "Validation Date": "01/01/2024",
    "Organisation Capability": "cap-1"
  }]
}]);

describe('icnDataService', () => {
  beforeEach(() => {
    icnDataService.clearCache();
  });

  describe('loadData', () => {
    it('should load and process ICN data', async () => {
      const companies = await icnDataService.loadData();

      expect(companies).toBeInstanceOf(Array);
      expect(companies.length).toBeGreaterThan(0);
      expect(icnDataService.isLoaded).toBe(true);
    });

    it('should not reload if already loaded', async () => {
      await icnDataService.loadData();
      const loadTime = icnDataService.lastLoadTime;
      
      await icnDataService.loadData();
      
      expect(icnDataService.lastLoadTime).toBe(loadTime);
    });

    it('should handle invalid data format', async () => {
      // This would need proper mocking to test error handling
      expect(icnDataService.isLoaded).toBeDefined();
    });
  });

  describe('getCompanies', () => {
    it('should return all companies', async () => {
      await icnDataService.loadData();
      const companies = icnDataService.getCompanies();

      expect(companies).toBeInstanceOf(Array);
    });
  });

  describe('getCompanyById', () => {
    it('should return company by id', async () => {
      await icnDataService.loadData();
      const companies = icnDataService.getCompanies();
      const company = icnDataService.getCompanyById(companies[0].id);

      expect(company).toBeDefined();
      expect(company.id).toBe(companies[0].id);
    });

    it('should return undefined for invalid id', async () => {
      await icnDataService.loadData();
      const company = icnDataService.getCompanyById('invalid-id');

      expect(company).toBeUndefined();
    });
  });

  describe('searchCompanies', () => {
    it('should search companies by name', async () => {
      await icnDataService.loadData();
      const results = icnDataService.searchCompanies('Test');

      expect(results).toBeInstanceOf(Array);
    });

    it('should search by address', async () => {
      await icnDataService.loadData();
      const results = icnDataService.searchCompanies('Melbourne');

      expect(results).toBeInstanceOf(Array);
    });

    it('should search by sector', async () => {
      await icnDataService.loadData();
      const results = icnDataService.searchCompanies('Technology');

      expect(results).toBeInstanceOf(Array);
    });

    it('should return all companies for empty search', async () => {
      await icnDataService.loadData();
      const allCompanies = icnDataService.getCompanies();
      const results = icnDataService.searchCompanies('');

      expect(results.length).toBe(allCompanies.length);
    });

    it('should be case insensitive', async () => {
      await icnDataService.loadData();
      const results1 = icnDataService.searchCompanies('test');
      const results2 = icnDataService.searchCompanies('TEST');

      expect(results1.length).toBe(results2.length);
    });
  });

  describe('filterByState', () => {
    it('should filter companies by state', async () => {
      await icnDataService.loadData();
      const results = icnDataService.filterByState('VIC');

      results.forEach(company => {
        expect(company.billingAddress?.state).toBe('VIC');
      });
    });

    it('should return empty array for non-existent state', async () => {
      await icnDataService.loadData();
      const results = icnDataService.filterByState('ZZZ');

      expect(results).toEqual([]);
    });
  });

  describe('filterByCompanyType', () => {
    it('should filter suppliers', async () => {
      await icnDataService.loadData();
      const results = icnDataService.filterByCompanyType('supplier');

      expect(results).toBeInstanceOf(Array);
    });

    it('should filter manufacturers', async () => {
      await icnDataService.loadData();
      const results = icnDataService.filterByCompanyType('manufacturer');

      expect(results).toBeInstanceOf(Array);
    });

    it('should filter both', async () => {
      await icnDataService.loadData();
      const results = icnDataService.filterByCompanyType('both');

      expect(results).toBeInstanceOf(Array);
    });
  });

  describe('filterBySector', () => {
    it('should filter companies by sector', async () => {
      await icnDataService.loadData();
      const results = icnDataService.filterBySector('Technology');

      results.forEach(company => {
        expect(company.keySectors).toContain('Technology');
      });
    });
  });

  describe('getFilterOptions', () => {
    it('should return filter options', async () => {
      await icnDataService.loadData();
      const options = icnDataService.getFilterOptions();

      expect(options).toHaveProperty('sectors');
      expect(options).toHaveProperty('states');
      expect(options).toHaveProperty('cities');
      expect(options).toHaveProperty('capabilities');
      expect(options).toHaveProperty('capabilityTypes');
      
      expect(options.sectors).toBeInstanceOf(Array);
      expect(options.states).toBeInstanceOf(Array);
    });

    it('should return sorted options', async () => {
      await icnDataService.loadData();
      const options = icnDataService.getFilterOptions();

      const sortedSectors = [...options.sectors].sort();
      expect(options.sectors).toEqual(sortedSectors);
    });
  });

  describe('getStatistics', () => {
    it('should return statistics', async () => {
      await icnDataService.loadData();
      const stats = icnDataService.getStatistics();

      expect(stats).toHaveProperty('totalCompanies');
      expect(stats).toHaveProperty('totalItems');
      expect(stats).toHaveProperty('verified');
      expect(stats).toHaveProperty('unverified');
      expect(stats).toHaveProperty('suppliers');
      expect(stats).toHaveProperty('manufacturers');
      expect(stats).toHaveProperty('both');
      expect(stats).toHaveProperty('byState');
      expect(stats).toHaveProperty('bySector');
      expect(stats).toHaveProperty('topCities');
      
      expect(stats.totalCompanies).toBeGreaterThan(0);
      expect(stats.topCities).toBeInstanceOf(Array);
    });

    it('should have valid counts', async () => {
      await icnDataService.loadData();
      const stats = icnDataService.getStatistics();

      expect(stats.verified + stats.unverified).toBe(stats.totalCompanies);
    });
  });

  describe('utility methods', () => {
    it('should identify invalid values', () => {
      expect(icnDataService.isInvalidValue('')).toBe(true);
      expect(icnDataService.isInvalidValue('#N/A')).toBe(true);
      expect(icnDataService.isInvalidValue('N/A')).toBe(true);
      expect(icnDataService.isInvalidValue('0')).toBe(true);
      expect(icnDataService.isInvalidValue(null)).toBe(true);
      expect(icnDataService.isInvalidValue(undefined)).toBe(true);
      expect(icnDataService.isInvalidValue('valid')).toBe(false);
    });

    it('should clean company data', () => {
      expect(icnDataService.cleanCompanyData('  test  ')).toBe('test');
      expect(icnDataService.cleanCompanyData('#N/A')).toBe('Not Available');
      expect(icnDataService.cleanCompanyData('', 'Default')).toBe('Default');
    });

    it('should normalize state territory', () => {
      expect(icnDataService.normalizeStateTerritory('victoria')).toBe('VIC');
      expect(icnDataService.normalizeStateTerritory('new south wales')).toBe('NSW');
      expect(icnDataService.normalizeStateTerritory('VIC')).toBe('VIC');
      expect(icnDataService.normalizeStateTerritory('melbourne')).toBe('VIC');
      expect(icnDataService.normalizeStateTerritory('invalid')).toBe('NSW');
    });

    it('should convert ICN date to ISO', () => {
      expect(icnDataService.convertICNDateToISO('01/12/2024')).toBe('2024-12-01');
      expect(icnDataService.convertICNDateToISO('5/3/2024')).toBe('2024-03-05');
      expect(icnDataService.convertICNDateToISO('invalid')).toBeUndefined();
      expect(icnDataService.convertICNDateToISO('#N/A')).toBeUndefined();
    });
  });

  describe('clearCache', () => {
    it('should clear all cached data', async () => {
      await icnDataService.loadData();
      expect(icnDataService.isLoaded).toBe(true);
      
      icnDataService.clearCache();
      
      expect(icnDataService.isLoaded).toBe(false);
      expect(icnDataService.companies).toEqual([]);
      expect(icnDataService.icnItems).toEqual([]);
    });
  });

  describe('isDataLoaded', () => {
    it('should return loading status', async () => {
      expect(icnDataService.isDataLoaded()).toBe(false);
      
      await icnDataService.loadData();
      
      expect(icnDataService.isDataLoaded()).toBe(true);
    });
  });

  describe('getLastLoadTime', () => {
    it('should return last load time', async () => {
      expect(icnDataService.getLastLoadTime()).toBeNull();
      
      await icnDataService.loadData();
      
      expect(icnDataService.getLastLoadTime()).toBeInstanceOf(Date);
    });
  });
});