// src/services/authService.js
import api from './api';
import { sha256 } from 'js-sha256';

class AuthService {
  hashPassword(password) {
    return sha256(password).toLowerCase();
  }

  async login(email, password) {
    // Login expects HASHED password in query params (as per API docs)
    const hashedPassword = this.hashPassword(password);
    
    const response = await api.post(`/user?email=${encodeURIComponent(email)}&password=${encodeURIComponent(hashedPassword)}`);
    
    if (response.data) {
      // 添加email字段到用户数据中，因为后端响应中没有包含email
      const userData = {
        ...response.data,
        email: email  // 添加email字段
      };
      
      localStorage.setItem('token', 'session-' + Date.now());
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('user_password_hash', hashedPassword);
      
      return userData;
    }
    
    return response.data;
  }

  async signup(userData) {
    // Create user expects PLAIN password in JSON body
    const response = await api.post('/user/create', {
      email: userData.email,
      name: userData.name,
      password: userData.password  // Plain password for creation
    });
    
    if (response.data) {
      // Store hashed version for future use
      const hashedPassword = this.hashPassword(userData.password);
      localStorage.setItem('user_password_hash', hashedPassword);
      localStorage.setItem('token', 'session-' + Date.now());
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  }

  async sendValidationCode(email) {
    // Email validation endpoint
    return api.post(`/user/getCode?email=${encodeURIComponent(email)}`);
  }

  async resetPassword(email, code, newPassword) {
    // This endpoint might not exist in your backend
    // You might need to use PUT /user instead
    const hashedPassword = this.hashPassword(newPassword);
    
    // 根据dev分支的UpdateUserRequest构建正确的数据格式
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const resetData = {
      id: user.id || '',
      email: email,
      name: user.name || '',
      password: hashedPassword,
      organisationIds: user.organisationIds || user.cards || [],
      premium: user.premium || 0,
      subscribeDueDate: user.subscribeDueDate || ''
    };
    
    return api.put('/user', resetData);
  }

  async updateProfile(userData) {
    // PUT /user expects hashed password
    const hashedPassword = userData.password 
      ? this.hashPassword(userData.password)
      : localStorage.getItem('user_password_hash');
    
    // 根据dev分支的UpdateUserRequest构建正确的数据格式
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const updateData = {
      id: user.id || '',
      email: userData.email || user.email || '',
      name: userData.name || user.name || '',
      password: hashedPassword,
      organisationIds: user.organisationIds || user.cards || [],
      premium: userData.premium || user.premium || 0,
      subscribeDueDate: userData.subscribeDueDate || user.subscribeDueDate || ''
    };
    
    return api.put('/user', updateData);
  }
}

export const authService = new AuthService();
export default authService;