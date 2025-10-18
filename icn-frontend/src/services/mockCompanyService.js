import ICNData from '../assets/ICN_Navigator.Company.json';

// Define capability types
const CAPABILITY_TYPES = {
  SUPPLIER: 'Supplier',
  ITEM_SUPPLIER: 'Item Supplier',
  PARTS_SUPPLIER: 'Parts Supplier',
  MANUFACTURER: 'Manufacturer',
  MANUFACTURER_PARTS: 'Manufacturer (Parts)',
  SERVICE_PROVIDER: 'Service Provider',
  PROJECT_MANAGEMENT: 'Project Management',
  DESIGNER: 'Designer',
  ASSEMBLER: 'Assembler',
  RETAILER: 'Retailer',
  WHOLESALER: 'Wholesaler'
};

// Group capability types for filtering
const CAPABILITY_TYPE_GROUPS = {
  supplier: [
    CAPABILITY_TYPES.SUPPLIER,
    CAPABILITY_TYPES.ITEM_SUPPLIER,
    CAPABILITY_TYPES.PARTS_SUPPLIER
  ],
  manufacturer: [
    CAPABILITY_TYPES.MANUFACTURER,
    CAPABILITY_TYPES.MANUFACTURER_PARTS,
    CAPABILITY_TYPES.ASSEMBLER
  ],
  service: [
    CAPABILITY_TYPES.SERVICE_PROVIDER,
    CAPABILITY_TYPES.PROJECT_MANAGEMENT,
    CAPABILITY_TYPES.DESIGNER
  ],
  retail: [
    CAPABILITY_TYPES.RETAILER,
    CAPABILITY_TYPES.WHOLESALER
  ]
};

// State/Territory mapping
const STATE_TERRITORY_MAP = {
  'victoria': 'VIC',
  'new south wales': 'NSW',
  'queensland': 'QLD',
  'south australia': 'SA',
  'western australia': 'WA',
  'northern territory': 'NT',
  'tasmania': 'TAS',
  'australian capital territory': 'ACT',
  'vic.': 'VIC', 'nsw.': 'NSW', 'qld.': 'QLD', 'sa.': 'SA',
  'wa.': 'WA', 'nt.': 'NT', 'tas.': 'TAS', 'act.': 'ACT',
  'melbourne': 'VIC', 'sydney': 'NSW', 'brisbane': 'QLD',
  'adelaide': 'SA', 'perth': 'WA', 'darwin': 'NT',
  'hobart': 'TAS', 'canberra': 'ACT',
  'north island': 'NI', 'south island': 'SI',
  'auckland': 'NI', 'wellington': 'NI', 'christchurch': 'SI'
};

const STANDARD_STATES_TERRITORIES = [
  'VIC', 'NSW', 'QLD', 'SA', 'WA', 'NT', 'TAS', 'ACT', 'NI', 'SI'
];

class MockCompanyService {
  constructor() {
    this.companies = [];
    this.icnItems = [];
    this.isLoaded = false;
    this.bookmarks = new Map(); // userId -> Set of companyIds
    this.savedSearches = new Map(); // userId -> array of saved searches
    
    // Load ICN data on initialization
    this.loadICNData();
  }
  
  async loadICNData() {
    if (this.isLoaded) {
      return this.companies;
    }
    
    try {
      console.log('Loading ICN data from JSON file...');
      
      // Process the ICN data
      if (!Array.isArray(ICNData)) {
        throw new Error('Invalid ICN data format: expected array');
      }
      
      console.log(`Loaded ${ICNData.length} ICN items from file`);
      
      // Filter valid items
      this.icnItems = ICNData.filter(item => 
        item.Organizations && 
        item.Organizations.length > 0 &&
        !this.isInvalidValue(item["Item ID"])
      );
      
      console.log(`Valid ICN items: ${this.icnItems.length}`);
      
      // Convert ICN data to Company format
      this.companies = await this.convertICNDataToCompanies(this.icnItems);
      
      // Add some mock enhancements for demo purposes
      this.enhanceCompaniesForDemo();
      
      this.isLoaded = true;
      
      console.log(`Processed ${this.companies.length} unique companies`);
      this.logStatistics();
      
      return this.companies;
      
    } catch (error) {
      console.error('Error loading ICN data:', error);
      // Fallback to empty array
      this.companies = [];
      this.isLoaded = true;
      return this.companies;
    }
  }
  
  // Convert ICN data structure to Company interface
  async convertICNDataToCompanies(icnItems) {
    const companyMap = new Map();
    let skippedCount = 0;
    
    icnItems.forEach(item => {
      if (this.isInvalidValue(item["Sector Name"]) && this.isInvalidValue(item["Item Name"])) {
        skippedCount++;
        return;
      }
      
      item.Organizations.forEach(org => {
        const orgId = org["Organisation: Organisation ID"];
        
        if (!orgId || this.isInvalidValue(orgId)) {
          skippedCount++;
          return;
        }
        
        if (!companyMap.has(orgId)) {
          // Create new company entry
          const normalizedState = this.normalizeStateTerritory(org["Organisation: Billing State/Province"]);
          const street = this.cleanCompanyData(org["Organisation: Billing Street"], 'Address Not Available');
          const city = this.cleanCompanyData(org["Organisation: Billing City"], 'City Not Available');
          const postcode = this.cleanCompanyData(org["Organisation: Billing Zip/Postal Code"], '');
          
          const companyName = this.cleanCompanyData(org["Organisation: Organisation Name"], `Company ${orgId.slice(-4)}`);
          const fullAddress = [street, city, normalizedState, postcode]
            .filter(v => v && v !== '')
            .join(', ');
          
          const capabilityType = this.normalizeCapabilityType(org["Capability Type"]);
          const verificationDate = this.convertICNDateToISO(org["Validation Date"]);
          const sectorName = this.cleanCompanyData(item["Sector Name"], 'General');
          const itemName = this.cleanCompanyData(item["Item Name"], 'Service');
          const detailedItemName = this.cleanCompanyData(item["Detailed Item Name"], itemName);
          
          companyMap.set(orgId, {
            id: orgId,
            name: companyName,
            address: fullAddress || 'Address Not Available',
            billingAddress: {
              street,
              city,
              state: normalizedState,
              postcode
            },
            // Default coordinates with some randomization for demo
            latitude: this.getDefaultLatitude(normalizedState) + (Math.random() - 0.5) * 0.1,
            longitude: this.getDefaultLongitude(normalizedState) + (Math.random() - 0.5) * 0.1,
            verificationStatus: verificationDate ? 'verified' : 'unverified',
            verificationDate,
            keySectors: [sectorName],
            capabilities: [detailedItemName],
            companyType: this.determineCompanyType([capabilityType]),
            icnCapabilities: [{
              capabilityId: org["Organisation Capability"],
              itemId: item["Item ID"],
              itemName,
              detailedItemName,
              capabilityType,
              sectorName,
              sectorMappingId: item["Sector Mapping ID"]
            }],
            dataSource: 'ICN',
            icnValidationDate: org["Validation Date"],
            lastUpdated: new Date().toISOString(),
            // Calculate mock distance for demo
            distance: Math.random() * 20,
            employees: this.getRandomEmployeeRange(),
            ownership: this.getRandomOwnership()
          });
        } else {
          // Add to existing company
          const existingCompany = companyMap.get(orgId);
          const sectorName = this.cleanCompanyData(item["Sector Name"], 'General');
          const detailedItemName = this.cleanCompanyData(item["Detailed Item Name"], 'Service');
          const capabilityType = this.normalizeCapabilityType(org["Capability Type"]);
          
          // Add unique sectors
          if (!existingCompany.keySectors.includes(sectorName)) {
            existingCompany.keySectors.push(sectorName);
          }
          
          // Add unique capabilities
          if (existingCompany.capabilities && !existingCompany.capabilities.includes(detailedItemName)) {
            existingCompany.capabilities.push(detailedItemName);
          }
          
          // Add ICN capability details
          if (existingCompany.icnCapabilities) {
            existingCompany.icnCapabilities.push({
              capabilityId: org["Organisation Capability"],
              itemId: item["Item ID"],
              itemName: this.cleanCompanyData(item["Item Name"], 'Service'),
              detailedItemName,
              capabilityType,
              sectorName,
              sectorMappingId: item["Sector Mapping ID"]
            });
          }
          
          // Update company type based on all capability types
          if (existingCompany.icnCapabilities) {
            const allCapTypes = existingCompany.icnCapabilities.map(c => c.capabilityType);
            existingCompany.companyType = this.determineCompanyType(allCapTypes);
          }
        }
      });
    });
    
    const companies = Array.from(companyMap.values());
    
    if (skippedCount > 0) {
      console.log(`Skipped ${skippedCount} invalid entries`);
    }
    
    // Return ALL companies - no limit
    console.log(`Returning all ${companies.length} companies`);
    return companies;
  }
  
  // Enhance companies with mock data for demo purposes
  enhanceCompaniesForDemo() {
    this.companies.forEach((company, index) => {
      // Add mock contact info for some companies
      if (Math.random() > 0.3) {
        company.phoneNumber = `+61 3 ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}`;
      }
      
      if (Math.random() > 0.4) {
        company.email = `info@${company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.au`;
      }
      
      if (Math.random() > 0.5) {
        company.website = `www.${company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.au`;
      }
      
      // Add certifications for some companies
      if (Math.random() > 0.6) {
        company.certifications = this.getRandomCertifications();
      }
      
      // Add company size
      company.companySize = this.getCompanySize(company.employees);
      
      // Add year established for some
      if (Math.random() > 0.4) {
        company.yearEstablished = 1990 + Math.floor(Math.random() * 30);
      }
      
      // Add rating for some
      if (Math.random() > 0.3) {
        company.rating = 3 + Math.random() * 2; // 3-5 rating
        company.reviewCount = Math.floor(Math.random() * 50) + 1;
      }
    });
  }
  
  // API Methods - Compatible with original service
  async getAll(params = {}) {
    // Ensure data is loaded
    if (!this.isLoaded) {
      await this.loadICNData();
    }
    
    await this.delay(600);
    
    let filtered = [...this.companies];
    
    // Apply search filter
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.address.toLowerCase().includes(searchLower) ||
        c.keySectors.some(s => s.toLowerCase().includes(searchLower)) ||
        (c.capabilities && c.capabilities.some(cap => cap.toLowerCase().includes(searchLower)))
      );
    }
    
    // Apply sector filter
    if (params.sectors && params.sectors.length > 0) {
      filtered = filtered.filter(c =>
        c.keySectors.some(s => params.sectors.includes(s))
      );
    }
    
    // Apply company type filter
    if (params.companyType) {
      filtered = filtered.filter(c => c.companyType === params.companyType);
    }
    
    // Apply verification status filter
    if (params.verificationStatus && params.verificationStatus !== 'all') {
      filtered = filtered.filter(c => c.verificationStatus === params.verificationStatus);
    }
    
    // Apply state filter
    if (params.state) {
      filtered = filtered.filter(c => c.billingAddress?.state === params.state);
    }
    
    // Apply ownership filter (for tier-based filtering)
    if (params.ownership && params.ownership.length > 0) {
      filtered = filtered.filter(c => 
        c.ownership && c.ownership.some(o => params.ownership.includes(o))
      );
    }
    
    // Apply sorting
    if (params.sortBy) {
      filtered = this.sortCompanies(filtered, params.sortBy, params.sortOrder);
    }
    
    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || filtered.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: filtered.slice(start, end),
      total: filtered.length,
      page,
      limit,
      hasMore: end < filtered.length
    };
  }
  
  async getById(id) {
    // Ensure data is loaded
    if (!this.isLoaded) {
      await this.loadICNData();
    }
    
    await this.delay(400);
    
    const company = this.companies.find(c => c.id === id);
    if (!company) {
      throw new Error('Company not found');
    }
    
    // Add extra details for detail view
    return {
      ...company,
      description: company.description || `${company.name} is a leading ${company.companyType} company specializing in ${company.keySectors.join(', ')}. With ${company.verificationStatus} status and comprehensive capabilities, we deliver excellence in our field.`,
      certifications: company.certifications || ['ISO 9001', 'ISO 14001'],
      yearEstablished: company.yearEstablished || 2000 + Math.floor(Math.random() * 20),
      employeeCount: this.getEmployeeCount(company.employees),
      revenue: Math.floor(Math.random() * 10000000) + 100000,
      localContentPercentage: Math.floor(Math.random() * 100),
      abn: this.generateMockABN(),
      pastProjects: [
        {
          id: '1',
          name: 'Melbourne Metro Tunnel',
          date: '2023',
          description: 'Supplied critical components for tunnel boring machines',
          value: 2500000,
          client: 'State Government Victoria',
          location: 'Melbourne, VIC',
        },
        {
          id: '2',
          name: 'Western Sydney Airport',
          date: '2022',
          description: 'Manufacturing and installation of structural steel',
          value: 5000000,
          client: 'Commonwealth Government',
          location: 'Sydney, NSW',
        }
      ],
      socialMedia: {
        linkedin: `https://linkedin.com/company/${company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        twitter: Math.random() > 0.5 ? `https://twitter.com/${company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}` : undefined
      }
    };
  }
  
  async search(query) {
    // Ensure data is loaded
    if (!this.isLoaded) {
      await this.loadICNData();
    }
    
    await this.delay(500);
    
    const searchLower = query.toLowerCase();
    const results = this.companies.filter(c =>
      c.name.toLowerCase().includes(searchLower) ||
      c.address.toLowerCase().includes(searchLower) ||
      c.keySectors.some(s => s.toLowerCase().includes(searchLower)) ||
      (c.capabilities && c.capabilities.some(cap => cap.toLowerCase().includes(searchLower)))
    );
    
    return {
      data: results.slice(0, 50),
      total: results.length
    };
  }
  
  async create(data) {
    await this.delay(800);
    
    const newCompany = {
      ...data,
      id: 'comp_' + Date.now(),
      verificationStatus: 'unverified',
      createdDate: new Date().toISOString(),
      dataSource: 'manual'
    };
    
    this.companies.unshift(newCompany);
    return newCompany;
  }
  
  async update(id, data) {
    await this.delay(600);
    
    const index = this.companies.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Company not found');
    }
    
    this.companies[index] = { ...this.companies[index], ...data };
    return this.companies[index];
  }
  
  async delete(id) {
    await this.delay(500);
    
    const index = this.companies.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Company not found');
    }
    
    this.companies.splice(index, 1);
    return { success: true };
  }
  
  // Utility Methods
  sortCompanies(companies, sortBy, sortOrder = 'asc') {
    const sorted = [...companies];
    
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'verified':
        sorted.sort((a, b) => {
          if (a.verificationStatus === 'verified' && b.verificationStatus !== 'verified') return -1;
          if (a.verificationStatus !== 'verified' && b.verificationStatus === 'verified') return 1;
          return 0;
        });
        break;
      case 'distance':
        sorted.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }
    
    if (sortOrder === 'desc') {
      sorted.reverse();
    }
    
    return sorted;
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Helper Methods
  isInvalidValue(value) {
    if (!value) return true;
    const cleanValue = value.toString().trim().toUpperCase();
    return cleanValue === '' || 
           cleanValue === '#N/A' || 
           cleanValue === 'N/A' || 
           cleanValue === '0' ||
           cleanValue === 'NULL' ||
           cleanValue === 'UNDEFINED';
  }
  
  cleanCompanyData(data, placeholder = 'Not Available') {
    if (this.isInvalidValue(data)) {
      return placeholder;
    }
    return data.trim();
  }
  
  normalizeStateTerritory(state) {
    if (!state || this.isInvalidValue(state)) {
      return 'NSW'; // Default to NSW
    }
    
    const cleaned = state.trim().toLowerCase();
    const mapped = STATE_TERRITORY_MAP[cleaned];
    if (mapped) return mapped;
    
    const upper = state.trim().toUpperCase();
    if (STANDARD_STATES_TERRITORIES.includes(upper)) return upper;
    
    // Check for partial matches
    for (const [key, value] of Object.entries(STATE_TERRITORY_MAP)) {
      if (cleaned.includes(key) || key.includes(cleaned)) {
        return value;
      }
    }
    
    return 'NSW'; // Default
  }
  
  normalizeCapabilityType(type) {
    if (!type || this.isInvalidValue(type)) {
      return CAPABILITY_TYPES.SERVICE_PROVIDER;
    }
    
    const cleanType = type.trim();
    
    // Check if it's already a valid type
    if (Object.values(CAPABILITY_TYPES).includes(cleanType)) {
      return cleanType;
    }
    
    // Map common variations
    const typeMap = {
      'supplier': CAPABILITY_TYPES.SUPPLIER,
      'item supplier': CAPABILITY_TYPES.ITEM_SUPPLIER,
      'parts supplier': CAPABILITY_TYPES.PARTS_SUPPLIER,
      'manufacturer': CAPABILITY_TYPES.MANUFACTURER,
      'manufacturer (parts)': CAPABILITY_TYPES.MANUFACTURER_PARTS,
      'service provider': CAPABILITY_TYPES.SERVICE_PROVIDER,
      'project management': CAPABILITY_TYPES.PROJECT_MANAGEMENT,
      'designer': CAPABILITY_TYPES.DESIGNER,
      'assembler': CAPABILITY_TYPES.ASSEMBLER,
      'retailer': CAPABILITY_TYPES.RETAILER,
      'wholesaler': CAPABILITY_TYPES.WHOLESALER
    };
    
    const normalized = cleanType.toLowerCase();
    return typeMap[normalized] || CAPABILITY_TYPES.SERVICE_PROVIDER;
  }
  
  determineCompanyType(capabilityTypes) {
    const hasSupplier = capabilityTypes.some(type => 
      CAPABILITY_TYPE_GROUPS.supplier.includes(type)
    );
    const hasManufacturer = capabilityTypes.some(type => 
      CAPABILITY_TYPE_GROUPS.manufacturer.includes(type)
    );
    const hasService = capabilityTypes.some(type => 
      CAPABILITY_TYPE_GROUPS.service.includes(type)
    );
    const hasRetail = capabilityTypes.some(type => 
      CAPABILITY_TYPE_GROUPS.retail.includes(type)
    );
    
    if (hasManufacturer && hasSupplier) {
      return 'both';
    } else if (hasManufacturer) {
      return 'manufacturer';
    } else if (hasSupplier) {
      return 'supplier';
    } else if (hasService) {
      return 'service';
    } else if (hasRetail) {
      return 'consultant';
    } else {
      return 'supplier';
    }
  }
  
  convertICNDateToISO(icnDate) {
    if (!icnDate || this.isInvalidValue(icnDate)) return undefined;
    
    const parts = icnDate.split('/');
    if (parts.length !== 3) return undefined;
    
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    
    return `${year}-${month}-${day}`;
  }
  
  getDefaultLatitude(state) {
    const stateCoordinates = {
      'VIC': -37.8136,
      'NSW': -33.8688,
      'QLD': -27.4698,
      'SA': -34.9285,
      'WA': -31.9505,
      'NT': -12.4634,
      'TAS': -42.8821,
      'ACT': -35.2809,
      'NI': -36.8485,
      'SI': -43.5321
    };
    return stateCoordinates[state] || -37.8136;
  }
  
  getDefaultLongitude(state) {
    const stateCoordinates = {
      'VIC': 144.9631,
      'NSW': 151.2093,
      'QLD': 153.0251,
      'SA': 138.6007,
      'WA': 115.8605,
      'NT': 130.8456,
      'TAS': 147.3272,
      'ACT': 149.1300,
      'NI': 174.7633,
      'SI': 172.6362
    };
    return stateCoordinates[state] || 144.9631;
  }
  
  // Mock data generators
  getRandomEmployeeRange() {
    const ranges = ['1-10', '10-50', '50-200', '200-500', '500+'];
    return ranges[Math.floor(Math.random() * ranges.length)];
  }
  
  getRandomOwnership() {
    const ownership = [
      'Female-owned', 
      'First Nations-owned', 
      'Social Enterprise', 
      'Australian Disability Enterprise', 
      'Australian-owned'
    ];
    
    if (Math.random() > 0.7) {
      const selected = [];
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) {
        const type = ownership[Math.floor(Math.random() * ownership.length)];
        if (!selected.includes(type)) {
          selected.push(type);
        }
      }
      return selected;
    }
    
    return [];
  }
  
  getRandomCertifications() {
    const certifications = [
      'ISO 9001', 'ISO 14001', 'ISO 45001', 
      'AS 9100', 'ISO 27001', 'ISO 22000'
    ];
    
    const count = Math.floor(Math.random() * 3) + 1;
    const selected = [];
    
    for (let i = 0; i < count; i++) {
      const cert = certifications[Math.floor(Math.random() * certifications.length)];
      if (!selected.includes(cert)) {
        selected.push(cert);
      }
    }
    
    return selected;
  }
  
  getCompanySize(employeeRange) {
    if (!employeeRange) return 'SME';
    
    if (employeeRange === '1-10' || employeeRange === '10-50') {
      return 'SME';
    } else if (employeeRange === '50-200') {
      return 'Medium';
    } else if (employeeRange === '200-500') {
      return 'Large';
    } else {
      return 'Enterprise';
    }
  }
  
  getEmployeeCount(employeeRange) {
    if (!employeeRange) return Math.floor(Math.random() * 50) + 10;
    
    switch(employeeRange) {
      case '1-10':
        return Math.floor(Math.random() * 9) + 1;
      case '10-50':
        return Math.floor(Math.random() * 40) + 10;
      case '50-200':
        return Math.floor(Math.random() * 150) + 50;
      case '200-500':
        return Math.floor(Math.random() * 300) + 200;
      case '500+':
        return Math.floor(Math.random() * 1000) + 500;
      default:
        return Math.floor(Math.random() * 100) + 10;
    }
  }
  
  generateMockABN() {
    // Generate a mock 11-digit ABN
    let abn = '';
    for (let i = 0; i < 11; i++) {
      abn += Math.floor(Math.random() * 10);
      if (i === 1 || i === 4 || i === 7) {
        abn += ' ';
      }
    }
    return abn;
  }
  
  // Statistics
  getStatistics() {
    const stats = {
      totalCompanies: this.companies.length,
      totalItems: this.icnItems.length,
      verified: 0,
      unverified: 0,
      suppliers: 0,
      manufacturers: 0,
      both: 0,
      services: 0,
      byState: {},
      bySector: {},
      topCities: []
    };
    
    const cityCount = {};
    
    this.companies.forEach(company => {
      // Verification status
      if (company.verificationStatus === 'verified') {
        stats.verified++;
      } else {
        stats.unverified++;
      }
      
      // Company types
      if (company.companyType === 'supplier') stats.suppliers++;
      else if (company.companyType === 'manufacturer') stats.manufacturers++;
      else if (company.companyType === 'both') stats.both++;
      else if (company.companyType === 'service') stats.services++;
      
      // By state
      const state = company.billingAddress?.state;
      if (state) {
        stats.byState[state] = (stats.byState[state] || 0) + 1;
      }
      
      // By city
      const city = company.billingAddress?.city;
      if (city && city !== 'City Not Available') {
        cityCount[city] = (cityCount[city] || 0) + 1;
      }
      
      // By sector
      company.keySectors.forEach(sector => {
        if (sector !== 'General') {
          stats.bySector[sector] = (stats.bySector[sector] || 0) + 1;
        }
      });
    });
    
    // Top cities
    stats.topCities = Object.entries(cityCount)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return stats;
  }
  
  logStatistics() {
    const stats = this.getStatistics();
    
    console.group('ICN Data Statistics (Mock Service)');
    console.table({
      'Total Companies': stats.totalCompanies,
      'Total Items': stats.totalItems,
      'Verified': stats.verified,
      'Unverified': stats.unverified,
      'Suppliers': stats.suppliers,
      'Manufacturers': stats.manufacturers,
      'Both': stats.both,
      'Services': stats.services
    });
    console.log('By State:', stats.byState);
    console.log('Top Cities:', stats.topCities.slice(0, 5));
    console.log('Sectors:', Object.keys(stats.bySector).length, 'unique sectors');
    console.groupEnd();
  }
}

// Create and export singleton instance
export const mockCompanyService = new MockCompanyService();