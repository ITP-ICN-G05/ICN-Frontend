import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCompanyService, getBookmarkService } from '../../services/serviceFactory';
import './CompanyDetailPage.css';

function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const companyService = getCompanyService(); 
  const bookmarkService = getBookmarkService();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [bookmarked, setBookmarked] = useState(false);

  // Mock data - replace with API call
  const mockCompany = {
    id: 1,
    name: 'TechCorp Industries',
    type: 'Manufacturer',
    verified: true,
    logo: null,
    coverImage: null,
    description: 'TechCorp Industries is a leading manufacturer of electronic components and industrial equipment. With over 20 years of experience, we provide innovative solutions for businesses across Victoria.',
    address: '123 Smith Street, Melbourne, VIC 3000',
    phone: '+61 3 9999 9999',
    email: 'contact@techcorp.com.au',
    website: 'www.techcorp.com.au',
    abn: '12 345 678 901',
    yearEstablished: 2003,
    employees: '500+',
    size: 'Large',
    revenue: '$50M - $100M',
    sectors: ['Technology', 'Electronics', 'Manufacturing'],
    capabilities: [
      'Electronic Manufacturing',
      'PCB Assembly', 
      'Product Design',
      'Quality Control',
      'Supply Chain Management',
      'Rapid Prototyping'
    ],
    certifications: [
      'ISO 9001:2015',
      'ISO 14001:2015',
      'AS/NZS 4801'
    ],
    ownership: [],
    products: [
      {
        name: 'Custom PCB Assembly',
        description: 'High-quality printed circuit board assembly services'
      },
      {
        name: 'Electronic Components',
        description: 'Wide range of electronic components for various applications'
      },
      {
        name: 'Industrial Control Systems',
        description: 'Advanced control systems for industrial automation'
      }
    ],
    services: [
      {
        name: 'Design & Engineering',
        description: 'Complete product design and engineering services'
      },
      {
        name: 'Manufacturing',
        description: 'Large-scale manufacturing with quality assurance'
      },
      {
        name: 'Technical Support',
        description: '24/7 technical support and maintenance services'
      }
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/company/techcorp',
      facebook: 'https://facebook.com/techcorp',
      twitter: 'https://twitter.com/techcorp'
    },
    gallery: [],
    documents: [
      { name: 'Company Profile', type: 'PDF', size: '2.3 MB' },
      { name: 'Product Catalog', type: 'PDF', size: '5.1 MB' },
      { name: 'Certifications', type: 'PDF', size: '1.2 MB' }
    ],
    lastUpdated: '2024-12-15',
    localContent: 85,
    exportCapability: true,
    tags: ['verified', 'local-supplier', 'iso-certified', 'export-ready']
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, [id]);

  const fetchCompanyDetails = async () => {
    setLoading(true);
    try {
      const response = await companyService.getById(id);
      const data = response.data || response;
      
      if (data) {
        setCompany(data);
      } else {
        // Fallback to mock data if ID matches
        if (parseInt(id) === 1) {
          setCompany(mockCompany);
        } else {
          setCompany(null);
        }
      }
      
      // Check if bookmarked using bookmark service
      if (data || (parseInt(id) === 1)) {
        try {
          const bookmarkResponse = await bookmarkService.isBookmarked(id);
          const isBookmarked = bookmarkResponse.data || bookmarkResponse;
          setBookmarked(isBookmarked);
        } catch (err) {
          // Fallback to localStorage check
          const bookmarks = JSON.parse(localStorage.getItem('bookmarkedCompanies') || '[]');
          setBookmarked(bookmarks.includes(parseInt(id)));
        }
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
      // Fallback to mock data for demo
      if (parseInt(id) === 1) {
        setCompany(mockCompany);
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedCompanies') || '[]');
        setBookmarked(bookmarks.includes(parseInt(id)));
      }
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
        <button onClick={() => navigate('/search')}>Back to Search</button>
      </div>
    );
  }

  return (
    <div className="company-detail-page">
      {/* Header Section */}
      <section className="company-header-section">
        <div className="company-header-bg"></div>
        <div className="container">
          <div className="company-header-content">
            <div className="company-main-info">
              <div className="company-title-row">
                <h1 className="company-title">
                  {company.name}
                  {company.verified && (
                    <span className="verified-badge" title="ICN Verified">
                      ✓ Verified
                    </span>
                  )}
                </h1>
                <div className="company-actions">
                  <button 
                    className={`bookmark-btn ${bookmarked ? 'bookmarked' : ''}`}
                    onClick={handleBookmark}
                  >
                    {bookmarked ? '★' : '☆'} {bookmarked ? 'Bookmarked' : 'Bookmark'}
                  </button>
                  <button className="share-btn">↗ Share</button>
                </div>
              </div>
              
              <div className="company-meta-info">
                <span className="meta-item">{company.type}</span>
                <span className="meta-separator">•</span>
                <span className="meta-item">{company.employees} employees</span>
                <span className="meta-separator">•</span>
                <span className="meta-item">Est. {company.yearEstablished}</span>
                {company.localContent && (
                  <>
                    <span className="meta-separator">•</span>
                    <span className="meta-item local-content">
                      {company.localContent}% Local Content
                    </span>
                  </>
                )}
              </div>

              <p className="company-description">{company.description}</p>

              <div className="company-tags-row">
                {(company.ownership || []).map(own => (
                  <span key={own} className="ownership-tag">{own}</span>
                ))}
                {company.exportCapability && (
                  <span className="capability-tag">Export Ready</span>
                )}
                {company.certifications.length > 0 && (
                  <span className="certification-tag">
                    {company.certifications.length} Certifications
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="company-tabs-section">
        <div className="container">
          <div className="tabs-nav">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'capabilities' ? 'active' : ''}`}
              onClick={() => setActiveTab('capabilities')}
            >
              Capabilities
            </button>
            <button 
              className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              Products & Services
            </button>
            <button 
              className={`tab-btn ${activeTab === 'certifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('certifications')}
            >
              Certifications
            </button>
            <button 
              className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
              onClick={() => setActiveTab('contact')}
            >
              Contact
            </button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="company-content-section">
        <div className="container">
          <div className="content-grid">
            {/* Main Content */}
            <div className="main-content">
              {activeTab === 'overview' && (
                <div className="tab-content">
                  <div className="content-card">
                    <h2>Company Overview</h2>
                    <div className="overview-grid">
                      <div className="overview-item">
                        <label>Industry Sectors</label>
                        <div className="tag-list">
                          {(company.sectors || []).map(sector => (
                            <span key={sector} className="sector-tag">{sector}</span>
                          ))}
                        </div>
                      </div>
                      <div className="overview-item">
                        <label>Company Size</label>
                        <p>{company.size} ({company.employees} employees)</p>
                      </div>
                      <div className="overview-item">
                        <label>Annual Revenue</label>
                        <p>{company.revenue}</p>
                      </div>
                      <div className="overview-item">
                        <label>Year Established</label>
                        <p>{company.yearEstablished}</p>
                      </div>
                      <div className="overview-item">
                        <label>ABN</label>
                        <p>{company.abn}</p>
                      </div>
                      <div className="overview-item">
                        <label>Location</label>
                        <p>{company.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'capabilities' && (
                <div className="tab-content">
                  <div className="content-card">
                    <h2>Capabilities</h2>
                    <div className="capabilities-grid">
                      {(company.capabilities || []).map(capability => (
                        <div key={capability} className="capability-item">
                          <span className="capability-icon">✓</span>
                          <span>{capability}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="tab-content">
                  <div className="content-card">
                    <h2>Products</h2>
                    <div className="products-list">
                      {(company.products || []).map((product, index) => (
                        <div key={index} className="product-item">
                          <h3>{product.name}</h3>
                          <p>{product.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="content-card">
                    <h2>Services</h2>
                    <div className="services-list">
                      {(company.services || []).map((service, index) => (
                        <div key={index} className="service-item">
                          <h3>{service.name}</h3>
                          <p>{service.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'certifications' && (
                <div className="tab-content">
                  <div className="content-card">
                    <h2>Certifications & Compliance</h2>
                    <div className="certifications-list">
                      {(company.certifications || []).map(cert => (
                        <div key={cert} className="certification-item">
                          <span className="cert-icon">🏆</span>
                          <div>
                            <h3>{cert}</h3>
                            <p>Valid and current certification</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="tab-content">
                  <div className="content-card">
                    <h2>Contact Information</h2>
                    <div className="contact-info">
                      <div className="contact-item">
                        <label>Address</label>
                        <p>{company.address}</p>
                      </div>
                      <div className="contact-item">
                        <label>Phone</label>
                        <p>{company.phone}</p>
                      </div>
                      <div className="contact-item">
                        <label>Email</label>
                        <p>{company.email}</p>
                      </div>
                      <div className="contact-item">
                        <label>Website</label>
                        <p>
                          <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer">
                            {company.website}
                          </a>
                        </p>
                      </div>
                    </div>
                    <button className="btn-primary contact-btn" onClick={handleContactClick}>
                      Contact Company
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="sidebar">
              <div className="sidebar-card">
                <h3>Quick Actions</h3>
                <button className="btn-primary full-width" onClick={handleContactClick}>
                  Contact Company
                </button>
                <button 
                  className="btn-secondary full-width"
                  onClick={() => handleExport('PDF')}
                >
                  Export Profile (PDF)
                </button>
              </div>

              <div className="sidebar-card">
                <h3>Documents</h3>
                <div className="documents-list">
                  {(company.documents || []).map((doc, index) => (
                    <div key={index} className="document-item">
                      <span className="doc-icon">📄</span>
                      <div className="doc-info">
                        <p className="doc-name">{doc.name}</p>
                        <p className="doc-size">{doc.type} • {doc.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sidebar-card">
                <h3>Last Updated</h3>
                <p className="update-date">{company.lastUpdated}</p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CompanyDetailPage;