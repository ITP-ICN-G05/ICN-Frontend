import { mockAdminService } from './mockAdminService';

describe('mockAdminService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics', async () => {
      const result = await mockAdminService.getDashboardMetrics();
      
      expect(result.data).toHaveProperty('totalUsers');
      expect(result.data).toHaveProperty('totalCompanies');
      expect(result.data).toHaveProperty('revenue');
      expect(result.data).toHaveProperty('recentActivity');
      expect(result.data.recentActivity).toBeInstanceOf(Array);
    });
  });

  describe('getAllCompanies', () => {
    it('should return all companies', async () => {
      const result = await mockAdminService.getAllCompanies();
      
      expect(result.data).toBeInstanceOf(Array);
      expect(result).toHaveProperty('total');
    });

    it('should apply filters', async () => {
      const result = await mockAdminService.getAllCompanies({ 
        verificationStatus: 'verified' 
      });
      
      expect(result.data).toBeInstanceOf(Array);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const result = await mockAdminService.getAllUsers();
      
      expect(result.data).toBeInstanceOf(Array);
      result.data.forEach(user => {
        expect(user).not.toHaveProperty('password');
      });
    });

    it('should filter by tier', async () => {
      const result = await mockAdminService.getAllUsers({ tier: 'premium' });
      
      result.data.forEach(user => {
        expect(user.tier).toBe('premium');
      });
    });

    it('should filter by role', async () => {
      const result = await mockAdminService.getAllUsers({ role: 'admin' });
      
      result.data.forEach(user => {
        expect(user.role).toBe('admin');
      });
    });

    it('should search users', async () => {
      const result = await mockAdminService.getAllUsers({ search: 'john' });
      
      expect(result.data).toBeInstanceOf(Array);
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      const result = await mockAdminService.updateUser('1', { tier: 'premium' });
      
      expect(result.data.tier).toBe('premium');
    });

    it('should throw error for invalid user', async () => {
      await expect(
        mockAdminService.updateUser('invalid-id', { tier: 'premium' })
      ).rejects.toThrow('User not found');
    });
  });

  describe('updateUserTier', () => {
    it('should update user tier', async () => {
      const result = await mockAdminService.updateUserTier('1', 'premium');
      
      expect(result.data.tier).toBe('premium');
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user', async () => {
      const result = await mockAdminService.deactivateUser('1');
      
      expect(result.data.status).toBe('inactive');
    });
  });

  describe('reactivateUser', () => {
    it('should reactivate user', async () => {
      const result = await mockAdminService.reactivateUser('1');
      
      expect(result.data.status).toBe('active');
    });
  });

  describe('getCompanyVerificationQueue', () => {
    it('should return pending companies', async () => {
      const result = await mockAdminService.getCompanyVerificationQueue();
      
      expect(result.data).toBeInstanceOf(Array);
      result.data.forEach(company => {
        expect(company.status).toBe('pending');
      });
    });
  });

  describe('approveCompany', () => {
    it('should approve company', async () => {
      const result = await mockAdminService.approveCompany('pending_1');
      
      expect(result.data.success).toBe(true);
      expect(result.data.companyId).toBe('pending_1');
    });
  });

  describe('rejectCompany', () => {
    it('should reject company', async () => {
      const result = await mockAdminService.rejectCompany('pending_1', 'Invalid data');
      
      expect(result.data.success).toBe(true);
      expect(result.data.reason).toBe('Invalid data');
    });
  });

  describe('getActivityLogs', () => {
    it('should return activity logs', async () => {
      const result = await mockAdminService.getActivityLogs();
      
      expect(result.data).toBeInstanceOf(Array);
      result.data.forEach(log => {
        expect(log).toHaveProperty('action');
        expect(log).toHaveProperty('timestamp');
        expect(log).toHaveProperty('userId');
      });
    });
  });
});