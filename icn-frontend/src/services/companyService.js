// src/services/companyService.js
import api from './api';

// Configuration for mock data enrichment
const CONFIG = {
  USE_MOCK_ENRICHMENT: true,  // Toggle to add mock data for missing fields
};

// Mock data generator for missing fields only
class MockDataEnricher {
  static phoneNumbers = [
    '+61 3 9876 5432', '+61 3 8765 4321', '+61 3 7654 3210',
    '+61 2 9876 5432', '+61 2 8765 4321', '+61 7 3456 7890'
  ];
  
  static emailDomains = [
    'com.au', 'net.au', 'org.au', 'com', 'co'
  ];
  
  static ownershipTypes = [
    ['Australian-owned'],
    ['Female-owned'],
    ['First Nations-owned'],
    ['Social Enterprise'],
    ['Australian Disability Enterprise'],
    ['Female-owned', 'Australian-owned'],
    []
  ];
  
  static employeeRanges = ['1-10', '10-50', '50-200', '200-500', '500+'];
  
  static generatePhone() {
    return this.phoneNumbers[Math.floor(Math.random() * this.phoneNumbers.length)];
  }
  
  static generateEmail(companyName) {
    const cleanName = companyName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
    const domain = this.emailDomains[Math.floor(Math.random() * this.emailDomains.length)];
    return `info@${cleanName || 'company'}.${domain}`;
  }
  
  static generateWebsite(companyName) {
    const cleanName = companyName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
    const domain = this.emailDomains[Math.floor(Math.random() * this.emailDomains.length)];
    return `www.${cleanName || 'company'}.${domain}`;
  }
  
  static generateABN() {
    // Australian Business Number format: 11 digits
    const abn = Array.from({length: 11}, () => Math.floor(Math.random() * 10)).join('');
    return `${abn.substring(0, 2)} ${abn.substring(2, 5)} ${abn.substring(5, 8)} ${abn.substring(8)}`;
  }
  
  static generateRevenue() {
    const ranges = ['< $1M', '$1M - $5M', '$5M - $20M', '$20M - $50M', '$50M+'];
    return ranges[Math.floor(Math.random() * ranges.length)];
  }
  
  static generateYearEstablished() {
    const currentYear = new Date().getFullYear();
    return Math.floor(Math.random() * 50) + (currentYear - 50);
  }
  
  static generateEmployeeCount() {
    return this.employeeRanges[Math.floor(Math.random() * this.employeeRanges.length)];
  }
  
  static generateOwnership() {
    return this.ownershipTypes[Math.floor(Math.random() * this.ownershipTypes.length)];
  }
  
  static generateVerificationStatus() {
    const statuses = ['verified', 'unverified', 'pending'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    if (status === 'verified') {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 365));
      return {
        status,
        date: date.toISOString().split('T')[0]
      };
    }
    
    return { status, date: null };
  }
  
  static generateCertifications(sectors) {
    const certsByIndustry = {
      'Construction': ['ISO 9001', 'AS/NZS 4801', 'Green Building Council'],
      'Manufacturing': ['ISO 9001', 'ISO 14001', 'AS/NZS ISO 45001'],
      'Engineering': ['ISO 9001', 'Engineers Australia Chartered'],
      'Technology': ['ISO 27001', 'SOC 2', 'PCI DSS'],
      'Consulting': ['ISO 9001', 'CMC Certified'],
      'Logistics': ['ISO 9001', 'Chain of Responsibility'],
      'Services': ['ISO 9001', 'Customer Service Excellence'],
      'Infrastructure': ['ISO 9001', 'AS/NZS 4801'],
      'Environment': ['ISO 14001', 'Green Star'],
      'default': ['ISO 9001']
    };
    
    const certs = [];
    if (sectors && sectors.length > 0) {
      sectors.forEach(sector => {
        const sectorCerts = certsByIndustry[sector] || certsByIndustry.default;
        certs.push(...sectorCerts.slice(0, Math.floor(Math.random() * 2) + 1));
      });
    } else {
      certs.push('ISO 9001');
    }
    
    return [...new Set(certs)]; // Remove duplicates
  }
  
  static generatePastProjects(companyName, sectors) {
    const projectTemplates = {
      'Construction': [
        'Commercial Building Development',
        'Infrastructure Upgrade Project',
        'Residential Complex Construction'
      ],
      'Manufacturing': [
        'Production Line Optimization',
        'Custom Parts Manufacturing',
        'Supply Chain Integration'
      ],
      'Engineering': [
        'Systems Design and Implementation',
        'Technical Consultation Services',
        'Process Engineering Solutions'
      ],
      'Technology': [
        'Digital Transformation Initiative',
        'Software Development Project',
        'IT Infrastructure Upgrade'
      ],
      'Consulting': [
        'Strategic Advisory Services',
        'Business Process Improvement',
        'Organizational Change Management'
      ],
      'default': [
        'Service Delivery Project',
        'Consulting Engagement',
        'Partnership Initiative'
      ]
    };
    
    // Only generate projects for some companies (50% chance)
    if (Math.random() > 0.5) {
      return [];
    }
    
    const projects = [];
    const numProjects = Math.floor(Math.random() * 2) + 1; // 1-2 projects
    
    for (let i = 0; i < numProjects; i++) {
      const sector = sectors && sectors.length > 0 ? 
        sectors[Math.floor(Math.random() * sectors.length)] : 
        'default';
      const templates = projectTemplates[sector] || projectTemplates.default;
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      projects.push({
        name: template,
        client: `Client ${Math.floor(Math.random() * 100) + 1}`,
        year: new Date().getFullYear() - Math.floor(Math.random() * 5),
        value: `$${Math.floor(Math.random() * 900) + 100}K`
      });
    }
    
    return projects;
  }
  
  static enrichCompanyData(company) {
    // Only enrich if configuration allows
    if (!CONFIG.USE_MOCK_ENRICHMENT) {
      return company;
    }
    
    // Generate verification status only if missing
    let verificationStatus = company.verificationStatus;
    let verificationDate = company.verificationDate;
    
    if (!verificationStatus) {
      const verification = this.generateVerificationStatus();
      verificationStatus = verification.status;
      verificationDate = verification.date;
    }
    
    // Create enriched company object with mock data ONLY for null/undefined fields
    const enriched = {
      ...company,
      
      // Only add mock data for fields that are null, undefined, or empty
      verificationStatus: verificationStatus,
      verificationDate: verificationDate,
      
      // Company type - only if missing
      companyType: company.companyType || 
        ['supplier', 'manufacturer', 'service', 'consultant', 'both'][Math.floor(Math.random() * 5)],
      
      // Employee data - only if both are missing
      employees: company.employees || company.employeeCount || this.generateEmployeeCount(),
      employeeCount: company.employeeCount || company.employees || this.generateEmployeeCount(),
      
      // Business details - only if missing
      revenue: company.revenue || (Math.random() > 0.6 ? this.generateRevenue() : null),
      abn: company.abn || this.generateABN(), // ALWAYS generate ABN if missing
      yearEstablished: company.yearEstablished || (Math.random() > 0.5 ? this.generateYearEstablished() : null),
      
      // Contact info - DON'T generate phone/email, only website
      phone: null, // Always null - contact only through ICN
      phoneNumber: null, // Always null - contact only through ICN
      email: null, // Always null - contact only through ICN
      website: company.website || (Math.random() > 0.6 ? this.generateWebsite(company.name) : null),
      
      // Ownership - only if missing
      ownership: company.ownership || (Math.random() > 0.7 ? this.generateOwnership() : []),
      
      // Certifications - only if empty
      certifications: (company.certifications && company.certifications.length > 0) ? 
        company.certifications : 
        (Math.random() > 0.5 ? this.generateCertifications(company.sectors || company.keySectors || []) : []),
      
      // Past projects - only if empty
      pastProjects: (company.pastProjects && company.pastProjects.length > 0) ? 
        company.pastProjects : 
        this.generatePastProjects(company.name, company.sectors || company.keySectors || []),
      
      // Social links - only if empty
      socialLinks: (company.socialLinks && Object.keys(company.socialLinks).length > 0) ? 
        company.socialLinks : 
        (Math.random() > 0.8 ? {
          linkedin: `https://linkedin.com/company/${company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
        } : {}),
      
      // Local content - only if missing
      localContentPercentage: company.localContentPercentage || 
        (Math.random() > 0.7 ? Math.floor(Math.random() * 60) + 40 : null),
      
      // Last updated - only if missing
      lastUpdated: company.lastUpdated || new Date().toISOString()
    };
    
    return enriched;
  }
}

class CompanyService {
  // GET /organisation/general - searchOrganisation
  async searchCompanies(params = {}) {
    const queryParams = new URLSearchParams();
    
    // ALWAYS include all required parameters with default values
    queryParams.append('startLatitude', params.startLatitude ?? 0);
    queryParams.append('startLongitude', params.startLongitude ?? 0);
    queryParams.append('endLatitude', params.endLatitude ?? 0);
    queryParams.append('endLongitude', params.endLongitude ?? 0);
    queryParams.append('skip', params.skip ?? 0);
    queryParams.append('limit', params.limit ?? 999999);

    // Optional parameters
    if (params.searchString) {
      queryParams.append('searchString', params.searchString);
    }
    if (params.filterParameters) {
      queryParams.append('filterParameters', JSON.stringify(params.filterParameters));
    }
    
    // Use fetch API (works better with ngrok)
    const url = `https://1355xcz.top:8080/api/organisation/general?${queryParams.toString()}`;
    console.log('🔍 Fetching companies from:', url);
    
    const fetchResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json'
      }
    });
    
    console.log('🔍 Fetch Response Status:', fetchResponse.status);
    
    if (!fetchResponse.ok) {
      throw new Error(`Request failed with status ${fetchResponse.status}`);
    }
    
    const data = await fetchResponse.json();
    console.log('🔍 Fetch Response Data:', typeof data, Array.isArray(data) ? data.length : 'not array');
    
    // Store debug info in window for display
    window.apiResponseStatus = fetchResponse.status;
    window.apiResponseType = typeof data;
    window.apiResponseIsArray = Array.isArray(data);
    window.apiResponseLength = Array.isArray(data) ? data.length : 'not array';
    window.apiResponseSample = JSON.stringify(data).substring(0, 200) + '...';
    
    return data;
  }

  // GET /organisation/specific - searchOrganisationDetail
  async getById(organisationId) {
    try {
      // First try using /organisation/specific endpoint
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || user._id || user.userId || 'guest';

      console.log('🔍 Fetching company with:', { organisationId, userId });
      
      const response = await api.get(`/organisation/specific?organisationId=${organisationId}&user=${userId}`);
      return response.data;
    } catch (error) {
      console.warn('Specific endpoint failed, falling back to general search:', error.message);
      
      // Fallback: Use /organisation/general endpoint to search for specific ID
      try {
        let searchResponse;
        let found = false;
        
        // Batch search, 100 at a time, maximum 10 searches
        for (let skip = 0; skip < 1000 && !found; skip += 100) {
          searchResponse = await this.searchCompanies({
            skip: skip,
            limit: 100
          });
          
          // Handle both array and single object responses
          const dataArray = Array.isArray(searchResponse) ? searchResponse : [searchResponse];
          
          // Transform and check each company
          for (const rawCompany of dataArray) {
            const company = this.transformCompanyData(rawCompany);
            if (company && company.id === organisationId) {
              found = true;
              
              // Enrich and return
              const enriched = MockDataEnricher.enrichCompanyData(company);
              return enriched;
            }
          }
          
          // If returned data is less than 100, we've reached the end
          if (dataArray.length < 100) {
            break;
          }
        }
        
        if (!found) {
          throw new Error(`Company with ID ${organisationId} not found`);
        }
      } catch (fallbackError) {
        console.error('Both specific and general endpoints failed:', fallbackError);
        throw fallbackError;
      }
    }
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
    console.log('🔄 getAll called with params:', params);
    window.getAllCalled = true;
    
    const rawData = await this.searchCompanies({
      skip: params.skip || 0,
      limit: params.limit || 999999
    });
    
    console.log('📊 Raw data received:', typeof rawData, Array.isArray(rawData) ? rawData.length : 'not array');
    window.rawDataReceived = Array.isArray(rawData) ? rawData.length : 'not array';
    
    // Handle case where API returns a single object instead of array
    const dataArray = Array.isArray(rawData) ? rawData : [rawData];
    
    console.log('📊 Data array length:', dataArray.length);
    
    // Transform data for each company and filter out invalid companies
    const transformedData = dataArray
      .map(company => this.transformCompanyData(company))
      .filter(company => company !== null);
    
    // Enrich with mock data for missing fields
    const enrichedData = transformedData.map(company => MockDataEnricher.enrichCompanyData(company));
    
    console.log('📊 Transformed data length:', enrichedData.length);
    window.transformedDataLength = enrichedData.length;
    
    return enrichedData;
  }
  
  // Data transformation method
  transformCompanyData(company) {
    console.log('🔄 Transforming company:', company.name, 'ID:', company.id);
    
    // Handle the case where API returns items instead of companies
    // If company.id is empty but we have items, use the first item's id as company id
    let correctId = company.id;
    
    if (!correctId || correctId.trim() === '') {
      // Try to get ID from items array
      if (company.items && company.items.length > 0) {
        correctId = company.items[0].id;
        console.log('✅ Using item ID as company ID:', correctId);
      } else {
        console.log('❌ No items found for company:', company.name);
      }
    }
    
    // If still no ID, skip this company
    if (!correctId || correctId.trim() === '') {
      console.warn('❌ Skipping company with no valid ID:', company.name);
      return null;
    }
    
    console.log('✅ Company transformation successful:', company.name, 'Final ID:', correctId);
    
    // Process address information
    const cleanAddress = (value) => {
      if (!value || value === '#N/A' || value.trim() === '') {
        return null;
      }
      return value;
    };
    
    const street = cleanAddress(company.street);
    const city = cleanAddress(company.city);
    const state = cleanAddress(company.state);
    const zip = cleanAddress(company.zip);
    
    const addressParts = [street, city, state, zip].filter(Boolean);
    const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : null;
    
    // Process items and capabilities
    const items = company.items || [];
    const uniqueItems = items.reduce((acc, item) => {
      const key = `${item.detailedItemName || item.itemName}_${item.sectorName}`;
      if (!acc.has(key)) {
        acc.set(key, item);
      }
      return acc;
    }, new Map());
    
    const uniqueItemsArray = Array.from(uniqueItems.values());
    const capabilities = uniqueItemsArray.map(item => ({
      id: item.id,
      name: item.detailedItemName || item.itemName,
      itemName: item.itemName,
      detailedItemName: item.detailedItemName,
      sector: item.sectorName,
      capabilityType: item.capabilityType || 'Service',
      validationDate: item.validationDate,
      itemId: item.itemId,
      detailedItemId: item.detailedItemId,
      subtotal: item.subtotal
    }));
    
    const sectors = [...new Set(uniqueItemsArray.map(item => item.sectorName).filter(Boolean))];
    
    return {
      id: correctId,
      name: company.name,
      address: fullAddress,
      street: street,
      city: city,
      state: state,
      zip: zip,
      longitude: company.longitude || 0,
      latitude: company.latitude || 0,
      items: items,
      capabilities: capabilities,
      icnCapabilities: capabilities,
      keySectors: sectors,
      sectors: sectors,
      
      // These fields will be filled by MockDataEnricher if null and CONFIG.USE_MOCK_ENRICHMENT is true
      verificationStatus: null,
      companyType: null,
      employees: null,
      employeeCount: null,
      revenue: null,
      abn: null,
      phone: null,
      email: null,
      website: null,
      yearEstablished: null,
      pastProjects: [],
      
      // Generate products and services based on actual capabilities
      products: capabilities.filter(cap => 
        cap.name.toLowerCase().includes('manufacturing') || 
        cap.name.toLowerCase().includes('production') ||
        cap.name.toLowerCase().includes('equipment') ||
        cap.name.toLowerCase().includes('materials')
      ).map(cap => cap.name),
      
      services: capabilities.filter(cap => 
        cap.name.toLowerCase().includes('service') || 
        cap.name.toLowerCase().includes('consulting') ||
        cap.name.toLowerCase().includes('support') ||
        cap.name.toLowerCase().includes('maintenance') ||
        cap.name.toLowerCase().includes('installation')
      ).map(cap => cap.name),
      
      certifications: [],
      diversityMarkers: [],
      documents: [],
      socialLinks: {},
      localContentPercentage: null,
      lastUpdated: null
    };
  }

  // Search with default Melbourne area
  async search(query) {
    const rawData = await this.searchCompanies({
      searchString: query,
      startLatitude: -38.5,
      startLongitude: 144.5,
      endLatitude: -37.5,
      endLongitude: 145.5,
      limit: 100
    });
    
    // Transform and enrich search results
    const dataArray = Array.isArray(rawData) ? rawData : [rawData];
    const enrichedData = dataArray
      .map(company => this.transformCompanyData(company))
      .filter(company => company !== null)
      .map(company => MockDataEnricher.enrichCompanyData(company));
    
    return enrichedData;
  }
}

export const companyService = new CompanyService();