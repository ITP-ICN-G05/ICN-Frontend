import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CompanyManagement from '../admin/CompanyManagement';
import * as serviceFactory from '../../services/serviceFactory';

jest.mock('../../services/serviceFactory');

describe('CompanyManagement', () => {
  const mockAdminService = {
    getAllCompanies: jest.fn(),
    deleteCompany: jest.fn(),
    updateCompany: jest.fn(),
    addCompany: jest.fn(),
  };

  const mockCompanies = [
    {
      id: 1,
      name: 'TechCorp Industries',
      type: 'Manufacturer',
      address: '123 Smith St, Melbourne',
      verified: true,
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Global Supply Co',
      type: 'Supplier',
      address: '456 Queen Rd, Melbourne',
      verified: true,
      createdAt: '2024-01-20'
    },
    {
      id: 3,
      name: 'ServiceMax Pro',
      type: 'Service Provider',
      address: '789 King Ave, Melbourne',
      verified: false,
      createdAt: '2024-02-01'
    }
  ];

  let originalConsoleError;
  let originalConsoleLog;

  beforeAll(() => {
    originalConsoleError = console.error;
    originalConsoleLog = console.log;
    
    // Mock URL methods
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    serviceFactory.getAdminService.mockReturnValue(mockAdminService);
    mockAdminService.getAllCompanies.mockResolvedValue({
      data: mockCompanies
    });
    console.error = jest.fn();
    console.log = jest.fn();
    
    // Reset URL mocks
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
    jest.restoreAllMocks();
  });

  const renderComponent = () => {
    return render(<CompanyManagement />);
  };

  // ===== BASIC RENDERING TESTS =====
  test('renders company management page', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Company Management')).toBeInTheDocument();
      expect(screen.getByText('+ Add Company')).toBeInTheDocument();
    });
  });

  test('displays list of companies', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
      expect(screen.getByText('Global Supply Co')).toBeInTheDocument();
      expect(screen.getByText('ServiceMax Pro')).toBeInTheDocument();
    });
  });

  test('displays all company fields correctly', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Manufacturer')).toBeInTheDocument();
      expect(screen.getByText('Supplier')).toBeInTheDocument();
      expect(screen.getByText('Service Provider')).toBeInTheDocument();
      expect(screen.getByText('123 Smith St, Melbourne')).toBeInTheDocument();
    });
  });

  // ===== SEARCH TESTS =====
  test('filters companies by search term', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search companies...');
    fireEvent.change(searchInput, { target: { value: 'TechCorp' } });

    await waitFor(() => {
      expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
      expect(screen.queryByText('Global Supply Co')).not.toBeInTheDocument();
    });
  });

  test('search is case insensitive', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search companies...');
    fireEvent.change(searchInput, { target: { value: 'techcorp' } });

    await waitFor(() => {
      expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
    });
  });

  // ===== DELETE TESTS =====
  test('handles delete company with confirmation', async () => {
    window.confirm = jest.fn(() => true);
    mockAdminService.deleteCompany.mockResolvedValue({ success: true });
    
    renderComponent();
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this company?'
    );
    
    await waitFor(() => {
      expect(mockAdminService.deleteCompany).toHaveBeenCalledWith(1);
    });
  });

  test('cancels delete when user declines confirmation', async () => {
    window.confirm = jest.fn(() => false);
    
    renderComponent();
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(mockAdminService.deleteCompany).not.toHaveBeenCalled();
  });

  test('handles delete error with message', async () => {
    window.confirm = jest.fn(() => true);
    window.alert = jest.fn();
    mockAdminService.deleteCompany.mockRejectedValue(
      new Error('Delete failed')
    );
    
    renderComponent();
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Failed to delete company: Delete failed'
      );
    });
  });

  test('handles delete error without message property', async () => {
    window.confirm = jest.fn(() => true);
    window.alert = jest.fn();
    mockAdminService.deleteCompany.mockRejectedValue('String error');
    
    renderComponent();
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Failed to delete company: Unknown error'
      );
    });
  });

  test('handles delete when deleteCompany method does not exist', async () => {
    window.confirm = jest.fn(() => true);
    const serviceWithoutDelete = {
      getAllCompanies: jest.fn().mockResolvedValue({ data: mockCompanies })
    };
    serviceFactory.getAdminService.mockReturnValue(serviceWithoutDelete);
    
    renderComponent();
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
    });

    expect(window.confirm).toHaveBeenCalled();
  });

  // ===== ADD COMPANY TESTS =====
  test('opens add company form', async () => {
    renderComponent();
    
    await waitFor(() => {
      const addButton = screen.getByText('+ Add Company');
      fireEvent.click(addButton);
    });
    
    expect(screen.getByText('Add Company')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  test('submits add company form successfully', async () => {
    window.alert = jest.fn();
    mockAdminService.addCompany.mockResolvedValue({ id: 4 });
    
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('+ Add Company'));
    });

    fireEvent.change(screen.getByLabelText('Company Name'), {
      target: { value: 'New Company' }
    });
    fireEvent.change(screen.getByLabelText('Type'), {
      target: { value: 'Tech' }
    });
    fireEvent.change(screen.getByLabelText('Address'), {
      target: { value: '123 Test St' }
    });

    const form = screen.getByText('Add').closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockAdminService.addCompany).toHaveBeenCalledWith({
        name: 'New Company',
        type: 'Tech',
        address: '123 Test St',
        verified: false
      });
    });
  });

  test('adds company with verified checkbox', async () => {
    mockAdminService.addCompany.mockResolvedValue({ id: 4 });
    
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('+ Add Company'));
    });

    fireEvent.change(screen.getByLabelText('Company Name'), {
      target: { value: 'Verified Company' }
    });
    fireEvent.change(screen.getByLabelText('Type'), {
      target: { value: 'Type' }
    });
    fireEvent.change(screen.getByLabelText('Address'), {
      target: { value: 'Address' }
    });
    
    const checkbox = screen.getByLabelText('Verified');
    fireEvent.click(checkbox);

    const form = screen.getByText('Add').closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockAdminService.addCompany).toHaveBeenCalledWith(
        expect.objectContaining({ verified: true })
      );
    });
  });

  test('handles add company error', async () => {
    window.alert = jest.fn();
    mockAdminService.addCompany.mockRejectedValue(new Error('Add failed'));
    
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('+ Add Company'));
    });

    fireEvent.change(screen.getByLabelText('Company Name'), {
      target: { value: 'Test' }
    });
    fireEvent.change(screen.getByLabelText('Type'), {
      target: { value: 'Test' }
    });
    fireEvent.change(screen.getByLabelText('Address'), {
      target: { value: 'Test' }
    });

    const form = screen.getByText('Add').closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Failed to save company: Add failed'
      );
    });
  });

  test('cancels add company form', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('+ Add Company'));
    });

    expect(screen.getByText('Add Company')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByText('Add Company')).not.toBeInTheDocument();
    });
  });

  test('closes modal when clicking overlay', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('+ Add Company'));
    });

    const overlay = screen.getByText('Add Company').closest('.modal-overlay');
    fireEvent.click(overlay);

    await waitFor(() => {
      expect(screen.queryByText('Add Company')).not.toBeInTheDocument();
    });
  });

  test('prevents modal close when clicking modal content', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('+ Add Company'));
    });

    const modalContent = screen.getByText('Add Company').closest('.modal-content');
    fireEvent.click(modalContent);

    expect(screen.getByText('Add Company')).toBeInTheDocument();
  });

  // ===== EDIT COMPANY TESTS =====
  test('opens edit company form', async () => {
    renderComponent();
    
    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
    });

    expect(screen.getByText('Edit Company')).toBeInTheDocument();
    expect(screen.getByDisplayValue('TechCorp Industries')).toBeInTheDocument();
  });

  test('submits edit company form successfully', async () => {
    mockAdminService.updateCompany.mockResolvedValue({ success: true });
    
    renderComponent();
    
    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
    });

    fireEvent.change(screen.getByLabelText('Company Name'), {
      target: { value: 'Updated Name' }
    });

    const form = screen.getByText('Update').closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockAdminService.updateCompany).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ name: 'Updated Name' })
      );
    });
  });

  test('handles edit company error', async () => {
    window.alert = jest.fn();
    mockAdminService.updateCompany.mockRejectedValue(new Error('Update failed'));
    
    renderComponent();
    
    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
    });

    const form = screen.getByText('Update').closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Failed to save company: Update failed'
      );
    });
  });

  // ===== IMPORT/EXPORT TESTS =====
  test('imports CSV file successfully', async () => {
    window.alert = jest.fn();
    const csvContent = 'Name,Type,Address,Verified\nNew Co,Tech,123 St,true';
    
    // Create proper File mock with text() method
    const mockFile = new Blob([csvContent], { type: 'text/csv' });
    mockFile.text = jest.fn().mockResolvedValue(csvContent);
    
    renderComponent();
    
    await waitFor(() => {
      const importInput = screen.getByText('📥 Import CSV')
        .closest('label')
        .querySelector('input[type="file"]');
      
      Object.defineProperty(importInput, 'files', {
        value: [mockFile],
        writable: false
      });
      
      fireEvent.change(importInput);
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Successfully imported 1 companies'
      );
    });
  });

  test('handles import with no file selected', async () => {
    renderComponent();
    
    await waitFor(() => {
      const importInput = screen.getByText('📥 Import CSV')
        .closest('label')
        .querySelector('input[type="file"]');
      
      fireEvent.change(importInput);
    });

    // Should not crash or show error
  });

  test('handles import error', async () => {
    window.alert = jest.fn();
    
    const mockFile = new Blob(['invalid content'], { type: 'text/csv' });
    mockFile.text = jest.fn().mockRejectedValue(new Error('Read failed'));
    
    renderComponent();
    
    await waitFor(() => {
      const importInput = screen.getByText('📥 Import CSV')
        .closest('label')
        .querySelector('input[type="file"]');
      
      Object.defineProperty(importInput, 'files', {
        value: [mockFile],
        writable: false
      });
      
      fireEvent.change(importInput);
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Failed to import CSV: Read failed'
      );
    });
  });

  test('exports companies to CSV', async () => {
    const mockLink = {
      click: jest.fn(),
      href: '',
      download: '',
      style: {},
      setAttribute: jest.fn(),
      getAttribute: jest.fn()
    };
    
    // Store original createElement
    const originalCreateElement = document.createElement.bind(document);
    
    // Mock only for 'a' tags
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') {
        return mockLink;
      }
      // Call the real createElement for all other elements
      return originalCreateElement(tag);
    });
    
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('📤 Export All'));
    });

    expect(mockLink.click).toHaveBeenCalled();
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
  });

  test('handles export error', async () => {
    window.alert = jest.fn();
    
    // Temporarily break createObjectURL
    const originalCreateObjectURL = global.URL.createObjectURL;
    global.URL.createObjectURL = jest.fn(() => {
      throw new Error('Export failed');
    });
    
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('📤 Export All'));
    });

    expect(window.alert).toHaveBeenCalledWith(
      'Failed to export: Export failed'
    );
    
    // Restore immediately in this test
    global.URL.createObjectURL = originalCreateObjectURL;
  });

  // ===== API RESPONSE EDGE CASES =====
  test('handles API response without data property', async () => {
    mockAdminService.getAllCompanies.mockResolvedValue(mockCompanies);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
    });
  });

  test('handles non-array API response', async () => {
    mockAdminService.getAllCompanies.mockResolvedValue({ 
      data: { invalid: 'data' } 
    });
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Company Management')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully with fallback data', async () => {
    mockAdminService.getAllCompanies.mockRejectedValue(
      new Error('Failed to fetch')
    );
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Company Management')).toBeInTheDocument();
    });
    
    expect(console.error).toHaveBeenCalledWith(
      'Error loading companies:',
      expect.any(Error)
    );
  });

  // ===== UI TESTS =====
  test('displays verified status correctly', async () => {
    renderComponent();
    
    await waitFor(() => {
      const verifiedElements = screen.getAllByText('✓');
      const unverifiedElements = screen.getAllByText('✗');
      
      expect(verifiedElements.length).toBeGreaterThan(0);
      expect(unverifiedElements.length).toBeGreaterThan(0);
    });
  });

  test('shows import and export buttons', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('📥 Import CSV')).toBeInTheDocument();
      expect(screen.getByText('📤 Export All')).toBeInTheDocument();
    });
  });

  test('shows edit button for each company', async () => {
    renderComponent();
    
    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      expect(editButtons).toHaveLength(mockCompanies.length);
    });
  });
});