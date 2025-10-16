import React, { useState } from 'react';
import './IllustrationsPage.css';

function IllustrationsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedIllustration, setSelectedIllustration] = useState(null);

  const categories = [
    { id: 'all', name: 'All', count: 24 },
    { id: 'hero', name: 'Hero Images', count: 6 },
    { id: 'icons', name: 'Icons', count: 8 },
    { id: 'patterns', name: 'Patterns', count: 4 },
    { id: 'backgrounds', name: 'Backgrounds', count: 6 }
  ];

  const illustrations = [
    {
      id: 1,
      title: 'Network Connections',
      category: 'hero',
      description: 'Interconnected nodes representing supplier network',
      colors: ['#F99F1C', '#003366', '#B6D289']
    },
    {
      id: 2,
      title: 'Location Pin',
      category: 'icons',
      description: 'Map marker for company locations',
      colors: ['#F99F1C', '#FEECD2']
    },
    {
      id: 3,
      title: 'Search Pattern',
      category: 'patterns',
      description: 'Abstract search visualization',
      colors: ['#003366', '#F99F1C', '#FFFFFF']
    },
    {
      id: 4,
      title: 'Wave Background',
      category: 'backgrounds',
      description: 'Flowing waves for section backgrounds',
      colors: ['#FEECD2', '#F99F1C']
    },
    {
      id: 5,
      title: 'Company Building',
      category: 'hero',
      description: 'Isometric office building illustration',
      colors: ['#003366', '#B6D289', '#F99F1C']
    },
    {
      id: 6,
      title: 'Verified Badge',
      category: 'icons',
      description: 'Verification checkmark icon',
      colors: ['#B6D289', '#FFFFFF']
    }
  ];

  const filteredIllustrations = activeCategory === 'all' 
    ? illustrations 
    : illustrations.filter(ill => ill.category === activeCategory);

  return (
    <div className="illustrations-page">
      {/* Hero Section */}
      <section className="illustrations-hero">
        <div className="container">
          <div className="hero-content">
            <h1>Illustrations & Graphics</h1>
            <p className="hero-subtitle">
              Custom illustrations and visual elements that bring the ICN Navigator experience to life
            </p>
          </div>
          <div className="hero-illustration">
            <svg viewBox="0 0 400 300" className="hero-svg">
              <circle cx="100" cy="150" r="60" fill="#FEECD2" opacity="0.8"/>
              <rect x="150" y="100" width="100" height="100" fill="#F99F1C" opacity="0.6" transform="rotate(15 200 150)"/>
              <polygon points="300,150 350,100 350,200" fill="#003366" opacity="0.7"/>
              <circle cx="320" cy="180" r="40" fill="#B6D289" opacity="0.6"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="filter-section">
        <div className="container">
          <div className="filter-tabs">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`filter-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
                <span className="count">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Illustrations Grid */}
      <section className="illustrations-grid-section">
        <div className="container">
          <div className="illustrations-grid">
            {filteredIllustrations.map(ill => (
              <div
                key={ill.id}
                className="illustration-card"
                onClick={() => setSelectedIllustration(ill)}
              >
                <div className="illustration-preview">
                  <svg viewBox="0 0 200 150" className="preview-svg">
                    {ill.category === 'hero' && (
                      <>
                        <rect x="20" y="30" width="160" height="90" fill={ill.colors[0]} opacity="0.8" rx="8"/>
                        <circle cx="60" cy="75" r="25" fill={ill.colors[1]}/>
                        <rect x="100" y="60" width="60" height="30" fill={ill.colors[2]} opacity="0.7"/>
                      </>
                    )}
                    {ill.category === 'icons' && (
                      <circle cx="100" cy="75" r="40" fill={ill.colors[0]}/>
                    )}
                    {ill.category === 'patterns' && (
                      <>
                        <rect x="0" y="0" width="50" height="50" fill={ill.colors[0]} opacity="0.3"/>
                        <rect x="50" y="50" width="50" height="50" fill={ill.colors[1]} opacity="0.3"/>
                        <rect x="100" y="0" width="50" height="50" fill={ill.colors[0]} opacity="0.3"/>
                        <rect x="150" y="50" width="50" height="50" fill={ill.colors[1]} opacity="0.3"/>
                        <rect x="0" y="100" width="50" height="50" fill={ill.colors[0]} opacity="0.3"/>
                        <rect x="50" y="100" width="50" height="50" fill={ill.colors[2]} opacity="0.3"/>
                      </>
                    )}
                    {ill.category === 'backgrounds' && (
                      <path d={`M 0 75 Q 50 ${50 + Math.random() * 50} 100 75 T 200 75 L 200 150 L 0 150 Z`} 
                            fill={ill.colors[0]} opacity="0.6"/>
                    )}
                  </svg>
                </div>
                <div className="illustration-info">
                  <h3>{ill.title}</h3>
                  <p>{ill.description}</p>
                  <div className="color-palette">
                    {ill.colors.map((color, index) => (
                      <span
                        key={index}
                        className="color-swatch"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Style Guide Section */}
      <section className="style-guide">
        <div className="container">
          <h2>Visual Style Guide</h2>
          <div className="style-grid">
            <div className="style-card">
              <h3>Color Palette</h3>
              <div className="colors-list">
                <div className="color-item">
                  <div className="color-box" style={{ background: '#F99F1C' }}></div>
                  <div className="color-info">
                    <span className="color-name">Primary Orange</span>
                    <span className="color-code">#F99F1C</span>
                  </div>
                </div>
                <div className="color-item">
                  <div className="color-box" style={{ background: '#003366' }}></div>
                  <div className="color-info">
                    <span className="color-name">Navy</span>
                    <span className="color-code">#003366</span>
                  </div>
                </div>
                <div className="color-item">
                  <div className="color-box" style={{ background: '#B6D289' }}></div>
                  <div className="color-info">
                    <span className="color-name">Success Green</span>
                    <span className="color-code">#B6D289</span>
                  </div>
                </div>
                <div className="color-item">
                  <div className="color-box" style={{ background: '#FEECD2' }}></div>
                  <div className="color-info">
                    <span className="color-name">Light Orange</span>
                    <span className="color-code">#FEECD2</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="style-card">
              <h3>Typography</h3>
              <div className="typography-samples">
                <div className="type-sample">
                  <h1 className="heading-1">Heading 1</h1>
                  <p className="type-specs">48px / Bold / #003366</p>
                </div>
                <div className="type-sample">
                  <h2 className="heading-2">Heading 2</h2>
                  <p className="type-specs">32px / Semi-bold / #003366</p>
                </div>
                <div className="type-sample">
                  <p className="body-text">Body text sample</p>
                  <p className="type-specs">16px / Regular / #333333</p>
                </div>
              </div>
            </div>

            <div className="style-card">
              <h3>Spacing System</h3>
              <div className="spacing-samples">
                <div className="spacing-item">
                  <div className="spacing-box" style={{ width: '8px', height: '8px' }}></div>
                  <span>8px</span>
                </div>
                <div className="spacing-item">
                  <div className="spacing-box" style={{ width: '16px', height: '16px' }}></div>
                  <span>16px</span>
                </div>
                <div className="spacing-item">
                  <div className="spacing-box" style={{ width: '24px', height: '24px' }}></div>
                  <span>24px</span>
                </div>
                <div className="spacing-item">
                  <div className="spacing-box" style={{ width: '32px', height: '32px' }}></div>
                  <span>32px</span>
                </div>
                <div className="spacing-item">
                  <div className="spacing-box" style={{ width: '48px', height: '48px' }}></div>
                  <span>48px</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="download-section">
        <div className="container">
          <h2>Download Assets</h2>
          <p>Get our complete illustration pack and brand guidelines</p>
          <div className="download-buttons">
            <button className="download-btn">
              <span className="icon">📦</span>
              <span>Illustration Pack</span>
              <span className="format">SVG & PNG</span>
            </button>
            <button className="download-btn">
              <span className="icon">📘</span>
              <span>Brand Guidelines</span>
              <span className="format">PDF</span>
            </button>
            <button className="download-btn">
              <span className="icon">🎨</span>
              <span>Figma Library</span>
              <span className="format">FIGMA</span>
            </button>
          </div>
        </div>
      </section>

      {/* Modal for selected illustration */}
      {selectedIllustration && (
        <div className="illustration-modal" onClick={() => setSelectedIllustration(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedIllustration(null)}>×</button>
            <h2>{selectedIllustration.title}</h2>
            <p>{selectedIllustration.description}</p>
            <div className="modal-illustration">
              <svg viewBox="0 0 400 300" className="modal-svg">
                {/* Larger version of the illustration */}
                <rect x="50" y="50" width="300" height="200" fill={selectedIllustration.colors[0]} opacity="0.8" rx="12"/>
                <circle cx="200" cy="150" r="60" fill={selectedIllustration.colors[1]}/>
              </svg>
            </div>
            <div className="modal-actions">
              <button className="action-btn">Download SVG</button>
              <button className="action-btn">Download PNG</button>
              <button className="action-btn">Copy Code</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IllustrationsPage;