import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCompanyService, getBookmarkService } from '../../services/serviceFactory';
import './CompanyDetailPage.css';
import defaultAvatar from '../../assets/use_image/user.jpg';

function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const companyService = getCompanyService(); 
  const bookmarkService = getBookmarkService();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [projectPage, setProjectPage] = useState(0);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const [isCapabilitiesExpanded, setIsCapabilitiesExpanded] = useState(false);
  const [capabilityPage, setCapabilityPage] = useState(0);
  const [isNewsExpanded, setIsNewsExpanded] = useState(false);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);
  const [isContactExpanded, setIsContactExpanded] = useState(false);
  const [expandedCapabilityGroups, setExpandedCapabilityGroups] = useState({});
  const [abnCopied, setAbnCopied] = useState(false);
  const [bookmarkEffect, setBookmarkEffect] = useState(false);

  // Copy ABN to clipboard
  const handleCopyABN = () => {
    if (company.abn) {
      navigator.clipboard.writeText(company.abn).then(() => {
        setAbnCopied(true);
        setTimeout(() => setAbnCopied(false), 2000);
      });
    }
  };

  // User tier management - simulating subscription levels
  // In production, this would come from user's account settings
  const getUserTier = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // Default to 'basic' for testing different tiers
    // Options: 'basic' (free), 'plus', 'premium'
    // You can test by changing this default value or setting user.tier in localStorage
    return user.tier || 'basic';
  };

  const currentTier = getUserTier();

  useEffect(() => {
    fetchCompanyDetails();
  }, [id]);

  const fetchCompanyDetails = async () => {
    setLoading(true);
    try {
      const response = await companyService.getById(id);
      const data = response.data || response;
      
      if (data) {
        // Process the data to ensure all required fields exist
        const processedCompany = {
          ...data,
          // Ensure capabilities array exists
          capabilities: data.capabilities || [],
          // Map ICN capabilities to simpler format if needed
          icnCapabilities: data.icnCapabilities || [],
          // Ensure sectors array exists
          sectors: data.keySectors || [],
          // Ensure certifications exists
          certifications: data.certifications || [],
          // Ensure diversity markers
          diversityMarkers: data.diversityMarkers || data.ownershipType || [],
          // Process address
          address: data.address || 'Address not available',
          // Ensure other fields
          type: data.companyType || 'Unknown',
          verified: data.verificationStatus === 'verified',
          employees: data.employees || (data.employeeCount ? `${data.employeeCount}+` : 'N/A'),
          size: data.size || 'Unknown',
          revenue: data.revenue ? `$${(data.revenue / 1000000).toFixed(1)}M` : 'N/A',
          annualRevenue: data.revenue || null,
          employeeCount: data.employeeCount || null,
          localContent: data.localContentPercentage || null,
          abn: data.abn || null,
          // Past projects - ensure it's an array
          pastProjects: Array.isArray(data.pastProjects) ? data.pastProjects.map(project => ({
            ...project,
            value: project.value ? `$${(project.value / 1000000).toFixed(1)}M` : null
          })) : [],
          // Products and services
          products: data.products || [],
          services: data.services || [],
          // Documents
          documents: data.documents || [],
          // Social links
          socialLinks: data.socialMedia || data.socialLinks || {},
          // Contact info
          phone: data.phoneNumber || data.phone || null,
          email: data.email || null,
          website: data.website || null,
          yearEstablished: data.yearEstablished || null,
          lastUpdated: data.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString() : new Date().toLocaleDateString(),
        };
        
        setCompany(processedCompany);
        
        // Check if bookmarked
        try {
          const bookmarkResponse = await bookmarkService.isBookmarked(id);
          const isBookmarked = bookmarkResponse.data || bookmarkResponse;
          setBookmarked(isBookmarked);
        } catch (err) {
          const bookmarks = JSON.parse(localStorage.getItem('bookmarkedCompanies') || '[]');
          setBookmarked(bookmarks.includes(id));
        }
      } else {
        setCompany(null);
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };
  

  const handleBookmark = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }
  
    // Trigger effect animation
    setBookmarkEffect(true);
    setTimeout(() => setBookmarkEffect(false), 600);

    try {
      if (bookmarked) {
        await bookmarkService.removeBookmark(company.id);
        setBookmarked(false);
      } else {
        await bookmarkService.addBookmark(company.id);
        setBookmarked(true);
      }
    } catch (error) {
      // Fallback to localStorage method
      console.log('Using localStorage fallback for bookmarks');
      const bookmarks = JSON.parse(localStorage.getItem('bookmarkedCompanies') || '[]');
      let newBookmarks;
      
      if (bookmarked) {
        newBookmarks = bookmarks.filter(b => b !== company.id);
      } else {
        newBookmarks = [...bookmarks, company.id];
      }
      
      localStorage.setItem('bookmarkedCompanies', JSON.stringify(newBookmarks));
      setBookmarked(!bookmarked);
      
      if (error.message) {
        alert(error.message);
      }
    }
  };
  

  const handleContactClick = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
    } else {
      // Show contact information or modal
      alert(`Contact ${company.name} at ${company.email} or ${company.phone}`);
    }
  };

  const handleExport = (format) => {
    console.log(`Exporting company profile as ${format}`);
    // Implement export functionality
  };

  // Format ABN with spacing
  const formatABN = (abn) => {
    if (!abn) return '';
    const abnString = abn.toString().replace(/\s/g, '');
    return `${abnString.slice(0, 2)} ${abnString.slice(2)}`;
  };

  // Helper functions for contact information
  const isValidData = (value) => {
    return value && value !== 'N/A' && value !== 'Not available' && value.trim() !== '';
  };

  const getDisplayValue = (value, placeholder) => {
    return isValidData(value) ? value : placeholder;
  };

  const handleWebsite = () => {
    if (company.website) {
      const url = company.website.startsWith('http') ? company.website : `https://${company.website}`;
      window.open(url, '_blank');
    }
  };

  const handleCall = () => {
    if (company.phone) {
      window.location.href = `tel:${company.phone}`;
    }
  };

  const handleEmail = () => {
    if (company.email) {
      window.location.href = `mailto:${company.email}`;
    }
  };

  const handleICNContact = () => {
    // Navigate to ICN portal or show contact modal
    alert('Please contact this company through the ICN Victoria portal for more information.');
  };

  // Get capabilities data
  const capabilitiesData = company && company.icnCapabilities && company.icnCapabilities.length > 0 
    ? company.icnCapabilities 
    : (company && company.capabilities ? company.capabilities.map((cap, idx) => ({
        itemName: cap,
        detailedItemName: cap,
        capabilityType: idx % 3 === 0 ? 'Manufacturing' : idx % 3 === 1 ? 'Design' : 'Services',
        localContentPercentage: 60 + Math.floor(Math.random() * 40)
      })) : []);

  // Pagination for capabilities
  // Group capabilities by itemName so that each item can expand to show its children (detailed items)
  const groupedCapabilities = useMemo(() => {
    if (!capabilitiesData) return [];
    const groupMap = new Map();
    capabilitiesData.forEach((cap) => {
      const name = (cap && cap.itemName) ? cap.itemName : (typeof cap === 'string' ? cap : 'Item');
      const detailedName = (cap && cap.detailedItemName) ? cap.detailedItemName : (typeof cap === 'string' ? cap : name);
      if (!groupMap.has(name)) {
        groupMap.set(name, {
          groupName: name,
          capabilityType: cap && cap.capabilityType,
          localContentPercentage: cap && cap.localContentPercentage,
          items: []
        });
      }
      const group = groupMap.get(name);
      // push all child entries (allow duplicates to reflect counts from data)
      group.items.push({ name: detailedName });
    });
    return Array.from(groupMap.values());
  }, [capabilitiesData]);

  const capabilitiesPerPage = 6;
  const totalCapabilityPages = groupedCapabilities ? 
    Math.ceil(groupedCapabilities.length / capabilitiesPerPage) : 0;
  const currentCapabilityGroups = groupedCapabilities ? 
    groupedCapabilities.slice(capabilityPage * capabilitiesPerPage, (capabilityPage + 1) * capabilitiesPerPage) : [];
  
  // Track which groups are expanded (for child items)
  const toggleGroupExpansion = (groupName) => {
    setExpandedCapabilityGroups(prev => ({...prev, [groupName]: !prev[groupName]}));
  };

  // Pagination for projects
  const projectsPerPage = 3;
  const totalProjectPages = company && company.pastProjects ? 
    Math.ceil(company.pastProjects.length / projectsPerPage) : 0;
  const currentProjects = company && company.pastProjects ? 
    company.pastProjects.slice(projectPage * projectsPerPage, (projectPage + 1) * projectsPerPage) : [];

  // Handle quick actions
  const handleGetDirections = () => {
    if (company.address) {
      const encodedAddress = encodeURIComponent(company.address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  };

  const handleChatWithICN = () => {
    window.open('mailto:research@icn.vic.gov.au?subject=Inquiry about ' + (company?.name || 'Company'), '_blank');
  };

  const handleExportData = () => {
    handleExport('PDF');
  };

  const handleAnalyze = () => {
    // Placeholder for analysis feature
    alert('Analysis coming soon');
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: company?.name || 'Company',
        text: `Check out ${company?.name || 'this company'} on ICN Navigator`,
        url: window.location.href,
      };
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard');
      } else {
        const input = document.createElement('input');
        input.value = shareData.url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        alert('Link copied to clipboard');
      }
    } catch (err) {
      console.error('Share failed:', err);
      alert('Unable to share. Please copy the URL manually.');
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner"></div>
        <p>Loading company details...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="error-page">
        <h2>Company not found</h2>
        <button onClick={() => navigate('/companies')}>Back to Companies</button>
      </div>
    );
  }

  return (
    <div className="company-detail-page">
      {/* Content Section - All content in single scrollable page */}
      <section className="company-content-section">
        <div className="container">
          <div className="content-grid">
            {/* Main Content */}
            <div className="main-content">
              {/* Company Overview */}
              <div className="content-card company-overview-card">
                {/* Company Header with Avatar */}
                <div className="company-header-row">
                  <div className="company-avatar">
                    <img 
                      src={company.avatar || defaultAvatar} 
                      alt={company.name}
                      className="avatar-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = document.createElement('span');
                        fallback.className = 'avatar-text';
                        fallback.textContent = company.name.charAt(0).toUpperCase();
                        e.target.parentNode.appendChild(fallback);
                      }}
                    />
                  </div>
                  <div className="company-info-section">
                    <h2 className="company-name-title">{company.name}</h2>
                    {company.verified && (
                      <div className="verified-details">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="var(--success)"/>
                          <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="verified-text">
                          ICN Verified on {company.verifiedDate || new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                      </div>
                  )}
                  </div>
                </div>
                {/* Actions moved to sidebar */}

                {/* Company Address */}
                {company.address && (
                  <div className="overview-section">
                    <div className="section-title-row">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="section-title-text">Address</span>
                    </div>
                    <p className="address-text">{company.address}</p>
              </div>
                )}

                {/* ABN Section - Plus tier and above */}
                {(currentTier === 'plus' || currentTier === 'premium') && company.abn && (
                  <div className="abn-container">
                    <div className="abn-label">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Company ABN<span className="abn-colon">:</span></span>
                    </div>
                    <div className="abn-text-wrapper">
                      <div className="abn-text" onClick={handleCopyABN}>
                        {formatABN(company.abn)}
                      </div>
                      <button className="abn-copy-btn" onClick={handleCopyABN} title="Copy ABN">
                        {abnCopied ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                      {abnCopied && <span className="abn-copy-tooltip">Copied!</span>}
                    </div>
              </div>
                )}

                {/* Company Summary with Expand/Collapse - Plus tier and above */}
                {(currentTier === 'plus' || currentTier === 'premium') && company.description && (
                  <div className="collapsible-section summary-section">
                    <div className="summary-header">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="summary-title">Company Summary</span>
                    </div>
                    {isSummaryExpanded && (
                      <div className="summary-content">
                        <p>{company.description}</p>
                      </div>
                    )}
                    <div className="summary-toggle" onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}>
                      <span className="summary-toggle-text">{isSummaryExpanded ? 'Show Less' : 'Show More'}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points={isSummaryExpanded ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                )}

                {/* Diversity Markers - Premium tier */}
                {currentTier === 'premium' && company.diversityMarkers && company.diversityMarkers.length > 0 && (
                  <div className="diversity-container">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: '600', color: 'var(--black-50)', marginBottom: '8px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Diversity Markers
                    </label>
                    <div className="diversity-chips">
                      {company.diversityMarkers.map((marker, index) => (
                        <div key={index} className="diversity-chip">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
                            <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="diversity-chip-text">{marker}</span>
                      </div>
                      ))}
                  </div>
                </div>
              )}

                {/* Certifications & Badges - Premium tier */}
                {currentTier === 'premium' && company.certifications && company.certifications.length > 0 && (
                  <div className="overview-section">
                    <div className="section-title-row">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="section-title-text">Certifications & Badges</span>
                    </div>
                    <div className="certifications-chips">
                      {company.certifications.map((cert, index) => (
                        <div key={index} className="certification-chip-inline">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                          </svg>
                          <span className="certification-chip-text">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Operating Sectors */}
                {company.sectors && company.sectors.length > 0 && (
                  <div className="overview-section">
                    <div className="section-title-row">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="section-title-text">Operating Sectors</span>
                    </div>
                    <div className="tag-list">
                      {company.sectors.map(sector => (
                        <span key={sector} className="sector-tag">{sector}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Items & Services (Capabilities) - Collapsible */}
              {groupedCapabilities && groupedCapabilities.length > 0 && (
                <div className="content-card">
                  <div 
                    className="collapsible-header-capability" 
                    onClick={() => setIsCapabilitiesExpanded(!isCapabilitiesExpanded)}
                  >
                    <div className="capability-title-row">
                      <span className="capability-title-icon" aria-hidden="true">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <h2>Items & Services</h2>
                      <div className="items-count-badge">
                        {totalCapabilityPages > 1 && isCapabilitiesExpanded 
                          ? `${Math.min((capabilityPage + 1) * capabilitiesPerPage, groupedCapabilities.length)}/${groupedCapabilities.length}`
                          : `${groupedCapabilities.length}`
                        }
                      </div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polyline points={isCapabilitiesExpanded ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>

                  {isCapabilitiesExpanded && (
                    <div className="collapsible-content-capability">
                      {/* Pagination Controls - at top */}
                      {totalCapabilityPages > 1 && (
                        <div className="horizontal-pagination-wrapper">
                          <div className="horizontal-pagination-container">
                            <button 
                              className={`separated-nav-button ${capabilityPage === 0 ? 'disabled' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCapabilityPage(Math.max(0, capabilityPage - 1));
                              }}
                              disabled={capabilityPage === 0}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <polyline points="15 18 9 12 15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            
                            <div className="page-dots-container">
                              {Array.from({ length: totalCapabilityPages }, (_, index) => (
                                <div
                                  key={index}
                                  className={`compact-page-dot ${index === capabilityPage ? 'active' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCapabilityPage(index);
                                  }}
                                />
                              ))}
                            </div>
                            
                            <button 
                              className={`separated-nav-button ${capabilityPage === totalCapabilityPages - 1 ? 'disabled' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCapabilityPage(Math.min(totalCapabilityPages - 1, capabilityPage + 1));
                              }}
                              disabled={capabilityPage === totalCapabilityPages - 1}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Capability Items - Keep original style */}
                      <div className="capabilities-list">
                        {currentCapabilityGroups.map((group, index) => (
                          <div key={`${group.groupName}-${capabilityPage}-${index}`} className="modern-capability-item">
                            <div className="capability-header-content">
                              <div className="capability-icon-wrapper">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                              <div className="capability-content">
                                <div className="capability-name">{group.groupName}</div>
                                {group.items.length > 1 && !expandedCapabilityGroups[group.groupName] && (
                                  <div className="capability-detail">{group.items[0].name}</div>
                                )}
                              </div>
                            </div>
                            
                            {/* Tags Row */}
                            <div className="capability-tags">
                              {/* Capability Type - Plus tier and above */}
                              {(currentTier === 'plus' || currentTier === 'premium') && group.capabilityType && (
                                <div className="modern-capability-type-badge">
                                  {group.capabilityType}
                                </div>
                              )}
                              {/* Local Content % - Premium tier only */}
                              {currentTier === 'premium' && group.localContentPercentage && (
                                <div className="local-content-badge-capability">
                                  {group.localContentPercentage}% Local
                                </div>
                              )}
                              {/* Show expand button if has multiple items */}
                              {group.items.length > 1 && (
                                <button 
                                  className="capability-expand-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleGroupExpansion(group.groupName);
                                  }}
                                >
                                  {expandedCapabilityGroups[group.groupName] ? (
                                    <>
                                      <span>Show Less</span>
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <polyline points="18 15 12 9 6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </>
                                  ) : (
                                    <>
                                      <span>+{group.items.length - 1} more</span>
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>

                            {/* Expanded child items */}
                            {expandedCapabilityGroups[group.groupName] && group.items.length > 1 && (
                              <div className="capability-children">
                                {group.items.map((child, idx) => (
                                  <div key={idx} className="capability-child-item">
                                    <div className="capability-child-number">{idx + 1}</div>
                                    <span className="capability-child-name">{child.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show preview when collapsed */}
                  {!isCapabilitiesExpanded && (
                    <div className="preview-container">
                      <div className="preview-tags">
                        {groupedCapabilities.slice(0, 3).map((cap, index) => (
                          <div key={index} className="preview-tag">
                            {cap.groupName}
                          </div>
                        ))}
                        {groupedCapabilities.length > 3 && (
                          <div 
                            className="more-tag" 
                            onClick={() => setIsCapabilitiesExpanded(true)}
                          >
                            +{groupedCapabilities.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Products & Services */}
              {(company.products?.length > 0 || company.services?.length > 0) && (
                <>
                  {company.products?.length > 0 && (
                  <div className="content-card">
                    <h2>Products</h2>
                    <div className="products-list">
                        {company.products.map((product, index) => (
                        <div key={index} className="product-item">
                          <h3>{product.name}</h3>
                          <p>{product.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}
                  {company.services?.length > 0 && (
                  <div className="content-card">
                    <h2>Services</h2>
                    <div className="services-list">
                        {company.services.map((service, index) => (
                        <div key={index} className="service-item">
                          <h3>{service.name}</h3>
                          <p>{service.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}
                </>
              )}

              {/* Industry News & Trends - Collapsible */}
              <div className="content-card">
                <div 
                  className="collapsible-header-news" 
                  onClick={() => setIsNewsExpanded(!isNewsExpanded)}
                >
                  <div className="news-title-row">
                    <span className="section-title-icon" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 20H5C4.46957 20 3.96086 19.7893 3.58579 19.4142C3.21071 19.0391 3 18.5304 3 18V6C3 5.46957 3.21071 4.96086 3.58579 4.58579C3.96086 4.21071 4.46957 4 5 4H9L11 7H19C19.5304 7 20.0391 7.21071 20.4142 7.58579C20.7893 7.96086 21 8.46957 21 9V18C21 18.5304 20.7893 19.0391 20.4142 19.4142C20.0391 19.7893 19.5304 20 19 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="7" y1="16" x2="14" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <h2>Industry News & Trends</h2>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polyline points={isNewsExpanded ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {!isNewsExpanded && (
                  <p className="section-description">
                    ICN Victoria research and insights for {company.sectors?.[0] || 'your industry'}
                  </p>
                )}

                {isNewsExpanded && (
                  <div className="collapsible-content-news">
                    <div className="news-placeholder">
                      ICN Victoria Industry Research Team's thought leadership articles and trends for the {company.sectors?.[0] || 'industry'} sector will appear here.
                    </div>
                    <button 
                      className="view-all-button"
                      onClick={() => window.open('https://icn.org.au/news', '_blank')}
                    >
                      <span>View All ICN News</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                </div>
              )}
              </div>

              {/* Past Projects - Collapsible - Premium tier only */}
              {currentTier === 'premium' && company.pastProjects && company.pastProjects.length > 0 && (
                  <div className="content-card">
                  <div 
                    className="collapsible-header-projects" 
                    onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                  >
                    <div className="projects-title-row">
                      <span className="section-title-icon" aria-hidden="true">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <h2>Past Projects</h2>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polyline points={isProjectsExpanded ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {!isProjectsExpanded && (
                    <p className="section-description">
                      View {company.pastProjects.length} completed projects and outcomes
                    </p>
                  )}

                  {isProjectsExpanded && (
                    <div className="collapsible-content-projects">
                      <div className="projects-container">
                        {currentProjects.map((project) => (
                          <div key={project.id} className="modern-project-item">
                            <div className="project-main-info">
                              <div className="project-name">{project.name}</div>
                              <p className="project-description">{project.description}</p>
                            </div>
                            <div className="project-tags">
                              <div className="project-badge project-client-badge">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                {project.client}
                              </div>
                              <div className="project-badge project-date-badge">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                {project.date}
                              </div>
                              {project.value && (
                                <div className="project-badge project-value-badge">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  {project.value}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Project Pagination - Horizontal style like capabilities */}
                      {totalProjectPages > 1 && (
                        <div className="horizontal-pagination-wrapper">
                          <div className="horizontal-pagination-container">
                            <button 
                              className={`separated-nav-button ${projectPage === 0 ? 'disabled' : ''}`}
                              onClick={() => setProjectPage(Math.max(0, projectPage - 1))}
                              disabled={projectPage === 0}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <polyline points="15 18 9 12 15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            
                            <div className="page-dots-container">
                              {Array.from({ length: totalProjectPages }, (_, index) => (
                                <div
                                  key={index}
                                  className={`compact-page-dot ${index === projectPage ? 'active' : ''}`}
                                  onClick={() => setProjectPage(index)}
                                />
                              ))}
                            </div>
                            
                            <button 
                              className={`separated-nav-button ${projectPage === totalProjectPages - 1 ? 'disabled' : ''}`}
                              onClick={() => setProjectPage(Math.min(totalProjectPages - 1, projectPage + 1))}
                              disabled={projectPage === totalProjectPages - 1}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Sidebar */}
            <aside className="sidebar">
              {/* Contact Details Sidebar Card */}
              <div className="sidebar-card contact-sidebar-card">
                <div className="contact-sidebar-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 10V21H3V3H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 3L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <h3>Contact Details</h3>
                </div>
                <div className="contact-sidebar-content">
                  {/* Website */}
                  <div 
                    className="contact-sidebar-item" 
                    onClick={isValidData(company.website) ? handleWebsite : handleICNContact}
                  >
                    <div className={`contact-sidebar-icon ${!isValidData(company.website) ? 'disabled' : ''}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="contact-sidebar-content-text">
                      <div className="contact-sidebar-label">Website</div>
                      <div className={`contact-sidebar-value ${!isValidData(company.website) ? 'placeholder' : ''}`}>
                        {getDisplayValue(company.website, 'Visit ICN Portal')}
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div 
                    className="contact-sidebar-item" 
                    onClick={isValidData(company.phone) ? handleCall : handleICNContact}
                  >
                    <div className={`contact-sidebar-icon ${!isValidData(company.phone) ? 'disabled' : ''}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1469 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.5953 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5864 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="contact-sidebar-content-text">
                      <div className="contact-sidebar-label">Phone</div>
                      <div className={`contact-sidebar-value ${!isValidData(company.phone) ? 'placeholder' : ''}`}>
                        {getDisplayValue(company.phone, 'Contact via ICN Portal')}
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div 
                    className="contact-sidebar-item" 
                    onClick={isValidData(company.email) ? handleEmail : handleICNContact}
                  >
                    <div className={`contact-sidebar-icon ${!isValidData(company.email) ? 'disabled' : ''}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="contact-sidebar-content-text">
                      <div className="contact-sidebar-label">Email</div>
                      <div className={`contact-sidebar-value ${!isValidData(company.email) ? 'placeholder' : ''}`}>
                        {getDisplayValue(company.email, 'Contact via ICN Portal')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="sidebar-card">
                <h3>Quick Actions</h3>
                {/* Bookmark Company */}
                <button 
                  className={`sidebar-action-btn bookmark-action ${bookmarked ? 'bookmarked' : ''} ${bookmarkEffect ? 'bookmark-effect' : ''}`}
                  onClick={handleBookmark}
                >
                  <div className="sidebar-action-icon">
                    {bookmarked ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="sidebar-action-content">
                    <div className="sidebar-action-title">{bookmarked ? 'Already Bookmarked' : 'Bookmark'}</div>
                    <div className="sidebar-action-subtitle">{bookmarked ? 'Saved to your list' : 'Save this company'}</div>
                  </div>
                  {bookmarkEffect && (
                    <div className="bookmark-ripple"></div>
                  )}
                </button>
                
                {/* Get Directions */}
                <button 
                  className="sidebar-action-btn"
                  onClick={handleGetDirections}
                >
                  <div className="sidebar-action-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polygon points="3 11 22 2 13 21 11 13 3 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="sidebar-action-content">
                    <div className="sidebar-action-title">Get Directions</div>
                    <div className="sidebar-action-subtitle">Navigate to location</div>
                  </div>
                </button>

                {/* Chat with ICN */}
                <button 
                  className="sidebar-action-btn"
                  onClick={(currentTier === 'plus' || currentTier === 'premium') ? handleChatWithICN : () => alert('Upgrade Required\n\nChat with ICN is available for Plus and Premium users.')}
                >
                  <div className="sidebar-action-icon success">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="sidebar-action-content">
                    <div className="sidebar-action-title">Chat with ICN</div>
                    <div className="sidebar-action-subtitle">
                      {(currentTier === 'plus' || currentTier === 'premium') ? 'Get expert support' : 'Upgrade to unlock'}
                    </div>
                  </div>
                </button>

                {/* Analyze Company */}
                <button 
                  className="sidebar-action-btn"
                  onClick={handleAnalyze}
                >
                  <div className="sidebar-action-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="6" y="13" width="3" height="5" rx="1" stroke="currentColor" strokeWidth="2"/>
                      <rect x="11" y="9" width="3" height="9" rx="1" stroke="currentColor" strokeWidth="2"/>
                      <rect x="16" y="6" width="3" height="12" rx="1" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="sidebar-action-content">
                    <div className="sidebar-action-title">Analyze</div>
                    <div className="sidebar-action-subtitle">Insights & metrics</div>
                  </div>
                </button>

                {/* Share */}
                <button 
                  className="sidebar-action-btn"
                  onClick={handleShare}
                >
                  <div className="sidebar-action-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
                      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
                      <path d="M8.9 10.8L15.1 7.2M8.9 13.2L15.1 16.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="sidebar-action-content">
                    <div className="sidebar-action-title">Share</div>
                    <div className="sidebar-action-subtitle">Copy link or share</div>
                  </div>
                </button>

                {/* Export Data */}
                <button 
                  className="sidebar-action-btn"
                  onClick={handleExportData}
                >
                  <div className="sidebar-action-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                      </div>
                  <div className="sidebar-action-content">
                    <div className="sidebar-action-title">Export Data</div>
                    <div className="sidebar-action-subtitle">
                      {currentTier === 'basic' ? 'Basic info' : currentTier === 'plus' ? 'Limited data' : 'Complete profile'}
                    </div>
                </div>
                </button>
              </div>

              {/* Business Metrics Sidebar Card - Premium tier only */}
              {currentTier === 'premium' && (company.annualRevenue || company.employeeCount || company.localContent) && (
                <div className="sidebar-card metrics-sidebar-card">
                  <div className="metrics-sidebar-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="6" y="13" width="3" height="5" rx="1" stroke="currentColor" strokeWidth="2"/>
                      <rect x="11" y="9" width="3" height="9" rx="1" stroke="currentColor" strokeWidth="2"/>
                      <rect x="16" y="6" width="3" height="12" rx="1" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <h3>Business Metrics</h3>
                  </div>
                  <div className="metrics-sidebar-content">
                    {company.annualRevenue && (
                      <div className="metric-sidebar-item">
                        <div className="metric-sidebar-icon success">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="17 6 23 6 23 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="metric-sidebar-content-text">
                          <div className="metric-sidebar-label">Annual Revenue</div>
                          <div className="metric-sidebar-value">
                            ${(company.annualRevenue / 1000000).toFixed(1)}M
                          </div>
                        </div>
                      </div>
                    )}
                    {company.employeeCount && (
                      <div className="metric-sidebar-item">
                        <div className="metric-sidebar-icon blue">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="metric-sidebar-content-text">
                          <div className="metric-sidebar-label">Team Size</div>
                          <div className="metric-sidebar-value">{company.employeeCount}</div>
                        </div>
                      </div>
                    )}
                    {company.localContent && (
                      <div className="metric-sidebar-item">
                        <div className="metric-sidebar-icon success">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="metric-sidebar-content-text">
                          <div className="metric-sidebar-label">Local Content</div>
                          <div className="metric-sidebar-value">{company.localContent}%</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CompanyDetailPage;
