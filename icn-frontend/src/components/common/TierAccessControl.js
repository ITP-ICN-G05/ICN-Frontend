import React from 'react';
import { useTierAccess } from '../../hooks/useTierAccess';
import './TierAccessControl.css';

function TierAccessControl({ 
  feature, 
  children, 
  fallback = null,
  showUpgradePrompt = true,
  maskContent = false 
}) {
  const { hasAccess, userTier } = useTierAccess();
  
  if (hasAccess(feature)) {
    return children;
  }

  if (maskContent) {
    return (
      <div className="tier-masked-content">
        <div className="masked-overlay">
          {showUpgradePrompt && (
            <div className="upgrade-hint">
              <span className="lock-icon">🔒</span>
              <span>Upgrade to view</span>
            </div>
          )}
        </div>
        <div className="masked-text">••••••••</div>
      </div>
    );
  }

  if (fallback) {
    return fallback;
  }

  if (showUpgradePrompt) {
    return (
      <div className="tier-restricted">
        <span className="restriction-message">
          Available in {getRequiredTier(feature)} tier
        </span>
      </div>
    );
  }

  return null;
}

const getRequiredTier = (feature) => {
  const tierFeatures = {
    COMPANY_ABN: 'Plus',
    COMPANY_REVENUE: 'Premium',
    COMPANY_EMPLOYEES: 'Premium',
    COMPANY_OWNERSHIP: 'Premium',
    ADVANCED_SEARCH: 'Plus',
    API_ACCESS: 'Premium',
  };
  return tierFeatures[feature] || 'Premium';
};

export default TierAccessControl;