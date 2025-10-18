import { mockExportService } from './mockExportService';

describe('mockExportService', () => {
  beforeEach(() => {
    localStorage.clear();
    
    // Mock DOM methods
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
    
    document.createElement = jest.fn(() => ({
      href: '',
      setAttribute: jest.fn(),
      click: jest.fn(),
      remove: jest.fn()
    }));
    
    document.body.appendChild = jest.fn();
  });

  describe('exportToCSV', () => {
    it('should export CSV for plus tier', async () => {
      const user = { id: '1', tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockExportService.exportToCSV(['1', '2'], 'plus');
      
      expect(result.success).toBe(true);
      expect(result).toHaveProperty('filename');
    });

    it('should reject for free tier', async () => {
      const user = { id: '1', tier: 'free' };
      localStorage.setItem('user', JSON.stringify(user));
      
      await expect(
        mockExportService.exportToCSV(['1', '2'], 'free')
      ).rejects.toThrow('Export feature not available in free tier');
    });

    it('should include correct headers based on tier', async () => {
      const user = { id: '1', tier: 'premium' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockExportService.exportToCSV(['1', '2'], 'premium');
      
      expect(result.success).toBe(true);
    });
  });

  describe('exportToPDF', () => {
    it('should export PDF for premium tier', async () => {
      const user = { id: '1', tier: 'premium' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockExportService.exportToPDF(['1', '2'], 'premium');
      
      expect(result.success).toBe(true);
    });

    it('should reject for plus tier', async () => {
      const user = { id: '1', tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user));
      
      await expect(
        mockExportService.exportToPDF(['1', '2'], 'plus')
      ).rejects.toThrow('PDF export only available in Premium tier');
    });
  });

  describe('getExportQuota', () => {
    it('should return export quota', async () => {
      const user = { id: '1', tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockExportService.getExportQuota();
      
      expect(result.data).toHaveProperty('limit');
      expect(result.data).toHaveProperty('used');
      expect(result.data).toHaveProperty('remaining');
      expect(result.data).toHaveProperty('resetDate');
    });

    it('should handle unlimited exports for premium', async () => {
      const user = { id: '1', tier: 'premium' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockExportService.getExportQuota();
      
      expect(result.data.limit).toBe(-1);
    });
  });
});