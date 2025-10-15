import React, { useState } from 'react';
import './MobileDesignsPage.css';

function MobileDesignsPage() {
  const [activeScreen, setActiveScreen] = useState('home');
  const [deviceType, setDeviceType] = useState('iphone');

  const screens = [
    { id: 'home', name: 'Home Screen', icon: '🏠' },
    { id: 'search', name: 'Search', icon: '🔍' },
    { id: 'company', name: 'Company Detail', icon: '🏢' },
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'bookmarks', name: 'Bookmarks', icon: '⭐' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  const renderMobileScreen = () => {
    switch(activeScreen) {
      case 'home':
        return (
          <div className="mobile-screen home-screen">
            <div className="status-bar">
              <span>9:41</span>
              <div className="status-icons">
                <span>📶</span>
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>
            <div className="app-header">
              <h1>ICN Navigator</h1>
              <button className="menu-btn">☰</button>
            </div>
            <div className="search-bar-mobile">
              <input type="text" placeholder="Search companies..." />
              <button>🔍</button>
            </div>
            <div className="quick-filters">
              <button className="filter-chip active">Near Me</button>
              <button className="filter-chip">Verified</button>
              <button className="filter-chip">Manufacturers</button>
            </div>
            <div className="company-cards">
              <div className="company-card-mobile">
                <h3>TechCorp Industries</h3>
                <p>📍 2.3km • Manufacturing</p>
                <span className="verified">✓ Verified</span>
              </div>
              <div className="company-card-mobile">
                <h3>Global Supply Co</h3>
                <p>📍 4.1km • Logistics</p>
                <span className="verified">✓ Verified</span>
              </div>
            </div>
            <div className="bottom-nav">
              <button className="nav-item active">🏠</button>
              <button className="nav-item">🔍</button>
              <button className="nav-item">➕</button>
              <button className="nav-item">⭐</button>
              <button className="nav-item">👤</button>
            </div>
          </div>
        );
      
      case 'search':
        return (
          <div className="mobile-screen search-screen">
            <div className="status-bar">
              <span>9:41</span>
              <div className="status-icons">
                <span>📶</span>
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>
            <div className="search-header">
              <button className="back-btn">‹</button>
              <input type="text" placeholder="Search..." className="search-input-mobile" />
              <button className="filter-btn">⚙️</button>
            </div>
            <div className="search-results-mobile">
              <div className="result-item">
                <div className="result-icon">🏭</div>
                <div className="result-info">
                  <h4>Manufacturing</h4>
                  <p>156 companies</p>
                </div>
              </div>
              <div className="result-item">
                <div className="result-icon">📦</div>
                <div className="result-info">
                  <h4>Suppliers</h4>
                  <p>89 companies</p>
                </div>
              </div>
              <div className="result-item">
                <div className="result-icon">🔧</div>
                <div className="result-info">
                  <h4>Services</h4>
                  <p>245 companies</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'company':
        return (
          <div className="mobile-screen company-screen">
            <div className="status-bar">
              <span>9:41</span>
              <div className="status-icons">
                <span>📶</span>
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>
            <div className="company-header-mobile">
              <button className="back-btn">‹</button>
              <button className="share-btn">↗</button>
            </div>
            <div className="company-hero">
              <div className="company-logo">TC</div>
              <h2>TechCorp Industries</h2>
              <span className="verified-badge">✓ Verified</span>
            </div>
            <div className="company-actions-mobile">
              <button className="action-btn primary">Contact</button>
              <button className="action-btn">Bookmark</button>
            </div>
            <div className="company-tabs-mobile">
              <button className="tab active">About</button>
              <button className="tab">Products</button>
              <button className="tab">Contact</button>
            </div>
            <div className="company-content-mobile">
              <div className="info-section">
                <h3>Overview</h3>
                <p>Leading manufacturer of electronic components and industrial equipment.</p>
              </div>
              <div className="info-section">
                <h3>Capabilities</h3>
                <div className="capability-tags">
                  <span className="tag">Manufacturing</span>
                  <span className="tag">Assembly</span>
                  <span className="tag">Design</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'profile':
        return (
          <div className="mobile-screen profile-screen">
            <div className="status-bar">
              <span>9:41</span>
              <div className="status-icons">
                <span>📶</span>
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>
            <div className="profile-header-mobile">
              <h2>Profile</h2>
              <button className="edit-btn">Edit</button>
            </div>
            <div className="profile-card">
              <div className="avatar">JS</div>
              <h3>John Smith</h3>
              <p>john.smith@company.com</p>
              <span className="tier-badge">Free Account</span>
            </div>
            <div className="profile-menu">
              <button className="menu-item">
                <span>🏢</span>
                <span>My Company</span>
                <span>›</span>
              </button>
              <button className="menu-item">
                <span>⭐</span>
                <span>Bookmarks</span>
                <span>›</span>
              </button>
              <button className="menu-item">
                <span>🔍</span>
                <span>Saved Searches</span>
                <span>›</span>
              </button>
              <button className="menu-item">
                <span>💎</span>
                <span>Upgrade Plan</span>
                <span>›</span>
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="mobile-designs-page">
      {/* Hero Section */}
      <section className="mobile-hero">
        <div className="container">
          <h1>Mobile Designs</h1>
          <p className="hero-subtitle">
            Responsive and native mobile experiences optimized for on-the-go supplier discovery
          </p>
        </div>
      </section>

      {/* Device Showcase */}
      <section className="device-showcase">
        <div className="container">
          <div className="showcase-controls">
            <div className="device-selector">
              <button 
                className={`device-btn ${deviceType === 'iphone' ? 'active' : ''}`}
                onClick={() => setDeviceType('iphone')}
              >
                iPhone 14
              </button>
              <button 
                className={`device-btn ${deviceType === 'android' ? 'active' : ''}`}
                onClick={() => setDeviceType('android')}
              >
                Android
              </button>
              <button 
                className={`device-btn ${deviceType === 'tablet' ? 'active' : ''}`}
                onClick={() => setDeviceType('tablet')}
              >
                Tablet
              </button>
            </div>
          </div>

          <div className="showcase-content">
            <div className="screens-sidebar">
              <h3>Screens</h3>
              <div className="screens-list">
                {screens.map(screen => (
                  <button
                    key={screen.id}
                    className={`screen-btn ${activeScreen === screen.id ? 'active' : ''}`}
                    onClick={() => setActiveScreen(screen.id)}
                  >
                    <span className="screen-icon">{screen.icon}</span>
                    <span>{screen.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="device-container">
              <div className={`device-frame ${deviceType}`}>
                <div className="device-notch"></div>
                <div className="device-screen">
                  {renderMobileScreen()}
                </div>
                <div className="device-home-indicator"></div>
              </div>
            </div>

            <div className="features-sidebar">
              <h3>Key Features</h3>
              <ul className="features-list">
                <li>✨ Gesture Navigation</li>
                <li>📍 Location-Based Search</li>
                <li>🔔 Push Notifications</li>
                <li>💾 Offline Mode</li>
                <li>🌙 Dark Mode Support</li>
                <li>📱 Native Performance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* App Store Section */}
      <section className="app-store-section">
        <div className="container">
          <h2>Download Our Mobile App</h2>
          <p>Available on iOS and Android</p>
          <div className="store-buttons">
            <button className="store-btn apple">
              <span className="store-icon">🍎</span>
              <div className="store-text">
                <span className="small">Download on the</span>
                <span className="large">App Store</span>
              </div>
            </button>
            <button className="store-btn google">
              <span className="store-icon">▶️</span>
              <div className="store-text">
                <span className="small">Get it on</span>
                <span className="large">Google Play</span>
              </div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default MobileDesignsPage;