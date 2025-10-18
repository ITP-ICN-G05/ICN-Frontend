import { mockAuthService } from './mockAuthService';

describe('mockAuthService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const result = await mockAuthService.login('john.smith@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.token).toContain('mock-jwt-token-');
      expect(result.user.email).toBe('john.smith@example.com');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should reject invalid credentials', async () => {
      await expect(
        mockAuthService.login('wrong@email.com', 'wrongpass')
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('signup', () => {
    it('should create new user', async () => {
      const userData = {
        email: 'newuser@test.com',
        password: 'pass123',
        firstName: 'New',
        lastName: 'User',
        company: 'Test Co'
      };

      const result = await mockAuthService.signup(userData);

      expect(result.success).toBe(true);
      expect(result.user.email).toBe('newuser@test.com');
      expect(result.user.tier).toBe('free');
    });

    it('should reject duplicate email', async () => {
      await expect(
        mockAuthService.signup({ email: 'john.smith@example.com', password: 'test' })
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const result = await mockAuthService.logout();
      expect(result.success).toBe(true);
    });
  });

  describe('forgotPassword', () => {
    it('should send reset email for valid user', async () => {
      const result = await mockAuthService.forgotPassword('john.smith@example.com');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('reset link');
    });

    it('should reject invalid email', async () => {
      await expect(
        mockAuthService.forgotPassword('nonexistent@test.com')
      ).rejects.toThrow('Email not found');
    });
  });

  describe('resetPassword', () => {
    it('should reset password', async () => {
      const result = await mockAuthService.resetPassword('token', 'newpass');
      
      expect(result.success).toBe(true);
    });
  });

  describe('validateToken', () => {
    it('should validate token', async () => {
      const user = { id: '1', email: 'test@test.com' };
      localStorage.setItem('user', JSON.stringify(user));

      const result = await mockAuthService.validateToken('mock-jwt-token-123');
      
      expect(result.valid).toBe(true);
      expect(result.user).toEqual(user);
    });

    it('should reject invalid token', async () => {
      await expect(
        mockAuthService.validateToken('invalid')
      ).rejects.toThrow('Invalid token');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updates = { firstName: 'Jane' };
      const result = await mockAuthService.updateProfile('1', updates);
      
      expect(result.success).toBe(true);
      expect(result.user.firstName).toBe('Jane');
    });

    it('should throw error for invalid user', async () => {
      await expect(
        mockAuthService.updateProfile('999', {})
      ).rejects.toThrow('User not found');
    });
  });
});