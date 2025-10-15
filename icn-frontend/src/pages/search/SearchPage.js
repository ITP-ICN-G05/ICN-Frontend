import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import FilterPanel from '../../components/search/FilterPanel';
import CompanyCard from '../../components/company/CompanyCard';
import SearchMap from '../../components/map/SearchMap';
import './SearchPage.css';

function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [view, setView] = useState('list'); // 'list' or 'map'
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
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

  // Mock data - replace with API call
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
      description: 'Leading manufacturer of electronic components'
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
      description: 'Comprehensive supply chain solutions'
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
      description: 'Professional maintenance and repair services'
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
      description: 'Sustainable technology and environmental solutions'
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
      description: 'High-precision components for automotive industry'
    }
  ];

  useEffect(() => {
    searchCompanies();
  }, [query]);

  useEffect(() => {
    applyFilters();
  }, [filters, companies, sortBy]);

  const searchCompanies = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter mock data based on search query
      const results = query 
        ? mockCompanies.filter(company => 
            company.name.toLowerCase().includes(query.toLowerCase()) ||
            company.description.toLowerCase().includes(query.toLowerCase()) ||
            company.sectors.some(s => s.toLowerCase().includes(query.toLowerCase())) ||
            company.capabilities.some(c => c.toLowerCase().includes(query.toLowerCase()))
          )
        : mockCompanies;
      
      setCompanies(results);
    } catch (error) {
      console.error('Search error:', error);
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
                    selectedCompany={null}
                    onCompanySelect={(company) => {
                      console.log('Selected company:', company);
                    }}
                  />
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