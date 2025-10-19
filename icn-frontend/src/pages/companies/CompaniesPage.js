import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanyService, getExportService } from '../../services/serviceFactory';
import './CompaniesPage.css';

function CompaniesPage() {
  const navigate = useNavigate();
  const companyService = getCompanyService(); 
  const exportService = getExportService(); 
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedCapability, setSelectedCapability] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

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
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [searchTerm, selectedSector, selectedCapability, companies]);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const response = await companyService.getAll({
        sectors: selectedSector !== 'all' ? [selectedSector] : undefined,
        capabilities: selectedCapability !== 'all' ? [selectedCapability] : undefined,
        search: searchTerm || undefined
      });
      
      const data = response.data || response;
      setCompanies(Array.isArray(data) ? data : mockCompanies);
    } catch (error) {
      console.error('Error loading companies:', error);
      // Keep existing mock data as fallback
      setCompanies(mockCompanies);
    } finally {
      setLoading(false);
    }
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

  const renderCompanyCard = (company) => {
    const userTier = user?.tier || 'free';
    
    return (
      <div key={company.id} className="company-card">
        <div className="company-card-header">
          <h3>{company.name}</h3>
          {canViewDetail('verified') && company.verified && (
            <span className="verified-badge">✓ Verified</span>
          )}
        </div>
        
        <p className="company-type">{company.type}</p>
        <p className="company-address">{company.address}</p>
        
        {canViewDetail('sectors') && (
          <div className="company-sectors">
            {(company.sectors || []).map(sector => (
              <span key={sector} className="sector-tag">{sector}</span>
            ))}
          </div>
        )}
        
        {canViewDetail('capabilities') && (
          <div className="company-capabilities">
            <strong>Capabilities:</strong>
            <div className="capability-tags">
              {(company.capabilities || []).slice(0, 3).map(cap => (
                <span key={cap} className="capability-tag">{cap}</span>
              ))}
            </div>
          </div>
        )}
        
        {userTier === 'premium' && (company.ownership || []).length > 0 && (
          <div className="ownership-badges">
            {(company.ownership || []).map(own => (
              <span key={own} className="ownership-badge">{own}</span>
            ))}
          </div>
        )}
        
        {userTier === 'premium' && (
          <div className="premium-info">
            <p className="local-content">Local Content: {company.localContent}%</p>
            <p className="employees">Employees: {company.employees}</p>
          </div>
        )}
        
        <div className="card-actions">
          <button 
            className="btn-view"
            onClick={() => navigate(`/company/${company.id}`)}
          >
            View Details
          </button>
          {canViewDetail('website') && (
            <a 
              href={`https://${company.website}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-website"
            >
              Website ↗
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="companies-page">
      <div className="page-header">
        <div className="container">
          <h1>ICN Victoria Company Database</h1>
          <p>Access {companies.length} verified Victorian companies</p>
        </div>
      </div>

      <div className="controls-section">
        <div className="container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-controls">
            <select 
              value={selectedSector} 
              onChange={(e) => setSelectedSector(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Sectors</option>
              <option value="Technology">Technology</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Services">Services</option>
              <option value="Logistics">Logistics</option>
              <option value="Environment">Environment</option>
              <option value="Automotive">Automotive</option>
            </select>
            
            <select 
              value={selectedCapability} 
              onChange={(e) => setSelectedCapability(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Capabilities</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Assembly">Assembly</option>
              <option value="Design">Design</option>
              <option value="Supply Chain">Supply Chain</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Quality Control">Quality Control</option>
            </select>
            
            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                Grid View
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                List View
              </button>
            </div>
            
            <div className="export-controls">
              <button 
                className="export-btn"
                onClick={() => handleExport('csv')}
              >
                Export CSV
              </button>
              <button 
                className="export-btn"
                onClick={() => handleExport('pdf')}
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="companies-content">
        <div className="container">
          {loading ? (
            <div className="loading">Loading companies...</div>
          ) : (
            <>
              <div className="results-info">
                <p>Showing {filteredCompanies.length} companies</p>
                {user && (
                  <p className="tier-notice">
                    Your {user.tier || 'free'} tier shows {
                      user?.tier === 'premium' ? 'full' : 
                      user?.tier === 'plus' ? 'standard' : 'basic'
                    } company information
                  </p>
                )}
              </div>
              
              <div className={`companies-grid ${viewMode}`}>
                {(filteredCompanies || []).map(renderCompanyCard)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompaniesPage;