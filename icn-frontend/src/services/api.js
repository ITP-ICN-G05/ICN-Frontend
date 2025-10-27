// src/services/api.js
import axios from 'axios';

// Direct connection to backend
const api = axios.create({
  baseURL: 'http://54.242.81.107:8080/api',
  timeout: 60000, // 增加到60秒
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🌐 API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
    console.log('🔗 Full URL:', config.baseURL + config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url);
    
    // Log full error details
    if (error.response?.data) {
      console.error('Backend error message:', error.response.data);
    }
    
    // Log the request that failed
    if (error.config) {
      console.error('Failed request:', {
        url: error.config.url,
        method: error.config.method,
        data: error.config.data,
        headers: error.config.headers
      });
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;