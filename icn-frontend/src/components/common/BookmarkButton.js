import React, { useState, useEffect } from 'react';
import { useBookmarks } from '../../contexts/BookmarkContext';
import './BookmarkButton.css';

function BookmarkButton({ company, size = 'medium', showLabel = true }) {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBookmarked(isBookmarked(company.id));
  }, [company.id, isBookmarked]);

  const handleToggleBookmark = async (e) => {
    e.stopPropagation();
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      alert('Please log in to bookmark companies');
      return;
    }
    
    setLoading(true);
    try {
      if (bookmarked) {
        const success = await removeBookmark(company.id);
        if (success) setBookmarked(false);
      } else {
        const success = await addBookmark(company);
        if (success) setBookmarked(true);
      }
    } catch (error) {
      console.error('Bookmark error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`bookmark-btn bookmark-btn-${size} ${bookmarked ? 'bookmarked' : ''} ${loading ? 'loading' : ''}`}
      onClick={handleToggleBookmark}
      disabled={loading}
      title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <span className="bookmark-icon">
        {bookmarked ? '★' : '☆'}
      </span>
      {showLabel && (
        <span className="bookmark-label">
          {loading ? 'Saving...' : bookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      )}
    </button>
  );
}

export default BookmarkButton;