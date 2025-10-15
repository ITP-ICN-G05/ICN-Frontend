import React, { createContext, useState, useContext, useEffect } from 'react';
import { bookmarkService } from '../services/bookmarkService';

const BookmarkContext = createContext();

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within BookmarkProvider');
  }
  return context;
};

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await bookmarkService.getUserBookmarks();
      setBookmarks(response.data);
    } catch (err) {
      console.error('Error loading bookmarks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addBookmark = async (company) => {
    try {
      await bookmarkService.addBookmark(company.id);
      setBookmarks(prev => [...prev, company]);
      return true;
    } catch (err) {
      console.error('Error adding bookmark:', err);
      setError(err.message);
      return false;
    }
  };

  const removeBookmark = async (companyId) => {
    try {
      await bookmarkService.removeBookmark(companyId);
      setBookmarks(prev => prev.filter(b => b.id !== companyId));
      return true;
    } catch (err) {
      console.error('Error removing bookmark:', err);
      setError(err.message);
      return false;
    }
  };

  const isBookmarked = (companyId) => {
    return bookmarks.some(b => b.id === companyId);
  };

  const value = {
    bookmarks,
    loading,
    error,
    addBookmark,
    removeBookmark,
    isBookmarked,
    reloadBookmarks: loadBookmarks,
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};