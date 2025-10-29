import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCompanyService, getExportService, getBookmarkService } from '../../services/serviceFactory';
import './CompaniesPage.css';

function CompaniesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyService = getCompanyService(); 
  const exportService = getExportService();
  const bookmarkService = getBookmarkService(); 
  
  console.log('🏢 CompaniesPage initialized');
  console.log('📊 Company service type:', typeof companyService);
  console.log('📊 Company service has getAll:', typeof companyService.getAll); 
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedCapability, setSelectedCapability] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [bookmarkedCompanies, setBookmarkedCompanies] = useState([]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    
    // Read sector parameter from URL (from HomePage)
    const sectorParam = searchParams.get('sector');
    console.log('📍 URL sector parameter:', sectorParam);
    
    if (sectorParam) {
      setSelectedSector(sectorParam);  // Use existing selectedSector state
    } else {
      setSelectedSector('all');
    }
    
    loadBookmarks();
  }, [searchParams]);

  useEffect(() => {
    if (user !== null) {
      console.log('🔄 Loading companies for sector:', selectedSector);
      loadCompanies();
    }
  }, [selectedSector, user]);

  useEffect(() => {
    console.log('📅 useEffect triggered - companies length:', companies.length);
    if (companies.length > 0) {
      console.log('🔄 Companies available, calling filterCompanies...');
      filterCompanies();
      setCurrentPage(1);
    } else {
      console.log('⏸️ No companies available, skipping filter');
    }
  }, [searchTerm, selectedSector, selectedCapability, companies]);

  const loadCompanies = async () => {
    setLoading(true);
    
    try {
      console.log('🔄 Loading companies...');
      console.log('📊 Selected sector:', selectedSector);
      
      // Build API parameters
      const params = {
        limit: 999999
      };
      
      // If sector filter is active, send to API
      if (selectedSector !== 'all') {
        params.filterParameters = {
          sectorName: selectedSector  // ← KEY: Filter by sectorName field
        };
        console.log('📤 Sending filterParameters to API:', params.filterParameters);
      }
      
      const loadedCompanies = await companyService.getAll(params);
      
      console.log('📊 Loaded companies:', loadedCompanies.length);
      setCompanies(loadedCompanies);
    } catch (error) {
      console.error('❌ Error loading companies:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    console.log('🔍 Filtering companies...');
    console.log('📊 Companies count:', companies.length);
    console.log('📊 Search term:', searchTerm);
    console.log('📊 Selected sector:', selectedSector);
    console.log('📊 Selected capability:', selectedCapability);
    
    let filtered = [...companies];
  
    // If no filters active, show all companies
    if (!searchTerm && selectedSector === 'all' && selectedCapability === 'all') {
      console.log('📊 No active filters, showing all companies');
      setFilteredCompanies(filtered);
      return;
    }
  
    // SEARCH FILTER - Fixed to work with actual API structure
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(company => {
        // Search in company name
        if (company.name && company.name.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Search in city
        if (company.city && company.city.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Search in state
        if (company.state && company.state.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Search in street address
        if (company.street && company.street.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Search in items (capabilities and sectors)
        if (company.items && Array.isArray(company.items)) {
          return company.items.some(item => {
            // Search in item name
            if (item.itemName && item.itemName.toLowerCase().includes(searchLower)) {
              return true;
            }
            // Search in detailed item name
            if (item.detailedItemName && item.detailedItemName.toLowerCase().includes(searchLower)) {
              return true;
            }
            // Search in capability type
            if (item.capabilityType && item.capabilityType.toLowerCase().includes(searchLower)) {
              return true;
            }
            // Search in sector name
            if (item.sectorName && item.sectorName.toLowerCase().includes(searchLower)) {
              return true;
            }
            return false;
          });
        }
        
        return false;
      });
    }
  
    // SECTOR FILTER - Keep existing (working with items array)
    if (selectedSector !== 'all') {
      filtered = filtered.filter(company => {
        if (company.items && Array.isArray(company.items)) {
          return company.items.some(item => 
            item.sectorName && item.sectorName === selectedSector
          );
        }
        return false;
      });
    }
  
    // CAPABILITY FILTER - Fixed to work with items array
    if (selectedCapability !== 'all') {
      filtered = filtered.filter(company => {
        if (company.items && Array.isArray(company.items)) {
          return company.items.some(item => 
            item.capabilityType && item.capabilityType === selectedCapability
          );
        }
        return false;
      });
    }
  
    console.log('📊 Filtered companies count:', filtered.length);
    setFilteredCompanies(filtered);
  };

  const handleExport = (format) => {
    // Check user tier for export limitations
    const userTier = user?.tier || 'free';
    
    if (userTier === 'free') {
      // Basic export - name and contact only
      const exportData = filteredCompanies.map(c => ({
        name: c.name,
        type: c.type,
        address: c.address,
        website: c.website
      }));
      console.log('Exporting basic data:', exportData);
      alert('Basic export (Free tier): Company names and contacts only');
    } else if (userTier === 'plus') {
      // Limited export
      const exportData = filteredCompanies.map(c => ({
        name: c.name,
        type: c.type,
        sectors: c.sectors,
        capabilities: c.capabilities,
        address: c.address,
        website: c.website,
        size: c.size,
        verified: c.verified
      }));
      console.log('Exporting plus data:', exportData);
      alert('Plus export: Limited company information');
    } else {
      // Full export for premium
      console.log('Exporting full data:', filteredCompanies);
      alert('Premium export: Full company information with all fields');
    }
  };

  const getAvailableInfo = (company) => {
    const userTier = user?.tier || 'free';
    
    // Define what each tier can see
    const tierAccess = {
      free: ['name', 'type', 'address', 'website', 'sectors'],
      plus: ['name', 'type', 'address', 'website', 'sectors', 'capabilities', 'size', 'verified', 'abn'],
      premium: ['all']
    };

    return tierAccess[userTier];
  };

  const canViewDetail = (field) => {
    const userTier = user?.tier || 'free';
    const access = getAvailableInfo({});
    
    if (userTier === 'premium' || access.includes('all')) return true;
    return access.includes(field);
  };

  const toggleBookmark = async (companyId, e) => {
    e.stopPropagation(); // Prevent card click
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }
  
    try {
      const isCurrentlyBookmarked = bookmarkedCompanies.includes(companyId);
      
      if (isCurrentlyBookmarked) {
        // Remove bookmark
        await bookmarkService.removeBookmark(companyId);
        setBookmarkedCompanies(prev => prev.filter(id => id !== companyId));
      } else {
        // Add bookmark
        await bookmarkService.addBookmark(companyId);
        setBookmarkedCompanies(prev => [...prev, companyId]);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      
      // Fallback to localStorage method
      const bookmarks = JSON.parse(localStorage.getItem('bookmarkedCompanies') || '[]');
      let newBookmarks;
      
      if (bookmarkedCompanies.includes(companyId)) {
        newBookmarks = bookmarks.filter(id => id !== companyId);
        setBookmarkedCompanies(prev => prev.filter(id => id !== companyId));
      } else {
        newBookmarks = [...bookmarks, companyId];
        setBookmarkedCompanies(prev => [...prev, companyId]);
      }
      
      localStorage.setItem('bookmarkedCompanies', JSON.stringify(newBookmarks));
      
      if (error.message) {
        alert(error.message);
      }
    }
  };

  const loadBookmarks = async () => {
    try {
      const response = await bookmarkService.getUserBookmarks();
      const data = response.data || response;
      if (Array.isArray(data)) {
        const bookmarkIds = data.map(b => b.id || b.companyId);
        setBookmarkedCompanies(bookmarkIds);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      // Fallback to localStorage
      const bookmarks = JSON.parse(localStorage.getItem('bookmarkedCompanies') || '[]');
      setBookmarkedCompanies(bookmarks);
    }
  };

  const formatVerificationDate = (date) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-AU', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return date;
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

  const renderCompanyCard = (company) => {
    const userTier = user?.tier || 'free';
    const isBookmarked = bookmarkedCompanies.includes(company.id);
    
    return (
      <div 
        key={company.id} 
        className="company-card"
        onClick={() => navigate(`/company/${company.id}`)}
      >
        {/* Bookmark button */}
        <button 
          className="bookmark-button"
          onClick={(e) => toggleBookmark(company.id, e)}
          title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>

        {/* Header: avatar + name + address */}
        <div className="card-header-section">
          <div className="company-avatar-circle">
            <span className="avatar-letter">{company.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="company-info-section">
            <h3 className="company-name-text">{company.name}</h3>
            <p className="company-location">{getLocationDisplay(company)}</p>
          </div>
        </div>

        {/* Badges section: verified + type + employees */}
        <div className="badges-section">
          {/* Verified badge - visible to all users - supports multiple field names */}
          {(company.verified || company.verificationStatus === 'verified' || company.isVerified) && (
            <div className="verified-badge-new">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>
                Verified {company.verificationDate ? `on ${formatVerificationDate(company.verificationDate)}` : ''}
              </span>
            </div>
          )}
          
          {/* Company type badge */}
          {company.type && (
            <div 
              className="type-badge"
              style={{ backgroundColor: getCompanyTypeColor(company.type) }}
            >
              {company.type}
            </div>
          )}

          {/* Employee count badge - prominent position - supports multiple field names */}
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
        </div>
        
        {/* Capabilities tags - visible to all users - supports multiple field names */}
        {(() => {
          // Supports icnCapabilities or capabilities
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

        {/* Sectors tags - visible to all users - supports multiple field names */}
        {(() => {
          // Supports keySectors or sectors
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

        {/* Additional information section */}
        {(company.abn || company.website || company.size) && (
          <div className="additional-info">
            {company.abn && (
              <div className="info-item">
                <span>ABN: {company.abn}</span>
              </div>
            )}
            {company.size && (
              <div className="info-item">
                <span>Size: {company.size}</span>
              </div>
            )}
            {company.website && (
              <div className="info-item website-link">
                <a 
                  href={`https://${company.website.replace(/^https?:\/\//, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {company.website.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                </a>
              </div>
            )}
          </div>
        )}
        
        {/* Premium information */}
        {userTier === 'premium' && (
          <>
            {(company.ownership || []).length > 0 && (
          <div className="ownership-badges">
                {company.ownership.map((own, index) => (
                  <span key={index} className="ownership-badge">{own}</span>
            ))}
          </div>
        )}
        
            {company.localContent && (
          <div className="premium-info">
                <p>🇦🇺 Local Content: {company.localContent}%</p>
          </div>
            )}
          </>
        )}

        {/* Right arrow indicator */}
        <div className="card-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>
    );
  };

  // Supports multiple verification field names
  const verifiedCount = companies.filter(c => 
    c.verified || c.verificationStatus === 'verified' || c.isVerified
  ).length;

  // Pagination logic
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCompanies = filteredCompanies.slice(startIndex, endIndex);

  // Pagination handler functions
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  // Page number input jump
  const handlePageInputChange = (e) => {
    const value = e.target.value;
    if (value === '') return;
    
    const pageNum = parseInt(value, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      goToPage(pageNum);
    }
  };

  const handlePageInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handlePageInputChange(e);
    }
  };

  // Generate page number array
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="companies-page">
      <div className="page-container">
        {/* Left Sidebar - Filters and Controls */}
        <aside className="sidebar">
          <div className="sidebar-content">
            {/* Statistics */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">Database Overview</h3>
              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-number">{companies.length}</div>
                  <div className="stat-label">Companies</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number">{verifiedCount}</div>
                  <div className="stat-label">Verified</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number">{filteredCompanies.length}</div>
                  <div className="stat-label">Results</div>
                </div>
        </div>
      </div>

            {/* Search */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">Search</h3>
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
          
            {/* Filters */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">Filters</h3>
              
              <div className="filter-group-sidebar">
                <label className="filter-label">Sector</label>
                <select 
                  value={selectedSector} 
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="sidebar-select"
                >
                  <option value="all">All Sectors</option>
                  <option value="Power Transmission">Power Transmission</option>
                  <option value="Fixtures, Fitting & Equipment">Fixtures, Fitting & Equipment</option>
                  <option value="Renewables/ Wind">Renewables/ Wind</option>
                  <option value="Emerging Storage & Generation">Emerging Storage & Generation</option>
                  <option value="Renewables/ Solar">Renewables/ Solar</option>
                  <option value="Renewables/ Battery">Renewables/ Battery</option>
                  <option value="Additive Manufacturing">Additive Manufacturing</option>
                  <option value="Critical Minerals">Critical Minerals</option>
                  <option value="Textiles, Clothing & Footwear">Textiles, Clothing & Footwear</option>
                  <option value="Prefabricated Construction">Prefabricated Construction</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Hydrogen Generation & Storage">Hydrogen Generation & Storage</option>
                  <option value="Building Information Modelling">Building Information Modelling</option>
                  <option value="Electric Vehicle Charging Stations">Electric Vehicle Charging Stations</option>
                  <option value="Rolling Stock">Rolling Stock</option>
                </select>
              </div>
            
              <div className="filter-group-sidebar">
                <label className="filter-label">CompanyTypes</label>
                <select 
                  value={selectedCapability} 
                  onChange={(e) => setSelectedCapability(e.target.value)}
                  className="sidebar-select"
                >
                  <option value="all">All CompanyTypes</option>
                  <option value="Service Provider">Service Provider</option>
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="Item Supplier">Item Supplier</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Designer">Designer</option>
                  <option value="Parts Supplier">Parts Supplier</option>
                  <option value="Assembler">Assembler</option>
                  <option value="Retailer">Retailer</option>
                  <option value="Wholesaler">Wholesaler</option>
                  <option value="Project Management">Project Management</option>
                </select>
              </div>

              {/* Active filters */}
              {(selectedSector !== 'all' || selectedCapability !== 'all' || searchTerm) && (
                <div className="active-filters-sidebar">
                  {searchTerm && (
                    <span className="filter-tag">
                      Search: "{searchTerm}"
                      <button onClick={() => setSearchTerm('')}>✕</button>
                    </span>
                  )}
                  {selectedSector !== 'all' && (
                    <span className="filter-tag">
                      {selectedSector}
                      <button onClick={() => setSelectedSector('all')}>✕</button>
                    </span>
                  )}
                  {selectedCapability !== 'all' && (
                    <span className="filter-tag">
                      {selectedCapability}
                      <button onClick={() => setSelectedCapability('all')}>✕</button>
                    </span>
                  )}
                  <button 
                    className="clear-all-btn"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSector('all');
                      setSelectedCapability('all');
                    }}
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* View Options */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">Display</h3>
              
              <div className="view-options">
              <button 
                  className={`view-option ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor">
                    <rect x="1" y="1" width="6" height="6" rx="1"/>
                    <rect x="11" y="1" width="6" height="6" rx="1"/>
                    <rect x="1" y="11" width="6" height="6" rx="1"/>
                    <rect x="11" y="11" width="6" height="6" rx="1"/>
                  </svg>
                  <span>Grid</span>
              </button>
              <button 
                  className={`view-option ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor">
                    <rect x="1" y="2" width="16" height="2" rx="1"/>
                    <rect x="1" y="8" width="16" height="2" rx="1"/>
                    <rect x="1" y="14" width="16" height="2" rx="1"/>
                  </svg>
                  <span>List</span>
              </button>
              </div>
            </div>
            
            {/* Export Options */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">Export</h3>
              <div className="export-buttons">
                <button className="export-btn-sidebar" onClick={() => handleExport('csv')}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 12l-4-4h2.5V2h3v6H12l-4 4zm-7 2h14v2H1v-2z"/>
                  </svg>
                Export CSV
              </button>
                <button className="export-btn-sidebar" onClick={() => handleExport('pdf')}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 12l-4-4h2.5V2h3v6H12l-4 4zm-7 2h14v2H1v-2z"/>
                  </svg>
                Export PDF
              </button>
            </div>
          </div>
        </div>
        </aside>

        {/* Right Content Area - Companies Grid */}
        <main className="main-content">
          {/* Pagination - top */}
          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <div className="pagination-main">
                <button 
                  className="page-nav-btn page-prev"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  title="Previous page"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                
                <div className="page-numbers">
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="page-ellipsis">···</span>
                    ) : (
                      <button
                        key={page}
                        className={`page-num ${currentPage === page ? 'active' : ''}`}
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </button>
                    )
                  ))}
      </div>

                <button 
                  className="page-nav-btn page-next"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  title="Next page"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>

              <div className="page-jump">
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  placeholder={currentPage}
                  className="page-jump-input"
                  onKeyPress={handlePageInputKeyPress}
                  onBlur={handlePageInputChange}
                />
                <span className="page-jump-sep">/</span>
                <span className="page-jump-total">{totalPages}</span>
              </div>
            </div>
          )}

          {/* Companies Content */}
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading companies...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
                <rect x="12" y="16" width="40" height="40" rx="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M20 8v8M44 8v8M12 28h40" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <h3>No Companies Found</h3>
              <p>
                {searchTerm ? 
                  `No results for "${searchTerm}"` : 
                  'Try adjusting your filters'}
              </p>
              <div style={{marginTop: '20px', fontSize: '12px', color: '#666', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px'}}>
                <strong>Debug Info:</strong><br/>
                companies.length: {companies.length}<br/>
                filteredCompanies.length: {filteredCompanies.length}<br/>
                loading: {loading.toString()}<br/>
                searchTerm: "{searchTerm}"<br/>
                selectedSector: "{selectedSector}"<br/>
                selectedCapability: "{selectedCapability}"<br/>
                errorExecuted: {window.errorExecuted ? 'true' : 'false'}<br/>
                lastError: {window.lastError || 'none'}<br/>
                errorCode: {window.errorCode || 'none'}<br/>
                <strong>Function Call Status:</strong><br/>
                loadCompaniesCalled: {window.loadCompaniesCalled ? 'true' : 'false'}<br/>
                getAllCalled: {window.getAllCalled ? 'true' : 'false'}<br/>
                rawDataReceived: {window.rawDataReceived || 'none'}<br/>
                transformedDataLength: {window.transformedDataLength || 'none'}<br/>
                <strong>API Response Info:</strong><br/>
                Status: {window.apiResponseStatus || 'none'}<br/>
                Type: {window.apiResponseType || 'none'}<br/>
                Is Array: {window.apiResponseIsArray ? 'true' : 'false'}<br/>
                Length: {window.apiResponseLength || 'none'}<br/>
                Sample: {window.apiResponseSample || 'none'}<br/>
                <strong>Request Details:</strong><br/>
                {window.errorConfig ? (
                  <>
                    URL: {window.errorConfig.url}<br/>
                    Method: {window.errorConfig.method}<br/>
                    BaseURL: {window.errorConfig.baseURL}<br/>
                    Timeout: {window.errorConfig.timeout}ms<br/>
                  </>
                ) : 'No config info'}<br/>
                Current time: {new Date().toLocaleTimeString()}
              </div>
            </div>
          ) : (
            <>
                {user && (
                <div className="tier-info-banner">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0l2.5 5 5.5.8-4 3.9.9 5.3L8 12.5 3.1 15l.9-5.3-4-3.9 5.5-.8L8 0z"/>
                  </svg>
                  <span>
                    {user.tier?.toUpperCase() || 'FREE'} TIER - Viewing {
                      user?.tier === 'premium' ? 'full' : 
                      user?.tier === 'plus' ? 'standard' : 'basic'
                    } company information
                  </span>
                </div>
                )}
              
              <div className={`companies-grid-modern ${viewMode}`}>
                {currentCompanies.map(renderCompanyCard)}
              </div>

              {/* Pagination - bottom */}
              {totalPages > 1 && (
                <div className="pagination-wrapper pagination-bottom">
                  <div className="pagination-main">
                    <button 
                      className="page-nav-btn page-prev"
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      title="Previous page"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"/>
                      </svg>
                    </button>
                    
                    <div className="page-numbers">
                      {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                          <span key={`ellipsis-${index}`} className="page-ellipsis">···</span>
                        ) : (
                          <button
                            key={page}
                            className={`page-num ${currentPage === page ? 'active' : ''}`}
                            onClick={() => goToPage(page)}
                          >
                            {page}
                          </button>
                        )
                      ))}
                    </div>
                    
                    <button 
                      className="page-nav-btn page-next"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      title="Next page"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  </div>

                  <div className="page-jump">
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      placeholder={currentPage}
                      className="page-jump-input"
                      onKeyPress={handlePageInputKeyPress}
                      onBlur={handlePageInputChange}
                    />
                    <span className="page-jump-sep">/</span>
                    <span className="page-jump-total">{totalPages}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default CompaniesPage;