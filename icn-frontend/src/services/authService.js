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
      // Add email field to user data since backend response doesn't include email
      const userData = {
        ...response.data,
        email: email  // Add email field
      };
      
      localStorage.setItem('token', 'session-' + Date.now());
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('user_password_hash', hashedPassword);
      
      return userData;
    }
    
    return response.data;
  }

  async signup(userData) {
    // Create user expects HASHED password in JSON body + verification code
    const hashedPassword = this.hashPassword(userData.password);
    
    const response = await api.post('/user/create', {
      email: userData.email,
      name: userData.name,
      password: hashedPassword,  // Send hashed password, not plain text
      code: userData.verificationCode  // Add verification code
    });
    
    if (response.status === 201) {
      // Store hashed version for future use
      localStorage.setItem('user_password_hash', hashedPassword);
      localStorage.setItem('token', 'session-' + Date.now());
      
      // Create user data object since backend returns empty body on success
      const userDataResponse = {
        id: Date.now().toString(), // Temporary ID
        email: userData.email,
        name: userData.name,
        premium: 0,
        subscribeDueDate: '',
        organisationIds: []
      };
      
      localStorage.setItem('user', JSON.stringify(userDataResponse));
      return userDataResponse;
    }
    
    throw new Error('Registration failed');
  }

  async sendValidationCode(email) {
    console.log('📧 Sending verification code to:', email);
    
    try {
      const response = await api.post(`/user/getCode?email=${encodeURIComponent(email)}`);
      console.log('✅ Verification code sent successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to send verification code:', error);
      
      // Check if it's a network issue
      if (error.code === 'ERR_NETWORK') {
        console.error('🔴 Network error - likely HTTPS/HTTP protocol mismatch!');
        throw new Error('Connection failed. The app may be trying to use HTTPS on an HTTP server.');
      }
      
      // Check if it's a timeout issue
      if (error.code === 'ECONNABORTED') {
        console.error('⏰ Request timed out - email service may be slow');
        throw new Error('Email service is taking too long. Please try again.');
      }
      
      if (error.response?.status === 400) {
        throw new Error('Invalid email address.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Email service may be unavailable.');
      }
      
      throw error;
    }
  }

  async resetPassword(email, code, newPassword) {
    // Backend analysis shows: PUT /user doesn't validate verification codes
    // Only POST /user/create validates codes
    // So we need a different approach for password reset
    
    const hashedPassword = this.hashPassword(newPassword);
    
    try {
      console.log('🔄 Password reset: Backend limitation detected');
      console.log('⚠️ PUT /user endpoint does not validate verification codes');
      console.log('💡 Only POST /user/create validates codes');
      
      // Since backend doesn't support verification code validation in password reset,
      // we need to inform the user about this limitation
      
      throw new Error('Password reset with verification code is not supported by the current backend. Please contact support or use a different approach.');
      
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  async updateProfile(userData) {
    // PUT /user expects hashed password
    const hashedPassword = userData.password 
      ? this.hashPassword(userData.password)
      : localStorage.getItem('user_password_hash');
    
    // Build correct data format according to dev branch UpdateUserRequest
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