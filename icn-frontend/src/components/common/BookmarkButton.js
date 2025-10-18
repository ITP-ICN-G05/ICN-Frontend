// src/components/common/BookmarkButton.js
import React, { useState, useEffect } from 'react';
import { useBookmarks } from '../../contexts/BookmarkContext';
import { getBookmarkService } from '../../services/serviceFactory';
import { useTierAccess } from '../../hooks/useTierAccess';
import './BookmarkButton.css';

function BookmarkButton({ company, size = 'medium', showLabel = true }) {
  const bookmarkService = getBookmarkService();
  const { isBookmarked: contextIsBookmarked, reloadBookmarks } = useBookmarks();
  const { hasAccess, getLimit } = useTierAccess();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBookmarked(contextIsBookmarked(company.id));
  }, [company.id, contextIsBookmarked]);

  const handleToggleBookmark = async (e) => {
    e.stopPropagation();
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      alert('Please log in to bookmark companies');
      return;
    }

    // Check bookmark limits for non-unlimited users
    if (!bookmarked && !hasAccess('UNLIMITED_BOOKMARKS')) {
      const limit = getLimit('BOOKMARK_LIMIT');
      if (limit > 0) {
        try {
          const stats = await bookmarkService.getBookmarkStats();
          const currentCount = stats.data?.total || stats.total || 0;
          if (currentCount >= limit) {
            alert(`Bookmark limit reached (${limit} max). Upgrade your plan to bookmark more companies.`);
            return;
          }
        } catch (err) {
          // If stats call fails, continue with bookmark attempt
          console.warn('Could not check bookmark stats:', err);
        }
      }
    }
    
    setLoading(true);
    try {
      if (bookmarked) {
        await bookmarkService.removeBookmark(company.id);
        setBookmarked(false);
      } else {
        await bookmarkService.addBookmark(company.id);
        setBookmarked(true);
      }
      await reloadBookmarks();
    } catch (error) {
      console.error('Bookmark error:', error);
      alert(error.message || 'Failed to update bookmark');
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
        {loading ? '⟳' : bookmarked ? '★' : '☆'}
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
