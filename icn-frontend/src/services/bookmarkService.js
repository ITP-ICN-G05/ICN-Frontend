// src/services/bookmarkService.js
import api from './api';

class BookmarkService {
  async getUserBookmarks() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // 修复：优先使用organisationCards字段，并过滤空ID
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

    // 修复：使用正确的字段名 organisationCards
    const currentCards = user.organisationCards || [];
    const currentIds = currentCards.map(card => card.id).filter(id => id && id.trim() !== '');
    
    if (!currentIds.includes(companyId)) {
      currentIds.push(companyId);
    }

    // PUT /user to update organisationIds with proper error handling
    try {
      // 根据dev分支的UpdateUserRequest构建正确的数据格式
      const userData = {
        id: user.id || '',
        email: user.email || '',  // 确保email字段不为空
        name: user.name || '',
        password: hashedPassword,  // 必须是64字符的哈希值
        organisationIds: currentIds,  // 使用organisationIds字段
        premium: user.premium || 0,  // 使用premium字段
        subscribeDueDate: user.subscribeDueDate || ''  // 使用subscribeDueDate字段
      };

      console.log('Sending user data:', userData);

      const response = await api.put('/user', userData);

      // 修复：即使response.data为空也要更新localStorage（200状态码表示成功）
      if (response.status === 200) {
        // 更新localStorage中的用户数据，保持两种字段名兼容
        user.organisationIds = currentIds;
        user.cards = currentIds;
        // 修复：同时更新organisationCards字段
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

    // 修复：使用正确的字段名 organisationCards
    const currentCards = user.organisationCards || [];
    const currentIds = currentCards.map(card => card.id).filter(id => id && id.trim() !== '');
    const updatedIds = currentIds.filter(id => id !== companyId);

    // PUT /user to update organisationIds with proper error handling
    try {
      // 根据dev分支的UpdateUserRequest构建正确的数据格式
      const userData = {
        id: user.id || '',
        email: user.email || '',
        name: user.name || '',
        password: hashedPassword,  // 必须是64字符的哈希值
        organisationIds: updatedIds,  // 使用organisationIds字段
        premium: user.premium || 0,  // 使用premium字段
        subscribeDueDate: user.subscribeDueDate || ''  // 使用subscribeDueDate字段
      };

      console.log('Sending user data:', userData);

      const response = await api.put('/user', userData);

      // 修复：即使response.data为空也要更新localStorage（200状态码表示成功）
      if (response.status === 200) {
        // 更新localStorage中的用户数据，保持两种字段名兼容
        user.organisationIds = updatedIds;
        user.cards = updatedIds;
        // 修复：同时更新organisationCards字段
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
    // 修复：使用正确的字段名 organisationCards
    const currentCards = user.organisationCards || [];
    const ids = currentCards.map(card => card.id).filter(id => id && id.trim() !== '');
    return { data: ids.includes(companyId) };
  }
}

export const bookmarkService = new BookmarkService();