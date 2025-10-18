import { adminService } from './adminService';
import api from './api';

jest.mock('./api');

describe('adminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardMetrics', () => {
    it('should fetch dashboard metrics', async () => {
      const mockMetrics = { totalUsers: 100, activeUsers: 80 };
      api.get.mockResolvedValue({ data: mockMetrics });

      const result = await adminService.getDashboardMetrics();

      expect(api.get).toHaveBeenCalledWith('/admin/dashboard/metrics');
      expect(result).toEqual({ data: mockMetrics });
    });

    it('should handle errors', async () => {
      api.get.mockRejectedValue(new Error('Network error'));

      await expect(adminService.getDashboardMetrics()).rejects.toThrow('Network error');
    });
  });

  describe('getAllCompanies', () => {
    it('should fetch all companies with params', async () => {
      const mockCompanies = [{ id: '1', name: 'Test Co' }];
      const params = { page: 1, limit: 10 };
      api.get.mockResolvedValue({ data: mockCompanies });

      const result = await adminService.getAllCompanies(params);

      expect(api.get).toHaveBeenCalledWith('/admin/companies', { params });
      expect(result).toEqual({ data: mockCompanies });
    });
  });

  describe('createCompany', () => {
    it('should create a new company', async () => {
      const newCompany = { name: 'New Co', address: '123 St' };
      const createdCompany = { id: '1', ...newCompany };
      api.post.mockResolvedValue({ data: createdCompany });

      const result = await adminService.createCompany(newCompany);

      expect(api.post).toHaveBeenCalledWith('/admin/companies', newCompany);
      expect(result).toEqual({ data: createdCompany });
    });
  });

  describe('updateCompany', () => {
    it('should update a company', async () => {
      const updates = { name: 'Updated Co' };
      const updated = { id: '1', ...updates };
      api.put.mockResolvedValue({ data: updated });

      const result = await adminService.updateCompany('1', updates);

      expect(api.put).toHaveBeenCalledWith('/admin/companies/1', updates);
      expect(result).toEqual({ data: updated });
    });
  });

  describe('deleteCompany', () => {
    it('should delete a company', async () => {
      api.delete.mockResolvedValue({ data: { success: true } });

      const result = await adminService.deleteCompany('1');

      expect(api.delete).toHaveBeenCalledWith('/admin/companies/1');
      expect(result).toEqual({ data: { success: true } });
    });
  });

  describe('bulkImportCompanies', () => {
    it('should upload file for bulk import', async () => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      api.post.mockResolvedValue({ data: { imported: 10 } });

      const result = await adminService.bulkImportCompanies(file);

      expect(api.post).toHaveBeenCalledWith(
        '/admin/companies/import',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(result).toEqual({ data: { imported: 10 } });
    });
  });

  describe('getAllUsers', () => {
    it('should fetch all users', async () => {
      const users = [{ id: '1', email: 'test@test.com' }];
      api.get.mockResolvedValue({ data: users });

      const result = await adminService.getAllUsers({ page: 1 });

      expect(api.get).toHaveBeenCalledWith('/admin/users', { params: { page: 1 } });
      expect(result).toEqual({ data: users });
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      const updates = { tier: 'premium' };
      api.put.mockResolvedValue({ data: { id: '1', ...updates } });

      const result = await adminService.updateUser('1', updates);

      expect(api.put).toHaveBeenCalledWith('/admin/users/1', updates);
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user', async () => {
      api.patch.mockResolvedValue({ data: { success: true } });

      const result = await adminService.deactivateUser('1');

      expect(api.patch).toHaveBeenCalledWith('/admin/users/1/deactivate');
    });
  });

  describe('reactivateUser', () => {
    it('should reactivate user', async () => {
      api.patch.mockResolvedValue({ data: { success: true } });

      const result = await adminService.reactivateUser('1');

      expect(api.patch).toHaveBeenCalledWith('/admin/users/1/reactivate');
    });
  });

  describe('getSubscriptions', () => {
    it('should fetch subscriptions', async () => {
      const subs = [{ id: '1', tier: 'premium' }];
      api.get.mockResolvedValue({ data: subs });

      const result = await adminService.getSubscriptions();

      expect(api.get).toHaveBeenCalledWith('/admin/subscriptions');
      expect(result).toEqual({ data: subs });
    });
  });

  describe('updateSubscription', () => {
    it('should update subscription', async () => {
      const updates = { status: 'cancelled' };
      api.put.mockResolvedValue({ data: { id: '1', ...updates } });

      const result = await adminService.updateSubscription('1', updates);

      expect(api.put).toHaveBeenCalledWith('/admin/subscriptions/1', updates);
    });
  });

  describe('getActivityLogs', () => {
    it('should fetch activity logs', async () => {
      const logs = [{ id: '1', action: 'LOGIN' }];
      api.get.mockResolvedValue({ data: logs });

      const result = await adminService.getActivityLogs({ limit: 50 });

      expect(api.get).toHaveBeenCalledWith('/admin/logs', { params: { limit: 50 } });
    });
  });

  describe('Content Moderation', () => {
    it('should get flagged content', async () => {
      const flagged = [{ id: '1', reason: 'spam' }];
      api.get.mockResolvedValue({ data: flagged });

      const result = await adminService.getFlaggedContent();

      expect(api.get).toHaveBeenCalledWith('/admin/moderation/flagged');
    });

    it('should approve content', async () => {
      api.patch.mockResolvedValue({ data: { success: true } });

      const result = await adminService.approveContent('1');

      expect(api.patch).toHaveBeenCalledWith('/admin/moderation/1/approve');
    });

    it('should reject content', async () => {
      api.patch.mockResolvedValue({ data: { success: true } });

      const result = await adminService.rejectContent('1');

      expect(api.patch).toHaveBeenCalledWith('/admin/moderation/1/reject');
    });
  });
});