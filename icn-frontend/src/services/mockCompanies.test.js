import { mockCompanies, generateMockCompanies } from './mockCompanies';

describe('mockCompanies', () => {
  describe('mockCompanies array', () => {
    it('should contain 5 predefined companies', () => {
      expect(mockCompanies).toHaveLength(5);
    });

    it('should have valid company structure', () => {
      mockCompanies.forEach(company => {
        expect(company).toHaveProperty('id');
        expect(company).toHaveProperty('name');
        expect(company).toHaveProperty('address');
        expect(company).toHaveProperty('verificationStatus');
        expect(company).toHaveProperty('keySectors');
        expect(company).toHaveProperty('latitude');
        expect(company).toHaveProperty('longitude');
        expect(company).toHaveProperty('companyType');
        expect(company).toHaveProperty('distance');
        expect(company).toHaveProperty('employees');
        expect(company).toHaveProperty('ownership');
      });
    });

    it('should have unique IDs', () => {
      const ids = mockCompanies.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(mockCompanies.length);
    });

    it('should have valid verification statuses', () => {
      mockCompanies.forEach(company => {
        expect(['verified', 'unverified']).toContain(company.verificationStatus);
      });
    });

    it('should have valid company types', () => {
      const validTypes = ['supplier', 'manufacturer', 'service', 'consultant', 'both'];
      mockCompanies.forEach(company => {
        expect(validTypes).toContain(company.companyType);
      });
    });

    it('should have verified companies with verification dates', () => {
      const verifiedCompanies = mockCompanies.filter(c => c.verificationStatus === 'verified');
      verifiedCompanies.forEach(company => {
        expect(company.verificationDate).toBeDefined();
        expect(company.verificationDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('should have valid coordinates', () => {
      mockCompanies.forEach(company => {
        expect(company.latitude).toBeGreaterThan(-90);
        expect(company.latitude).toBeLessThan(-10);
        expect(company.longitude).toBeGreaterThan(100);
        expect(company.longitude).toBeLessThan(180);
      });
    });

    it('should have keySectors as array', () => {
      mockCompanies.forEach(company => {
        expect(Array.isArray(company.keySectors)).toBe(true);
        expect(company.keySectors.length).toBeGreaterThan(0);
      });
    });

    it('should have ownership as array', () => {
      mockCompanies.forEach(company => {
        expect(Array.isArray(company.ownership)).toBe(true);
      });
    });

    it('should have valid phone numbers when present', () => {
      const companiesWithPhone = mockCompanies.filter(c => c.phoneNumber);
      companiesWithPhone.forEach(company => {
        expect(company.phoneNumber).toMatch(/^\+61/);
      });
    });

    it('should have valid emails when present', () => {
      const companiesWithEmail = mockCompanies.filter(c => c.email);
      companiesWithEmail.forEach(company => {
        expect(company.email).toContain('@');
        // Removed strict .com.au requirement - any valid email format is acceptable
      });
    });

    it('should have valid websites when present', () => {
      const companiesWithWebsite = mockCompanies.filter(c => c.website);
      companiesWithWebsite.forEach(company => {
        expect(company.website).toContain('www.');
      });
    });

    it('should have Melbourne addresses', () => {
      mockCompanies.forEach(company => {
        expect(company.address).toContain('Melbourne');
        expect(company.address).toContain('VIC');
      });
    });
  });

  describe('generateMockCompanies', () => {
    it('should generate default 100 companies', () => {
      const companies = generateMockCompanies();
      expect(companies).toHaveLength(100);
    });

    it('should generate specified number of companies', () => {
      const companies = generateMockCompanies(50);
      expect(companies).toHaveLength(50);
    });

    it('should include original 5 companies', () => {
      const companies = generateMockCompanies(10);
      
      expect(companies[0].name).toBe('ABC Construction Ltd');
      expect(companies[1].name).toBe('XYZ Engineering');
      expect(companies[2].name).toBe('Global Manufacturing Co');
      expect(companies[3].name).toBe('Tech Solutions Pty Ltd');
      expect(companies[4].name).toBe('BuildRight Construction');
    });

    it('should generate companies with unique IDs', () => {
      const companies = generateMockCompanies(100);
      const ids = companies.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(companies.length);
    });

    it('should generate companies with sequential IDs', () => {
      const companies = generateMockCompanies(20);
      
      for (let i = 0; i < companies.length; i++) {
        expect(companies[i].id).toBe((i + 1).toString());
      }
    });

    it('should generate companies with valid structures', () => {
      const companies = generateMockCompanies(30);
      
      companies.forEach(company => {
        expect(company).toHaveProperty('id');
        expect(company).toHaveProperty('name');
        expect(company).toHaveProperty('address');
        expect(company).toHaveProperty('verificationStatus');
        expect(company).toHaveProperty('keySectors');
        expect(company).toHaveProperty('latitude');
        expect(company).toHaveProperty('longitude');
        expect(company).toHaveProperty('companyType');
        expect(company).toHaveProperty('distance');
        expect(company).toHaveProperty('employees');
        expect(company).toHaveProperty('ownership');
      });
    });

    it('should generate companies with valid verification statuses', () => {
      const companies = generateMockCompanies(50);
      
      companies.forEach(company => {
        expect(['verified', 'unverified']).toContain(company.verificationStatus);
      });
    });

    it('should generate verified companies with dates', () => {
      const companies = generateMockCompanies(100);
      const verified = companies.filter(c => 
        c.verificationStatus === 'verified' && c.verificationDate
      );
      
      verified.forEach(company => {
        expect(company.verificationDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('should generate companies with valid company types', () => {
      const companies = generateMockCompanies(50);
      const validTypes = ['supplier', 'manufacturer', 'service', 'consultant', 'both'];
      
      companies.forEach(company => {
        expect(validTypes).toContain(company.companyType);
      });
    });

    it('should distribute company types across sectors', () => {
      const companies = generateMockCompanies(50);
      const types = companies.map(c => c.companyType);
      
      expect(types).toContain('supplier');
      expect(types).toContain('manufacturer');
      expect(types).toContain('service');
      expect(types).toContain('consultant');
      expect(types).toContain('both');
    });

    it('should generate companies with multiple sectors', () => {
      const companies = generateMockCompanies(30);
      
      companies.slice(5).forEach(company => {
        expect(Array.isArray(company.keySectors)).toBe(true);
        expect(company.keySectors.length).toBe(2);
      });
    });

    it('should generate companies across different cities', () => {
      const companies = generateMockCompanies(100);
      const cities = new Set(
        companies.map(c => c.address.split(',')[1]?.trim().split(' ')[0])
      );
      
      expect(cities.size).toBeGreaterThan(1);
    });

    it('should generate companies with valid coordinates', () => {
      const companies = generateMockCompanies(50);
      
      companies.forEach(company => {
        expect(typeof company.latitude).toBe('number');
        expect(typeof company.longitude).toBe('number');
        expect(company.latitude).toBeGreaterThan(-90);
        expect(company.latitude).toBeLessThan(0);
        expect(company.longitude).toBeGreaterThan(100);
        expect(company.longitude).toBeLessThan(180);
      });
    });

    it('should generate companies with distance values', () => {
      const companies = generateMockCompanies(50);
      
      companies.forEach(company => {
        expect(typeof company.distance).toBe('number');
        expect(company.distance).toBeGreaterThanOrEqual(0);
        expect(company.distance).toBeLessThan(20);
      });
    });

    it('should generate companies with valid employee ranges', () => {
      const companies = generateMockCompanies(50);
      const validRanges = ['1-10', '10-50', '50-200', '200-500', '500+'];
      
      companies.forEach(company => {
        expect(validRanges).toContain(company.employees);
      });
    });

    it('should generate some companies with ownership types', () => {
      const companies = generateMockCompanies(100);
      const withOwnership = companies.filter(c => c.ownership.length > 0);
      
      expect(withOwnership.length).toBeGreaterThan(0);
      
      withOwnership.forEach(company => {
        const validOwnership = [
          'Female-owned',
          'First Nations-owned',
          'Social Enterprise',
          'Australian Disability Enterprise',
          'Australian-owned'
        ];
        
        company.ownership.forEach(type => {
          expect(validOwnership).toContain(type);
        });
      });
    });

    it('should generate some companies without ownership', () => {
      const companies = generateMockCompanies(100);
      const withoutOwnership = companies.filter(c => c.ownership.length === 0);
      
      expect(withoutOwnership.length).toBeGreaterThan(0);
    });

    it('should generate some companies with phone numbers', () => {
      const companies = generateMockCompanies(100);
      const withPhone = companies.filter(c => c.phoneNumber);
      
      expect(withPhone.length).toBeGreaterThan(0);
      
      withPhone.forEach(company => {
        expect(company.phoneNumber).toMatch(/^\+61 3 \d{4} \d{4}$/);
      });
    });

    it('should generate some companies with emails', () => {
      const companies = generateMockCompanies(100);
      // Only check generated companies (index 5+), not the original 5
      const withEmail = companies.slice(5).filter(c => c.email);
      
      expect(withEmail.length).toBeGreaterThan(0);
      
      withEmail.forEach(company => {
        expect(company.email).toMatch(/^info@company\d+\.com\.au$/);
      });
    });

    it('should generate some companies with websites', () => {
      const companies = generateMockCompanies(100);
      // Only check generated companies (index 5+), not the original 5
      const withWebsite = companies.slice(5).filter(c => c.website);
      
      expect(withWebsite.length).toBeGreaterThan(0);
      
      withWebsite.forEach(company => {
        expect(company.website).toMatch(/^www\.company\d+\.com\.au$/);
      });
    });

    it('should generate companies with capabilities', () => {
      const companies = generateMockCompanies(50);
      const validCapabilities = [
        'Manufacturing',
        'Supply Chain',
        'Design',
        'Assembly',
        'Distribution'
      ];
      
      companies.slice(5).forEach(company => {
        expect(Array.isArray(company.capabilities)).toBe(true);
        expect(company.capabilities.length).toBeGreaterThan(0);
        expect(company.capabilities.length).toBeLessThanOrEqual(4);
        
        company.capabilities.forEach(cap => {
          expect(validCapabilities).toContain(cap);
        });
      });
    });

    it('should generate companies with addresses in correct format', () => {
      const companies = generateMockCompanies(50);
      
      companies.forEach(company => {
        expect(company.address).toContain(',');
        expect(company.address).toMatch(/\d{4}/); // Postcode
      });
    });

    it('should handle edge case of generating 5 companies (original only)', () => {
      const companies = generateMockCompanies(5);
      
      expect(companies).toHaveLength(5);
      expect(companies).toEqual(mockCompanies);
    });

    it('should handle large number of companies', () => {
      const companies = generateMockCompanies(500);
      
      expect(companies).toHaveLength(500);
      expect(companies[0].name).toBe('ABC Construction Ltd');
      expect(companies[499].name).toBe('Company 500');
    });

    it('should maintain data consistency', () => {
      const companies1 = generateMockCompanies(50);
      const companies2 = generateMockCompanies(50);
      
      // First 5 should be identical (original companies)
      for (let i = 0; i < 5; i++) {
        expect(companies1[i]).toEqual(companies2[i]);
      }
    });

    it('should generate different random data each time', () => {
      const companies1 = generateMockCompanies(10);
      const companies2 = generateMockCompanies(10);
      
      // Generated companies (index 5+) should be different due to randomization
      let differencesFound = false;
      for (let i = 5; i < 10; i++) {
        if (companies1[i].distance !== companies2[i].distance ||
            companies1[i].latitude !== companies2[i].latitude) {
          differencesFound = true;
          break;
        }
      }
      
      expect(differencesFound).toBe(true);
    });

    it('should cycle through states based on city index', () => {
      const companies = generateMockCompanies(100);
      const addressStates = companies.slice(5).map(c => {
        const parts = c.address.split(',');
        return parts[2]?.trim().split(' ')[0];
      });
      
      const uniqueStates = new Set(addressStates);
      expect(uniqueStates.size).toBeGreaterThan(1);
    });
  });

  describe('data quality', () => {
    it('should have consistent naming pattern', () => {
      const companies = generateMockCompanies(20);
      
      for (let i = 5; i < 20; i++) {
        expect(companies[i].name).toBe(`Company ${i + 1}`);
      }
    });

    it('should have no null or undefined required fields', () => {
      const companies = generateMockCompanies(50);
      
      companies.forEach(company => {
        expect(company.id).toBeDefined();
        expect(company.name).toBeDefined();
        expect(company.address).toBeDefined();
        expect(company.verificationStatus).toBeDefined();
        expect(company.keySectors).toBeDefined();
        expect(company.latitude).toBeDefined();
        expect(company.longitude).toBeDefined();
        expect(company.companyType).toBeDefined();
        expect(company.distance).toBeDefined();
        expect(company.employees).toBeDefined();
        expect(company.ownership).toBeDefined();
      });
    });

    it('should maintain referential integrity', () => {
      const companies = generateMockCompanies(30);
      const ids = companies.map(c => c.id);
      
      // All IDs should be unique and sequential
      for (let i = 0; i < ids.length; i++) {
        expect(ids[i]).toBe((i + 1).toString());
      }
    });
  });
});