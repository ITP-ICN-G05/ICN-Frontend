// NavigationPage.js - Updated with all filter features and tier restrictions
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FilterPanel from '../../components/search/FilterPanel';
import { getCompanyService, getGeocodingService } from '../../services/serviceFactory';
import geocodingCacheService from '../../services/geocodingCacheService';
import SearchMap from '../../components/map/SearchMap';
import { useTierAccess } from '../../hooks/useTierAccess';
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
  const [mapCenter, setMapCenter] = useState({ lat: -37.8136, lng: 144.9631 });
  const [mapZoom, setMapZoom] = useState(10);

  // Load companies first
  useEffect(() => {
    loadCompanies();
  }, []);

  // Read search query from URL parameters after component mounts
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(decodeURIComponent(query));
      // Optionally remove the query parameter from URL after reading
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('q');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);
  
  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await companyService.getAll({ limit: 10000 });
      const data = response.data || response;
      
      if (Array.isArray(data) && data.length > 0) {
        const mappedCompanies = data.map((company) => ({
          ...company,
          sectors: company.keySectors || company.sectors || [],
          capabilities: company.capabilities || [],
          type: company.companyType || company.type || 'supplier',
          verified: company.verificationStatus === 'verified' || company.verified === true,
          size: company.companySize || company.employees || 'Unknown',
          employees: company.employees || 'Unknown',
          ownership: company.ownership || [],
          certifications: company.certifications || [],
          revenue: company.revenue,
          employeeCount: company.employeeCount,
          localContentPercentage: company.localContentPercentage,
          socialEnterprise: company.socialEnterprise,
          australianDisabilityEnterprise: company.australianDisabilityEnterprise,
          distance: company.distance || (2 + Math.random() * 20),
        }));
        
        const companiesWithPositions = await geocodingCacheService.batchGeocodeWithCache(
          mappedCompanies,
          geocodingService
        );
        
        setCompanies(companiesWithPositions);
        setFilteredCompanies(companiesWithPositions);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
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
    
    // Search filter - search across multiple fields
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const searchTrimmed = searchTerm.trim();
      
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchLower) ||
        (company.description && company.description.toLowerCase().includes(searchLower)) ||
        company.type.toLowerCase().includes(searchLower) ||
        (company.sectors && company.sectors.some(sector => 
          sector.toLowerCase().includes(searchLower)
        )) ||
        (company.capabilities && company.capabilities.some(cap => 
          cap.toLowerCase().includes(searchLower)
        )) ||
        (company.billingAddress && (
          (company.billingAddress.city && company.billingAddress.city.toLowerCase().includes(searchLower)) ||
          (company.billingAddress.state && company.billingAddress.state.toLowerCase().includes(searchLower)) ||
          (company.billingAddress.suburb && company.billingAddress.suburb.toLowerCase().includes(searchLower)) ||
          (company.billingAddress.postcode && company.billingAddress.postcode.toString().includes(searchTrimmed))
        )) ||
        // Also check for postcode in top-level fields (in case it's stored differently)
        (company.postcode && company.postcode.toString().includes(searchTrimmed))
      );
    }
    
    // Basic filters (all tiers)
    if (filters.sectors.length > 0) {
      filtered = filtered.filter(company =>
        company.sectors.some(sector => filters.sectors.includes(sector))
      );
    }
    
    if (filters.capabilities.length > 0) {
      filtered = filtered.filter(company =>
        company.capabilities.some(cap => filters.capabilities.includes(cap))
      );
    }
    
    filtered = filtered.filter(company => company.distance <= filters.distance);
    
    if (filters.verified) {
      filtered = filtered.filter(company => company.verified);
    }
    
    if (filters.companyTypes.length > 0) {
      filtered = filtered.filter(company =>
        filters.companyTypes.includes(company.type)
      );
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
    
    setFilteredCompanies(filtered);
    setPage(1);
  };

  const handleFilterChange = (newFilters) => {
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

  const toggleBookmark = (companyId, e) => {
    e.stopPropagation();
    setBookmarkedCompanies(prev => {
      if (prev.includes(companyId)) {
        return prev.filter(id => id !== companyId);
      } else {
        return [...prev, companyId];
      }
    });
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
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="sidebar-search-input"
                      />
                      {searchTerm && (
                        <button className="search-clear" onClick={() => setSearchTerm('')}>✕</button>
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