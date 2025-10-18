import React from 'react';
import { useTierAccess } from '../../hooks/useTierAccess';
import { useNavigate } from 'react-router-dom';
import './TierAccessControl.css';

function TierAccessControl({ 
  feature, 
  children, 
  fallback = null,
  showUpgradePrompt = true,
  maskContent = false,
  upgradeMessage = null
}) {
  const { hasAccess, userTier } = useTierAccess();
  const navigate = useNavigate();
  
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
              <button 
                className="upgrade-btn-small"
                onClick={() => navigate('/pricing')}
              >
                Upgrade
              </button>
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
        <div className="restriction-content">
          <span className="lock-icon">🔒</span>
          <p className="restriction-message">
            {upgradeMessage || `This feature requires ${userTier === 'free' ? 'Plus or Premium' : 'Premium'} tier`}
          </p>
          <button 
            className="upgrade-btn"
            onClick={() => navigate('/pricing')}
          >
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default TierAccessControl;
