import apiClient from './index';

export const authService = {
  // User authentication
  login: (email, password) => 
    apiClient.post('/auth/login', { email, password }),
  
  signup: (userData) => 
    apiClient.post('/auth/signup', userData),
  
  logout: () => 
    apiClient.post('/auth/logout'),
  
  refreshToken: (refreshToken) => 
    apiClient.post('/auth/refresh', { refreshToken }),
  
  // Password management
  forgotPassword: (email) => 
    apiClient.post('/auth/forgot-password', { email }),
  
  resetPassword: (token, newPassword) => 
    apiClient.post('/auth/reset-password', { token, newPassword }),
  
  verifyEmail: (token) => 
    apiClient.post('/auth/verify-email', { token }),
  
  resendVerification: (email) => 
    apiClient.post('/auth/resend-verification', { email }),
  
  // OAuth
  googleLogin: (googleToken) => 
    apiClient.post('/auth/google', { token: googleToken }),
  
  facebookLogin: (facebookToken) => 
    apiClient.post('/auth/facebook', { token: facebookToken }),
  
  // Session management
  validateSession: () => 
    apiClient.get('/auth/validate'),
  
  // Two-factor authentication
  enable2FA: () => 
    apiClient.post('/auth/2fa/enable'),
  
  verify2FA: (code) => 
    apiClient.post('/auth/2fa/verify', { code }),
  
  disable2FA: (code) => 
    apiClient.post('/auth/2fa/disable', { code }),
};