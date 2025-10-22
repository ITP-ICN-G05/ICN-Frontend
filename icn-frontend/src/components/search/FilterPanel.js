// FilterPanel.js - Enhanced with custom dropdown and all tier filters
import React from 'react';
import { useTierAccess } from '../../hooks/useTierAccess';
import './FilterPanel.css';

function FilterPanel({ filters, onFilterChange, onClearFilters, collapsedSections, onToggleSection, hideHeader = false }) {
  const { hasAccess } = useTierAccess();
  const [stateDropdownOpen, setStateDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  
  // Filter options
  const sectors = ['Technology', 'Manufacturing', 'Services', 'Logistics', 'Environment', 'Automotive'];
  const capabilities = ['Manufacturing', 'Supply Chain', 'Design', 'Assembly', 'Distribution', 'Maintenance'];
  const companySizes = ['Small', 'Medium', 'Large'];
  const companyTypes = ['Supplier', 'Manufacturer', 'Service Provider', 'Assembler'];
  const ownershipTypes = ['Female-owned', 'First Nations-owned', 'Social Enterprise', 'Australian Disability Enterprise'];
  const certifications = ['ISO 9001', 'ISO 14001', 'AS/NZS 4801', 'Quality Assurance'];
  const states = ['All', 'VIC', 'NSW', 'QLD', 'SA', 'WA', 'NT', 'TAS', 'ACT', 'SI', 'NI'];

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setStateDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCheckboxChange = (category, value) => {
    // Check access for premium features
    if (category === 'ownership' && !hasAccess('DEMOGRAPHIC_FILTERS')) {
      alert('Demographic filters require Premium tier. Upgrade to access this feature.');
      return;
    }
    
    if (category === 'certifications' && !hasAccess('ADVANCED_FILTERS')) {
      alert('Certification filters require Plus tier. Upgrade to access this feature.');
      return;
    }

    const currentValues = filters[category];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFilterChange({
      ...filters,
      [category]: newValues
    });
  };

  const handleSingleChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const handleRangeChange = (key, field, value) => {
    onFilterChange({
      ...filters,
      [key]: {
        ...filters[key],
        [field]: parseInt(value) || 0
      }
    });
  };

  const handleStateSelect = (state) => {
    handleSingleChange('state', state === 'All' ? '' : state);
    setStateDropdownOpen(false);
  };

  const getStateLabel = () => {
    return filters.state || 'All';
  };

  return (
    <div className="filter-panel">
      {!hideHeader && (
        <div className="filter-header">
          <h3>Filters</h3>
          <button className="clear-filters-btn" onClick={onClearFilters}>
            Clear All
          </button>
        </div>
      )}

      {/* Basic Filters - All Tiers */}
      
      {/* Distance Filter */}
      <div className="filter-group">
        <h4>Distance</h4>
        <div className="distance-slider">
          <input
            type="range"
            min="1"
            max="100"
            value={filters.distance}
            onChange={(e) => handleSingleChange('distance', parseInt(e.target.value))}
          />
          <span className="distance-value">{filters.distance} km</span>
        </div>
      </div>

      {/* Verified Filter */}
      <div className="filter-group">
        <label className="checkbox-item">
          <input
            type="checkbox"
            checked={filters.verified}
            onChange={(e) => handleSingleChange('verified', e.target.checked)}
          />
          <span>Verified Companies Only</span>
        </label>
      </div>

      {/* State Filter - Custom Dropdown */}
      <div className="filter-group">
        <h4 className="filter-group-header" onClick={() => onToggleSection('state')}>
          State/Territory
          <span className="collapse-icon">{collapsedSections?.state ? '▼' : '▲'}</span>
        </h4>
        {!collapsedSections?.state && (
          <div className={`custom-dropdown ${stateDropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
            <button 
              className="custom-dropdown-toggle"
              onClick={() => setStateDropdownOpen(!stateDropdownOpen)}
              type="button"
            >
              <span className="dropdown-label">{getStateLabel()}</span>
              <svg 
                className={`dropdown-arrow ${stateDropdownOpen ? 'open' : ''}`} 
                width="12" 
                height="12" 
                viewBox="0 0 12 12"
              >
                <path fill="currentColor" d="M6 9L1 4h10z"/>
              </svg>
            </button>
            
            {stateDropdownOpen && (
              <div className="custom-dropdown-menu">
                {states.map(state => (
                  <div
                    key={state}
                    className={`dropdown-item ${getStateLabel() === state ? 'active' : ''}`}
                    onClick={() => handleStateSelect(state)}
                  >
                    <span>{state}</span>
                    {getStateLabel() === state && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path 
                          d="M13.3 4.7L6 12l-3.3-3.3" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Company Type Filter */}
      <div className="filter-group">
        <h4 className="filter-group-header" onClick={() => onToggleSection('companyTypes')}>
          Company Type
          <span className="collapse-icon">{collapsedSections?.companyTypes ? '▼' : '▲'}</span>
        </h4>
        {!collapsedSections?.companyTypes && (
          <div className="checkbox-list">
            {companyTypes.map(type => (
              <label key={type} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={filters.companyTypes.includes(type)}
                  onChange={() => handleCheckboxChange('companyTypes', type)}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Sectors Filter */}
      <div className="filter-group">
        <h4 className="filter-group-header" onClick={() => onToggleSection('sectors')}>
          Sectors
          <span className="collapse-icon">{collapsedSections?.sectors ? '▼' : '▲'}</span>
        </h4>
        {!collapsedSections?.sectors && (
          <div className="checkbox-list">
            {sectors.map(sector => (
              <label key={sector} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={filters.sectors.includes(sector)}
                  onChange={() => handleCheckboxChange('sectors', sector)}
                />
                <span>{sector}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Capabilities Filter */}
      <div className="filter-group">
        <h4 className="filter-group-header" onClick={() => onToggleSection('capabilities')}>
          Capabilities
          <span className="collapse-icon">{collapsedSections?.capabilities ? '▼' : '▲'}</span>
        </h4>
        {!collapsedSections?.capabilities && (
          <div className="checkbox-list">
            {capabilities.map(capability => (
              <label key={capability} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={filters.capabilities.includes(capability)}
                  onChange={() => handleCheckboxChange('capabilities', capability)}
                />
                <span>{capability}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Plus Tier Filters */}
      
      {/* Company Size Filter */}
      <div className="filter-group">
        <h4 className="filter-group-header" onClick={() => onToggleSection('size')}>
          Company Size
          {!hasAccess('ADVANCED_FILTERS') && (
            <span className="premium-badge">Plus</span>
          )}
          <span className="collapse-icon">{collapsedSections?.size ? '▼' : '▲'}</span>
        </h4>
        {!collapsedSections?.size && (
          <div className={`radio-list ${!hasAccess('ADVANCED_FILTERS') ? 'disabled' : ''}`}>
            {companySizes.map(size => (
              <label key={size} className="radio-item">
                <input
                  type="radio"
                  name="companySize"
                  checked={filters.size === size}
                  onChange={() => handleSingleChange('size', size)}
                  disabled={!hasAccess('ADVANCED_FILTERS')}
                />
                <span>{size}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Certifications Filter */}
      <div className="filter-group">
        <h4 className="filter-group-header" onClick={() => onToggleSection('certifications')}>
          Certifications
          {!hasAccess('ADVANCED_FILTERS') && (
            <span className="premium-badge">Plus</span>
          )}
          <span className="collapse-icon">{collapsedSections?.certifications ? '▼' : '▲'}</span>
        </h4>
        {!collapsedSections?.certifications && (
          <>
            <div className={`checkbox-list ${!hasAccess('ADVANCED_FILTERS') ? 'disabled' : ''}`}>
              {certifications.map(cert => (
                <label key={cert} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={filters.certifications.includes(cert)}
                    onChange={() => handleCheckboxChange('certifications', cert)}
                    disabled={!hasAccess('ADVANCED_FILTERS')}
                  />
                  <span>{cert}</span>
                </label>
              ))}
            </div>
            {!hasAccess('ADVANCED_FILTERS') && (
              <p className="upgrade-hint">Upgrade to Plus to filter by certifications</p>
            )}
          </>
        )}
      </div>

      {/* Premium Tier Filters */}
      
      {/* Ownership Filter */}
      <div className="filter-group">
        <h4 className="filter-group-header" onClick={() => onToggleSection('ownership')}>
          Ownership & Diversity
          {!hasAccess('DEMOGRAPHIC_FILTERS') && (
            <span className="premium-badge">Premium</span>
          )}
          <span className="collapse-icon">{collapsedSections?.ownership ? '▼' : '▲'}</span>
        </h4>
        {!collapsedSections?.ownership && (
          <>
            <div className={`checkbox-list ${!hasAccess('DEMOGRAPHIC_FILTERS') ? 'disabled' : ''}`}>
              {ownershipTypes.map(type => (
                <label key={type} className={`checkbox-item ${!hasAccess('DEMOGRAPHIC_FILTERS') ? 'disabled' : ''}`}>
                  <input
                    type="checkbox"
                    checked={filters.ownership.includes(type)}
                    onChange={() => handleCheckboxChange('ownership', type)}
                    disabled={!hasAccess('DEMOGRAPHIC_FILTERS')}
                  />
                  <span>{type}</span>
                </label>
              ))}
              <label className={`checkbox-item ${!hasAccess('DEMOGRAPHIC_FILTERS') ? 'disabled' : ''}`}>
                <input
                  type="checkbox"
                  checked={filters.socialEnterprise}
                  onChange={(e) => handleSingleChange('socialEnterprise', e.target.checked)}
                  disabled={!hasAccess('DEMOGRAPHIC_FILTERS')}
                />
                <span>Social Enterprise Only</span>
              </label>
              <label className={`checkbox-item ${!hasAccess('DEMOGRAPHIC_FILTERS') ? 'disabled' : ''}`}>
                <input
                  type="checkbox"
                  checked={filters.australianDisability}
                  onChange={(e) => handleSingleChange('australianDisability', e.target.checked)}
                  disabled={!hasAccess('DEMOGRAPHIC_FILTERS')}
                />
                <span>Australian Disability Enterprise</span>
              </label>
            </div>
            {!hasAccess('DEMOGRAPHIC_FILTERS') && (
              <p className="upgrade-hint">Upgrade to Premium to filter by ownership type</p>
            )}
          </>
        )}
      </div>

      {/* Financial Filters */}
      <div className="filter-group">
        <h4 className="filter-group-header" onClick={() => onToggleSection('financial')}>
          Financial & Scale
          {!hasAccess('COMPANY_REVENUE') && (
            <span className="premium-badge">Premium</span>
          )}
          <span className="collapse-icon">{collapsedSections?.financial ? '▼' : '▲'}</span>
        </h4>
        {!collapsedSections?.financial && (
          <>
            {hasAccess('COMPANY_REVENUE') ? (
              <div className="financial-filters">
                {/* Revenue Range */}
                <div className="range-filter">
                  <label>Annual Revenue (AUD)</label>
                  <div className="range-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.revenue.min}
                      onChange={(e) => handleRangeChange('revenue', 'min', e.target.value)}
                      className="range-input"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.revenue.max}
                      onChange={(e) => handleRangeChange('revenue', 'max', e.target.value)}
                      className="range-input"
                    />
                  </div>
                </div>

                {/* Employee Count Range */}
                <div className="range-filter">
                  <label>Employee Count</label>
                  <div className="range-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.employeeCount.min}
                      onChange={(e) => handleRangeChange('employeeCount', 'min', e.target.value)}
                      className="range-input"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.employeeCount.max}
                      onChange={(e) => handleRangeChange('employeeCount', 'max', e.target.value)}
                      className="range-input"
                    />
                  </div>
                </div>

                {/* Local Content Percentage */}
                <div className="range-filter">
                  <label>Min Local Content %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.localContentPercentage}
                    onChange={(e) => handleSingleChange('localContentPercentage', parseInt(e.target.value))}
                    className="range-input"
                  />
                </div>
              </div>
            ) : (
              <p className="upgrade-hint">Upgrade to Premium to access financial filters</p>
            )}
          </>
        )}
      </div>

    </div>
  );
}

export default FilterPanel;