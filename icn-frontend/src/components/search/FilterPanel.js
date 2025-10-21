import React from 'react';
import { useTierAccess } from '../../hooks/useTierAccess';
import './FilterPanel.css';

function FilterPanel({ filters, onFilterChange, onClearFilters, collapsedSections, onToggleSection, hideHeader = false }) {
  const { hasAccess } = useTierAccess();
  const sectors = ['Technology', 'Manufacturing', 'Services', 'Logistics', 'Environment', 'Automotive'];
  const capabilities = ['Manufacturing', 'Supply Chain', 'Design', 'Assembly', 'Distribution', 'Maintenance'];
  const companySizes = ['Small', 'Medium', 'Large'];
  const ownershipTypes = ['Female-owned', 'First Nations-owned', 'Social Enterprise', 'Australian Disability Enterprise'];

  const handleCheckboxChange = (category, value) => {
    // Check access for premium features
    if (category === 'ownership' && !hasAccess('DEMOGRAPHIC_FILTERS')) {
      alert('Demographic filters require Premium tier. Upgrade to access this feature.');
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

      {/* Distance Filter */}
      <div className="filter-group">
        <h4>Distance</h4>
        <div className="distance-slider">
          <input
            type="range"
            min="1"
            max="100"
            value={filters.distance}
            onChange={(e) => onFilterChange({ ...filters, distance: parseInt(e.target.value) })}
          />
          <span className="distance-value">{filters.distance} km</span>
        </div>
      </div>

      {/* Verified Filter - 移到上面 */}
      <div className="filter-group">
        <label className="checkbox-item">
          <input
            type="checkbox"
            checked={filters.verified}
            onChange={(e) => onFilterChange({ ...filters, verified: e.target.checked })}
          />
          <span>Verified Companies Only</span>
        </label>
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

      {/* Company Size Filter */}
      <div className="filter-group">
        <h4 className="filter-group-header" onClick={() => onToggleSection('size')}>
          Company Size
          <span className="collapse-icon">{collapsedSections?.size ? '▼' : '▲'}</span>
        </h4>
        {!collapsedSections?.size && (
          <div className="radio-list">
            {companySizes.map(size => (
              <label key={size} className="radio-item">
                <input
                  type="radio"
                  name="companySize"
                  checked={filters.size === size}
                  onChange={() => onFilterChange({ ...filters, size })}
                />
                <span>{size}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Ownership Filter (Premium) */}
      <div className="filter-group">
        <h4 className="filter-group-header" onClick={() => onToggleSection('ownership')}>
          Ownership 
          {!hasAccess('DEMOGRAPHIC_FILTERS') && (
            <span className="premium-badge">Premium</span>
          )}
          <span className="collapse-icon">{collapsedSections?.ownership ? '▼' : '▲'}</span>
        </h4>
        {!collapsedSections?.ownership && (
          <>
            <div className="checkbox-list">
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
            </div>
            {!hasAccess('DEMOGRAPHIC_FILTERS') && (
              <p className="upgrade-hint">Upgrade to Premium to filter by ownership type</p>
            )}
          </>
        )}
      </div>

    </div>
  );
}

export default FilterPanel;
