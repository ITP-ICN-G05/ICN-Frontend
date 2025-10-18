import api from './api';

export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then(r => r.data),
  
  signup: (userData) =>
    api.post('/auth/signup', userData).then(r => r.data),
  
  logout: () =>
    api.post('/auth/logout').then(r => r.data),
  
  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }).then(r => r.data),
  
  resetPassword: (token, newPassword) =>
    api.post('/auth/reset-password', { token, newPassword }).then(r => r.data),
  
  validateToken: (token) =>
    api.get('/auth/validate', { headers: { Authorization: `Bearer \${token}` } }).then(r => r.data), updateProfile: (userId, updates) =>
    api.put(`/auth/profile/${userId}`, updates).then(r => r.data),
};

export default authService;
