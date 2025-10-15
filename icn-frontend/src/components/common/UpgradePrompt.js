import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTierAccess } from '../../hooks/useTierAccess';
import './UpgradePrompt.css';

function UpgradePrompt({ 
  feature, 
  message = "Upgrade to access this feature",
  compact = false 
}) {
  const navigate = useNavigate();
  const { userTier, canUpgrade } = useTierAccess();

  if (!canUpgrade()) return null;

  const handleUpgradeClick = () => {
    navigate('/pricing');
  };

  if (compact) {
    return (
      <button 
        className="upgrade-prompt-compact"
        onClick={handleUpgradeClick}
      >
        🔒 Upgrade
      </button>
    );
  }

  return (
    <div className="upgrade-prompt">
      <div className="upgrade-prompt-content">
        <div className="upgrade-icon">⬆️</div>
        <div className="upgrade-text">
          <h3>Upgrade Your Plan</h3>
          <p>{message}</p>
          <p className="current-tier">
            Current plan: <strong>{userTier}</strong>
          </p>
        </div>
      </div>
      <button 
        className="upgrade-btn"
        onClick={handleUpgradeClick}
      >
        View Plans
      </button>
    </div>
  );
}

export default UpgradePrompt;