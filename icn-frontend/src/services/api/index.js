import axios from 'axios';
import { authService } from './authService';
import { companyService } from './companyService';
import { searchService } from './searchService';
import { userService } from './userService';
import { subscriptionService } from './subscriptionService';
import { bookmarkService } from './bookmarkService';
import { exportService } from './exportService';
import { analyticsService } from './analyticsService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for authentication and logging
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = generateRequestId();
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        method: config.method,
        url: config.url,
        params: config.params,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await authService.refreshToken(refreshToken);
          localStorage.setItem('token', response.data.token);
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    handleApiError(error);
    return Promise.reject(error);
  }
);

// Generate unique request ID
function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Centralized error handling
function handleApiError(error) {
  const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
  const errorCode = error.response?.status;
  
  console.error('API Error:', {
    code: errorCode,
    message: errorMessage,
    details: error.response?.data
  });
  
  // You can add toast notifications here
  if (errorCode === 403) {
    console.error('Access denied. Upgrade your subscription to access this feature.');
  } else if (errorCode === 404) {
    console.error('Resource not found.');
  } else if (errorCode === 500) {
    console.error('Server error. Please try again later.');
  }
}

export { apiClient };
export default apiClient;