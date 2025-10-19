import React from 'react';
import './CompanyCard.css';

function CompanyCard({ company, onClick }) {
  return (
    <div className="company-card-search" onClick={onClick}>
      <div className="company-card-header">
        <div className="company-info">
          <h3 className="company-name">
            {company.name}
            {company.verified && <span className="verified-icon" title="Verified">✓</span>}
          </h3>
          <div className="company-meta">
            <span className="company-type">{company.type}</span>
            <span className="separator">•</span>
            <span className="company-size">{company.employees} employees</span>
            <span className="separator">•</span>
            <span className="company-distance">📍 {company.distance} km</span>
          </div>
        </div>
      </div>
      
      <p className="company-description">{company.description}</p>
      
      <div className="company-tags">
        <div className="tag-group">
          <span className="tag-label">Sectors:</span>
          {(company.sectors || []).map(sector => (
            <span key={sector} className="tag">{sector}</span>
          ))}
        </div>
        <div className="tag-group">
          <span className="tag-label">Capabilities:</span>
          {(company.capabilities || []).slice(0, 3).map(capability => (
            <span key={capability} className="tag">{capability}</span>
          ))}
        </div>
      </div>
      
      {(company.ownership || []).length > 0 && (
        <div className="company-ownership">
          {(company.ownership || []).map(own => (
            <span key={own} className="ownership-badge">{own}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default CompanyCard;