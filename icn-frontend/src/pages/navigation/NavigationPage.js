// NavigationPage.js - FIXED VERSION with working filters for capabilities, sectors, and types
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FilterPanel from '../../components/search/FilterPanel';
import { getCompanyService, getGeocodingService, getBookmarkService } from '../../services/serviceFactory';
import SearchMap from '../../components/map/SearchMap';
import { useTierAccess } from '../../hooks/useTierAccess';
import api from '../../services/api';
import './NavigationPage.css';

function NavigationPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const companyService = getCompanyService();
  const geocodingService = getGeocodingService();
  const { hasAccess } = useTierAccess();
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterPanelClosing, setFilterPanelClosing] = useState(false);
  const [filterPanelOpening, setFilterPanelOpening] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      navigate('/login', { 
        state: { 
          from: '/navigation',
          message: 'Please log in to search companies' 
        } 
      });
    }
  }, [navigate]);
  
  // Enhanced filter state with all tier features
  const [collapsedSections, setCollapsedSections] = useState({
    sectors: true,
    capabilities: true,
    size: true,
    ownership: true,
    certifications: true,
    financial: true
  });
  
  const [filters, setFilters] = useState({
    // Basic filters (all tiers)
    sectors: [],
    capabilities: [],
    distance: 50,
    verified: false,
    companyTypes: [],
    state: '',
    
    // Plus tier filters
    size: '',
    certifications: [],
    
    // Premium tier filters
    ownership: [],
    socialEnterprise: false,
    australianDisability: false,
    revenue: { min: 0, max: 10000000 },
    employeeCount: { min: 0, max: 1000 },
    localContentPercentage: 0
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarkedCompanies, setBookmarkedCompanies] = useState([]);
  const bookmarkService = getBookmarkService();
  const [mapCenter, setMapCenter] = useState({ lat: -37.8136, lng: 144.9631 });
  const [mapZoom, setMapZoom] = useState(10);
  const [companiesLoaded, setCompaniesLoaded] = useState(false);

  // Load companies and bookmarks first
  useEffect(() => {
    loadCompanies();
    loadBookmarks();
  }, []);

  // Add page focus listeners to automatically refresh bookmark list
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadBookmarks();
      }
    };

    const handleFocus = () => {
      loadBookmarks();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Read search query from URL parameters after component mounts
  useEffect(() => {
    if (companiesLoaded) {
      const query = searchParams.get('q');
      if (query) {
        setSearchTerm(decodeURIComponent(query));
      } else {
        setSearchTerm(''); // Clear when no query
      }
    }
  }, [companiesLoaded, searchParams]); // Watch searchParams
  
  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyService.getAll({ limit: 3000 });
      
      if (Array.isArray(data) && data.length > 0) {
        const mappedCompanies = data.map((company) => {
          const items = company.items || [];
          
          // Extract unique capabilities (itemName)
          const capabilities = [...new Set(items.map(item => item.itemName).filter(Boolean))];
          
          // Extract unique sectors (sectorName)
          const sectors = [...new Set(items.map(item => item.sectorName).filter(Boolean))];
          
          // Extract unique capability types
          const capabilityTypes = [...new Set(items.map(item => item.capabilityType).filter(Boolean))];
          
          const primaryType = capabilityTypes.length > 0 ? capabilityTypes[0] : 'Supplier';
          
          return {
            ...company,
            capabilities,
            sectors,
            companyTypes: capabilityTypes,
            type: primaryType,
            items,
            postcode: company.zip,
            address: [company.street, company.city, company.state, company.zip].filter(Boolean).join(', '),
            verified: company.verificationStatus === 'verified',
            distance: company.distance || (2 + Math.random() * 20),
            position: {
              lat: company.latitude || -37.8136,
              lng: company.longitude || 144.9631
            }
          };
        });
        
        // 🔍 DIAGNOSTIC: Log first 3 companies to see their capabilities
        console.log('🔍 DIAGNOSTIC - First 3 companies with capabilities:');
        mappedCompanies.slice(0, 3).forEach((company, index) => {
          console.log(`  Company ${index + 1}: ${company.name}`);
          console.log(`    Capabilities (${company.capabilities?.length || 0}):`, company.capabilities);
          console.log(`    Raw items (${company.items?.length || 0}):`, 
            company.items?.map(item => ({ itemName: item.itemName, capabilityType: item.capabilityType }))
          );
        });
        
        // 🔍 DIAGNOSTIC: Get all unique capabilities across all companies
        const allCapabilities = new Set();
        mappedCompanies.forEach(company => {
          if (company.capabilities) {
            company.capabilities.forEach(cap => allCapabilities.add(cap));
          }
        });
        console.log('🔍 DIAGNOSTIC - All unique capabilities across dataset:', Array.from(allCapabilities).sort());
        console.log(`🔍 DIAGNOSTIC - Total unique capabilities: ${allCapabilities.size}`);
        
        setCompanies(mappedCompanies);
        setFilteredCompanies(mappedCompanies);
        setCompaniesLoaded(true);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      setCompaniesLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Load bookmarks using the same method as ProfilePage
  const loadBookmarks = async () => {
    try {
      // Get latest user data directly from backend instead of relying on localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const hashedPassword = localStorage.getItem('user_password_hash');
      
      if (!user.email || !hashedPassword) {
        console.log('User not logged in or missing authentication info');
        setBookmarkedCompanies([]);
        return;
      }
      
      // Get latest user data directly from backend
      const loginResponse = await api.post(`/user?email=${encodeURIComponent(user.email)}&password=${encodeURIComponent(hashedPassword)}`);
      const latestUserData = loginResponse.data;
      
      if (latestUserData && latestUserData.organisationCards) {
        // Use latest user data to get bookmarks
        const organisationIds = latestUserData.organisationCards
          .map(card => card.id)
          .filter(id => id && id.trim() !== '');
        
        if (organisationIds.length > 0) {
          const queryParams = new URLSearchParams();
          organisationIds.forEach(id => {
            queryParams.append('ids', id);
          });
          
          const response = await api.get(`/organisation/generalByIds?${queryParams.toString()}`);
          const data = response.data || [];
          
          if (Array.isArray(data) && data.length > 0) {
            // Handle both id and companyId field names
            const bookmarkIds = data.map(b => b.id || b.companyId).filter(id => id);
            setBookmarkedCompanies(bookmarkIds);
            console.log('✅ Loaded bookmarks:', bookmarkIds);
          } else {
            setBookmarkedCompanies([]);
          }
        } else {
          setBookmarkedCompanies([]);
        }
      } else {
        setBookmarkedCompanies([]);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      setBookmarkedCompanies([]);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [filters, companies, searchTerm]);

  useEffect(() => {
    if (isPanelCollapsed) {
      closeFilterPanel();
    }
  }, [isPanelCollapsed]);

  const openFilterPanel = () => {
    setShowFilterPanel(true);
    setFilterPanelOpening(true);
    setTimeout(() => {
      setFilterPanelOpening(false);
    }, 300);
  };

  const closeFilterPanel = () => {
    setFilterPanelClosing(true);
    setTimeout(() => {
      setShowFilterPanel(false);
      setFilterPanelClosing(false);
    }, 300);
  };

  const applyFilters = () => {
    let filtered = [...companies];
    
    console.log('🔍 Applying filters:', {
      sectors: filters.sectors,
      capabilities: filters.capabilities,
      companyTypes: filters.companyTypes,
      totalCompanies: companies.length
    });
    
    // Search filter - search across multiple fields
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      
      filtered = filtered.filter(company => {
        try {
          // Name
          if (company.name && company.name.toLowerCase().includes(searchLower)) return true;
          
          // Address fields (API structure: street, city, state, zip)
          if (company.street && company.street.toLowerCase().includes(searchLower)) return true;
          if (company.city && company.city.toLowerCase().includes(searchLower)) return true;
          if (company.state && company.state.toLowerCase().includes(searchLower)) return true;
          if (company.zip && company.zip.toString().includes(searchLower)) return true;
          
          // Full address string
          if (company.address && company.address.toLowerCase().includes(searchLower)) return true;
          
          // Type
          if (company.type && company.type.toLowerCase().includes(searchLower)) return true;
          
          // Capabilities (from items array)
          if (company.capabilities && company.capabilities.some(cap => 
            cap && cap.toLowerCase().includes(searchLower)
          )) return true;
          
          // Sectors (from items array)
          if (company.sectors && company.sectors.some(sector => 
            sector && sector.toLowerCase().includes(searchLower)
          )) return true;
          
          // Search in items array directly
          if (company.items && company.items.some(item => 
            (item.itemName && item.itemName.toLowerCase().includes(searchLower)) ||
            (item.sectorName && item.sectorName.toLowerCase().includes(searchLower))
          )) return true;
          
          return false;
        } catch (error) {
          return false;
        }
      });
    }
    
    // FIXED: Sector filter - match any sector
    if (filters.sectors.length > 0) {
      filtered = filtered.filter(company => {
        if (!company.sectors || company.sectors.length === 0) return false;
        
        // Check if any of the company's sectors match any of the selected filters
        const hasMatch = company.sectors.some(companySector => 
          filters.sectors.some(filterSector => 
            companySector && filterSector && 
            companySector.toLowerCase().trim() === filterSector.toLowerCase().trim()
          )
        );
        
        if (hasMatch) {
          console.log('✅ Sector match:', company.name, 'has', company.sectors);
        }
        
        return hasMatch;
      });
      
      console.log(`📊 After sector filter: ${filtered.length} companies`);
    }
    
    // FIXED: Capability filter - match any capability
    if (filters.capabilities.length > 0) {
      console.log('🔍 CAPABILITY FILTER DIAGNOSTIC:');
      console.log('  Selected filter capabilities:', filters.capabilities);
      console.log('  Number of companies before filter:', filtered.length);
      
      // Sample some companies to see their capabilities
      const sampleCompanies = filtered.slice(0, 5);
      console.log('  Sample companies capabilities:');
      sampleCompanies.forEach(company => {
        console.log(`    - ${company.name}:`, company.capabilities);
      });
      
      filtered = filtered.filter(company => {
        if (!company.capabilities || company.capabilities.length === 0) {
          return false;
        }
        
        // Check if any of the company's capabilities match any of the selected filters
        const hasMatch = company.capabilities.some(companyCap => {
          const match = filters.capabilities.some(filterCap => {
            const companyCapLower = (companyCap || '').toLowerCase().trim();
            const filterCapLower = (filterCap || '').toLowerCase().trim();
            const isMatch = companyCapLower === filterCapLower;
            
            // Log every comparison for first few companies
            if (filtered.indexOf(company) < 3) {
              console.log(`      Comparing: "${companyCapLower}" === "${filterCapLower}" = ${isMatch}`);
            }
            
            return isMatch;
          });
          return match;
        });
        
        if (hasMatch) {
          console.log(`  ✅ MATCH: ${company.name} - capabilities:`, company.capabilities);
        }
        
        return hasMatch;
      });
      
      console.log(`  📊 After capability filter: ${filtered.length} companies`);
      
      // If no matches, let's see why
      if (filtered.length === 0) {
        console.log('  ⚠️ NO MATCHES FOUND!');
        console.log('  Let me check if any company has the selected capabilities...');
        
        companies.slice(0, 20).forEach(company => {
          if (company.capabilities && company.capabilities.length > 0) {
            const matches = company.capabilities.filter(cap => 
              filters.capabilities.some(filterCap => 
                cap.toLowerCase().trim() === filterCap.toLowerCase().trim()
              )
            );
            if (matches.length > 0) {
              console.log(`    Found in ${company.name}:`, matches);
            }
          }
        });
      }
    }
    
    filtered = filtered.filter(company => company.distance <= filters.distance);
    
    if (filters.verified) {
      filtered = filtered.filter(company => company.verified);
    }
    
    // FIXED: Company type filter - match any company type
    if (filters.companyTypes.length > 0) {
      filtered = filtered.filter(company => {
        // Check if company's primary type matches any selected type
        if (company.type && filters.companyTypes.some(filterType => 
          filterType.toLowerCase().trim() === company.type.toLowerCase().trim()
        )) {
          console.log('✅ Type match (primary):', company.name, 'is', company.type);
          return true;
        }
        
        // Also check if any of the company's capability types match
        if (company.companyTypes && company.companyTypes.length > 0) {
          const hasMatch = company.companyTypes.some(companyType => 
            filters.companyTypes.some(filterType => 
              companyType && filterType && 
              companyType.toLowerCase().trim() === filterType.toLowerCase().trim()
            )
          );
          
          if (hasMatch) {
            console.log('✅ Type match (capability):', company.name, 'has', company.companyTypes);
          }
          
          return hasMatch;
        }
        
        return false;
      });
      
      console.log(`📊 After type filter: ${filtered.length} companies`);
    }
    
    if (filters.state && filters.state !== 'All') {
      filtered = filtered.filter(company => 
        company.billingAddress?.state === filters.state || 
        company.state === filters.state
      );
    }
    
    // Plus tier filters - only apply if user has access
    if (hasAccess('ADVANCED_FILTERS')) {
      if (filters.size && filters.size !== 'All') {
        filtered = filtered.filter(company => company.size === filters.size);
      }
      
      if (filters.certifications.length > 0) {
        filtered = filtered.filter(company =>
          filters.certifications.some(cert => 
            (company.certifications || []).includes(cert)
          )
        );
      }
    }
    
    // Premium tier filters - only apply if user has access
    if (hasAccess('DEMOGRAPHIC_FILTERS')) {
      if (filters.ownership.length > 0) {
        filtered = filtered.filter(company =>
          filters.ownership.some(own => (company.ownership || []).includes(own))
        );
      }
      
      if (filters.socialEnterprise) {
        filtered = filtered.filter(company => company.socialEnterprise === true);
      }
      
      if (filters.australianDisability) {
        filtered = filtered.filter(company => 
          company.australianDisabilityEnterprise === true
        );
      }
    }
    
    if (hasAccess('COMPANY_REVENUE')) {
      // Revenue filter
      if (filters.revenue.min > 0 || filters.revenue.max < 10000000) {
        filtered = filtered.filter(company => 
          company.revenue !== undefined &&
          company.revenue >= filters.revenue.min &&
          company.revenue <= filters.revenue.max
        );
      }
      
      // Employee count filter
      if (filters.employeeCount.min > 0 || filters.employeeCount.max < 1000) {
        filtered = filtered.filter(company =>
          company.employeeCount !== undefined &&
          company.employeeCount >= filters.employeeCount.min &&
          company.employeeCount <= filters.employeeCount.max
        );
      }
      
      // Local content percentage filter
      if (filters.localContentPercentage > 0) {
        filtered = filtered.filter(company =>
          company.localContentPercentage !== undefined &&
          company.localContentPercentage >= filters.localContentPercentage
        );
      }
    }
    
    console.log(`✅ Final filtered companies: ${filtered.length}`);
    
    setFilteredCompanies(filtered);
    setPage(1);
  };

  const handleFilterChange = (newFilters) => {
    console.log('📝 Filter changed:', newFilters);
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      sectors: [],
      capabilities: [],
      distance: 50,
      verified: false,
      companyTypes: [],
      state: '',
      size: '',
      certifications: [],
      ownership: [],
      socialEnterprise: false,
      australianDisability: false,
      revenue: { min: 0, max: 10000000 },
      employeeCount: { min: 0, max: 1000 },
      localContentPercentage: 0
    });
    setSearchTerm('');
  };

  const toggleSection = (sectionName) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
  };

  // Pagination helpers
  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentCompanies = filteredCompanies.slice(startIndex, endIndex);

  const goToPage = (p) => {
    const next = Math.min(Math.max(1, p), totalPages);
    if (next !== page) setPage(next);
  };
  const goToPrevPage = () => goToPage(page - 1);
  const goToNextPage = () => goToPage(page + 1);

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (page <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    } else if (page >= totalPages - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = page - 1; i <= page + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  // FIXED: Toggle bookmark and reload the list
  const toggleBookmark = async (companyId, e) => {
    e.stopPropagation();
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      navigate('/login');
      return;
    }
    
    const isCurrentlyBookmarked = bookmarkedCompanies.includes(companyId);
    
    try {
      if (isCurrentlyBookmarked) {
        await bookmarkService.removeBookmark(companyId);
        console.log('✅ Bookmark removed');
      } else {
        await bookmarkService.addBookmark(companyId);
        console.log('✅ Bookmark added');
      }
      
      // FIXED: Reload bookmarks after operation succeeds (like ProfilePage does)
      await loadBookmarks();
      
    } catch (error) {
      console.error('❌ Bookmark error:', error);
      
      // Fallback to localStorage - update optimistically
      if (isCurrentlyBookmarked) {
        setBookmarkedCompanies(prev => prev.filter(id => id !== companyId));
      } else {
        setBookmarkedCompanies(prev => [...prev, companyId]);
      }
      
      if (error.message) {
        alert(error.message);
      }
    }
  };

  const getCompanyTypeColor = (type) => {
    const colors = {
      'Supplier': '#E3F2FD',
      'Manufacturer': '#FCE4EC',
      'Service Provider': '#FCCF8E',
      'Assembler': '#FEECD2',
    };
    return colors[type] || '#FEECD2';
  };

  const getLocationDisplay = (company) => {
    if (company.address) {
      const parts = company.address.split(',');
      if (parts.length >= 2) {
        return `${parts[parts.length - 2].trim()}, ${parts[parts.length - 1].trim().split(' ')[0]}`;
      }
      return company.address;
    }
    return 'Location not available';
  };

  const handleSidebarCardClick = (company) => {
    if (company.latitude && company.longitude) {
      setMapCenter({
        lat: parseFloat(company.latitude),
        lng: parseFloat(company.longitude)
      });
      setMapZoom(15);
      setSelectedCompany(company);
    }
  };

  const renderSidebarCompanyCard = (company) => {
    const isBookmarked = bookmarkedCompanies.includes(company.id);
    
    return (
      <div 
        key={company.id}
        className="company-card"
        onClick={() => handleSidebarCardClick(company)}
      >
        <button 
          className="bookmark-button"
          onClick={(e) => toggleBookmark(company.id, e)}
          title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>

        <div className="card-header-section">
          <div className="company-avatar-circle">
            <span className="avatar-letter">{(company.name || '?').charAt(0).toUpperCase()}</span>
          </div>
          <div className="company-info-section">
            <h3 className="company-name-text">{company.name}</h3>
            <p className="company-location">{getLocationDisplay(company)}</p>
          </div>
        </div>

        <div className="badges-section">
          {company.verified && (
            <div className="verified-badge-new">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>Verified</span>
            </div>
          )}
          {company.type && (
            <div 
              className="type-badge"
              style={{ backgroundColor: getCompanyTypeColor(company.type) }}
            >
              {company.type}
            </div>
          )}
          {(company.employees || company.employeeCount) && (
            <div className="employees-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>Employees: {company.employees || company.employeeCount}</span>
            </div>
          )}

          {company.distance && (
            <div className="distance-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{company.distance.toFixed(1)} km</span>
            </div>
          )}
        </div>

        {(() => {
          const caps = company.icnCapabilities || company.capabilities;
          if (!caps || caps.length === 0) return null;
          return (
            <div className="capabilities-section">
              {caps.slice(0, 2).map((cap, index) => (
                <div key={index} className="capability-chip">
                  <span>{typeof cap === 'object' ? cap.itemName : cap}</span>
                </div>
              ))}
              {caps.length > 2 && (
                <div className="more-chip">
                  <span>+{caps.length - 2} more</span>
                </div>
              )}
            </div>
          );
        })()}

        {(() => {
          const sects = company.keySectors || company.sectors;
          if (!sects || sects.length === 0) return null;
          return (
            <div className="sectors-section">
              {sects.slice(0, 2).map((sector, index) => (
                <div key={index} className="sector-chip-new">
                  <span>{sector}</span>
                </div>
              ))}
              {sects.length > 2 && (
                <div className="more-sectors-chip">
                  <span>+{sects.length - 2} more</span>
                </div>
              )}
            </div>
          );
        })()}

        {(company.website || company.size) && (
          <div className="additional-info">
            {company.size && (
              <div className="info-item">
                <span>Size: {company.size}</span>
              </div>
            )}
            {company.website && (
              <div className="info-item website-link">
                <a 
                  href={`https://${String(company.website).replace(/^https?:\/\//, '')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {String(company.website).replace(/^https?:\/\//, '').replace(/^www\./, '')}
                </a>
              </div>
            )}
          </div>
        )}

        <div className="card-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="navigation-page">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '80vh',
          gap: '20px'
        }}>
          <div className="spinner"></div>
          <h2>Loading Companies...</h2>
          <p style={{ color: '#666' }}>Geocoding addresses using cache</p>
        </div>
      </div>
    );
  }

  return (
    <div className="navigation-page">
      <section className="main-content fullscreen">
        <div className="map-container fullscreen">
          {showLeftPanel && (
            <aside className={`left-overlay ${isPanelCollapsed ? 'collapsed' : ''}`}>
              {!isPanelCollapsed && (
                <div className="overlay-inner">
                  <div className="overlay-header">
                    <div className="overlay-title">Companies ({filteredCompanies.length})</div>
                    <div className="overlay-actions">
                      <button className="filter-chip" onClick={() => {
                        if (showFilterPanel) {
                          closeFilterPanel();
                        } else {
                          openFilterPanel();
                        }
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                        </svg>
                      </button>
                      <button 
                        className="collapse-btn"
                        onClick={() => {
                          setIsPanelCollapsed(true);
                          setShowFilterPanel(false);
                        }}
                        aria-label="Collapse panel"
                        title="Collapse"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 18l-6-6 6-6"/>
                        </svg>
                      </button>
                    </div>
        </div>
                  
                  <div className="overlay-search">
                    <div className="sidebar-search">
                      <svg className="search-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18.5 18.5l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSearchTerm(value);
                          if (value.trim()) {
                            navigate(`/navigation?q=${encodeURIComponent(value)}`, { replace: true });
                          } else {
                            navigate('/navigation', { replace: true });
                          }
                        }}
                        className="sidebar-search-input"
                      />
                      {searchTerm && (
                        <button 
                          className="search-clear" 
                          onClick={() => {
                            setSearchTerm('');
                            navigate('/navigation', { replace: true });
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="overlay-pagination">
                    <div className="pagination-main">
              <button 
                        className="page-nav-btn page-prev"
                        onClick={goToPrevPage}
                        disabled={page === 1}
                        title="Previous page"
                      >
                        ‹
              </button>
                      <div className="page-numbers">
                        {getPageNumbers().map((num, idx) => (
                          num === '...'
                            ? <span key={`ellipsis-${idx}`} className="page-ellipsis">···</span>
                            : (
              <button 
                                  key={num}
                                  className={`page-num ${page === num ? 'active' : ''}`}
                                  onClick={() => goToPage(num)}
              >
                                  {num}
              </button>
                              )
                        ))}
            </div>
            <button 
                        className="page-nav-btn page-next"
                        onClick={goToNextPage}
                        disabled={page === totalPages}
                        title="Next page"
                      >
                        ›
            </button>
          </div>
        </div>
                  <div className="overlay-list">
                    {filteredCompanies.length > 0 ? (
                      currentCompanies.map(company => (
                        <div 
                          key={company.id}
                          className="overlay-list-item"
                          onClick={() => handleSidebarCardClick(company)}
                        >
                          {renderSidebarCompanyCard(company)}
                        </div>
                      ))
                    ) : (
                      <div className="no-results overlay-empty">
                        <p>No companies match your filters</p>
                        <p className="no-results-hint">Try adjusting your search or filters</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </aside>
          )}

          {showLeftPanel && isPanelCollapsed && (
            <button 
              className="collapsed-ball"
              onClick={() => setIsPanelCollapsed(false)}
              aria-label="Expand panel"
              title="Expand panel"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18"/>
              </svg>
            </button>
          )}

          {showFilterPanel && (
              <aside className={`filter-sidebar ${filterPanelClosing ? 'closing' : ''} ${filterPanelOpening ? 'opening' : ''}`}>
              <div className="filter-sidebar-header">
                <h3>Filters</h3>
                <button 
                  className="filter-sidebar-close"
                  onClick={closeFilterPanel}
                  aria-label="Close filters"
                >
                  ×
                </button>
              </div>
              <div className="filter-sidebar-content">
                <FilterPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                  collapsedSections={collapsedSections}
                  onToggleSection={toggleSection}
                  hideHeader={true}
                />
              </div>
              <div className="filter-sidebar-footer">
                <button 
                  className="apply-filters-btn"
                  onClick={() => {
                    applyFilters();
                    closeFilterPanel();
                  }}
                >
                  Apply Filters
                </button>
              </div>
              </aside>
            )}

          <main className="view-content fullscreen">
            <div className="map-stage">
                  {filteredCompanies.length > 0 ? (
                    <>
                      <SearchMap
                        companies={filteredCompanies}
                        selectedCompany={selectedCompany}
                        onCompanySelect={handleCompanySelect}
                        center={mapCenter}
                        zoom={mapZoom}
                        height={'calc(100vh - 0px)'}
                      />
                    </>
                  ) : (
                    <div className="no-results-map">
                      <p>No companies match your filters</p>
                      <p className="no-results-hint">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
            </main>
        </div>
      </section>
    </div>
  );
}

export default NavigationPage;