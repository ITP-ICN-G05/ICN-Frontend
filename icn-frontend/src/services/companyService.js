// src/services/companyService.js
import api from './api';

class CompanyService {
  // GET /organisation/general - searchOrganisation
  async searchCompanies(params = {}) {
    const queryParams = new URLSearchParams();
    
    // 地理参数变为可选
    if (params.startLatitude !== undefined) {
      queryParams.append('startLatitude', params.startLatitude);
    }
    if (params.startLongitude !== undefined) {
      queryParams.append('startLongitude', params.startLongitude);
    }
    if (params.endLatitude !== undefined) {
      queryParams.append('endLatitude', params.endLatitude);
    }
    if (params.endLongitude !== undefined) {
      queryParams.append('endLongitude', params.endLongitude);
    }
    
    // ALWAYS include skip and limit to avoid backend NullPointer
    queryParams.append('skip', params.skip ?? 0);
    queryParams.append('limit', params.limit ?? 999999);

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
  // 由于 /organisation/specific 端点有问题，使用 /organisation/general 来获取公司详情
  async getById(organisationId) {
    try {
      // 首先尝试使用 /organisation/specific 端点
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || 'guest';
      
      const response = await api.get(`/organisation/specific?organisationId=${organisationId}&user=${userId}`);
      return response.data;
    } catch (error) {
      console.warn('Specific endpoint failed, falling back to general search:', error.message);
      
      // 回退方案：使用 /organisation/general 端点搜索特定ID
      // 优化：先尝试小批量搜索，避免加载所有数据
      try {
        let searchResponse;
        let found = false;
        
        // 分批搜索，每次100个，最多搜索10次
        for (let skip = 0; skip < 1000 && !found; skip += 100) {
          searchResponse = await this.searchCompanies({
            skip: skip,
            limit: 100
          });
          
          // 检查是否找到匹配的公司
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
            searchResponse = [company]; // 只保留找到的公司
            break;
          }
          
          // 如果返回的数据少于100个，说明已经到末尾了
          if (searchResponse.length < 100) {
            break;
          }
        }
        
        // 如果找到了公司，处理数据
        if (found && searchResponse && searchResponse.length > 0) {
          const company = searchResponse[0]; // 我们已经确保只有一个公司
          // 获取正确的公司ID
          let correctId = company.id || company._id;
          // 如果公司ID为空，尝试从items中获取
          if (!correctId || correctId.trim() === '') {
            if (company.items && Array.isArray(company.items) && company.items.length > 0) {
              correctId = company.items[0].id; // 使用第一个item的ID
            }
          }
          
          // 从items中提取更多信息
          const items = company.items || [];
          
          // 去重：基于detailedItemName和itemName去重
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
            capabilityType: item.capabilityType || 'Service', // 默认值
            validationDate: item.validationDate,
            itemId: item.itemId,
            detailedItemId: item.detailedItemId,
            subtotal: item.subtotal
          }));
          
          const sectors = [...new Set(uniqueItemsArray.map(item => item.sectorName).filter(Boolean))];
          
          // 处理地址信息，将"#N/A"转换为null
          const cleanAddress = (value) => {
            if (!value || value === '#N/A' || value.trim() === '') {
              return null;
            }
            return value;
          };
          
          // 组合完整地址
          const street = cleanAddress(company.street);
          const city = cleanAddress(company.city);
          const state = cleanAddress(company.state);
          const zip = cleanAddress(company.zip);
          
          const addressParts = [street, city, state, zip].filter(Boolean);
          const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : null;
          
          // 转换为前端期望的格式，包含更多字段
          return {
            id: correctId || organisationId,
            name: company.name,
            address: fullAddress, // 添加完整地址字段
            street: street,
            city: city,
            state: state,
            zip: zip,
            longitude: company.longitude || 0,
            latitude: company.latitude || 0,
            items: items,
            
            // 从items中提取的额外信息
            capabilities: capabilities,
            icnCapabilities: capabilities,
            keySectors: sectors,
            sectors: sectors,
            
            // 只使用后端API返回的真实数据，不添加模拟数据
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
            
            // 只使用后端数据，不添加模拟项目
            pastProjects: [],
            
            // 基于实际能力生成产品和服务
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
            
            // 只使用后端数据
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
    const rawData = await this.searchCompanies({
      // 移除地理过滤参数，获取所有公司
      skip: params.skip || 0,    // Always provide skip
      limit: params.limit || 999999  // 移除限制，加载所有数据
    });
    
    // 对每个公司进行数据转换，并过滤掉无效的公司
    return rawData.map(company => this.transformCompanyData(company)).filter(company => company !== null);
  }
  
  // 数据转换方法
  transformCompanyData(company) {
    // 只使用 company.id 字段，不要从items中获取ID
    const correctId = company.id;
    
    // 如果ID为空，跳过这个公司
    if (!correctId || correctId.trim() === '') {
      console.warn('Skipping company with no valid ID:', company.name);
      return null;
    }
    
    // 处理地址信息
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
    
    // 处理items和capabilities
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