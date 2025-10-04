export interface Company {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  location: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  website?: string;
  email?: string;
  phone?: string;
  employees?: number;
  revenue?: number;
  foundedYear?: number;
  tags?: string[];
  logo?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  avatar?: string;
  role: 'admin' | 'user' | 'premium';
  tier: 'basic' | 'premium' | 'enterprise';
  company?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    updates: boolean;
  };
  language: string;
  timezone: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface CompanyState {
  companies: Company[];
  selectedCompany: Company | null;
  searchQuery: string;
  filters: SearchFilters;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  isLoading: boolean;
  error: string | null;
}

export interface SearchFilters {
  industry?: string[];
  size?: string[];
  location?: {
    city?: string;
    state?: string;
    country?: string;
    radius?: number;
  };
  employees?: {
    min?: number;
    max?: number;
  };
  revenue?: {
    min?: number;
    max?: number;
  };
  foundedYear?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
