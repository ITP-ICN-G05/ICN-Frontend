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

class ICNDataService {
  constructor() {
    this.companies = [];
    this.icnItems = [];
    this.isLoaded = false;
    this.lastLoadTime = null;
  }
  
  // Load and process ICN data from JSON file
  async loadData() {
    if (this.isLoaded) {
      console.log('ICN data already loaded');
      return this.companies;
    }
    
    try {
      console.log('Loading ICN data from JSON file...');
      
      // ICNData is already imported from the JSON file
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
      
      this.isLoaded = true;
      this.lastLoadTime = new Date();
      
      console.log(`Processed ${this.companies.length} unique companies`);
      this.logStatistics();
      
      return this.companies;
      
    } catch (error) {
      console.error('Error loading ICN data:', error);
      throw error;
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
            // Default coordinates - will be geocoded if needed
            latitude: this.getDefaultLatitude(normalizedState),
            longitude: this.getDefaultLongitude(normalizedState),
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
            distance: Math.random() * 20
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
    
    return companies;
  }
  
  // Utility functions
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
  
  // Data access methods
  getCompanies() {
    return this.companies;
  }
  
  getCompanyById(id) {
    return this.companies.find(c => c.id === id);
  }
  
  searchCompanies(searchText) {
    const searchLower = searchText.toLowerCase().trim();
    
    if (!searchLower) return this.companies;
    
    return this.companies.filter(company => 
      company.name.toLowerCase().includes(searchLower) ||
      company.address.toLowerCase().includes(searchLower) ||
      company.keySectors.some(sector => sector.toLowerCase().includes(searchLower)) ||
      company.capabilities?.some(cap => cap.toLowerCase().includes(searchLower)) ||
      company.billingAddress?.city.toLowerCase().includes(searchLower) ||
      company.billingAddress?.state.toLowerCase().includes(searchLower) ||
      company.billingAddress?.postcode.includes(searchLower)
    );
  }
  
  filterByState(state) {
    return this.companies.filter(company => 
      company.billingAddress?.state === state
    );
  }
  
  filterByCompanyType(type) {
    return this.companies.filter(company => {
      const capabilityTypes = company.icnCapabilities?.map(cap => cap.capabilityType) || [];
      
      if (type === 'both') {
        const hasSupplier = capabilityTypes.some(capType => 
          CAPABILITY_TYPE_GROUPS.supplier.includes(capType)
        );
        const hasManufacturer = capabilityTypes.some(capType => 
          CAPABILITY_TYPE_GROUPS.manufacturer.includes(capType)
        );
        return hasSupplier && hasManufacturer;
      } else if (type === 'supplier') {
        return capabilityTypes.some(capType => 
          CAPABILITY_TYPE_GROUPS.supplier.includes(capType)
        );
      } else if (type === 'manufacturer') {
        return capabilityTypes.some(capType => 
          CAPABILITY_TYPE_GROUPS.manufacturer.includes(capType)
        );
      }
      
      return false;
    });
  }
  
  filterBySector(sector) {
    return this.companies.filter(company =>
      company.keySectors.includes(sector)
    );
  }
  
  getFilterOptions() {
    const sectors = new Set();
    const states = new Set();
    const cities = new Set();
    const capabilities = new Set();
    const capabilityTypes = new Set();
    
    this.companies.forEach(company => {
      company.keySectors.forEach(sector => {
        if (sector !== 'General') {
          sectors.add(sector);
        }
      });
      
      if (company.billingAddress?.state && STANDARD_STATES_TERRITORIES.includes(company.billingAddress.state)) {
        states.add(company.billingAddress.state);
      }
      
      if (company.billingAddress?.city && 
          company.billingAddress.city !== 'City Not Available' &&
          !this.isInvalidValue(company.billingAddress.city)) {
        cities.add(company.billingAddress.city);
      }
      
      company.capabilities?.forEach(cap => {
        if (cap !== 'Service' && !this.isInvalidValue(cap)) {
          capabilities.add(cap);
        }
      });
      
      company.icnCapabilities?.forEach(icnCap => {
        if (icnCap.capabilityType) {
          capabilityTypes.add(icnCap.capabilityType);
        }
      });
    });
    
    return {
      sectors: Array.from(sectors).sort(),
      states: Array.from(states).sort(),
      cities: Array.from(cities).sort(),
      capabilities: Array.from(capabilities).sort(),
      capabilityTypes: Array.from(capabilityTypes).sort()
    };
  }
  
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
      byCapabilityType: {},
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
      
      // By capability type
      company.icnCapabilities?.forEach(cap => {
        if (cap.capabilityType) {
          stats.byCapabilityType[cap.capabilityType] = 
            (stats.byCapabilityType[cap.capabilityType] || 0) + 1;
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
    
    console.group('ICN Data Statistics');
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
    console.log('Capability Types:', stats.byCapabilityType);
    console.groupEnd();
  }
  
  clearCache() {
    this.companies = [];
    this.icnItems = [];
    this.isLoaded = false;
    this.lastLoadTime = null;
  }
  
  isDataLoaded() {
    return this.isLoaded;
  }
  
  getLastLoadTime() {
    return this.lastLoadTime;
  }
}

// Create singleton instance
const icnDataService = new ICNDataService();
export default icnDataService;
