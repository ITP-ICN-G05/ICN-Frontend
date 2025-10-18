import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CompaniesPage from '../companies/CompaniesPage';
import * as serviceFactory from '../../services/serviceFactory';

jest.mock('../../services/serviceFactory');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

/**
 * CompaniesPage Test Suite
 * 
 * All console output is suppressed during tests to keep output clean.
 * This includes console.log from MockCompanyService and console.error from error handling.
 */
describe('CompaniesPage', () => {
  // Store original console methods
  let originalConsoleLog;
  let originalConsoleError;
  let originalAlert;

  const mockCompanyService = {
    getAll: jest.fn(),
  };

  const mockExportService = {
    exportData: jest.fn(),
  };

  const mockCompanies = [
    {
      id: 1,
      name: 'TechCorp Industries',
      type: 'Manufacturer',
      sectors: ['Technology', 'Electronics'],
      capabilities: ['Manufacturing', 'Assembly', 'Design'],
      address: '123 Smith Street, Melbourne, VIC 3000',
      size: 'Large',
      employees: '500+',
      verified: true,
      ownership: [],
      abn: '12 345 678 901',
      description: 'Leading manufacturer of electronic components',
      website: 'www.techcorp.com.au',
      localContent: 85
    },
    {
      id: 2,
      name: 'Global Supply Co',
      type: 'Supplier',
      sectors: ['Logistics', 'Distribution'],
      capabilities: ['Supply Chain', 'Warehousing', 'Distribution'],
      address: '456 Queen Road, Melbourne, VIC 3006',
      size: 'Medium',
      employees: '100-499',
      verified: true,
      ownership: ['Female-owned'],
      abn: '98 765 432 109',
      description: 'Comprehensive supply chain solutions',
      website: 'www.globalsupply.com.au',
      localContent: 75
    }
  ];

  // Suppress console output for all tests
  beforeAll(() => {
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    originalAlert = window.alert;
    
    console.log = jest.fn();
    console.error = jest.fn();
    window.alert = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    window.alert = originalAlert;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Clear mock implementations
    console.log.mockClear();
    console.error.mockClear();
    window.alert.mockClear();
    
    serviceFactory.getCompanyService.mockReturnValue(mockCompanyService);
    serviceFactory.getExportService.mockReturnValue(mockExportService);
    
    mockCompanyService.getAll.mockResolvedValue({
      data: mockCompanies
    });

    // Mock localStorage
    const mockUser = { tier: 'free' };
    localStorage.setItem('user', JSON.stringify(mockUser));
  });

  afterEach(() => {
    localStorage.clear();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <CompaniesPage />
      </BrowserRouter>
    );
  };

  test('renders companies page', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('ICN Victoria Company Database')).toBeInTheDocument();
    });
  });

  test('displays list of companies', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
      expect(screen.getByText('Global Supply Co')).toBeInTheDocument();
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

  test('filters companies by sector', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
    });

    const sectorSelect = screen.getByDisplayValue('All Sectors');
    fireEvent.change(sectorSelect, { target: { value: 'Technology' } });

    await waitFor(() => {
      expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
      expect(screen.queryByText('Global Supply Co')).not.toBeInTheDocument();
    });
  });

  test('filters companies by capability', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
    });

    const capabilitySelect = screen.getByDisplayValue('All Capabilities');
    fireEvent.change(capabilitySelect, { target: { value: 'Manufacturing' } });

    await waitFor(() => {
      expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
      expect(screen.queryByText('Global Supply Co')).not.toBeInTheDocument();
    });
  });

  test('switches between grid and list view', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
    });

    const listViewButton = screen.getByText('List View');
    fireEvent.click(listViewButton);

    const companiesGrid = document.querySelector('.companies-grid');
    expect(companiesGrid).toHaveClass('list');

    const gridViewButton = screen.getByText('Grid View');
    fireEvent.click(gridViewButton);

    expect(companiesGrid).not.toHaveClass('list');
  });

  test('handles export CSV', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
    });

    const exportCSVButton = screen.getByText('Export CSV');
    fireEvent.click(exportCSVButton);

    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining('Basic export')
    );
  });

  test('handles export PDF', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
    });

    const exportPDFButton = screen.getByText('Export PDF');
    fireEvent.click(exportPDFButton);

    expect(window.alert).toHaveBeenCalled();
  });

  test('shows tier-specific information for free tier', async () => {
    localStorage.setItem('user', JSON.stringify({ tier: 'free' }));
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/Your free tier shows basic company information/)).toBeInTheDocument();
    });
  });

  test('shows tier-specific information for plus tier', async () => {
    localStorage.setItem('user', JSON.stringify({ tier: 'plus' }));
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/Your plus tier shows standard company information/)).toBeInTheDocument();
    });
  });

  test('shows tier-specific information for premium tier', async () => {
    localStorage.setItem('user', JSON.stringify({ tier: 'premium' }));
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/Your premium tier shows full company information/)).toBeInTheDocument();
    });
  });

  test('displays verified badges', async () => {
    // Set user to plus or premium tier to see verified badges
    localStorage.setItem('user', JSON.stringify({ tier: 'plus' }));
    renderComponent();
    
    await waitFor(() => {
      const verifiedBadges = screen.getAllByText('✓ Verified');
      expect(verifiedBadges.length).toBe(2);
    });
  });

  test('displays sector tags', async () => {
    renderComponent();
    
    await waitFor(() => {
      // Use getAllByText to handle multiple matches (dropdown + tags)
      const technologyElements = screen.getAllByText('Technology');
      expect(technologyElements.length).toBeGreaterThan(0);
      
      const electronicsElements = screen.getAllByText('Electronics');
      expect(electronicsElements.length).toBeGreaterThan(0);
      
      const logisticsElements = screen.getAllByText('Logistics');
      expect(logisticsElements.length).toBeGreaterThan(0);
    });
  });

  test('displays capability tags', async () => {
    renderComponent();
    
    await waitFor(() => {
      // Use getAllByText to handle multiple matches (dropdowns + tags)
      const manufacturingElements = screen.getAllByText('Manufacturing');
      expect(manufacturingElements.length).toBeGreaterThan(0);
      
      const assemblyElements = screen.getAllByText('Assembly');
      expect(assemblyElements.length).toBeGreaterThan(0);
      
      const supplyChainElements = screen.getAllByText('Supply Chain');
      expect(supplyChainElements.length).toBeGreaterThan(0);
    });
  });

  test('navigates to company detail on view details click', async () => {
    renderComponent();
    
    await waitFor(() => {
      const viewButtons = screen.getAllByText('View Details');
      expect(viewButtons.length).toBeGreaterThan(0);
    });

    const viewButtons = screen.getAllByText('View Details');
    fireEvent.click(viewButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/company/1');
  });

  test('displays company websites', async () => {
    renderComponent();
    
    await waitFor(() => {
      const websiteLinks = screen.getAllByText(/Website/);
      expect(websiteLinks.length).toBeGreaterThan(0);
    });
  });

  test('displays ownership badges for premium users', async () => {
    localStorage.setItem('user', JSON.stringify({ tier: 'premium' }));
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Female-owned')).toBeInTheDocument();
    });
  });

  test('displays local content for premium users', async () => {
    localStorage.setItem('user', JSON.stringify({ tier: 'premium' }));
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Local Content: 85%')).toBeInTheDocument();
      expect(screen.getByText('Local Content: 75%')).toBeInTheDocument();
    });
  });

  test('displays employee count for premium users', async () => {
    localStorage.setItem('user', JSON.stringify({ tier: 'premium' }));
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Employees: 500+')).toBeInTheDocument();
      expect(screen.getByText('Employees: 100-499')).toBeInTheDocument();
    });
  });

  test('shows loading state', () => {
    mockCompanyService.getAll.mockImplementation(() => new Promise(() => {}));
    renderComponent();
    
    expect(screen.getByText('Loading companies...')).toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    mockCompanyService.getAll.mockRejectedValue(new Error('API Error'));
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('ICN Victoria Company Database')).toBeInTheDocument();
    });
  });

  test('displays results count', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Showing 2 companies')).toBeInTheDocument();
    });
  });

  test('combines multiple filters', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search companies...');
    const sectorSelect = screen.getByDisplayValue('All Sectors');

    fireEvent.change(searchInput, { target: { value: 'Tech' } });
    fireEvent.change(sectorSelect, { target: { value: 'Technology' } });

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
    fireEvent.change(searchInput, { target: { value: 'TECHCORP' } });

    await waitFor(() => {
      expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
    });
  });

  test('displays company addresses', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('123 Smith Street, Melbourne, VIC 3000')).toBeInTheDocument();
      expect(screen.getByText('456 Queen Road, Melbourne, VIC 3006')).toBeInTheDocument();
    });
  });
});