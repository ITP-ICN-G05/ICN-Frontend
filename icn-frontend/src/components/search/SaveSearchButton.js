import React, { useState } from 'react';
import { getSavedSearchService } from '../../services/serviceFactory';
import { useTierAccess } from '../../hooks/useTierAccess';
import { useNavigate } from 'react-router-dom';
import SavedSearchModal from './SavedSearchModal';
import './SaveSearchButton.css';

function SaveSearchButton({ searchParams, resultCount }) {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const savedSearchService = getSavedSearchService();
  const { hasAccess } = useTierAccess();
  const navigate = useNavigate();

  const handleSaveClick = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      alert('Please log in to save searches');
      return;
    }

    if (!hasAccess('SAVED_SEARCHES')) {
      const result = window.confirm('Saved searches require Plus or Premium tier. Would you like to upgrade now?');
      if (result) {
        navigate('/pricing');
      }
      return;
    }
    setShowModal(true);
  };

  const handleSaveSearch = async (searchData) => {
    setSaving(true);
    try {
      await savedSearchService.saveSearch({
        ...searchData,
        query: searchParams.query || '',
        filters: searchParams.filters || {},
        resultCount,
      });
      setShowModal(false);
      alert('Search saved successfully!');
    } catch (error) {
      alert(error.message || 'Failed to save search');
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
          saving={saving}
        />
      )}
    </>
  );
}

export default SaveSearchButton;
