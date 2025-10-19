import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FilterPanel from '../../components/search/FilterPanel';
import { getCompanyService, getGeocodingService } from '../../services/serviceFactory';
import geocodingCacheService from '../../services/geocodingCacheService';
import SearchMap from '../../components/map/SearchMap';
import CompanyCard from '../../components/company/CompanyCard';
import './NavigationPage.css';

function NavigationPage() {
  const navigate = useNavigate();
  const companyService = getCompanyService();
  const geocodingService = getGeocodingService();
  
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [viewMode, setViewMode] = useState('map');
  const [showFilters, setShowFilters] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    sectors: [],
    capabilities: [],
    distance: 50,
    size: '',
    ownership: [],
    verified: false
  });

  useEffect(() => {
    loadCompanies();
  }, []);
  
  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await companyService.getAll({ limit: 10000 });
      const data = response.data || response;
      
      if (Array.isArray(data) && data.length > 0) {
        // Map ICN data structure
        const mappedCompanies = data.map((company) => ({
          ...company,
          sectors: company.keySectors || company.sectors || [],
          capabilities: company.capabilities || [],
          type: company.companyType || company.type || 'supplier',
          verified: company.verificationStatus === 'verified' || company.verified === true,
          size: company.companySize || company.employees || 'Unknown',
          employees: company.employees || 'Unknown',
          ownership: company.ownership || [],
          distance: company.distance || (2 + Math.random() * 20),
        }));
        
        // Geocode with cache
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
  }, [filters, companies]);

  const applyFilters = () => {
    let filtered = [...companies];
    
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
    
    if (filters.size) {
      filtered = filtered.filter(company => company.size === filters.size);
    }
    
    if (filters.ownership.length > 0) {
      filtered = filtered.filter(company =>
        filters.ownership.some(own => (company.ownership || []).includes(own))
      );
    }
    
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
      {/* Header */}
      <section className="nav-header">
        <div className="container">
          <h1>Victorian Company Navigator</h1>
          <p className="header-subtitle">
            Explore {companies.length} companies across Australia and New Zealand
          </p>
        </div>
      </section>

      {/* Controls */}
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
            {/* Filters */}
            {showFilters && (
              <aside className="filter-sidebar">
                <FilterPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                />
              </aside>
            )}

            {/* Map or List */}
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
                      
                      {/* Company Detail Panel */}
                      {selectedCompany && (
                        <div className="company-info-panel">
                          <button 
                            className="close-panel"
                            onClick={() => setSelectedCompany(null)}
                            aria-label="Close"
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
                            <p className="company-distance">
                              {selectedCompany.distance.toFixed(1)} km away
                            </p>
                            
                            <div className="company-tags">
                              {selectedCompany.sectors.slice(0, 3).map(sector => (
                                <span key={sector} className="tag">{sector}</span>
                              ))}
                            </div>
                            
                            <div className="panel-actions">
                              <button 
                                className="btn-primary"
                                onClick={() => navigate(`/company/${selectedCompany.id}`)}
                              >
                                View Full Details
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="no-results-map">
                      <p>No companies match your filters</p>
                      <button className="btn-secondary" onClick={clearFilters}>
                        Clear Filters
                      </button>
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

      {/* Info Cards */}
      <section className="info-section">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">📍</div>
              <h3>Location-Based Discovery</h3>
              <p>Find companies based on proximity to your location or any address</p>
            </div>
            <div className="info-card">
              <div className="info-icon">✓</div>
              <h3>Verified Companies</h3>
              <p>ICN-verified companies marked with badges for trusted partnerships</p>
            </div>
            <div className="info-card">
              <div className="info-icon">🔍</div>
              <h3>Advanced Filtering</h3>
              <p>Filter by sector, capabilities, size, ownership and more</p>
            </div>
            <div className="info-card">
              <div className="info-icon">⚡</div>
              <h3>Smart Caching</h3>
              <p>Lightning-fast loading with intelligent geocoding cache</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default NavigationPage;