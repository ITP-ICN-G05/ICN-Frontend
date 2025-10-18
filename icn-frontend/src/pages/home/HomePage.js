import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanyService } from '../../services/serviceFactory';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const companyService = getCompanyService();
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyCompanies, setNearbyCompanies] = useState([]);
  const [sectors, setSectors] = useState([
    { name: 'Service Provider', count: 245, icon: '🔧' },
    { name: 'Item Supplier', count: 189, icon: '📦' },
    { name: 'Manufacturer', count: 156, icon: '🏭' },
    { name: 'Retailer', count: 112, icon: '🛍️' },
    { name: 'Component', count: 98, icon: '⚙️' },
    { name: 'Both', count: 67, icon: '🔄' }
  ]);

  useEffect(() => {
    loadNearbyCompanies();
  }, []);

  const loadNearbyCompanies = async () => {
    try {
      // Try to get companies from service
      const response = await companyService.getAll({ limit: 3, nearby: true });
      const data = response.data || response;
      
      if (Array.isArray(data) && data.length > 0) {
        // Transform API data to match expected format
        const transformedData = data.slice(0, 3).map(company => ({
          id: company.id,
          name: company.name,
          type: company.type || company.companyType,
          distance: company.distance || '2.5km',
          verified: company.verificationStatus === 'verified' || company.verified
        }));
        setNearbyCompanies(transformedData);
      } else {
        // Use mock data as fallback
        setNearbyCompanies([
          {
            id: 1,
            name: 'TechCorp Industries',
            type: 'Manufacturer',
            distance: '2.3km',
            verified: true
          },
          {
            id: 2,
            name: 'Global Supply Co',
            type: 'Item Supplier',
            distance: '4.1km',
            verified: true
          },
          {
            id: 3,
            name: 'ServiceMax Pro',
            type: 'Service Provider',
            distance: '5.7km',
            verified: false
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading nearby companies:', error);
      // Use mock data as fallback
      setNearbyCompanies([
        {
          id: 1,
          name: 'TechCorp Industries',
          type: 'Manufacturer',
          distance: '2.3km',
          verified: true
        },
        {
          id: 2,
          name: 'Global Supply Co',
          type: 'Item Supplier',
          distance: '4.1km',
          verified: true
        },
        {
          id: 3,
          name: 'ServiceMax Pro',
          type: 'Service Provider',
          distance: '5.7km',
          verified: false
        }
      ]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSectorClick = (sectorName) => {
    navigate(`/companies?sector=${encodeURIComponent(sectorName)}`);
  };

  const handleGetStarted = () => {
    navigate('/signup');
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Find capable local<br />
            suppliers in minutes.
          </h1>
          <p className="hero-subtitle">
            Search 2,716+ companies across Victoria through<br />
            your ICN – in lists and maps.
          </p>
          
          {/* Search Bar */}
          <form className="hero-search" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="Search companies, capabilities, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </form>

          {/* Sector Chips */}
          <div className="sector-chips">
            {sectors.map((sector) => (
              <button
                key={sector.name}
                className="sector-chip"
                onClick={() => handleSectorClick(sector.name)}
              >
                <span className="sector-icon">{sector.icon}</span>
                <span className="sector-name">{sector.name}</span>
                <span className="sector-count">{sector.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="hero-image">
          <div className="hero-map-placeholder">
            {/* Placeholder for hero image/illustration */}
            <div className="map-dots">
              <div className="map-dot dot-orange" style={{top: '30%', left: '40%'}}></div>
              <div className="map-dot dot-navy" style={{top: '50%', left: '60%'}}></div>
              <div className="map-dot dot-orange" style={{top: '70%', left: '35%'}}></div>
              <div className="map-dot dot-verified" style={{top: '45%', left: '75%'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-cards">
            <div className="trust-card">
              <h3>Buyer-focused</h3>
              <p>Pinpoint suppliers by precise capability, ownership, and distance</p>
            </div>
            <div className="trust-card">
              <h3>Trust & speed</h3>
              <p>ICN-verified capability data you can rely on</p>
            </div>
            <div className="trust-card">
              <h3>Supplier-friendly</h3>
              <p>Showcase products and earn a verified badge</p>
            </div>
          </div>
        </div>
      </section>

      {/* Near You Section */}
      <section className="nearby-section">
        <div className="container">
          <h2>Companies Near You</h2>
          <div className="nearby-cards">
            {nearbyCompanies.map((company) => (
              <div key={company.id} className="company-card">
                <div className="company-header">
                  <h3>{company.name}</h3>
                  {company.verified && (
                    <span className="verified-badge">✓ Verified</span>
                  )}
                </div>
                <p className="company-type">{company.type}</p>
                <p className="company-distance">📍 {company.distance}</p>
                <button 
                  className="view-details-btn"
                  onClick={() => navigate(`/company/${company.id}`)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Search or Browse</h3>
              <p>Find companies by capability, location, or industry sector</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Filter & Compare</h3>
              <p>Narrow results by distance, size, and verified capabilities</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Connect</h3>
              <p>View detailed profiles and connect with verified suppliers</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to find your next supplier?</h2>
            <p>Join thousands of businesses already using ICN Navigator</p>
            <button className="cta-button" onClick={handleGetStarted}>
              Get Started Free
            </button>
            <p className="cta-note">Free tier available • No credit card required</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;