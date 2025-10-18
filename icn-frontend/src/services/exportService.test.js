import { exportService } from './exportService';
import api from './api';

jest.mock('./api');

describe('exportService', () => {
  let createElementSpy;
  let appendChildSpy;
  let clickSpy;
  let removeSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    
    clickSpy = jest.fn();
    removeSpy = jest.fn();
    
    createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      setAttribute: jest.fn(),
      click: clickSpy,
      remove: removeSpy
    });
    
    appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
  });

  describe('exportToCSV', () => {
    it('should export companies to CSV', async () => {
      const csvBlob = new Blob(['test,data'], { type: 'text/csv' });
      api.post.mockResolvedValue({ data: csvBlob });

      await exportService.exportToCSV(['1', '2'], 'plus');

      expect(api.post).toHaveBeenCalledWith(
        '/export/csv',
        { companyIds: ['1', '2'], tierLevel: 'plus' },
        { responseType: 'blob' }
      );
      expect(clickSpy).toHaveBeenCalled();
      expect(removeSpy).toHaveBeenCalled();
    });
  });

  describe('exportToPDF', () => {
    it('should export companies to PDF', async () => {
      const pdfBlob = new Blob(['test pdf'], { type: 'application/pdf' });
      api.post.mockResolvedValue({ data: pdfBlob });

      await exportService.exportToPDF(['1', '2'], 'premium');

      expect(api.post).toHaveBeenCalledWith(
        '/export/pdf',
        { companyIds: ['1', '2'], tierLevel: 'premium' },
        { responseType: 'blob' }
      );
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('getExportQuota', () => {
    it('should fetch export quota', async () => {
      const quota = { data: { limit: 10, used: 3 } };
      api.get.mockResolvedValue(quota);

      const result = await exportService.getExportQuota();

      expect(api.get).toHaveBeenCalledWith('/export/quota');
      expect(result).toEqual(quota);
    });
  });
});