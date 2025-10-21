import React from 'react';
import cmpInfImage from '../../assets/use_image/cmp_inf.jpg';
import mapPageImage from '../../assets/use_image/map_page.jpg';
import './MobileDesignsPage.css';

function MobileDesignsPage() {
  return (
    <div className="mobile-designs-page">
      <div className="mobile-designs-container">
        {/* Mobile App Previews Container */}
        <div className="mobile-preview-container">
          <div className="mobile-preview">
            <div className="phone-mockup phone-left">
              <div className="phone-screen">
                <img 
                  src={cmpInfImage} 
                  alt="Company Information App Screen" 
                  className="phone-app-image"
                />
              </div>
            </div>
            
            <div className="phone-mockup phone-right">
              <div className="phone-screen">
                <img 
                  src={mapPageImage} 
                  alt="Map Page App Screen" 
                  className="phone-app-image"
                />
              </div>
            </div>
          </div>
          
          {/* App Store Download Buttons */}
          <div className="download-buttons">
            <a href="#" className="download-btn app-store">
              <div className="download-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </div>
              <div className="download-text">
                <div className="download-line1">Download on the</div>
                <div className="download-line2">App Store</div>
              </div>
            </a>
            
            <a href="#" className="download-btn google-play">
              <div className="download-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
              </div>
              <div className="download-text">
                <div className="download-line1">GET IT ON</div>
                <div className="download-line2">Google Play</div>
              </div>
            </a>
          </div>
        </div>

        {/* Content Section */}
        <div className="mobile-content-container">
          <div className="mobile-content-card">
            <div className="mobile-content-header">
              <h1>Mobile Application</h1>
              <p className="mobile-subtitle">
                Take ICN Navigator with you. Browse suppliers, search companies, 
                and manage connections on the go.
              </p>
            </div>

            <div className="features-section">
              <h2>Key Features</h2>
              <div className="features-grid">
                <div className="feature-item">
                  <div className="feature-icon">📱</div>
                  <h3>Native Experience</h3>
                  <p>Smooth, responsive interface built for mobile-first performance</p>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">📍</div>
                  <h3>Location Services</h3>
                  <p>Find suppliers near you with GPS-powered search and real-time mapping</p>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">⚡</div>
                  <h3>Lightning Fast</h3>
                  <p>Optimized for speed with instant search results and smooth scrolling</p>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">🔔</div>
                  <h3>Push Notifications</h3>
                  <p>Stay updated with alerts about new suppliers and opportunities</p>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">💾</div>
                  <h3>Offline Mode</h3>
                  <p>Access your saved companies and bookmarks without internet</p>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">🌙</div>
                  <h3>Dark Mode</h3>
                  <p>Automatic theme switching for comfortable viewing anytime</p>
                </div>
              </div>
            </div>

            <div className="app-specs">
              <h2>Technical Specifications</h2>
              <div className="specs-grid">
                <div className="spec-item">
                  <strong>Platform:</strong>
                  <span>iOS 14+ & Android 8+</span>
                </div>
                <div className="spec-item">
                  <strong>Size:</strong>
                  <span>~50 MB</span>
                </div>
                <div className="spec-item">
                  <strong>Languages:</strong>
                  <span>English</span>
                </div>
                <div className="spec-item">
                  <strong>Updated:</strong>
                  <span>October 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileDesignsPage;