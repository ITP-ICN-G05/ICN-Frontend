import { checkTierAccess } from '../utils/tierConfig';

const MOCK_USERS = [
  {
    id: '1',
    email: 'john.smith@example.com',
    password: 'password123',
    name: 'John Smith',
    firstName: 'John',
    lastName: 'Smith',
    company: 'ABC Construction',
    role: 'admin',
    tier: 'premium',
    phone: '+61 400 123 456',
    memberSince: '2024-01-15',
    avatar: null,
  },
  {
    id: '2',
    email: 'jane.doe@example.com',
    password: 'password123',
    name: 'Jane Doe',
    firstName: 'Jane',
    lastName: 'Doe',
    company: 'XYZ Engineering',
    role: 'user',
    tier: 'plus',
    phone: '+61 400 987 654',
    memberSince: '2024-02-20',
    avatar: null,
  },
  {
    id: '3',
    email: 'test@example.com',
    password: 'test123',
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    company: 'Demo Company',
    role: 'user',
    tier: 'free',
    phone: '+61 400 555 555',
    memberSince: '2024-03-10',
    avatar: null,
  },
  {
    id: '4',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    firstName: 'Admin',
    lastName: 'User',
    company: 'ICN Victoria',
    role: 'admin',
    tier: 'premium',
    phone: '+61 400 999 999',
    memberSince: '2023-12-01',
    avatar: null,
  }
];

class MockAuthService {
  constructor() {
    this.MOCK_USERS = MOCK_USERS;
  }

  async login(email, password) {
    await this.delay(800);
    
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    const token = 'mock-jwt-token-' + Date.now();
    const userData = { ...user };
    delete userData.password;
    
    return {
      success: true,
      token,
      user: userData
    };
  }
  
  async signup(data) {
    await this.delay(1000);
    
    if (MOCK_USERS.some(u => u.email === data.email)) {
      throw new Error('Email already registered');
    }
    
    const newUser = {
      id: String(MOCK_USERS.length + 1),
      email: data.email,
      password: data.password,
      name: data.name || `${data.firstName} ${data.lastName}`,
      firstName: data.firstName,
      lastName: data.lastName,
      company: data.company || '',
      role: 'user',
      tier: 'free',
      phone: data.phone || '',
      memberSince: new Date().toISOString().split('T'),
      avatar: null,
    };
    
    MOCK_USERS.push(newUser);
    
    const token = 'mock-jwt-token-' + Date.now();
    const userData = { ...newUser };
    delete userData.password;
    
    return {
      success: true,
      token,
      user: userData
    };
  }
  
  async logout() {
    await this.delay(300);
    return { success: true };
  }
  
  async forgotPassword(email) {
    await this.delay(800);
    
    const user = MOCK_USERS.find(u => u.email === email);
    if (!user) {
      throw new Error('Email not found');
    }
    
    return {
      success: true,
      message: 'Password reset link has been sent to your email'
    };
  }
  
  async resetPassword(token, newPassword) {
    await this.delay(800);
    
    return {
      success: true,
      message: 'Password has been reset successfully'
    };
  }
  
  async validateToken(token) {
    await this.delay(300);
    
    if (!token || !token.startsWith('mock-jwt-token-')) {
      throw new Error('Invalid token');
    }
    
    const userData = localStorage.getItem('user');
    if (!userData) {
      throw new Error('User not found');
    }
    
    return {
      valid: true,
      user: JSON.parse(userData)
    };
  }
  
  async updateProfile(userId, updates) {
    await this.delay(500);
    
    const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...updates };
    const updatedUser = { ...MOCK_USERS[userIndex] };
    delete updatedUser.password;
    
    return {
      success: true,
      user: updatedUser
    };
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockAuthService = new MockAuthService();
