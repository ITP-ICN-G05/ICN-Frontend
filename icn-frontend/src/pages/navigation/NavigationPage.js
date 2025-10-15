import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FilterPanel from '../../components/search/FilterPanel';
import SearchMap from '../../components/map/SearchMap';
import CompanyCard from '../../components/company/CompanyCard';
import './NavigationPage.css';

function NavigationPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [showFilters, setShowFilters] = useState(true);
  
  const [filters, setFilters] = useState({
    sectors: [],
    capabilities: [],
    distance: 50,
    size: '',
    ownership: [],
    verified: false
  });

  // Mock companies data - complete dataset
  const mockCompanies = [
    {
      id: 1,
      name: 'TechCorp Industries',
      type: 'Manufacturer',
      sectors: ['Technology', 'Electronics'],
      capabilities: ['Manufacturing', 'Assembly', 'Design'],
      distance: 2.3,
      size: 'Large',
      employees: '500+',
      verified: true,
      ownership: [],
      address: '123 Smith Street, Melbourne, VIC 3000',
      description: 'Leading manufacturer of electronic components',
      position: { lat: -37.8136, lng: 144.9631 }
    },
    {
      id: 2,
      name: 'Global Supply Co',
      type: 'Item Supplier',
      sectors: ['Logistics', 'Distribution'],
      capabilities: ['Supply Chain', 'Warehousing', 'Distribution'],
      distance: 4.1,
      size: 'Medium',
      employees: '100-499',
      verified: true,
      ownership: ['Female-owned'],
      address: '456 Queen Road, Melbourne, VIC 3006',
      description: 'Comprehensive supply chain solutions',
      position: { lat: -37.8200, lng: 144.9780 }
    },
    {
      id: 3,
      name: 'ServiceMax Pro',
      type: 'Service Provider',
      sectors: ['Services', 'Maintenance'],
      capabilities: ['Maintenance', 'Repair', 'Technical Support'],
      distance: 5.7,
      size: 'Small',
      employees: '10-99',
      verified: false,
      ownership: [],
      address: '789 King Avenue, Melbourne, VIC 3141',
      description: 'Professional maintenance and repair services',
      position: { lat: -37.8050, lng: 144.9500 }
    },
    {
      id: 4,
      name: 'EcoTech Solutions',
      type: 'Manufacturer',
      sectors: ['Environment', 'Technology'],
      capabilities: ['Green Technology', 'Recycling', 'Waste Management'],
      distance: 8.2,
      size: 'Medium',
      employees: '100-499',
      verified: true,
      ownership: ['First Nations-owned'],
      address: '321 Green Lane, Melbourne, VIC 3124',
      description: 'Sustainable technology and environmental solutions',
      position: { lat: -37.8300, lng: 144.9900 }
    },
    {
      id: 5,
      name: 'Precision Parts Ltd',
      type: 'Component Supplier',
      sectors: ['Manufacturing', 'Automotive'],
      capabilities: ['Precision Engineering', 'CNC Machining', 'Quality Control'],
      distance: 12.5,
      size: 'Medium',
      employees: '100-499',
      verified: true,
      ownership: [],
      address: '555 Industrial Drive, Melbourne, VIC 3175',
      description: 'High-precision components for automotive industry',
      position: { lat: -37.7900, lng: 144.9400 }
    },
    {
      id: 6,
      name: 'Digital Solutions Hub',
      type: 'Service Provider',
      sectors: ['Technology', 'Services'],
      capabilities: ['Software Development', 'IT Support', 'Cloud Services'],
      distance: 3.8,
      size: 'Small',
      employees: '10-99',
      verified: false,
      ownership: [],
      address: '777 Tech Boulevard, Melbourne, VIC 3008',
      description: 'Digital transformation and IT solutions',
      position: { lat: -37.8250, lng: 144.9550 }
    },
    {
      id: 7,
      name: 'Melbourne Logistics',
      type: 'Logistics Provider',
      sectors: ['Logistics', 'Transport'],
      capabilities: ['Freight Management', 'Warehousing', 'Last-Mile Delivery'],
      distance: 6.5,
      size: 'Large',
      employees: '500+',
      verified: true,
      ownership: [],
      address: '999 Transport Way, Melbourne, VIC 3207',
      description: 'End-to-end logistics solutions',
      position: { lat: -37.8400, lng: 144.9700 }
    },
    {
      id: 8,
      name: 'Green Energy Systems',
      type: 'Energy Provider',
      sectors: ['Environment', 'Energy'],
      capabilities: ['Solar Installation', 'Energy Storage', 'Grid Solutions'],
      distance: 9.3,
      size: 'Medium',
      employees: '100-499',
      verified: true,
      ownership: ['Social Enterprise'],
      address: '111 Sustainable Street, Melbourne, VIC 3121',
      description: 'Renewable energy solutions provider',
      position: { lat: -37.7950, lng: 144.9850 }
    },
    {
      id: 9,
      name: 'Advanced Manufacturing Co',
      type: 'Manufacturer',
      sectors: ['Manufacturing', 'Technology'],
      capabilities: ['3D Printing', 'Prototyping', 'Custom Manufacturing'],
      distance: 7.1,
      size: 'Medium',
      employees: '100-499',
      verified: true,
      ownership: [],
      address: '222 Innovation Drive, Melbourne, VIC 3195',
      description: 'Advanced manufacturing and prototyping services',
      position: { lat: -37.8600, lng: 145.0200 }
    },
    {
      id: 10,
      name: 'Quality Assurance Services',
      type: 'Service Provider',
      sectors: ['Services', 'Quality'],
      capabilities: ['Testing', 'Certification', 'Compliance'],
      distance: 4.9,
      size: 'Small',
      employees: '10-99',
      verified: false,
      ownership: ['Female-owned'],
      address: '333 Standards Road, Melbourne, VIC 3123',
      description: 'Quality assurance and compliance services',
      position: { lat: -37.8150, lng: 144.9850 }
    }
  ];

  useEffect(() => {
    // Set companies and filtered companies immediately for mock data
    setCompanies(mockCompanies);
    setFilteredCompanies(mockCompanies);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, companies]);

  const applyFilters = () => {
    let filtered = [...companies];
    
    // Apply sector filter
    if (filters.sectors.length > 0) {
      filtered = filtered.filter(company =>
        company.sectors.some(sector => filters.sectors.includes(sector))
      );
    }
    
    // Apply capability filter
    if (filters.capabilities.length > 0) {
      filtered = filtered.filter(company =>
        company.capabilities.some(cap => filters.capabilities.includes(cap))
      );
    }
    
    // Apply distance filter
    filtered = filtered.filter(company => company.distance <= filters.distance);
    
    // Apply size filter
    if (filters.size) {
      filtered = filtered.filter(company => company.size === filters.size);
    }
    
    // Apply ownership filter
    if (filters.ownership.length > 0) {
      filtered = filtered.filter(company =>
        filters.ownership.some(own => company.ownership.includes(own))
      );
    }
    
    // Apply verified filter
    if (filters.verified) {
      filtered = filtered.filter(company => company.verified);
    }
    
    setFilteredCompanies(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      sectors: [],
      capabilities: [],
      distance: 50,
      size: '',
      ownership: [],
      verified: false
    });
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.sectors.length > 0) count += filters.sectors.length;
    if (filters.capabilities.length > 0) count += filters.capabilities.length;
    if (filters.distance !== 50) count++;
    if (filters.size) count++;
    if (filters.ownership.length > 0) count += filters.ownership.length;
    if (filters.verified) count++;
    return count;
  };

  return (
    <div className="navigation-page">
      {/* Header Section */}
      <section className="nav-header">
        <div className="container">
          <h1>Victorian Company Navigator</h1>
          <p className="header-subtitle">
            Interactive map showing all {mockCompanies.length} companies across Victoria
          </p>
        </div>
      </section>

      {/* Controls Bar */}
      <section className="controls-section">
        <div className="container">
          <div className="controls-wrapper">
            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
              >
                🗺️ Map View
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                📋 List View
              </button>
            </div>
            
            <div className="stats-display">
              <span className="stat-item">
                <strong>{filteredCompanies.length}</strong> companies
              </span>
              <span className="stat-item">
                <strong>{filteredCompanies.filter(c => c.verified).length}</strong> verified
              </span>
            </div>
            
            <button 
              className="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              🔧 Filters
              {activeFilterCount() > 0 && (
                <span className="filter-count">{activeFilterCount()}</span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="main-content">
        <div className="container">
          <div className="content-layout">
            {/* Filter Sidebar */}
            {showFilters && (
              <aside className="filter-sidebar">
                <FilterPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                />
              </aside>
            )}

            {/* Map or List View */}
            <main className="view-content">
              {viewMode === 'map' ? (
                    <div className="map-container">
                      {filteredCompanies.length > 0 ? (
                        <>
                          <SearchMap
                            companies={filteredCompanies}
                            selectedCompany={selectedCompany}
                            onCompanySelect={handleCompanySelect}
                          />
                          
                          {/* Company Info Panel */}
                          {selectedCompany && (
                            <div className="company-info-panel">
                              <button 
                                className="close-panel"
                                onClick={() => setSelectedCompany(null)}
                              >
                                ×
                              </button>
                              <div className="panel-content">
                                <h3>{selectedCompany.name}</h3>
                                {selectedCompany.verified && (
                                  <span className="verified-badge">✓ Verified</span>
                                )}
                                <p className="company-type">{selectedCompany.type}</p>
                                <p className="company-address">📍 {selectedCompany.address}</p>
                                <p className="company-distance">{selectedCompany.distance} km away</p>
                                
                                <div className="company-tags">
                                  {selectedCompany.sectors.map(sector => (
                                    <span key={sector} className="tag">{sector}</span>
                                  ))}
                                </div>
                                
                                <div className="panel-actions">
                                  <button 
                                    className="btn-primary"
                                    onClick={() => navigate(`/company/${selectedCompany.id}`)}
                                  >
                                    View Details
                                  </button>
                                  <button className="btn-secondary">
                                    Get Directions
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                          Loading companies data...
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="list-container">
                      {filteredCompanies.length > 0 ? (
                        <div className="companies-grid">
                          {filteredCompanies.map(company => (
                            <CompanyCard
                              key={company.id}
                              company={company}
                              onClick={() => navigate(`/company/${company.id}`)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="no-results">
                          <h2>No companies found</h2>
                          <p>Try adjusting your filters</p>
                          <button 
                            className="btn-primary"
                            onClick={clearFilters}
                          >
                            Clear All Filters
                          </button>
                        </div>
                      )}
                    </div>
                  )}
            </main>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="info-section">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">📍</div>
              <h3>Location-Based Search</h3>
              <p>Find companies based on proximity to your location or any address in Victoria</p>
            </div>
            <div className="info-card">
              <div className="info-icon">✓</div>
              <h3>Verified Companies</h3>
              <p>ICN-verified companies are marked with a green badge for trusted partnerships</p>
            </div>
            <div className="info-card">
              <div className="info-icon">🔍</div>
              <h3>Advanced Filtering</h3>
              <p>Filter by sector, capabilities, company size, ownership type, and more</p>
            </div>
            <div className="info-card">
              <div className="info-icon">📊</div>
              <h3>Comprehensive Data</h3>
              <p>Access detailed information about each company including capabilities and certifications</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default NavigationPage;