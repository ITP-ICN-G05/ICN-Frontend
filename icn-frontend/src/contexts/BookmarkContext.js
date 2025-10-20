import React, { createContext, useState, useContext, useEffect } from 'react';
import { getBookmarkService } from '../services/serviceFactory';

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
  const bookmarkService = getBookmarkService();

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    // Parse and validate user from localStorage
    let user;
    try {
      const userJson = localStorage.getItem('user');
      if (!userJson) {
        setBookmarks([]);
        return;
      }
      user = JSON.parse(userJson);
    } catch (err) {
      console.error('Error parsing user from localStorage:', err);
      setError(err.message);
      setBookmarks([]);
      return;
    }

    if (!user) {
      setBookmarks([]);
      return;
    }
    
    // Fetch bookmarks from service
    setLoading(true);
    setError(null);
    try {
      const response = await bookmarkService.getUserBookmarks();
      // Handle both mock and real service response shapes
      const bookmarkData = response.data || response;
      setBookmarks(Array.isArray(bookmarkData) ? bookmarkData : []);
    } catch (err) {
      console.error('Error loading bookmarks:', err);
      setError(err.message);
      setBookmarks([]);
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
      throw err; // Re-throw for component handling
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
      throw err; // Re-throw for component handling
    }
  };

  const isBookmarked = (companyId) => {
    return bookmarks.some(b => b.id === companyId);
  };

  const getBookmarkCount = () => {
    return bookmarks.length;
  };

  const value = {
    bookmarks,
    loading,
    error,
    addBookmark,
    removeBookmark,
    isBookmarked,
    getBookmarkCount,
    reloadBookmarks: loadBookmarks,
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};