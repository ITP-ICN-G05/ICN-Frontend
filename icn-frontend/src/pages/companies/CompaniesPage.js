import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanyService, getExportService, getBookmarkService } from '../../services/serviceFactory';
import './CompaniesPage.css';

function CompaniesPage() {
  const navigate = useNavigate();
  const companyService = getCompanyService(); 
  const exportService = getExportService();
  const bookmarkService = getBookmarkService(); 
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedCapability, setSelectedCapability] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // 每页显示12个公司
  const [bookmarkedCompanies, setBookmarkedCompanies] = useState([]); // 收藏的公司列表

  // Mock data - ICN Victoria managed companies
  const mockCompanies = [
    {
      id: 1,
      name: 'TechCorp Industries',
      type: 'Manufacturer',
      sectors: ['Technology', 'Electronics'],
      capabilities: ['Manufacturing', 'Assembly', 'Design'],
      address: '123 Smith Street, Melbourne, VIC 3000',
      size: 'Large',
      employees: '500+',
      verified: true,
      ownership: [],
      abn: '12 345 678 901',
      description: 'Leading manufacturer of electronic components',
      website: 'www.techcorp.com.au',
      localContent: 85
    },
    {
      id: 2,
      name: 'Global Supply Co',
      type: 'Supplier',
      sectors: ['Logistics', 'Distribution'],
      capabilities: ['Supply Chain', 'Warehousing', 'Distribution'],
      address: '456 Queen Road, Melbourne, VIC 3006',
      size: 'Medium',
      employees: '100-499',
      verified: true,
      ownership: ['Female-owned'],
      abn: '98 765 432 109',
      description: 'Comprehensive supply chain solutions',
      website: 'www.globalsupply.com.au',
      localContent: 75
    },
    {
      id: 3,
      name: 'ServiceMax Pro',
      type: 'Service Provider',
      sectors: ['Services', 'Maintenance'],
      capabilities: ['Maintenance', 'Repair', 'Technical Support'],
      address: '789 King Avenue, Melbourne, VIC 3141',
      size: 'Small',
      employees: '10-99',
      verified: false,
      ownership: [],
      abn: '11 223 344 556',
      description: 'Professional maintenance and repair services',
      website: 'www.servicemax.com.au',
      localContent: 100
    },
    {
      id: 4,
      name: 'EcoTech Solutions',
      type: 'Manufacturer',
      sectors: ['Environment', 'Technology'],
      capabilities: ['Green Technology', 'Recycling', 'Waste Management'],
      address: '321 Green Lane, Melbourne, VIC 3124',
      size: 'Medium',
      employees: '100-499',
      verified: true,
      ownership: ['First Nations-owned'],
      abn: '55 667 788 990',
      description: 'Sustainable technology and environmental solutions',
      website: 'www.ecotech.com.au',
      localContent: 90
    },
    {
      id: 5,
      name: 'Precision Parts Ltd',
      type: 'Assembler',
      sectors: ['Manufacturing', 'Automotive'],
      capabilities: ['Precision Engineering', 'CNC Machining', 'Quality Control'],
      address: '555 Industrial Drive, Melbourne, VIC 3175',
      size: 'Medium',
      employees: '100-499',
      verified: true,
      ownership: [],
      abn: '77 889 900 112',
      description: 'High-precision components for automotive industry',
      website: 'www.precisionparts.com.au',
      localContent: 80
    }
  ];

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    loadCompanies();
    loadBookmarks();
  }, []);

  useEffect(() => {
    filterCompanies();
    setCurrentPage(1); // 重置到第一页当筛选条件改变时
  }, [searchTerm, selectedSector, selectedCapability, companies]);

  const loadCompanies = async () => {
    setLoading(true);
    
    const response = await companyService.getAll({
      sectors: selectedSector !== 'all' ? [selectedSector] : undefined,
      capabilities: selectedCapability !== 'all' ? [selectedCapability] : undefined,
      search: searchTerm || undefined,
      limit: 999999  // 移除限制，加载所有数据
    });
    
    const data = response.data || response;
    const loadedCompanies = Array.isArray(data) ? data : [];
    setCompanies(loadedCompanies);
    setLoading(false);
  };

  const filterCompanies = () => {
    let filtered = [...companies];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sector filter
    if (selectedSector !== 'all') {
      filtered = filtered.filter(company =>
        company.sectors.includes(selectedSector)
      );
    }

    // Capability filter
    if (selectedCapability !== 'all') {
      filtered = filtered.filter(company =>
        company.capabilities.includes(selectedCapability)
      );
    }

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

  // 切换收藏状态
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

  // 格式化验证日期
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

  // 获取公司类型颜色
  const getCompanyTypeColor = (type) => {
    const colors = {
      'Supplier': '#E3F2FD',
      'Manufacturer': '#FCE4EC',
      'Service Provider': '#FCCF8E',
      'Assembler': '#FEECD2',
    };
    return colors[type] || '#FEECD2';
  };

  // 获取地址显示
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
        {/* 收藏按钮 - 借鉴移动端 */}
        <button 
          className="bookmark-button"
          onClick={(e) => toggleBookmark(company.id, e)}
          title={isBookmarked ? '取消收藏' : '收藏'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>

        {/* 头部：头像 + 名称 + 地址 */}
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
          
          {/* 公司类型徽章 */}
          {company.type && (
            <div 
              className="type-badge"
              style={{ backgroundColor: getCompanyTypeColor(company.type) }}
            >
              {company.type}
            </div>
          )}

          {/* 员工数徽章 - 显著位置 - 支持多种字段名 */}
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
        
        {/* Capabilities标签 - 所有用户可见 - 支持多种字段名 */}
        {(() => {
          // 支持 icnCapabilities 或 capabilities
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

        {/* Sectors标签 - 所有用户可见 - 支持多种字段名 */}
        {(() => {
          // 支持 keySectors 或 sectors
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

        {/* 额外信息栏 */}
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
        
        {/* Premium信息 */}
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

        {/* 右箭头指示 */}
        <div className="card-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>
    );
  };

  // 支持多种验证字段名
  const verifiedCount = companies.filter(c => 
    c.verified || c.verificationStatus === 'verified' || c.isVerified
  ).length;

  // 分页逻辑
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCompanies = filteredCompanies.slice(startIndex, endIndex);

  // 分页处理函数
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

  // 页码输入跳转
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

  // 生成页码数组
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
                  <button className="search-clear" onClick={() => setSearchTerm('')}>✕</button>
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
              <option value="Technology">Technology</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Services">Services</option>
              <option value="Logistics">Logistics</option>
              <option value="Environment">Environment</option>
              <option value="Automotive">Automotive</option>
            </select>
              </div>
            
              <div className="filter-group-sidebar">
                <label className="filter-label">Capability</label>
            <select 
              value={selectedCapability} 
              onChange={(e) => setSelectedCapability(e.target.value)}
                  className="sidebar-select"
            >
              <option value="all">All Capabilities</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Assembly">Assembly</option>
              <option value="Design">Design</option>
              <option value="Supply Chain">Supply Chain</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Quality Control">Quality Control</option>
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