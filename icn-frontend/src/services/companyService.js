// src/services/companyService.js
import api from './api';

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
    const url = `http://localhost:8080/api/organisation/general?${queryParams.toString()}`;
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
  // Due to issues with /organisation/specific endpoint, use /organisation/general to get company details
  async getById(organisationId) {
    try {
      // First try using /organisation/specific endpoint
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || 'guest';
      
      const response = await api.get(`/organisation/specific?organisationId=${organisationId}&user=${userId}`);
      return response.data;
    } catch (error) {
      console.warn('Specific endpoint failed, falling back to general search:', error.message);
      
      // Fallback: Use /organisation/general endpoint to search for specific ID
      // Optimization: Try small batch search first to avoid loading all data
      try {
        let searchResponse;
        let found = false;
        
        // Batch search, 100 at a time, maximum 10 searches
        for (let skip = 0; skip < 1000 && !found; skip += 100) {
          searchResponse = await this.searchCompanies({
            skip: skip,
            limit: 100
          });
          
          // Check if matching company is found
          const company = searchResponse.find(org => {
            if (org.id === organisationId || org._id === organisationId || org.organisationId === organisationId) {
              return true;
            }
            if (org.items && Array.isArray(org.items)) {
              return org.items.some(item => 
                item.id === organisationId || 
                item._id === organisationId ||
                item.organisationId === organisationId
              );
            }
            return false;
          });
          
          if (company) {
            found = true;
            searchResponse = [company]; // Keep only the found company
            break;
          }
          
          // If returned data is less than 100, we've reached the end
          if (searchResponse.length < 100) {
            break;
          }
        }
        
        // If company is found, process data
        if (found && searchResponse && searchResponse.length > 0) {
          const company = searchResponse[0]; // We've ensured there's only one company
          // Get correct company ID
          let correctId = company.id || company._id;
          // If company ID is empty, try to get from items
          if (!correctId || correctId.trim() === '') {
            if (company.items && Array.isArray(company.items) && company.items.length > 0) {
              correctId = company.items[0].id; // Use first item's ID
            }
          }
          
          // Extract more information from items
          const items = company.items || [];
          
          // Deduplication: based on detailedItemName and itemName
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
            capabilityType: item.capabilityType || 'Service', // Default value
            validationDate: item.validationDate,
            itemId: item.itemId,
            detailedItemId: item.detailedItemId,
            subtotal: item.subtotal
          }));
          
          const sectors = [...new Set(uniqueItemsArray.map(item => item.sectorName).filter(Boolean))];
          
          // Process address information, convert "#N/A" to null
          const cleanAddress = (value) => {
            if (!value || value === '#N/A' || value.trim() === '') {
              return null;
            }
            return value;
          };
          
          // Combine full address
          const street = cleanAddress(company.street);
          const city = cleanAddress(company.city);
          const state = cleanAddress(company.state);
          const zip = cleanAddress(company.zip);
          
          const addressParts = [street, city, state, zip].filter(Boolean);
          const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : null;
          
          // Convert to frontend expected format with more fields
          return {
            id: correctId || organisationId,
            name: company.name,
            address: fullAddress, // Add complete address field
            street: street,
            city: city,
            state: state,
            zip: zip,
            longitude: company.longitude || 0,
            latitude: company.latitude || 0,
            items: items,
            
            // Additional information extracted from items
            capabilities: capabilities,
            icnCapabilities: capabilities,
            keySectors: sectors,
            sectors: sectors,
            
            // Only use real data from backend API, don't add mock data
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
            
            // Only use backend data, don't add mock projects
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
            
            // Only use backend data
            certifications: [],
            diversityMarkers: [],
            documents: [],
            socialLinks: {},
            localContentPercentage: null,
            lastUpdated: null
          };
        } else {
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
      // Remove geographic filtering parameters, get all companies
      skip: params.skip || 0,    // Always provide skip
      limit: params.limit || 999999  // Remove limit, load all data
    });
    
    console.log('📊 Raw data received:', typeof rawData, Array.isArray(rawData) ? rawData.length : 'not array');
    window.rawDataReceived = Array.isArray(rawData) ? rawData.length : 'not array';
    
    // Handle case where API returns a single object instead of array
    const dataArray = Array.isArray(rawData) ? rawData : [rawData];
    
    console.log('📊 Data array length:', dataArray.length);
    
    // Transform data for each company and filter out invalid companies
    const transformedData = dataArray.map(company => this.transformCompanyData(company)).filter(company => company !== null);
    
    console.log('📊 Transformed data length:', transformedData.length);
    window.transformedDataLength = transformedData.length;
    
    return transformedData;
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