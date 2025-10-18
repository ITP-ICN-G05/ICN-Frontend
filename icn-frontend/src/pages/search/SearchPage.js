import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import FilterPanel from '../../components/search/FilterPanel';
import { getCompanyService, getGeocodingService } from '../../services/serviceFactory';
import CompanyCard from '../../components/company/CompanyCard';
import SearchMap from '../../components/map/SearchMap';
import './SearchPage.css';

function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const companyService = getCompanyService(); 
  const geocodingService = getGeocodingService();
  const query = searchParams.get('q') || '';
  
  const [view, setView] = useState('list'); // 'list' or 'map'
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [selectedMapCompany, setSelectedMapCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    sectors: [],
    capabilities: [],
    distance: 50,
    size: '',
    ownership: [],
    verified: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  // Mock data with complete geocoded positions
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
    }
  ];

  useEffect(() => {
    searchCompanies();
  }, [query]);

  useEffect(() => {
    applyFilters();
  }, [filters, companies, sortBy]);

  // Helper function to generate mock positions in Melbourne area
  const generateMockPosition = () => ({
    lat: -37.8136 + (Math.random() - 0.5) * 0.2, // Melbourne area
    lng: 144.9631 + (Math.random() - 0.5) * 0.2
  });
  
  // Helper function to calculate distance from user's location (mock implementation)
  const calculateDistance = (position) => {
    // Mock calculation - in real app, you'd use user's actual location
    const userLocation = { lat: -37.8136, lng: 144.9631 }; // Melbourne CBD
    const R = 6371; // Earth's radius in km
    const dLat = (position.lat - userLocation.lat) * Math.PI / 180;
    const dLng = (position.lng - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(position.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10; // Distance in km, rounded to 1 decimal
  };

  const searchCompanies = async () => {
    setLoading(true);
    try {
      // Use service factory company service
      const response = await companyService.search({
        query: query.trim(),
        ...filters,
      });
      
      let companiesData = response.data || response;
      
      // If service returns empty or no data, use mock data as fallback
      if (!Array.isArray(companiesData) || companiesData.length === 0) {
        // Filter mock data based on search query
        if (!query || query.trim() === '') {
          companiesData = mockCompanies;
        } else {
          companiesData = mockCompanies.filter(company => 
            company.name.toLowerCase().includes(query.toLowerCase()) ||
            company.description.toLowerCase().includes(query.toLowerCase()) ||
            company.sectors.some(s => s.toLowerCase().includes(query.toLowerCase())) ||
            company.capabilities.some(c => c.toLowerCase().includes(query.toLowerCase()))
          );
        }
      }
      
      // Ensure all companies have position data for map display
      const companiesWithPositions = await Promise.all(
        companiesData.map(async (company) => {
          // If company already has position data, use it
          if (company.position && company.position.lat && company.position.lng) {
            return {
              ...company,
              distance: company.distance || calculateDistance(company.position)
            };
          }
          
          // If company has address but no position, try to geocode it
          if (company.address && !company.position) {
            try {
              const geocodeResponse = await geocodingService.geocodeAddress(company.address);
              const position = geocodeResponse.data || geocodeResponse;
              
              return {
                ...company,
                position: position || generateMockPosition(),
                distance: company.distance || calculateDistance(position || generateMockPosition())
              };
            } catch (geocodeError) {
              console.warn(`Geocoding failed for ${company.name}:`, geocodeError);
              // Generate mock position as fallback
              const mockPosition = generateMockPosition();
              return {
                ...company,
                position: mockPosition,
                distance: company.distance || calculateDistance(mockPosition)
              };
            }
          }
          
          // If no address or position, generate mock position
          const mockPosition = generateMockPosition();
          return {
            ...company,
            position: mockPosition,
            distance: company.distance || calculateDistance(mockPosition)
          };
        })
      );
      
      setCompanies(companiesWithPositions);
    } catch (error) {
      console.error('Search error:', error);
      // Use mock data as fallback with positions
      const mockDataWithPositions = mockCompanies.map(company => ({
        ...company,
        position: company.position || generateMockPosition(),
        distance: company.distance || calculateDistance(company.position || generateMockPosition())
      }));
      setCompanies(mockDataWithPositions);
    } finally {
      setLoading(false);
    }
  };

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
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          const sizeOrder = { 'Small': 1, 'Medium': 2, 'Large': 3 };
          return sizeOrder[b.size] - sizeOrder[a.size];
        default: // relevance
          return 0;
      }
    });
    
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

  const handleMapCompanySelect = (company) => {
    setSelectedMapCompany(company);
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="search-header-content">
          <h1>Search Results</h1>
          <p>
            {loading ? 'Searching...' : 
              `${filteredCompanies.length} companies found${query ? ` for "${query}"` : ''}`
            }
          </p>
        </div>
        
        <div className="search-controls">
          <div className="view-toggle">
            <button 
              className={`view-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
            >
              📋 List
            </button>
            <button 
              className={`view-btn ${view === 'map' ? 'active' : ''}`}
              onClick={() => setView('map')}
            >
              🗺️ Map
            </button>
          </div>
          
          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="relevance">Relevance</option>
            <option value="distance">Distance</option>
            <option value="name">Name</option>
            <option value="size">Company Size</option>
          </select>
          
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

      <div className="search-content">
        {showFilters && (
          <aside className="filter-sidebar">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </aside>
        )}
        
        <main className="search-results">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Searching companies...</p>
            </div>
          ) : (
            <>
              {view === 'list' ? (
                <div className="results-list">
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map(company => (
                      <CompanyCard 
                        key={company.id}
                        company={company}
                        onClick={() => navigate(`/company/${company.id}`)}
                      />
                    ))
                  ) : (
                    <div className="no-results">
                      <h2>No companies found</h2>
                      <p>Try adjusting your filters or search terms</p>
                      <button 
                        className="btn-primary"
                        onClick={clearFilters}
                      >
                        Clear All Filters
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="results-map">
                  <SearchMap 
                    companies={filteredCompanies}
                    selectedCompany={selectedMapCompany}
                    onCompanySelect={handleMapCompanySelect}
                  />
                  
                  {/* Company Info Panel for Map */}
                  {selectedMapCompany && (
                    <div className="map-company-panel">
                      <button 
                        className="close-panel"
                        onClick={() => setSelectedMapCompany(null)}
                      >
                        ×
                      </button>
                      <div className="panel-content">
                        <h3>{selectedMapCompany.name}</h3>
                        {selectedMapCompany.verified && (
                          <span className="verified-badge">✓ Verified</span>
                        )}
                        <p className="company-type">{selectedMapCompany.type}</p>
                        <p className="company-distance">📍 {selectedMapCompany.distance} km away</p>
                        <p className="company-address">{selectedMapCompany.address}</p>
                        <p className="company-description">{selectedMapCompany.description}</p>
                        
                        <div className="company-tags">
                          {selectedMapCompany.sectors.map(sector => (
                            <span key={sector} className="tag">{sector}</span>
                          ))}
                        </div>
                        
                        <div className="panel-actions">
                          <button 
                            className="btn-primary"
                            onClick={() => navigate(`/company/${selectedMapCompany.id}`)}
                          >
                            View Details
                          </button>
                          <button 
                            className="btn-secondary"
                            onClick={() => {
                              const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedMapCompany.address)}`;
                              window.open(url, '_blank');
                            }}
                          >
                            Get Directions
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default SearchPage;
