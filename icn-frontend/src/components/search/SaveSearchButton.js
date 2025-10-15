import React, { useState } from 'react';
import { useSavedSearches } from '../../hooks/useSavedSearches';
import { useTierAccess } from '../../hooks/useTierAccess';
import SavedSearchModal from './SavedSearchModal';
import './SaveSearchButton.css';

function SaveSearchButton({ searchParams, resultCount }) {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { saveSearch, canSaveSearch, quota } = useSavedSearches();
  const { userTier } = useTierAccess();

  const handleSaveClick = () => {
    if (userTier === 'free') {
      alert('Upgrade to Plus or Premium to save searches');
      return;
    }
    
    if (!canSaveSearch()) {
      alert(`You've reached your saved search limit (${quota.limit})`);
      return;
    }
    
    setShowModal(true);
  };

  const handleSaveSearch = async (searchData) => {
    setSaving(true);
    try {
      await saveSearch({
        ...searchData,
        params: searchParams,
        resultCount,
        createdAt: new Date().toISOString()
      });
      setShowModal(false);
      alert('Search saved successfully!');
    } catch (error) {
      alert(`Failed to save search: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button 
        className="save-search-btn"
        onClick={handleSaveClick}
        disabled={saving}
      >
        {saving ? 'Saving...' : '💾 Save Search'}
      </button>
      
      {showModal && (
        <SavedSearchModal
          onSave={handleSaveSearch}
          onClose={() => setShowModal(false)}
          defaultQuery={searchParams.query || ''}
          filters={searchParams.filters || {}}
          resultCount={resultCount}
        />
      )}
    </>
  );
}

export default SaveSearchButton;