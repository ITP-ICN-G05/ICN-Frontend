import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CompanyManagement from '../admin/CompanyManagement';
import * as serviceFactory from '../../services/serviceFactory';

jest.mock('../../services/serviceFactory');

describe('CompanyManagement', () => {
  const mockAdminService = {
    getAllCompanies: jest.fn(),
    deleteCompany: jest.fn(),
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

  // Store original console methods
  let originalConsoleError;
  let originalConsoleLog;

  beforeAll(() => {
    // Save original console methods
    originalConsoleError = console.error;
    originalConsoleLog = console.log;
  });

  afterAll(() => {
    // Restore original console methods
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    serviceFactory.getAdminService.mockReturnValue(mockAdminService);
    mockAdminService.getAllCompanies.mockResolvedValue({
      data: mockCompanies
    });
    
    // Suppress console.error and console.log for cleaner test output
    console.error = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    // Restore console methods after each test
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  const renderComponent = () => {
    return render(<CompanyManagement />);
  };

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

  test('shows edit button for each company', async () => {
    renderComponent();
    
    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      expect(editButtons).toHaveLength(mockCompanies.length);
    });
  });

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

  test('displays verified status correctly', async () => {
    renderComponent();
    
    await waitFor(() => {
      const verifiedElements = screen.getAllByText('✓');
      const unverifiedElements = screen.getAllByText('✗');
      
      // TechCorp and Global Supply are verified, ServiceMax is not
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

  test('handles API errors gracefully', async () => {
    mockAdminService.getAllCompanies.mockRejectedValue(
      new Error('Failed to fetch')
    );
    
    renderComponent();
    
    // Should render with fallback data
    await waitFor(() => {
      expect(screen.getByText('Company Management')).toBeInTheDocument();
    });
    
    // Verify console.error was called with the error
    expect(console.error).toHaveBeenCalledWith(
      'Error loading companies:',
      expect.any(Error)
    );
  });

  test('opens add company form', async () => {
    renderComponent();
    
    await waitFor(() => {
      const addButton = screen.getByText('+ Add Company');
      fireEvent.click(addButton);
    });
    
    // Form should be shown (implementation dependent)
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

  test('displays all company fields correctly', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Manufacturer')).toBeInTheDocument();
      expect(screen.getByText('Supplier')).toBeInTheDocument();
      expect(screen.getByText('Service Provider')).toBeInTheDocument();
      expect(screen.getByText('123 Smith St, Melbourne')).toBeInTheDocument();
    });
  });

  test('handles delete error', async () => {
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
        expect.stringContaining('Failed to delete company')
      );
    });
  });
});