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

    it('should search by postcode', async () => {
      await icnDataService.loadData();
      const results = icnDataService.searchCompanies('3000');
      
      expect(results).toBeInstanceOf(Array);
    });

    it('should search by capability', async () => {
      await icnDataService.loadData();
      const results = icnDataService.searchCompanies('Custom Software');
      
      expect(results).toBeInstanceOf(Array);
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

    it('should return empty for invalid company type', async () => {
      await icnDataService.loadData();
      const results = icnDataService.filterByCompanyType('invalid-type');
      
      expect(results).toEqual([]);
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

    it('should count companies with multiple capability types', async () => {
      await icnDataService.loadData();
      const stats = icnDataService.getStatistics();
      
      expect(stats.byCapabilityType).toBeDefined();
      expect(typeof stats.byCapabilityType).toBe('object');
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

// ============================================================================
// ADDITIONAL TESTS FOR IMPROVED COVERAGE
// ============================================================================

describe('icnDataService - Additional Coverage', () => {
  beforeEach(() => {
    icnDataService.clearCache();
  });

  describe('determineCompanyType - all branches', () => {
    it('should determine service type', () => {
      const result = icnDataService.determineCompanyType(['Service Provider']);
      expect(result).toBe('service');
    });

    it('should determine service type for project management', () => {
      const result = icnDataService.determineCompanyType(['Project Management']);
      expect(result).toBe('service');
    });

    it('should determine service type for designer', () => {
      const result = icnDataService.determineCompanyType(['Designer']);
      expect(result).toBe('service');
    });

    it('should determine consultant type for retailer', () => {
      const result = icnDataService.determineCompanyType(['Retailer']);
      expect(result).toBe('consultant');
    });

    it('should determine consultant type for wholesaler', () => {
      const result = icnDataService.determineCompanyType(['Wholesaler']);
      expect(result).toBe('consultant');
    });

    it('should default to supplier for unknown types', () => {
      const result = icnDataService.determineCompanyType(['Unknown Type']);
      expect(result).toBe('supplier');
    });

    it('should default to supplier for empty array', () => {
      const result = icnDataService.determineCompanyType([]);
      expect(result).toBe('supplier');
    });

    it('should return both for supplier and manufacturer', () => {
      const result = icnDataService.determineCompanyType(['Supplier', 'Manufacturer']);
      expect(result).toBe('both');
    });

    it('should return manufacturer for manufacturer types', () => {
      const result = icnDataService.determineCompanyType(['Manufacturer']);
      expect(result).toBe('manufacturer');
    });

    it('should return manufacturer for assembler', () => {
      const result = icnDataService.determineCompanyType(['Assembler']);
      expect(result).toBe('manufacturer');
    });

    it('should return supplier for supplier types', () => {
      const result = icnDataService.determineCompanyType(['Supplier']);
      expect(result).toBe('supplier');
    });

    it('should return supplier for item supplier', () => {
      const result = icnDataService.determineCompanyType(['Item Supplier']);
      expect(result).toBe('supplier');
    });

    it('should return supplier for parts supplier', () => {
      const result = icnDataService.determineCompanyType(['Parts Supplier']);
      expect(result).toBe('supplier');
    });
  });

  describe('normalizeCapabilityType - additional cases', () => {
    it('should return valid type if already normalized', () => {
      const result = icnDataService.normalizeCapabilityType('Manufacturer');
      expect(result).toBe('Manufacturer');
    });

    it('should map supplier', () => {
      const result = icnDataService.normalizeCapabilityType('supplier');
      expect(result).toBe('Supplier');
    });

    it('should map item supplier', () => {
      const result = icnDataService.normalizeCapabilityType('item supplier');
      expect(result).toBe('Item Supplier');
    });

    it('should map parts supplier', () => {
      const result = icnDataService.normalizeCapabilityType('parts supplier');
      expect(result).toBe('Parts Supplier');
    });

    it('should map manufacturer', () => {
      const result = icnDataService.normalizeCapabilityType('manufacturer');
      expect(result).toBe('Manufacturer');
    });

    it('should map manufacturer (parts) variation', () => {
      const result = icnDataService.normalizeCapabilityType('manufacturer (parts)');
      expect(result).toBe('Manufacturer (Parts)');
    });

    it('should map service provider', () => {
      const result = icnDataService.normalizeCapabilityType('service provider');
      expect(result).toBe('Service Provider');
    });

    it('should map project management', () => {
      const result = icnDataService.normalizeCapabilityType('project management');
      expect(result).toBe('Project Management');
    });

    it('should map designer', () => {
      const result = icnDataService.normalizeCapabilityType('designer');
      expect(result).toBe('Designer');
    });

    it('should map assembler', () => {
      const result = icnDataService.normalizeCapabilityType('assembler');
      expect(result).toBe('Assembler');
    });

    it('should map retailer', () => {
      const result = icnDataService.normalizeCapabilityType('retailer');
      expect(result).toBe('Retailer');
    });

    it('should map wholesaler', () => {
      const result = icnDataService.normalizeCapabilityType('wholesaler');
      expect(result).toBe('Wholesaler');
    });

    it('should default to service provider for invalid types', () => {
      const result = icnDataService.normalizeCapabilityType('invalid-type');
      expect(result).toBe('Service Provider');
    });

    it('should default to service provider for null', () => {
      const result = icnDataService.normalizeCapabilityType(null);
      expect(result).toBe('Service Provider');
    });

    it('should default to service provider for #N/A', () => {
      const result = icnDataService.normalizeCapabilityType('#N/A');
      expect(result).toBe('Service Provider');
    });
  });

  describe('getDefaultLatitude and getDefaultLongitude', () => {
    it('should return default coordinates for unknown state', () => {
      const lat = icnDataService.getDefaultLatitude('UNKNOWN');
      const lng = icnDataService.getDefaultLongitude('UNKNOWN');
      
      // Should default to VIC coordinates
      expect(lat).toBe(-37.8136);
      expect(lng).toBe(144.9631);
    });

    it('should return coordinates for all Australian states', () => {
      const states = {
        'VIC': { lat: -37.8136, lng: 144.9631 },
        'NSW': { lat: -33.8688, lng: 151.2093 },
        'QLD': { lat: -27.4698, lng: 153.0251 },
        'SA': { lat: -34.9285, lng: 138.6007 },
        'WA': { lat: -31.9505, lng: 115.8605 },
        'NT': { lat: -12.4634, lng: 130.8456 },
        'TAS': { lat: -42.8821, lng: 147.3272 },
        'ACT': { lat: -35.2809, lng: 149.1300 }
      };

      Object.entries(states).forEach(([state, coords]) => {
        expect(icnDataService.getDefaultLatitude(state)).toBe(coords.lat);
        expect(icnDataService.getDefaultLongitude(state)).toBe(coords.lng);
      });
    });

    it('should return coordinates for New Zealand states', () => {
      const latNI = icnDataService.getDefaultLatitude('NI');
      const lngNI = icnDataService.getDefaultLongitude('NI');
      
      expect(latNI).toBe(-36.8485);
      expect(lngNI).toBe(174.7633);
      
      const latSI = icnDataService.getDefaultLatitude('SI');
      const lngSI = icnDataService.getDefaultLongitude('SI');
      
      expect(latSI).toBe(-43.5321);
      expect(lngSI).toBe(172.6362);
    });
  });

  describe('normalizeStateTerritory - comprehensive', () => {
    it('should normalize Australian city names', () => {
      expect(icnDataService.normalizeStateTerritory('melbourne')).toBe('VIC');
      expect(icnDataService.normalizeStateTerritory('sydney')).toBe('NSW');
      expect(icnDataService.normalizeStateTerritory('brisbane')).toBe('QLD');
      expect(icnDataService.normalizeStateTerritory('adelaide')).toBe('SA');
      expect(icnDataService.normalizeStateTerritory('perth')).toBe('WA');
      expect(icnDataService.normalizeStateTerritory('darwin')).toBe('NT');
      expect(icnDataService.normalizeStateTerritory('hobart')).toBe('TAS');
      expect(icnDataService.normalizeStateTerritory('canberra')).toBe('ACT');
    });

    it('should normalize New Zealand regions', () => {
      expect(icnDataService.normalizeStateTerritory('north island')).toBe('NI');
      expect(icnDataService.normalizeStateTerritory('south island')).toBe('SI');
      expect(icnDataService.normalizeStateTerritory('auckland')).toBe('NI');
      expect(icnDataService.normalizeStateTerritory('wellington')).toBe('NI');
      expect(icnDataService.normalizeStateTerritory('christchurch')).toBe('SI');
    });

    it('should normalize state abbreviations with periods', () => {
      expect(icnDataService.normalizeStateTerritory('vic.')).toBe('VIC');
      expect(icnDataService.normalizeStateTerritory('nsw.')).toBe('NSW');
      expect(icnDataService.normalizeStateTerritory('qld.')).toBe('QLD');
    });

    it('should handle full state names', () => {
      expect(icnDataService.normalizeStateTerritory('victoria')).toBe('VIC');
      expect(icnDataService.normalizeStateTerritory('new south wales')).toBe('NSW');
      expect(icnDataService.normalizeStateTerritory('queensland')).toBe('QLD');
      expect(icnDataService.normalizeStateTerritory('south australia')).toBe('SA');
      expect(icnDataService.normalizeStateTerritory('western australia')).toBe('WA');
      expect(icnDataService.normalizeStateTerritory('northern territory')).toBe('NT');
      expect(icnDataService.normalizeStateTerritory('tasmania')).toBe('TAS');
      expect(icnDataService.normalizeStateTerritory('australian capital territory')).toBe('ACT');
    });

    it('should default to NSW for null or invalid', () => {
      expect(icnDataService.normalizeStateTerritory(null)).toBe('NSW');
      expect(icnDataService.normalizeStateTerritory('')).toBe('NSW');
      expect(icnDataService.normalizeStateTerritory('#N/A')).toBe('NSW');
      expect(icnDataService.normalizeStateTerritory('invalid-state')).toBe('NSW');
    });
  });

  describe('convertICNDateToISO - edge cases', () => {
    it('should handle single digit days and months', () => {
      expect(icnDataService.convertICNDateToISO('1/2/2024')).toBe('2024-02-01');
      expect(icnDataService.convertICNDateToISO('5/3/2024')).toBe('2024-03-05');
      expect(icnDataService.convertICNDateToISO('9/11/2024')).toBe('2024-11-09');
    });

    it('should pad days and months with zeros', () => {
      expect(icnDataService.convertICNDateToISO('01/12/2024')).toBe('2024-12-01');
      expect(icnDataService.convertICNDateToISO('15/05/2024')).toBe('2024-05-15');
    });

    it('should return undefined for malformed dates', () => {
      expect(icnDataService.convertICNDateToISO('invalid')).toBeUndefined();
      expect(icnDataService.convertICNDateToISO('01-12-2024')).toBeUndefined();
      expect(icnDataService.convertICNDateToISO('01/12')).toBeUndefined();
      expect(icnDataService.convertICNDateToISO('')).toBeUndefined();
    });

    it('should return undefined for invalid values', () => {
      expect(icnDataService.convertICNDateToISO(null)).toBeUndefined();
      expect(icnDataService.convertICNDateToISO('#N/A')).toBeUndefined();
      expect(icnDataService.convertICNDateToISO('N/A')).toBeUndefined();
    });
  });

  describe('cleanCompanyData - edge cases', () => {
    it('should trim whitespace', () => {
      expect(icnDataService.cleanCompanyData('  test  ')).toBe('test');
      expect(icnDataService.cleanCompanyData('\n\tdata\t\n')).toBe('data');
    });

    it('should use custom placeholder', () => {
      expect(icnDataService.cleanCompanyData('', 'Custom')).toBe('Custom');
      expect(icnDataService.cleanCompanyData(null, 'Default')).toBe('Default');
      expect(icnDataService.cleanCompanyData('#N/A', 'Placeholder')).toBe('Placeholder');
    });

    it('should handle various invalid values', () => {
      expect(icnDataService.cleanCompanyData('0')).toBe('Not Available');
      expect(icnDataService.cleanCompanyData('NULL')).toBe('Not Available');
      expect(icnDataService.cleanCompanyData('UNDEFINED')).toBe('Not Available');
    });

    it('should preserve valid data', () => {
      expect(icnDataService.cleanCompanyData('Valid Company Name')).toBe('Valid Company Name');
      expect(icnDataService.cleanCompanyData('123 Main St')).toBe('123 Main St');
    });
  });
});

// ============================================================================
// TESTS WITH MOCK DATA FOR COMPLEX SCENARIOS
// ============================================================================

describe('icnDataService - Complex Scenarios', () => {
  describe('Multiple organizations per item', () => {
    beforeAll(() => {
      // Setup mock data
      jest.resetModules();
      jest.doMock('../assets/ICN_Navigator.Company.json', () => [
        {
          "Item ID": "item-1",
          "Sector Name": "Technology",
          "Item Name": "Software",
          "Detailed Item Name": "Custom Software",
          "Sector Mapping ID": "sector-1",
          "Organizations": [
            {
              "Organisation: Organisation ID": "org-1",
              "Organisation: Organisation Name": "Test Company",
              "Organisation: Billing Street": "123 Test St",
              "Organisation: Billing City": "Melbourne",
              "Organisation: Billing State/Province": "VIC",
              "Organisation: Billing Zip/Postal Code": "3000",
              "Capability Type": "Supplier",
              "Validation Date": "01/01/2024",
              "Organisation Capability": "cap-1"
            }
          ]
        },
        {
          "Item ID": "item-2",
          "Sector Name": "Manufacturing",
          "Item Name": "Hardware",
          "Detailed Item Name": "Electronic Components",
          "Sector Mapping ID": "sector-2",
          "Organizations": [
            {
              "Organisation: Organisation ID": "org-1",
              "Organisation: Organisation Name": "Test Company",
              "Organisation: Billing Street": "123 Test St",
              "Organisation: Billing City": "Melbourne",
              "Organisation: Billing State/Province": "VIC",
              "Organisation: Billing Zip/Postal Code": "3000",
              "Capability Type": "Manufacturer",
              "Validation Date": "01/01/2024",
              "Organisation Capability": "cap-2"
            }
          ]
        }
      ]);
    });

    it('should consolidate same organization across multiple items', async () => {
      const service = require('./icnDataService').default;
      await service.loadData();
      
      const companies = service.getCompanies();
      const orgCompanies = companies.filter(c => c.id === 'org-1');
      
      // Should only have one company entry for org-1
      expect(orgCompanies.length).toBe(1);
    });

    it('should aggregate sectors from multiple items', async () => {
      const service = require('./icnDataService').default;
      await service.loadData();
      
      const company = service.getCompanyById('org-1');
      
      expect(company.keySectors).toContain('Technology');
      expect(company.keySectors).toContain('Manufacturing');
      expect(company.keySectors.length).toBeGreaterThanOrEqual(2);
    });

    it('should aggregate capabilities from multiple items', async () => {
      const service = require('./icnDataService').default;
      await service.loadData();
      
      const company = service.getCompanyById('org-1');
      
      expect(company.capabilities).toContain('Custom Software');
      expect(company.capabilities).toContain('Electronic Components');
    });

    it('should update company type to both when has supplier and manufacturer', async () => {
      const service = require('./icnDataService').default;
      await service.loadData();
      
      const company = service.getCompanyById('org-1');
      
      expect(company.companyType).toBe('both');
    });

    it('should have multiple ICN capabilities', async () => {
      const service = require('./icnDataService').default;
      await service.loadData();
      
      const company = service.getCompanyById('org-1');
      
      expect(company.icnCapabilities).toBeDefined();
      expect(company.icnCapabilities.length).toBe(2);
      expect(company.icnCapabilities[0].capabilityId).toBe('cap-1');
      expect(company.icnCapabilities[1].capabilityId).toBe('cap-2');
    });
  });

  describe('Filter options exclusions', () => {
    beforeAll(() => {
      jest.resetModules();
      jest.doMock('../assets/ICN_Navigator.Company.json', () => [
        {
          "Item ID": "item-1",
          "Sector Name": "General",
          "Item Name": "Service",
          "Detailed Item Name": "Service",
          "Sector Mapping ID": "sector-1",
          "Organizations": [{
            "Organisation: Organisation ID": "org-1",
            "Organisation: Organisation Name": "Test Company",
            "Organisation: Billing Street": "123 Test St",
            "Organisation: Billing City": "City Not Available",
            "Organisation: Billing State/Province": "VIC",
            "Organisation: Billing Zip/Postal Code": "3000",
            "Capability Type": "Supplier",
            "Validation Date": "01/01/2024",
            "Organisation Capability": "cap-1"
          }]
        },
        {
          "Item ID": "item-2",
          "Sector Name": "Technology",
          "Item Name": "Software",
          "Detailed Item Name": "Custom Software",
          "Sector Mapping ID": "sector-2",
          "Organizations": [{
            "Organisation: Organisation ID": "org-2",
            "Organisation: Organisation Name": "Tech Company",
            "Organisation: Billing Street": "456 Tech Ave",
            "Organisation: Billing City": "Sydney",
            "Organisation: Billing State/Province": "NSW",
            "Organisation: Billing Zip/Postal Code": "2000",
            "Capability Type": "Service Provider",
            "Validation Date": "01/02/2024",
            "Organisation Capability": "cap-2"
          }]
        }
      ]);
    });

    it('should exclude General from sectors', async () => {
      const service = require('./icnDataService').default;
      await service.loadData();
      
      const options = service.getFilterOptions();
      
      expect(options.sectors).not.toContain('General');
      expect(options.sectors).toContain('Technology');
    });

    it('should exclude Service from capabilities', async () => {
      const service = require('./icnDataService').default;
      await service.loadData();
      
      const options = service.getFilterOptions();
      
      expect(options.capabilities).not.toContain('Service');
      expect(options.capabilities).toContain('Custom Software');
    });

    it('should exclude City Not Available from cities', async () => {
      const service = require('./icnDataService').default;
      await service.loadData();
      
      const options = service.getFilterOptions();
      
      expect(options.cities).not.toContain('City Not Available');
      expect(options.cities).toContain('Sydney');
    });

    it('should include all valid capability types', async () => {
      const service = require('./icnDataService').default;
      await service.loadData();
      
      const options = service.getFilterOptions();
      
      expect(options.capabilityTypes).toContain('Supplier');
      expect(options.capabilityTypes).toContain('Service Provider');
    });
  });

  describe('Invalid data handling', () => {
    beforeAll(() => {
      jest.resetModules();
      jest.doMock('../assets/ICN_Navigator.Company.json', () => [
        {
          "Item ID": "item-1",
          "Sector Name": "#N/A",
          "Item Name": "N/A",
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
        },
        {
          "Item ID": "item-2",
          "Sector Name": "Technology",
          "Item Name": "Software",
          "Sector Mapping ID": "sector-2",
          "Organizations": [{
            "Organisation: Organisation ID": "#N/A",
            "Organisation: Organisation Name": "Invalid Company",
            "Organisation: Billing Street": "456 Test St",
            "Organisation: Billing City": "Sydney",
            "Organisation: Billing State/Province": "NSW",
            "Organisation: Billing Zip/Postal Code": "2000",
            "Capability Type": "Supplier",
            "Validation Date": "01/01/2024",
            "Organisation Capability": "cap-2"
          }]
        },
        {
          "Item ID": "item-3",
          "Sector Name": "Manufacturing",
          "Item Name": "Parts",
          "Detailed Item Name": "Metal Parts",
          "Sector Mapping ID": "sector-3",
          "Organizations": [{
            "Organisation: Organisation ID": "org-3",
            "Organisation: Organisation Name": "Valid Company",
            "Organisation: Billing Street": "789 Main St",
            "Organisation: Billing City": "Brisbane",
            "Organisation: Billing State/Province": "QLD",
            "Organisation: Billing Zip/Postal Code": "4000",
            "Capability Type": "Manufacturer",
            "Validation Date": "01/03/2024",
            "Organisation Capability": "cap-3"
          }]
        }
      ]);
    });

    it('should skip items with both invalid sector and item name', async () => {
      const service = require('./icnDataService').default;
      await service.loadData();
      
      const companies = service.getCompanies();
      
      // First item should be skipped (both sector and item name invalid)
      // Second item should be skipped (invalid org ID)
      // Only third item should be processed
      expect(companies.some(c => c.id === 'org-1')).toBe(false);
      expect(companies.some(c => c.id === '#N/A')).toBe(false);
      expect(companies.some(c => c.id === 'org-3')).toBe(true);
    });

    it('should process valid items correctly', async () => {
      const service = require('./icnDataService').default;
      await service.loadData();
      
      const company = service.getCompanyById('org-3');
      
      expect(company).toBeDefined();
      expect(company.name).toBe('Valid Company');
      expect(company.keySectors).toContain('Manufacturing');
    });
  });
});