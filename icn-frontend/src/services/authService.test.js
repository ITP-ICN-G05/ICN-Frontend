import { authService } from './authService';
import api from './api';

jest.mock('./api');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          user: { id: '1', email: 'test@test.com' }
        }
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await authService.login('test@test.com', 'password123');

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: 'password123'
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle login errors', async () => {
      api.post.mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        authService.login('test@test.com', 'wrong')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('signup', () => {
    it('should signup successfully', async () => {
      const userData = {
        email: 'new@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };
      const mockResponse = {
        data: {
          token: 'new-token',
          user: { id: '2', ...userData }
        }
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await authService.signup(userData);

      expect(api.post).toHaveBeenCalledWith('/auth/signup', userData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle signup errors', async () => {
      api.post.mockRejectedValue(new Error('Email already exists'));

      await expect(
        authService.signup({ email: 'existing@test.com' })
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockResponse = { data: { success: true } };
      api.post.mockResolvedValue(mockResponse);

      const result = await authService.logout();

      expect(api.post).toHaveBeenCalledWith('/auth/logout');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email', async () => {
      const mockResponse = { data: { message: 'Email sent' } };
      api.post.mockResolvedValue(mockResponse);

      const result = await authService.forgotPassword('test@test.com');

      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@test.com'
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockResponse = { data: { success: true } };
      api.post.mockResolvedValue(mockResponse);

      const result = await authService.resetPassword('reset-token', 'newPass123');

      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'reset-token',
        newPassword: 'newPass123'
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      const mockResponse = {
        data: { valid: true, user: { id: '1' } }
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await authService.validateToken('valid-token');

      expect(api.get).toHaveBeenCalledWith('/auth/validate', {
        headers: { Authorization: 'Bearer ${token}' }
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle invalid token', async () => {
      api.get.mockRejectedValue(new Error('Invalid token'));

      await expect(
        authService.validateToken('invalid-token')
      ).rejects.toThrow('Invalid token');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updates = { firstName: 'Jane', lastName: 'Smith' };
      const mockResponse = {
        data: { id: '1', ...updates }
      };
      api.put.mockResolvedValue(mockResponse);

      const result = await authService.updateProfile('1', updates);

      expect(api.put).toHaveBeenCalledWith('/auth/profile/1', updates);
      expect(result).toEqual(mockResponse.data);
    });
  });
});