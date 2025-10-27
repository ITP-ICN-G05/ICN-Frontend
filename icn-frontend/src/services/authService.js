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
      localStorage.setItem('token', 'session-' + Date.now());
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('user_password_hash', hashedPassword);
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
    
    return api.put('/user', {
      email: email,
      password: hashedPassword,
      code: code
    });
  }

  async updateProfile(userData) {
    // PUT /user expects hashed password
    const hashedPassword = userData.password 
      ? this.hashPassword(userData.password)
      : localStorage.getItem('user_password_hash');
    
    return api.put('/user', {
      ...userData,
      password: hashedPassword
    });
  }
}

export const authService = new AuthService();
export default authService;