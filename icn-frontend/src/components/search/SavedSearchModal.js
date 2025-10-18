import React, { useState } from 'react';
import './SavedSearchModal.css';

function SavedSearchModal({ 
  onSave, 
  onClose, 
  defaultQuery, 
  filters, 
  resultCount,
  saving = false 
}) {
  const [formData, setFormData] = useState({
    name: defaultQuery ? `Search: ${defaultQuery}` : 'My Search',
    description: '',
    enableAlerts: false,
    alertFrequency: 'daily'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a name for your saved search');
      return;
    }
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="modal-overlay" onClick={saving ? null : onClose}>
      <div className="saved-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Save Search</h2>
          <button className="close-btn" onClick={onClose} disabled={saving}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="search-summary">
              <p className="result-count">{resultCount} results found</p>
              {Object.entries(filters || {}).length > 0 && (
                <div className="active-filters">
                  <strong>Active filters:</strong>
                  <div className="filter-tags">
                    {Object.entries(filters).map(([key, value]) => (
                      value && value.length > 0 && (
                        <span key={key} className="filter-tag">
                          {key}: {Array.isArray(value) ? value.join(', ') : value}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="name">Search Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter a name for this search"
                required
                disabled={saving}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add notes about this search (optional)"
                rows="3"
                disabled={saving}
              />
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="enableAlerts"
                  checked={formData.enableAlerts}
                  onChange={handleChange}
                  disabled={saving}
                />
                <span>Enable email alerts for new matches</span>
              </label>
            </div>
            
            {formData.enableAlerts && (
              <div className="form-group">
                <label htmlFor="alertFrequency">Alert Frequency</label>
                <select
                  id="alertFrequency"
                  name="alertFrequency"
                  value={formData.alertFrequency}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="instant">Instant</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-save"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Search'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SavedSearchModal;
