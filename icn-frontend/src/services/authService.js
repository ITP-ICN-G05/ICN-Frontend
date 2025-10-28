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
    console.log('🔄 Starting simplified password reset process...');
    console.log('📧 Email:', email);
    console.log('🔑 Code:', code);
    console.log('🔐 New Password:', newPassword);
    
    const hashedNewPassword = this.hashPassword(newPassword);
    
    try {
      // Simplified approach: Direct password reset using email, code, and new password
      console.log('🔄 Updating password directly via PUT /user...');
      
      const updateData = {
        email: email,
        password: hashedNewPassword,
        code: code
      };
      
      console.log('📊 Request data:', updateData);
      
      const response = await api.put('/user', updateData);
      
      if (response.status === 200) {
        console.log('✅ Password reset successful');
        return { success: true, message: 'Password reset successfully' };
      } else {
        throw new Error('Password update failed');
      }
      
    } catch (error) {
      console.error('❌ Password reset error:', error);
      
      if (error.response?.status === 400) {
        throw new Error('Invalid verification code or user data. Please check your code and try again.');
      } else if (error.response?.status === 404) {
        throw new Error('User not found. Please check your email.');
      } else if (error.response?.status === 409) {
        throw new Error('Invalid verification code. Please check your email and try again.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
      
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