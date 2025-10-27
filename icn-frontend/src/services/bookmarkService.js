// src/services/bookmarkService.js
import api from './api';
import { companyService } from './companyService';

class BookmarkService {
  async getUserBookmarks() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const organisationIds = user.organisationIds || [];
    
    if (organisationIds.length === 0) {
      return { data: [] };
    }
    
    // Use loadBookMarks endpoint to get organisation cards
    const companies = await companyService.getByIds(organisationIds);
    return { data: companies };
  }

  async addBookmark(companyId) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const hashedPassword = localStorage.getItem('user_password_hash');
    
    if (!hashedPassword) {
      throw new Error('Authentication required');
    }

    const currentIds = user.organisationIds || [];
    if (!currentIds.includes(companyId)) {
      currentIds.push(companyId);
    }

    // PUT /user to update organisationIds
    const response = await api.put('/user', {
      id: user.id,
      email: user.email,
      name: user.name,
      password: hashedPassword,
      organisationIds: currentIds
    });

    if (response.data) {
      user.organisationIds = currentIds;
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  }

  async removeBookmark(companyId) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const hashedPassword = localStorage.getItem('user_password_hash');
    
    if (!hashedPassword) {
      throw new Error('Authentication required');
    }

    const currentIds = user.organisationIds || [];
    const updatedIds = currentIds.filter(id => id !== companyId);

    // PUT /user to update organisationIds
    const response = await api.put('/user', {
      id: user.id,
      email: user.email,
      name: user.name,
      password: hashedPassword,
      organisationIds: updatedIds
    });

    if (response.data) {
      user.organisationIds = updatedIds;
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  }

  async isBookmarked(companyId) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const ids = user.organisationIds || [];
    return { data: ids.includes(companyId) };
  }
}

export const bookmarkService = new BookmarkService();