import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanyService } from '../../services/serviceFactory';
import './HomePage.css';
import './HomePageCards.css';
import defaultAvatar from '../../assets/use_image/user.jpg';
import home1Image from '../../assets/use_image/home1.jpg';
import home2Image from '../../assets/use_image/home2.jpg';

function HomePage() {
  const navigate = useNavigate();
  const companyService = getCompanyService();
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyCompanies, setNearbyCompanies] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const observerRef = useRef(null);
  const [sectors, setSectors] = useState([
    { 
      name: 'Power Transmission',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      )
    },
    { 
      name: 'Fixtures, Fitting & Equipment',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      )
    },
    { 
      name: 'Renewables/ Wind',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
        </svg>
      )
    },
    { 
      name: 'Emerging Storage & Generation',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="6" width="18" height="12" rx="2" ry="2"/>
          <line x1="23" y1="13" x2="23" y2="11"/>
        </svg>
      )
    },
    { 
      name: 'Renewables/ Solar',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      )
    },
    { 
      name: 'Renewables/ Battery',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="6" width="18" height="12" rx="2" ry="2"/>
          <line x1="23" y1="13" x2="23" y2="11"/>
        </svg>
      )
    },
    { 
      name: 'Additive Manufacturing',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      )
    },
    { 
      name: 'Critical Minerals',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      )
    },
    { 
      name: 'Textiles, Clothing & Footwear',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
        </svg>
      )
    },
    { 
      name: 'Prefabricated Construction',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
      )
    },
    { 
      name: 'HVAC',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2"/>
        </svg>
      )
    },
    { 
      name: 'Hydrogen Generation & Storage',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      )
    },
    { 
      name: 'Building Information Modelling',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="3" y1="9" x2="21" y2="9"/>
          <line x1="9" y1="21" x2="9" y2="9"/>
        </svg>
      )
    },
    { 
      name: 'Electric Vehicle Charging Stations',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      )
    },
    { 
      name: 'Rolling Stock',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
          <circle cx="9" cy="9" r="2"/>
          <circle cx="15" cy="15" r="2"/>
        </svg>
      )
    }
  ]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isGuest = !user.id;

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
          distance: company.distanceFromUser ? `${company.distanceFromUser.toFixed(1)} km` : '2.5 km',
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
    
    // Check authentication
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      navigate('/login', { 
        state: { 
          from: '/',
          message: 'Please log in to search companies' 
        } 
      });
      return;
    }
    
    if (searchQuery.trim()) {
      navigate(`/navigation?q=${encodeURIComponent(searchQuery)}`, { replace: false });
    }
  };
  

  const handleSectorClick = (sectorName) => {
    // Check authentication
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      navigate('/login', { 
        state: { 
          from: '/',
          message: 'Please log in to browse companies by sector' 
        } 
      });
      return;
    }
    
    // Navigate with sector parameter
    navigate(`/companies?sector=${encodeURIComponent(sectorName)}`);
  };

  const handleGetStarted = () => {
    navigate('/signup');
  };

  // Carousel control functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % nearbyCompanies.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + nearbyCompanies.length) % nearbyCompanies.length);
  };

  // Auto-play
  useEffect(() => {
    if (nearbyCompanies.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % nearbyCompanies.length);
      }, 5000); // 5Auto-switch every 5 seconds

      return () => clearInterval(interval);
    }
  }, [nearbyCompanies.length]);

  // Scroll animation listener
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
        }
      });
    }, observerOptions);

    // Observe all elements that need animation
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .animate-fade-in-left, .animate-fade-in-right, .animate-scale-in');
    animatedElements.forEach((el) => observer.observe(el));

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [nearbyCompanies.length]);

  const handleExplore = () => {
    navigate('/companies');
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
            Search 2,700+ companies across Critical Minerals,<br />
            Steel, HVAC, Textiles and more.
          </p>
          
          {/* Search Bar with Explore Button */}
          <form className="hero-search" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder={isGuest ? "Log in to search companies..." : "Search companies, capabilities, or locations..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={isGuest ? { cursor: 'not-allowed', opacity: 0.7 } : {}}
            />
            <button 
              type="submit" 
              className="search-button"
              style={isGuest ? { opacity: 0.7 } : {}}
            >
              Explore
            </button>
          </form>

          {/* Sector Chips */}
          <div className="sector-chips" style={isGuest ? { opacity: 0.7 } : {}}>
            {sectors.map((sector) => (
              <button
                key={sector.name}
                className="sector-chip"
                onClick={() => handleSectorClick(sector.name)}
                style={isGuest ? { cursor: 'not-allowed' } : {}}
              >
                <span className="sector-icon">{sector.icon}</span>
                <span className="sector-name">{sector.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="hero-image">
          <div className="hero-images-container">
            {/* Top rounded square image */}
            <div className="hero-image-top">
              <img src={home1Image} alt="ICN Industrial" />
            </div>
            {/* Bottom rounded square image */}
            <div className="hero-image-bottom">
              <img src={home2Image} alt="ICN Victoria" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="trust-section animate-on-scroll">
        <div className="trust-cards">
          <div className="trust-card animate-scale-in" style={{animationDelay: '0.1s'}}>
            <div className="trust-card-icon">☁️</div>
            <h3>Buyer-focused</h3>
            <p>Pinpoint suppliers by sector, capability, ownership, and distance</p>
          </div>
          <div className="trust-card animate-scale-in" style={{animationDelay: '0.2s'}}>
            <div className="trust-card-icon">☁️</div>
            <h3>Trust & speed</h3>
            <p>ICN-verified capability data you can rely on</p>
          </div>
          <div className="trust-card animate-scale-in" style={{animationDelay: '0.3s'}}>
            <div className="trust-card-icon">☁️</div>
            <h3>Supplier-friendly</h3>
            <p>Showcase products and earn a verified badge</p>
          </div>
        </div>
      </section>

      {/* Near You Section */}
      <section className="nearby-section animate-on-scroll">
        <h2>Companies Near You</h2>
        <div className="nearby-cards">
          <div className="homepage-carousel-container">
            <div className="homepage-carousel-slide" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {nearbyCompanies.map((company, index) => (
                <div key={company.id} className="homepage-company-card">
                  {/* Company header - Reference from CompanyDetailPage */}
                  <div className="homepage-card-header-section">
                    <div className="homepage-company-avatar-circle">
                      <img 
                        src={defaultAvatar} 
                        alt={company.name}
                        className="homepage-avatar-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = document.createElement('span');
                          fallback.className = 'homepage-avatar-text';
                          fallback.textContent = company.name?.charAt(0).toUpperCase();
                          e.target.parentNode.appendChild(fallback);
                        }}
                      />
                    </div>
                    <div className="homepage-company-info-section">
                      <h3 className="homepage-company-name-text">{company.name}</h3>
                    </div>
                  </div>

                  {/* Content area */}
                  <div className="homepage-company-card-content">
                    {/* Badge area */}
                    <div className="homepage-badges-section">
                {company.verified && (
                        <div className="homepage-verified-badge">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                          Verified
                        </div>
                      )}
                      <div className="homepage-type-badge">{company.type}</div>
                      <div className="homepage-distance-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>{company.distance}</span>
                      </div>
                    </div>

                    {/* Capability tags */}
                    <div className="homepage-capabilities-section">
                      <div className="homepage-capability-chip">Manufacturing</div>
                      <div className="homepage-capability-chip">Quality Control</div>
                      <div className="homepage-capability-chip more">+2 more</div>
              </div>

                    {/* Bottom button */}
                    <div className="homepage-company-footer">
                    <button 
                      className="homepage-view-details-btn"
                      onClick={() => {
                        const user = JSON.parse(localStorage.getItem('user') || '{}');
                        if (!user.id) {
                          navigate('/login', { 
                            state: { 
                              from: '/',
                              message: 'Please log in to view company details' 
                            } 
                          });
                        } else {
                          navigate(`/company/${company.id}`);
                        }
                      }}
                    >
                      View Details
                    </button>
            </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Carousel controls */}
          <div className="homepage-carousel-controls">
            <button 
              className="homepage-carousel-btn"
              onClick={prevSlide}
              disabled={currentSlide === 0}
            >
              ‹
            </button>
            
            <div className="homepage-page-dots-container">
              {nearbyCompanies.map((_, index) => (
                <div
                  key={index}
                  className={`homepage-compact-page-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
            
            <button 
              className="homepage-carousel-btn"
              onClick={nextSlide}
              disabled={currentSlide === nearbyCompanies.length - 1}
            >
              ›
            </button>
          </div>
        </div>
      </section>

      {/* Combined Background Section */}
      <div className="combined-background-section animate-on-scroll">
      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
              <div className="step-content">
            <h3>Search or Browse</h3>
            <p>Find companies by capability, location, or industry sector</p>
              </div>
              <div className="step-connector"></div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
              <div className="step-content">
            <h3>Filter & Compare</h3>
            <p>Narrow results by distance, size, and verified capabilities</p>
              </div>
              <div className="step-connector"></div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
              <div className="step-content">
            <h3>Connect</h3>
            <p>View detailed profiles and connect with verified suppliers</p>
              </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to find your next supplier?</h2>
          <p>Join thousands of businesses already using ICN Navigator</p>
          <button className="cta-button" onClick={handleGetStarted}>
            Get Started Free
          </button>
          <p className="cta-note">Free tier available • No credit card required</p>
        </div>
      </section>
      </div>
    </div>
  );
}

export default HomePage;