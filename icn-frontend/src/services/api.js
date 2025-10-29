// src/services/api.js
import axios from 'axios';

// Direct connection to backend
const api = axios.create({
  baseURL: 'https://1355xcz.top:8080/api',
  // baseURL: 'http://98.83.91.193:8080/api',
  timeout: 60000,
  withCredentials: true, // ✅ CRITICAL: Enable cookies for cross-origin requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

api.interceptors.request.use(
  (config) => {
    // ✅ REMOVE: Authorization header (backend uses cookies, not JWT)
    // The session cookie will be sent automatically by the browser
    
    console.log('🌐 API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
    console.log('🔗 Full URL:', config.baseURL + config.url);
    console.log('🍪 Cookies will be sent automatically');
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    
    // Log if backend set any cookies
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      console.log('🍪 Backend set cookies:', setCookie);
    }
    
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.config?.url);
    
    if (error.response?.data) {
      console.error('Backend error message:', error.response.data);
    }
    
    if (error.config) {
      console.error('Failed request:', {
        url: error.config.url,
        method: error.config.method,
        data: error.config.data,
        headers: error.config.headers
      });
    }
    
    // On 401, clear local storage and redirect to login
    if (error.response?.status === 401) {
      console.log('🔒 Session expired - redirecting to login');
      localStorage.removeItem('user');
      localStorage.removeItem('user_password_hash');
      localStorage.removeItem('isAdmin');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;