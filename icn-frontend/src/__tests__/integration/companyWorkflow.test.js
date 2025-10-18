// src/__tests__/integration/companyWorkflow.test.js
import { mockCompanyService } from '../../services/mockCompanyService';
import { mockBookmarkService } from '../../services/mockBookmarkService';
import { mockExportService } from '../../services/mockExportService';

describe('Company Workflow Integration', () => {
  beforeEach(async () => {
    localStorage.clear();
    const user = { id: '1', tier: 'premium' };
    localStorage.setItem('user', JSON.stringify(user));
    await mockCompanyService.loadICNData();
    
    // Mock URL.createObjectURL for export tests
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();
    
    // Mock link.click() to prevent jsdom navigation error
    HTMLAnchorElement.prototype.click = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should complete search, view, and bookmark workflow', async () => {
    // 1. Search companies - use a more generic term or empty string to get results
    const searchResults = await mockCompanyService.search('');
    expect(searchResults.data.length).toBeGreaterThan(0);

    // 2. Get first company details
    const company = searchResults.data[0];
    const details = await mockCompanyService.getById(company.id);
    expect(details.id).toBe(company.id);
    expect(details).toHaveProperty('description');

    // 3. Bookmark the company
    const bookmark = await mockBookmarkService.addBookmark(company.id);
    expect(bookmark.success).toBe(true);

    // 4. Verify bookmark exists
    const isBookmarked = await mockBookmarkService.isBookmarked(company.id);
    expect(isBookmarked.data).toBe(true);

    // 5. Get all bookmarks
    const bookmarks = await mockBookmarkService.getUserBookmarks();
    expect(bookmarks.data.length).toBeGreaterThan(0);

    // 6. Remove bookmark
    const removed = await mockBookmarkService.removeBookmark(company.id);
    expect(removed.success).toBe(true);
  });

  it('should filter and export companies', async () => {
    // 1. Filter companies
    const filtered = await mockCompanyService.getAll({
      companyType: 'supplier',
      state: 'VIC',
      verificationStatus: 'verified'
    });
    expect(filtered.data).toBeInstanceOf(Array);

    // 2. Export filtered results
    const companyIds = filtered.data.slice(0, 10).map(c => c.id);
    const exportResult = await mockExportService.exportToCSV(companyIds, 'premium');
    expect(exportResult.success).toBe(true);
    
    // Verify createObjectURL was called
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it('should handle company CRUD operations', async () => {
    // 1. Create company
    const newCompany = {
      name: 'Integration Test Co',
      address: '123 Test St, Melbourne VIC',
      keySectors: ['Technology', 'Manufacturing']
    };
    const created = await mockCompanyService.create(newCompany);
    expect(created).toHaveProperty('id');

    // 2. Update company
    const updates = { name: 'Updated Test Co' };
    const updated = await mockCompanyService.update(created.id, updates);
    expect(updated.name).toBe('Updated Test Co');

    // 3. Get by ID
    const retrieved = await mockCompanyService.getById(created.id);
    expect(retrieved.name).toBe('Updated Test Co');

    // 4. Delete company
    const deleted = await mockCompanyService.delete(created.id);
    expect(deleted.success).toBe(true);

    // 5. Verify deletion
    await expect(
      mockCompanyService.getById(created.id)
    ).rejects.toThrow('Company not found');
  });
});