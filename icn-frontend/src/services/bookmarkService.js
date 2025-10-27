// src/services/bookmarkService.js
import api from './api';

class BookmarkService {
  async getUserBookmarks() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // Fix: Prioritize organisationCards field and filter empty IDs
    const organisationIds = user.organisationCards ? 
      user.organisationCards.map(card => card.id).filter(id => id && id.trim() !== '') : 
      (user.organisationIds || user.cards || []);
    
    if (organisationIds.length === 0) {
      return { data: [] };
    }
    
    // Use correct endpoint: GET /organisation/generalByIds?ids=...
    try {
      const queryParams = new URLSearchParams();
      organisationIds.forEach(id => {
        queryParams.append('ids', id);
      });
      
      const response = await api.get(`/organisation/generalByIds?${queryParams.toString()}`);
      return { data: response.data || [] };
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return { data: [] };
    }
  }

  async addBookmark(companyId) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const hashedPassword = localStorage.getItem('user_password_hash');
    
    if (!hashedPassword) {
      throw new Error('Authentication required');
    }

    // Fix: Use correct field name organisationCards
    const currentCards = user.organisationCards || [];
    const currentIds = currentCards.map(card => card.id).filter(id => id && id.trim() !== '');
    
    if (!currentIds.includes(companyId)) {
      currentIds.push(companyId);
    }

    // PUT /user to update organisationIds with proper error handling
    try {
      // Build correct data format according to dev branch UpdateUserRequest
      const userData = {
        id: user.id || '',
        email: user.email || '',  // Ensure email field is not empty
        name: user.name || '',
        password: hashedPassword,  // Must be 64-character hash
        organisationIds: currentIds,  // Use organisationIds field
        premium: user.premium || 0,  // Use premium field
        subscribeDueDate: user.subscribeDueDate || ''  // Use subscribeDueDate field
      };

      console.log('Sending user data:', userData);

      const response = await api.put('/user', userData);

      // Fix: Update localStorage even if response.data is empty (200 status code indicates success)
      if (response.status === 200) {
        // Update user data in localStorage, maintain compatibility with both field names
        user.organisationIds = currentIds;
        user.cards = currentIds;
        // Fix: Also update organisationCards field
        user.organisationCards = currentIds.map(id => ({ id: id }));
        localStorage.setItem('user', JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 400) {
        throw new Error(`Invalid user data format: ${error.response?.data?.message || 'Unknown error'}`);
      } else if (error.response?.status === 409) {
        throw new Error('Failed to update user information');
      }
      throw error;
    }
  }

  async removeBookmark(companyId) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const hashedPassword = localStorage.getItem('user_password_hash');
    
    if (!hashedPassword) {
      throw new Error('Authentication required');
    }

    // Fix: Use correct field name organisationCards
    const currentCards = user.organisationCards || [];
    const currentIds = currentCards.map(card => card.id).filter(id => id && id.trim() !== '');
    const updatedIds = currentIds.filter(id => id !== companyId);

    // PUT /user to update organisationIds with proper error handling
    try {
      // Build correct data format according to dev branch UpdateUserRequest
      const userData = {
        id: user.id || '',
        email: user.email || '',
        name: user.name || '',
        password: hashedPassword,  // Must be 64-character hash
        organisationIds: updatedIds,  // Use organisationIds field
        premium: user.premium || 0,  // Use premium field
        subscribeDueDate: user.subscribeDueDate || ''  // Use subscribeDueDate field
      };

      console.log('Sending user data:', userData);

      const response = await api.put('/user', userData);

      // Fix: Update localStorage even if response.data is empty (200 status code indicates success)
      if (response.status === 200) {
        // Update user data in localStorage, maintain compatibility with both field names
        user.organisationIds = updatedIds;
        user.cards = updatedIds;
        // Fix: Also update organisationCards field
        user.organisationCards = updatedIds.map(id => ({ id: id }));
        localStorage.setItem('user', JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 400) {
        throw new Error(`Invalid user data format: ${error.response?.data?.message || 'Unknown error'}`);
      } else if (error.response?.status === 409) {
        throw new Error('Failed to update user information');
      }
      throw error;
    }
  }

  async isBookmarked(companyId) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // Fix: Use correct field name organisationCards
    const currentCards = user.organisationCards || [];
    const ids = currentCards.map(card => card.id).filter(id => id && id.trim() !== '');
    return { data: ids.includes(companyId) };
  }
}

export const bookmarkService = new BookmarkService();