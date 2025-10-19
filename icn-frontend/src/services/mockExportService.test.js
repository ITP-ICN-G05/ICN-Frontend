import { mockExportService } from './mockExportService';
import { TIER_FEATURES, TIER_LIMITS } from '../utils/tierConfig';
import * as tierConfig from '../utils/tierConfig';

describe('mockExportService', () => {
  beforeEach(() => {
    localStorage.clear();
    
    // Mock DOM methods
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
    
    const mockElement = {
      href: '',
      setAttribute: jest.fn(),
      click: jest.fn(),
      remove: jest.fn()
    };
    
    document.createElement = jest.fn(() => mockElement);
    document.body.appendChild = jest.fn();
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('exportToCSV', () => {
    it('should export CSV for plus tier', async () => {
      const user = { id: '1', tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockExportService.exportToCSV(['1', '2'], 'plus');
      
      expect(result.success).toBe(true);
      expect(result).toHaveProperty('filename');
      expect(result.filename).toMatch(/^companies-export-\d+\.csv$/);
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should export CSV for premium tier with full data', async () => {
      const user = { id: '1', tier: 'premium' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockExportService.exportToCSV(['1', '2', '3'], 'premium');
      
      expect(result.success).toBe(true);
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('downloadUrl');
    });

    it('should reject for free tier', async () => {
      const user = { id: '1', tier: 'free' };
      localStorage.setItem('user', JSON.stringify(user));
      
      await expect(
        mockExportService.exportToCSV(['1', '2'], 'free')
      ).rejects.toThrow('Export feature not available in free tier');
    });

    it('should reject when export limit is exhausted', async () => {
      const user = { id: '1', tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user));
      
      // Mock getTierLimit to return 0 (exhausted)
      jest.spyOn(tierConfig, 'getTierLimit').mockReturnValue(0);
      
      await expect(
        mockExportService.exportToCSV(['1', '2'], 'plus')
      ).rejects.toThrow('No exports remaining this month');
      
      tierConfig.getTierLimit.mockRestore();
    });

    it('should handle empty user in localStorage', async () => {
      localStorage.setItem('user', '{}');
      
      await expect(
        mockExportService.exportToCSV(['1', '2'], 'free')
      ).rejects.toThrow('Export feature not available');
    });

    it('should handle missing user in localStorage', async () => {
      localStorage.removeItem('user');
      
      await expect(
        mockExportService.exportToCSV(['1', '2'], 'free')
      ).rejects.toThrow('Export feature not available');
    });

    it('should generate CSV with basic headers for plus tier', async () => {
      const user = { id: '1', tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const csv = mockExportService.generateCSV(['1', '2'], 'plus');
      
      expect(csv).toContain('ID,Name,Address,Type,Sectors,Verified');
      expect(csv).toContain('ABN');
      expect(csv).toContain('Phone');
      expect(csv).toContain('Email');
      expect(csv).not.toContain('Revenue');
    });

    it('should generate CSV with full headers for premium tier', async () => {
      const user = { id: '1', tier: 'premium' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const csv = mockExportService.generateCSV(['1', '2'], 'premium');
      
      expect(csv).toContain('ABN');
      expect(csv).toContain('Revenue');
      expect(csv).toContain('Employees');
      expect(csv).toContain('Local Content %');
      expect(csv).toContain('Year Established');
    });

    it('should generate CSV with minimal headers for free tier', async () => {
      const csv = mockExportService.generateCSV(['1'], 'free');
      
      expect(csv).toContain('ID,Name,Address,Type,Sectors,Verified');
      expect(csv).not.toContain('ABN');
      expect(csv).not.toContain('Revenue');
    });

    it('should handle multiple company IDs in CSV', async () => {
      const user = { id: '1', tier: 'premium' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const csv = mockExportService.generateCSV(['1', '2', '3', '4', '5'], 'premium');
      const lines = csv.split('\\n');
      
      expect(lines.length).toBe(6); // 1 header + 5 data rows
    });
  });

  describe('exportToPDF', () => {
    it('should export PDF for premium tier', async () => {
      const user = { id: '1', tier: 'premium' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockExportService.exportToPDF(['1', '2'], 'premium');
      
      expect(result.success).toBe(true);
      expect(result).toHaveProperty('filename');
      expect(result.filename).toMatch(/^companies-export-\d+\.pdf$/);
    });

    it('should reject for plus tier', async () => {
      const user = { id: '1', tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user));
      
      await expect(
        mockExportService.exportToPDF(['1', '2'], 'plus')
      ).rejects.toThrow('PDF export only available in Premium tier');
    });

    it('should reject for free tier', async () => {
      const user = { id: '1', tier: 'free' };
      localStorage.setItem('user', JSON.stringify(user));
      
      await expect(
        mockExportService.exportToPDF(['1', '2'], 'free')
      ).rejects.toThrow('PDF export only available in Premium tier');
    });

    it('should generate PDF content with basic info', async () => {
      const content = mockExportService.generatePDFContent(['1', '2'], 'plus');
      
      expect(content).toContain('Company Export Report');
      expect(content).toContain('User Tier: PLUS');
      expect(content).toContain('Total Companies: 2');
      expect(content).toContain('Company 1');
      expect(content).toContain('Company 2');
      expect(content).toContain('ABN');
      expect(content).toContain('Phone');
    });

    it('should generate PDF content with full data for premium', async () => {
      const content = mockExportService.generatePDFContent(['1', '2'], 'premium');
      
      expect(content).toContain('User Tier: PREMIUM');
      expect(content).toContain('ABN');
      expect(content).toContain('Revenue');
      expect(content).toContain('Employees');
      expect(content).toContain('Local Content');
    });

    it('should generate PDF content without extended data for free tier', async () => {
      const content = mockExportService.generatePDFContent(['1'], 'free');
      
      expect(content).toContain('User Tier: FREE');
      expect(content).toContain('Company 1');
      expect(content).not.toContain('ABN');
      expect(content).not.toContain('Revenue');
    });

    it('should handle multiple companies in PDF', async () => {
      const content = mockExportService.generatePDFContent(['1', '2', '3'], 'premium');
      
      expect(content).toContain('Total Companies: 3');
      expect(content).toContain('Company 1');
      expect(content).toContain('Company 2');
      expect(content).toContain('Company 3');
    });
  });

  describe('getExportQuota', () => {
    it('should return export quota for plus tier', async () => {
      const user = { id: '1', tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockExportService.getExportQuota();
      
      expect(result.data).toHaveProperty('limit');
      expect(result.data).toHaveProperty('used');
      expect(result.data).toHaveProperty('remaining');
      expect(result.data).toHaveProperty('resetDate');
      expect(result.data.limit).toBeGreaterThan(0);
      expect(result.data.remaining).toBeGreaterThanOrEqual(0);
    });

    it('should handle unlimited exports for premium', async () => {
      const user = { id: '1', tier: 'premium' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockExportService.getExportQuota();
      
      expect(result.data.limit).toBe(-1);
      expect(result.data.remaining).toBe(-1);
      expect(result.data.used).toBeGreaterThanOrEqual(0);
    });

    it('should return quota for free tier', async () => {
      const user = { id: '1', tier: 'free' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockExportService.getExportQuota();
      
      expect(result.data).toHaveProperty('limit');
      expect(result.data).toHaveProperty('used');
      expect(result.data).toHaveProperty('remaining');
    });

    it('should have valid reset date', async () => {
      const user = { id: '1', tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user));
      
      const result = await mockExportService.getExportQuota();
      const resetDate = new Date(result.data.resetDate);
      const now = new Date();
      
      expect(resetDate.getTime()).toBeGreaterThan(now.getTime());
      expect(resetDate.getDate()).toBe(1); // First day of month
    });

    it('should calculate remaining correctly when limit is set', async () => {
      const user = { id: '1', tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user));
      
      // Mock getTierLimit to return a specific value
      jest.spyOn(tierConfig, 'getTierLimit').mockReturnValue(10);
      
      const result = await mockExportService.getExportQuota();
      
      expect(result.data.limit).toBe(10);
      expect(result.data.remaining).toBe(result.data.limit - result.data.used);
      expect(result.data.remaining).toBeGreaterThanOrEqual(0);
      
      tierConfig.getTierLimit.mockRestore();
    });
  });

  describe('delay', () => {
    it('should delay execution', async () => {
      const startTime = Date.now();
      await mockExportService.delay(100);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(95); // Allow small margin
    });
  });

  describe('Integration tests', () => {
    it('should handle complete export workflow for premium user', async () => {
      const user = { id: '1', tier: 'premium' };
      localStorage.setItem('user', JSON.stringify(user));
      
      // Get quota
      const quota = await mockExportService.getExportQuota();
      expect(quota.data.limit).toBe(-1);
      
      // Export CSV
      const csvResult = await mockExportService.exportToCSV(['1', '2', '3'], 'premium');
      expect(csvResult.success).toBe(true);
      
      // Export PDF
      const pdfResult = await mockExportService.exportToPDF(['1', '2', '3'], 'premium');
      expect(pdfResult.success).toBe(true);
    });

    it('should handle tier limitations correctly', async () => {
      const user = { id: '1', tier: 'free' };
      localStorage.setItem('user', JSON.stringify(user));
      
      // Free tier cannot export
      await expect(
        mockExportService.exportToCSV(['1'], 'free')
      ).rejects.toThrow();
      
      await expect(
        mockExportService.exportToPDF(['1'], 'free')
      ).rejects.toThrow();
    });

    it('should respect tier feature access in generated content', () => {
      // Test free tier - minimal data
      const freeCsv = mockExportService.generateCSV(['1'], 'free');
      const freeHeaders = freeCsv.split('\\n')[0];
      expect(freeHeaders).toContain('ID');
      expect(freeHeaders).toContain('Name');
      expect(freeHeaders).not.toContain('ABN');
      expect(freeHeaders).not.toContain('Revenue');
      
      // Test plus tier - medium data
      const plusCsv = mockExportService.generateCSV(['1'], 'plus');
      const plusHeaders = plusCsv.split('\\n')[0];
      expect(plusHeaders).toContain('ABN');
      expect(plusHeaders).not.toContain('Revenue');
      
      // Test premium tier - full data
      const premiumCsv = mockExportService.generateCSV(['1'], 'premium');
      const premiumHeaders = premiumCsv.split('\\n')[0];
      expect(premiumHeaders).toContain('ABN');
      expect(premiumHeaders).toContain('Revenue');
      expect(premiumHeaders).toContain('Employees');
    });
  });
});