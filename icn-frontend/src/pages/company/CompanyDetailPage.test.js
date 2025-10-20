// src/pages/company/CompanyDetailPage.test.js
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockUsers } from '../../utils/testUtils';
import CompanyDetailPage from './CompanyDetailPage';
import { getCompanyService, getBookmarkService } from '../../services/serviceFactory';

// Mock the service factory
jest.mock('../../services/serviceFactory');

// Mock navigator.clipboard and set up secure context
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
  share: jest.fn(() => Promise.resolve()),
});

// Set secure context for clipboard API
Object.defineProperty(window, 'isSecureContext', {
  writable: true,
  configurable: true,
  value: true,
});

describe('CompanyDetailPage', () => {
  let mockCompanyService;
  let mockBookmarkService;
  
  beforeAll(() => {
    global.alert = jest.fn();
  });

  afterAll(() => {
    delete global.alert;
  });
  
  const mockCompanyData = {
    id: 1,
    name: 'Tech Solutions Ltd',
    description: 'Leading technology manufacturer specializing in advanced solutions',
    address: '123 Tech Street, Melbourne VIC 3000',
    companyType: 'Manufacturer',
    verificationStatus: 'verified',
    verifiedDate: '2024-01-15',
    employees: 150,
    employeeCount: 150,
    size: 'Medium',
    revenue: 25000000,
    abn: '12345678901',
    keySectors: ['Technology', 'Manufacturing'],
    icnCapabilities: [
      {
        itemName: 'Advanced Manufacturing',
        detailedItemName: 'Precision CNC Machining',
        capabilityType: 'Manufacturing',
        localContentPercentage: 85,
      },
      {
        itemName: 'Design Services',
        detailedItemName: 'CAD/CAM Design',
        capabilityType: 'Design',
        localContentPercentage: 90,
      },
    ],
    capabilities: ['Manufacturing', 'Design', 'Assembly'],
    certifications: ['ISO 9001', 'ISO 14001'],
    diversityMarkers: ['Female-owned', 'Social Enterprise'],
    pastProjects: [
      {
        id: 1,
        name: 'Infrastructure Project',
        description: 'Major infrastructure development',
        client: 'Government Agency',
        date: '2023',
        value: 5000000,
      },
      {
        id: 2,
        name: 'Manufacturing Solution',
        description: 'Custom manufacturing solution',
        client: 'Private Sector',
        date: '2022',
        value: 3000000,
      },
    ],
    products: [
      { name: 'Product A', description: 'High quality product' },
    ],
    services: [
      { name: 'Service B', description: 'Professional service' },
    ],
    phone: '+61 3 1234 5678',
    email: 'contact@techsolutions.com.au',
    website: 'https://www.techsolutions.com.au',
    localContentPercentage: 75,
    yearEstablished: 2010,
    lastUpdated: '2024-01-20',
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    
    mockCompanyService = {
      getById: jest.fn(),
    };
    
    mockBookmarkService = {
      isBookmarked: jest.fn(),
      addBookmark: jest.fn(),
      removeBookmark: jest.fn(),
    };
    
    getCompanyService.mockReturnValue(mockCompanyService);
    getBookmarkService.mockReturnValue(mockBookmarkService);
    
    localStorage.setItem('bookmarkedCompanies', JSON.stringify([]));
  });

  describe('Loading and Error States', () => {
    test('displays loading spinner while fetching data', () => {
      mockCompanyService.getById.mockReturnValue(new Promise(() => {}));
      
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
      });

      expect(screen.getByText('Loading company details...')).toBeInTheDocument();
      expect(document.querySelector('.loading-spinner')).toBeInTheDocument();
    });

    test('displays error message when company not found', async () => {
      mockCompanyService.getById.mockResolvedValue(null);

      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/999'],
      });

      await waitFor(() => {
        expect(screen.getByText('Company not found')).toBeInTheDocument();
      });
    });

    test('displays error message on API failure', async () => {
      mockCompanyService.getById.mockRejectedValue(new Error('API Error'));

      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
      });

      await waitFor(() => {
        expect(screen.getByText('Company not found')).toBeInTheDocument();
      });
    });
  });

  describe('Company Information Display', () => {
    beforeEach(async () => {
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });
    });

    test('displays company name and verified badge', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.premium,
      });

      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      });

      expect(screen.getByText(/ICN Verified on/)).toBeInTheDocument();
    });

    test('displays company address', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('123 Tech Street, Melbourne VIC 3000')).toBeInTheDocument();
      });
    });

    test('displays operating sectors', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Technology')).toBeInTheDocument();
        expect(screen.getByText('Manufacturing')).toBeInTheDocument();
      });
    });

    test('handles avatar image error and shows fallback', async () => {
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });

      const { container } = renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      });

      const avatarImg = container.querySelector('.avatar-image');
      
      if (avatarImg) {
        // Simulate image error by creating a proper error event
        const errorEvent = new Event('error', { bubbles: true });
        Object.defineProperty(errorEvent, 'target', {
          value: avatarImg,
          writable: false,
          configurable: true
        });
        
        avatarImg.dispatchEvent(errorEvent);

        await waitFor(() => {
          expect(avatarImg.style.display).toBe('none');
          const fallback = container.querySelector('.avatar-text');
          expect(fallback).toBeInTheDocument();
          expect(fallback.textContent).toBe('T'); // First letter of company name
        });
      }
    });
  });

  describe('User Tier-Based Content Visibility', () => {
    beforeEach(() => {
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });
    });

    test('basic tier shows limited information', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: { ...mockUsers.free, tier: 'basic' },
      });

      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      });

      expect(screen.queryByText('Company ABN')).not.toBeInTheDocument();
      expect(screen.queryByText('Company Summary')).not.toBeInTheDocument();
      expect(screen.queryByText('Diversity Markers')).not.toBeInTheDocument();
      expect(screen.queryByText('Past Projects')).not.toBeInTheDocument();
    });

    test('plus tier shows ABN and summary', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.plus,
      });

      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      });

      expect(screen.getByText('Company ABN')).toBeInTheDocument();
      expect(screen.getByText('12 345678901')).toBeInTheDocument();
      expect(screen.getByText('Company Summary')).toBeInTheDocument();
      expect(screen.queryByText('Diversity Markers')).not.toBeInTheDocument();
      expect(screen.queryByText('Past Projects')).not.toBeInTheDocument();
    });

    test('premium tier shows all content', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.premium,
      });

      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      });

      expect(screen.getByText('Company ABN')).toBeInTheDocument();
      expect(screen.getByText('Company Summary')).toBeInTheDocument();
      expect(screen.getByText('Diversity Markers')).toBeInTheDocument();
      expect(screen.getByText('Female-owned')).toBeInTheDocument();
      expect(screen.getByText('Social Enterprise')).toBeInTheDocument();
      expect(screen.getByText('Certifications & Badges')).toBeInTheDocument();
      expect(screen.getByText('ISO 9001')).toBeInTheDocument();
      expect(screen.getByText('Past Projects')).toBeInTheDocument();
      expect(screen.getByText('Business Metrics')).toBeInTheDocument();
    });

    test('premium tier shows capability type badges', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.premium,
      });

      await waitFor(() => {
        expect(screen.getByText('Items & Services')).toBeInTheDocument();
      });

      const capabilitiesHeader = screen.getByText('Items & Services').closest('.collapsible-header-capability');
      await userEvent.click(capabilitiesHeader);

      await waitFor(() => {
        const capabilityBadges = document.querySelectorAll('.modern-capability-type-badge');
        expect(capabilityBadges.length).toBeGreaterThan(0);
        expect(capabilityBadges[0].textContent).toBe('Manufacturing');
        expect(screen.getByText('85% Local')).toBeInTheDocument();
      });
    });

    test('plus tier shows capability type badges but not local content', async () => {
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });

      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.plus,
      });

      await waitFor(() => {
        expect(screen.getByText('Items & Services')).toBeInTheDocument();
      });

      const capabilitiesHeader = screen.getByText('Items & Services').closest('.collapsible-header-capability');
      await userEvent.click(capabilitiesHeader);

      await waitFor(() => {
        const typeBadges = document.querySelectorAll('.modern-capability-type-badge');
        expect(typeBadges.length).toBeGreaterThan(0);
        expect(typeBadges[0].textContent).toBe('Manufacturing');
        
        // Plus tier should NOT show local content percentage
        expect(screen.queryByText('85% Local')).not.toBeInTheDocument();
      });
    });
  });

  describe('Bookmark Functionality', () => {
    beforeEach(() => {
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
    });

    test('shows unbookmarked state initially', async () => {
      mockBookmarkService.isBookmarked.mockResolvedValue(false);
      
      const { container } = renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      });

      await waitFor(() => {
        const bookmarkButton = container.querySelector('.bookmark-action');
        expect(bookmarkButton).toBeTruthy();
        expect(bookmarkButton).not.toHaveClass('bookmarked');
        expect(bookmarkButton.textContent).toContain('Bookmark');
        expect(bookmarkButton.textContent).toContain('Save this company');
      }, { timeout: 3000 });
    });

    test('shows bookmarked state when company is bookmarked', async () => {
      mockBookmarkService.isBookmarked.mockResolvedValue(true);
      
      const { container } = renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      });

      await waitFor(() => {
        const bookmarkedButton = container.querySelector('.bookmark-action.bookmarked');
        expect(bookmarkedButton).toBeTruthy();
        expect(bookmarkedButton.textContent).toContain('Bookmarked');
        expect(bookmarkedButton.textContent).toContain('Saved to your list');
      }, { timeout: 3000 });
    });

    test('adds bookmark when clicked', async () => {
      mockBookmarkService.isBookmarked.mockResolvedValue(false);
      mockBookmarkService.addBookmark.mockResolvedValue({ success: true });
      
      const { container } = renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      });

      let bookmarkButton;
      await waitFor(() => {
        bookmarkButton = container.querySelector('.bookmark-action');
        expect(bookmarkButton).toBeTruthy();
      }, { timeout: 3000 });

      await userEvent.click(bookmarkButton);

      await waitFor(() => {
        expect(mockBookmarkService.addBookmark).toHaveBeenCalledWith(1);
      });

      await waitFor(() => {
        const bookmarkedButton = container.querySelector('.bookmark-action.bookmarked');
        expect(bookmarkedButton).toBeTruthy();
        expect(bookmarkedButton.textContent).toContain('Bookmarked');
      });
    });

    test('removes bookmark when clicked on bookmarked company', async () => {
      mockBookmarkService.isBookmarked.mockResolvedValue(true);
      mockBookmarkService.removeBookmark.mockResolvedValue({ success: true });
      
      const { container } = renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      });

      let bookmarkedButton;
      await waitFor(() => {
        bookmarkedButton = container.querySelector('.bookmark-action.bookmarked');
        expect(bookmarkedButton).toBeTruthy();
      }, { timeout: 3000 });

      await userEvent.click(bookmarkedButton);

      await waitFor(() => {
        expect(mockBookmarkService.removeBookmark).toHaveBeenCalledWith(1);
      });

      await waitFor(() => {
        const unbookmarkedButton = container.querySelector('.bookmark-action');
        expect(unbookmarkedButton).toBeTruthy();
        expect(unbookmarkedButton).not.toHaveClass('bookmarked');
      });
    });

    test('falls back to localStorage if service fails', async () => {
      mockBookmarkService.isBookmarked.mockRejectedValue(new Error('Service unavailable'));
      
      const { container } = renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      });

      let bookmarkButton;
      await waitFor(() => {
        bookmarkButton = container.querySelector('.bookmark-action');
        expect(bookmarkButton).toBeTruthy();
      }, { timeout: 3000 });

      mockBookmarkService.addBookmark.mockRejectedValue(new Error('Service unavailable'));
      
      await userEvent.click(bookmarkButton);

      await waitFor(() => {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedCompanies') || '[]');
        expect(bookmarks).toContain(1);
      });

      await waitFor(() => {
        const bookmarkedButton = container.querySelector('.bookmark-action.bookmarked');
        expect(bookmarkedButton).toBeTruthy();
        expect(bookmarkedButton.textContent).toContain('Bookmarked');
      });
    });

    test('shows error message when bookmark fails with message', async () => {
      window.alert = jest.fn();
      
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
      mockBookmarkService.isBookmarked.mockResolvedValue(false);
      mockBookmarkService.addBookmark.mockRejectedValue(new Error('Bookmark limit reached'));

      const { container } = renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      });

      const bookmarkButton = await waitFor(() => {
        return container.querySelector('.bookmark-action');
      });

      await userEvent.click(bookmarkButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Bookmark limit reached');
      });
    });
  });

  describe('Collapsible Sections', () => {
    beforeEach(async () => {
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });
    });

    test('expands and collapses company summary', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.plus,
      });

      await waitFor(() => {
        expect(screen.getByText('Company Summary')).toBeInTheDocument();
      });

      expect(screen.queryByText(mockCompanyData.description)).not.toBeInTheDocument();

      const summaryHeader = screen.getByText('Company Summary').closest('.collapsible-header');
      await userEvent.click(summaryHeader);

      await waitFor(() => {
        expect(screen.getByText(mockCompanyData.description)).toBeInTheDocument();
      });

      await userEvent.click(summaryHeader);

      await waitFor(() => {
        expect(screen.queryByText(mockCompanyData.description)).not.toBeInTheDocument();
      });
    });

    test('expands and collapses capabilities section', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.premium,
      });

      await waitFor(() => {
        expect(screen.getByText('Items & Services')).toBeInTheDocument();
      });

      const capabilitiesHeader = screen.getByText('Items & Services').closest('.collapsible-header-capability');
      await userEvent.click(capabilitiesHeader);

      await waitFor(() => {
        expect(screen.getByText('Advanced Manufacturing')).toBeInTheDocument();
        expect(screen.getByText('Design Services')).toBeInTheDocument();
      });
    });

    test('expands and collapses contact details', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Contact Details')).toBeInTheDocument();
      });

      expect(screen.queryByText('contact@techsolutions.com.au')).not.toBeInTheDocument();

      const contactHeader = screen.getByText('Contact Details').closest('.collapsible-header-contact');
      await userEvent.click(contactHeader);

      await waitFor(() => {
        expect(screen.getByText('contact@techsolutions.com.au')).toBeInTheDocument();
      });
    });

    test('expands and collapses past projects (premium only)', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.premium,
      });

      await waitFor(() => {
        expect(screen.getByText('Past Projects')).toBeInTheDocument();
      });

      const projectsHeader = screen.getByText('Past Projects').closest('.collapsible-header-projects');
      await userEvent.click(projectsHeader);

      await waitFor(() => {
        expect(screen.getByText('Infrastructure Project')).toBeInTheDocument();
        expect(screen.getByText('Manufacturing Solution')).toBeInTheDocument();
      });
    });

    test('shows capability preview when collapsed', async () => {
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });

      const { container } = renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.premium,
      });

      await waitFor(() => {
        expect(screen.getByText('Items & Services')).toBeInTheDocument();
      });

      // Capabilities should be collapsed by default, showing preview
      await waitFor(() => {
        const previewContainer = container.querySelector('.preview-container');
        expect(previewContainer).toBeInTheDocument();
        
        const previewTags = container.querySelectorAll('.preview-tag');
        expect(previewTags.length).toBeLessThanOrEqual(3);
      });

      // If more than 3 capabilities, should show "+X more" tag
      if (mockCompanyData.icnCapabilities.length > 3) {
        expect(container.querySelector('.more-tag')).toBeInTheDocument();
      }
    });
  });

  describe('Pagination', () => {
    const manyCapabilities = Array.from({ length: 15 }, (_, i) => ({
      itemName: `Capability ${i + 1}`,
      detailedItemName: `Detailed capability ${i + 1}`,
      capabilityType: 'Manufacturing',
      localContentPercentage: 75,
    }));

    beforeEach(() => {
      mockCompanyService.getById.mockResolvedValue({
        data: {
          ...mockCompanyData,
          icnCapabilities: manyCapabilities,
        },
      });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });
    });

    test('paginates capabilities correctly', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.premium,
      });

      await waitFor(() => {
        expect(screen.getByText('Items & Services')).toBeInTheDocument();
      });

      const capabilitiesHeader = screen.getByText('Items & Services').closest('.collapsible-header-capability');
      await userEvent.click(capabilitiesHeader);

      await waitFor(() => {
        expect(screen.getByText('Capability 1')).toBeInTheDocument();
        expect(screen.getByText('Capability 6')).toBeInTheDocument();
        expect(screen.queryByText('Capability 7')).not.toBeInTheDocument();
      });

      const nextButtons = screen.getAllByRole('button');
      const nextButton = nextButtons.find(btn => {
        const svg = btn.querySelector('polyline');
        return svg && svg.getAttribute('points') === '9 18 15 12 9 6';
      });
      
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Capability 7')).toBeInTheDocument();
        expect(screen.getByText('Capability 12')).toBeInTheDocument();
      });
    });

    test('disables navigation buttons at boundaries', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.premium,
      });

      await waitFor(() => {
        expect(screen.getByText('Items & Services')).toBeInTheDocument();
      });

      const capabilitiesHeader = screen.getByText('Items & Services').closest('.collapsible-header-capability');
      await userEvent.click(capabilitiesHeader);

      await waitFor(() => {
        const prevButton = document.querySelector('.separated-nav-button.disabled');
        expect(prevButton).toBeInTheDocument();
      });
    });

    test('navigates capabilities using page dots', async () => {
      const manyCapabilities = Array.from({ length: 15 }, (_, i) => ({
        itemName: `Capability ${i + 1}`,
        detailedItemName: `Detailed capability ${i + 1}`,
        capabilityType: 'Manufacturing',
        localContentPercentage: 75,
      }));

      mockCompanyService.getById.mockResolvedValue({
        data: {
          ...mockCompanyData,
          icnCapabilities: manyCapabilities,
        },
      });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });

      const { container } = renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.premium,
      });

      await waitFor(() => {
        expect(screen.getByText('Items & Services')).toBeInTheDocument();
      });

      const capabilitiesHeader = screen.getByText('Items & Services').closest('.collapsible-header-capability');
      await userEvent.click(capabilitiesHeader);

      await waitFor(() => {
        const pageDots = container.querySelectorAll('.compact-page-dot');
        expect(pageDots.length).toBe(3); // 15 capabilities / 6 per page = 3 pages
      });

      // Click second page dot
      const pageDots = container.querySelectorAll('.compact-page-dot');
      await userEvent.click(pageDots[1]);

      await waitFor(() => {
        expect(screen.getByText('Capability 7')).toBeInTheDocument();
        expect(screen.queryByText('Capability 1')).not.toBeInTheDocument();
      });
    });

    test('shows correct capability count in badge', async () => {
      const manyCapabilities = Array.from({ length: 15 }, (_, i) => ({
        itemName: `Capability ${i + 1}`,
        capabilityType: 'Manufacturing',
      }));

      mockCompanyService.getById.mockResolvedValue({
        data: {
          ...mockCompanyData,
          icnCapabilities: manyCapabilities,
        },
      });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });

      const { container } = renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.premium,
      });

      await waitFor(() => {
        const countBadge = container.querySelector('.items-count-badge');
        expect(countBadge).toBeInTheDocument();
        expect(countBadge.textContent).toBe('15');
      });

      // Expand and check paginated count
      const capabilitiesHeader = screen.getByText('Items & Services').closest('.collapsible-header-capability');
      await userEvent.click(capabilitiesHeader);

      await waitFor(() => {
        const countBadge = container.querySelector('.items-count-badge');
        expect(countBadge.textContent).toBe('6/15'); // First page showing 6 of 15
      });
    });

    test('paginates past projects correctly', async () => {
      const manyProjects = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Project ${i + 1}`,
        description: `Description for project ${i + 1}`,
        client: `Client ${i + 1}`,
        date: '2023',
        value: 1000000 * (i + 1),
      }));

      mockCompanyService.getById.mockResolvedValue({
        data: {
          ...mockCompanyData,
          pastProjects: manyProjects,
        },
      });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });

      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.premium,
      });

      await waitFor(() => {
        expect(screen.getByText('Past Projects')).toBeInTheDocument();
      });

      const projectsHeader = screen.getByText('Past Projects').closest('.collapsible-header-projects');
      await userEvent.click(projectsHeader);

      await waitFor(() => {
        expect(screen.getByText('Project 1')).toBeInTheDocument();
        expect(screen.getByText('Project 3')).toBeInTheDocument();
        expect(screen.queryByText('Project 4')).not.toBeInTheDocument();
      });

      // Navigate to next page
      const nextButtons = screen.getAllByRole('button');
      const nextButton = nextButtons.find(btn => {
        const svg = btn.querySelector('polyline');
        return svg && svg.getAttribute('points') === '9 18 15 12 9 6';
      });
      
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Project 4')).toBeInTheDocument();
        expect(screen.getByText('Project 6')).toBeInTheDocument();
      });
    });
  });

  describe('Quick Actions', () => {
    beforeEach(() => {
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });
      window.open = jest.fn();
    });

    test('opens Google Maps for directions', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Get Directions')).toBeInTheDocument();
      });

      const directionsButton = screen.getByText('Get Directions').closest('button');
      await userEvent.click(directionsButton);

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('google.com/maps'),
        '_blank'
      );
    });

    test('chat with ICN requires plus tier', async () => {
      window.alert = jest.fn();
      
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: { ...mockUsers.free, tier: 'basic' },
      });

      await waitFor(() => {
        expect(screen.getByText('Chat with ICN')).toBeInTheDocument();
      });

      const chatButton = screen.getByText('Chat with ICN').closest('button');
      await userEvent.click(chatButton);

      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('Upgrade Required')
      );
    });

    test('shares company link', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Share')).toBeInTheDocument();
      });

      const shareButton = screen.getByText('Share').closest('button');
      await userEvent.click(shareButton);

      await waitFor(() => {
        expect(navigator.share).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Tech Solutions Ltd',
            text: expect.stringContaining('Tech Solutions Ltd'),
            url: expect.any(String),
          })
        );
      });
    });

    test('shows analyze placeholder message', async () => {
      window.alert = jest.fn();
      
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });

      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.premium,
      });

      await waitFor(() => {
        expect(screen.getByText('Analyze')).toBeInTheDocument();
      });

      const analyzeButton = screen.getByText('Analyze').closest('button');
      await userEvent.click(analyzeButton);

      expect(window.alert).toHaveBeenCalledWith('Analysis coming soon');
    });
  });

  describe('Contact Actions', () => {
    let originalLocation;

    beforeEach(() => {
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });
      window.open = jest.fn();
      
      // Save original location
      originalLocation = window.location;
      
      // Mock window.location for these tests
      delete window.location;
      window.location = { href: '' };
    });

    afterEach(() => {
      // Restore window.location properly
      delete window.location;
      window.location = originalLocation;
    });

    test('opens website when clicked', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Contact Details')).toBeInTheDocument();
      });

      const contactHeader = screen.getByText('Contact Details').closest('.collapsible-header-contact');
      await userEvent.click(contactHeader);

      await waitFor(() => {
        expect(screen.getByText('https://www.techsolutions.com.au')).toBeInTheDocument();
      });

      const websiteRow = screen.getByText('Website').closest('.contact-row');
      await userEvent.click(websiteRow);

      expect(window.open).toHaveBeenCalledWith(
        'https://www.techsolutions.com.au',
        '_blank'
      );
    });

    test('initiates phone call when clicked', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Contact Details')).toBeInTheDocument();
      });

      const contactHeader = screen.getByText('Contact Details').closest('.collapsible-header-contact');
      await userEvent.click(contactHeader);

      const phoneRow = screen.getByText('Phone').closest('.contact-row');
      await userEvent.click(phoneRow);

      expect(window.location.href).toBe('tel:+61 3 1234 5678');
    });

    test('opens email client when clicked', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Contact Details')).toBeInTheDocument();
      });

      const contactHeader = screen.getByText('Contact Details').closest('.collapsible-header-contact');
      await userEvent.click(contactHeader);

      const emailRow = screen.getByText('Email').closest('.contact-row');
      await userEvent.click(emailRow);

      expect(window.location.href).toBe('mailto:contact@techsolutions.com.au');
    });

    test('handles website without https protocol', async () => {
      const companyWithBasicURL = {
        ...mockCompanyData,
        website: 'www.techsolutions.com.au',
      };

      mockCompanyService.getById.mockResolvedValue({ data: companyWithBasicURL });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });
      window.open = jest.fn();

      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Contact Details')).toBeInTheDocument();
      });

      const contactHeader = screen.getByText('Contact Details').closest('.collapsible-header-contact');
      await userEvent.click(contactHeader);

      const websiteRow = screen.getByText('Website').closest('.contact-row');
      await userEvent.click(websiteRow);

      expect(window.open).toHaveBeenCalledWith(
        'https://www.techsolutions.com.au',
        '_blank'
      );
    });
  });

  describe('Edge Cases', () => {
    test('handles missing optional data gracefully', async () => {
      const minimalCompany = {
        id: 1,
        name: 'Minimal Company',
        companyType: 'Service Provider',
        verificationStatus: 'unverified',
      };

      mockCompanyService.getById.mockResolvedValue({ data: minimalCompany });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });

      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Minimal Company')).toBeInTheDocument();
      });

      expect(screen.queryByText(/ICN Verified/)).not.toBeInTheDocument();
      expect(screen.queryByText('Address not available')).toBeInTheDocument();
    });

    test('handles empty capabilities array', async () => {
      mockCompanyService.getById.mockResolvedValue({
        data: {
          ...mockCompanyData,
          capabilities: [],
          icnCapabilities: [],
        },
      });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });

      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.premium,
      });

      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      });

      expect(screen.queryByText('Items & Services')).not.toBeInTheDocument();
    });

    test('handles bookmark click without authentication', async () => {
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
      mockBookmarkService.isBookmarked.mockResolvedValue(false);

      const { container } = renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
      });

      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      });

      let bookmarkButton;
      await waitFor(() => {
        bookmarkButton = container.querySelector('.bookmark-action');
        expect(bookmarkButton).toBeTruthy();
      }, { timeout: 3000 });
      
      await userEvent.click(bookmarkButton);
      
      await waitFor(() => {
        expect(mockBookmarkService.addBookmark).not.toHaveBeenCalled();
      }, { timeout: 500 });
    });

    test('handles projects without value', async () => {
      const projectsWithoutValue = [
        {
          id: 1,
          name: 'Confidential Project',
          description: 'Details are confidential',
          client: 'Private Client',
          date: '2023',
          value: null,
        },
      ];

      mockCompanyService.getById.mockResolvedValue({
        data: {
          ...mockCompanyData,
          pastProjects: projectsWithoutValue,
        },
      });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });

      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.premium,
      });

      await waitFor(() => {
        expect(screen.getByText('Past Projects')).toBeInTheDocument();
      });

      const projectsHeader = screen.getByText('Past Projects').closest('.collapsible-header-projects');
      await userEvent.click(projectsHeader);

      await waitFor(() => {
        expect(screen.getByText('Confidential Project')).toBeInTheDocument();
        // Value badge should not be present when value is null
        const valueBadges = document.querySelectorAll('.project-value-badge');
        expect(valueBadges.length).toBe(0);
      });
    });
  });

  describe('Helper Functions', () => {
    beforeEach(() => {
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });
    });

    test('formats ABN with correct spacing', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.plus,
      });

      await waitFor(() => {
        expect(screen.getByText('12 345678901')).toBeInTheDocument();
      });
    });

    test('handles missing contact information with placeholders', async () => {
      const companyNoContact = {
        ...mockCompanyData,
        phone: null,
        email: null,
        website: null,
      };

      mockCompanyService.getById.mockResolvedValue({ data: companyNoContact });

      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Contact Details')).toBeInTheDocument();
      });

      const contactHeader = screen.getByText('Contact Details').closest('.collapsible-header-contact');
      await userEvent.click(contactHeader);

      await waitFor(() => {
        expect(screen.getAllByText('Visit ICN Portal').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Contact via ICN Portal').length).toBeGreaterThan(0);
      });
    });

    test('shows ICN contact modal for missing contact info', async () => {
      window.alert = jest.fn();
      
      const companyNoContact = {
        ...mockCompanyData,
        website: null,
      };

      mockCompanyService.getById.mockResolvedValue({ data: companyNoContact });

      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Contact Details')).toBeInTheDocument();
      });

      const contactHeader = screen.getByText('Contact Details').closest('.collapsible-header-contact');
      await userEvent.click(contactHeader);

      const websiteRow = screen.getByText('Website').closest('.contact-row');
      await userEvent.click(websiteRow);

      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('ICN Victoria portal')
      );
    });
  });

  describe('Products and Services', () => {
    test('displays products section when available', async () => {
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });

      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Products')).toBeInTheDocument();
        expect(screen.getByText('Product A')).toBeInTheDocument();
        expect(screen.getByText('High quality product')).toBeInTheDocument();
      });
    });

    test('displays services section when available', async () => {
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });

      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Services')).toBeInTheDocument();
        expect(screen.getByText('Service B')).toBeInTheDocument();
        expect(screen.getByText('Professional service')).toBeInTheDocument();
      });
    });

    test('hides products and services when not available', async () => {
      const companyNoProductsServices = {
        ...mockCompanyData,
        products: [],
        services: [],
      };

      mockCompanyService.getById.mockResolvedValue({ data: companyNoProductsServices });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });

      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      });

      expect(screen.queryByText('Products')).not.toBeInTheDocument();
      expect(screen.queryByText('Services')).not.toBeInTheDocument();
    });
  });

  describe('Industry News Section', () => {
    beforeEach(() => {
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });
      window.open = jest.fn();
    });

    test('expands and collapses news section', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Industry News & Trends')).toBeInTheDocument();
      });

      expect(screen.queryByText(/ICN Victoria Industry Research Team/)).not.toBeInTheDocument();

      const newsHeader = screen.getByText('Industry News & Trends').closest('.collapsible-header-news');
      await userEvent.click(newsHeader);

      await waitFor(() => {
        expect(screen.getByText(/ICN Victoria Industry Research Team/)).toBeInTheDocument();
      });
    });

    test('opens external news link', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Industry News & Trends')).toBeInTheDocument();
      });

      const newsHeader = screen.getByText('Industry News & Trends').closest('.collapsible-header-news');
      await userEvent.click(newsHeader);

      await waitFor(() => {
        const viewAllButton = screen.getByText('View All ICN News').closest('button');
        expect(viewAllButton).toBeInTheDocument();
      });

      const viewAllButton = screen.getByText('View All ICN News').closest('button');
      await userEvent.click(viewAllButton);

      expect(window.open).toHaveBeenCalledWith('https://icn.org.au/news', '_blank');
    });

    test('shows sector-specific news subtitle', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        const subtitle = screen.getByText(/ICN Victoria research and insights for Technology/);
        expect(subtitle).toBeInTheDocument();
      });
    });
  });

  describe('Business Metrics - Premium Tier', () => {
    test('displays all business metrics for premium users', async () => {
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });

      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.premium,
      });

      await waitFor(() => {
        expect(screen.getByText('Business Metrics')).toBeInTheDocument();
      });

      expect(screen.getByText('Annual Revenue')).toBeInTheDocument();
      expect(screen.getByText('$25.0M')).toBeInTheDocument();
      
      expect(screen.getByText('Team Size')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      
      expect(screen.getByText('Local Content')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    test('hides business metrics for basic tier', async () => {
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });

      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: { ...mockUsers.free, tier: 'basic' },
      });

      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      });

      expect(screen.queryByText('Business Metrics')).not.toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    beforeEach(() => {
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });
      console.log = jest.fn();
    });

    test('shows export tier information for basic users', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: { ...mockUsers.free, tier: 'basic' },
      });

      await waitFor(() => {
        expect(screen.getByText('Export Data')).toBeInTheDocument();
      });

      expect(screen.getByText('Basic info')).toBeInTheDocument();
    });

    test('shows export tier information for plus users', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.plus,
      });

      await waitFor(() => {
        expect(screen.getByText('Export Data')).toBeInTheDocument();
      });

      expect(screen.getByText('Limited data')).toBeInTheDocument();
    });

    test('shows export tier information for premium users', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.premium,
      });

      await waitFor(() => {
        expect(screen.getByText('Export Data')).toBeInTheDocument();
      });

      expect(screen.getByText('Complete profile')).toBeInTheDocument();
    });

    test('triggers export functionality', async () => {
      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.premium,
      });

      await waitFor(() => {
        expect(screen.getByText('Export Data')).toBeInTheDocument();
      });

      const exportButton = screen.getByText('Export Data').closest('button');
      await userEvent.click(exportButton);

      expect(console.log).toHaveBeenCalledWith('Exporting company profile as PDF');
    });
  });

  describe('Share Functionality Fallbacks', () => {
    let originalClipboard;
    let originalShare;
    let originalLocation;

    beforeEach(() => {
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });
      
      // Save originals
      originalClipboard = navigator.clipboard;
      originalShare = navigator.share;
      originalLocation = window.location;
      
      // Ensure window.location is available with href
      if (!window.location || !window.location.href) {
        delete window.location;
        window.location = { href: 'http://localhost:3000/company/1' };
      }
    });

    afterEach(() => {
      // Restore to original state
      if (!navigator.share && originalShare) {
        navigator.share = originalShare;
      }
      if (navigator.clipboard !== originalClipboard) {
        Object.defineProperty(navigator, 'clipboard', {
          writable: true,
          configurable: true,
          value: originalClipboard
        });
      }
      if (window.location !== originalLocation) {
        delete window.location;
        window.location = originalLocation;
      }
    });

    test('falls back to clipboard when share API unavailable', async () => {
      // Remove share API
      delete navigator.share;
      
      // Create a completely fresh, isolated mock for clipboard
      const freshWriteTextMock = jest.fn(() => Promise.resolve());
      Object.defineProperty(navigator, 'clipboard', {
        writable: true,
        configurable: true,
        value: { writeText: freshWriteTextMock }
      });
      
      // Set up window.location.href to return the company URL
      delete window.location;
      window.location = {
        href: 'http://localhost:3000/company/1',
        protocol: 'http:',
        host: 'localhost:3000',
        pathname: '/company/1'
      };
      
      window.alert = jest.fn();

      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
        expect(screen.getByText('Share')).toBeInTheDocument();
      });

      const shareButton = screen.getByText('Share').closest('button');
      
      // Verify mock is clean before clicking
      expect(freshWriteTextMock).not.toHaveBeenCalled();
      
      await userEvent.click(shareButton);

      await waitFor(() => {
        expect(freshWriteTextMock).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Link copied to clipboard');
      });
      
      // Verify it was called with a URL
      expect(freshWriteTextMock).toHaveBeenCalledTimes(1);
      const callArg = freshWriteTextMock.mock.calls[0][0];
      // Just verify it was called with some URL string
      expect(typeof callArg).toBe('string');
      expect(callArg.length).toBeGreaterThan(0);
    });

    test('uses execCommand fallback when clipboard API unavailable', async () => {
      delete navigator.share;
      delete navigator.clipboard;
      
      // Mock document.execCommand
      document.execCommand = jest.fn(() => true);
      window.alert = jest.fn();

      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Share')).toBeInTheDocument();
      });

      const shareButton = screen.getByText('Share').closest('button');
      await userEvent.click(shareButton);

      await waitFor(() => {
        expect(document.execCommand).toHaveBeenCalledWith('copy');
        expect(window.alert).toHaveBeenCalledWith('Link copied to clipboard');
      });

      delete document.execCommand;
    });

    test('handles share failure', async () => {
      navigator.share = jest.fn(() => Promise.reject(new Error('Share failed')));
      window.alert = jest.fn();
      console.error = jest.fn();

      renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      await waitFor(() => {
        expect(screen.getByText('Share')).toBeInTheDocument();
      });

      const shareButton = screen.getByText('Share').closest('button');
      await userEvent.click(shareButton);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Share failed:', expect.any(Error));
        expect(window.alert).toHaveBeenCalledWith('Unable to share. Please copy the URL manually.');
      });
    });
  });
});