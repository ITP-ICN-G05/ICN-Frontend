// src/pages/company/CompanyDetailPage.test.js
import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockUsers, mockCompanies } from '../../utils/testUtils';
import CompanyDetailPage from './CompanyDetailPage';
import { getCompanyService, getBookmarkService } from '../../services/serviceFactory';

// Mock the service factory
jest.mock('../../services/serviceFactory');

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
  share: jest.fn(() => Promise.resolve()),
});

describe('CompanyDetailPage', () => {
  let mockCompanyService;
  let mockBookmarkService;
  
  beforeAll(() => {
    // Mock window.alert for all tests
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
    // Clear localStorage
    localStorage.clear();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup service mocks
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
    
    // Ensure no bookmarks in localStorage by default
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

      // Should NOT show ABN
      expect(screen.queryByText('Company ABN')).not.toBeInTheDocument();
      
      // Should NOT show company summary
      expect(screen.queryByText('Company Summary')).not.toBeInTheDocument();
      
      // Should NOT show diversity markers
      expect(screen.queryByText('Diversity Markers')).not.toBeInTheDocument();
      
      // Should NOT show past projects
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

      // Should show ABN
      expect(screen.getByText('Company ABN')).toBeInTheDocument();
      expect(screen.getByText('12 345678901')).toBeInTheDocument();
      
      // Should show company summary
      expect(screen.getByText('Company Summary')).toBeInTheDocument();
      
      // Should NOT show diversity markers (premium only)
      expect(screen.queryByText('Diversity Markers')).not.toBeInTheDocument();
      
      // Should NOT show past projects (premium only)
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

      // Should show ABN
      expect(screen.getByText('Company ABN')).toBeInTheDocument();
      
      // Should show company summary
      expect(screen.getByText('Company Summary')).toBeInTheDocument();
      
      // Should show diversity markers
      expect(screen.getByText('Diversity Markers')).toBeInTheDocument();
      expect(screen.getByText('Female-owned')).toBeInTheDocument();
      expect(screen.getByText('Social Enterprise')).toBeInTheDocument();
      
      // Should show certifications
      expect(screen.getByText('Certifications & Badges')).toBeInTheDocument();
      expect(screen.getByText('ISO 9001')).toBeInTheDocument();
      
      // Should show past projects
      expect(screen.getByText('Past Projects')).toBeInTheDocument();
      
      // Should show business metrics
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

      // Expand capabilities
      const capabilitiesHeader = screen.getByText('Items & Services').closest('.collapsible-header-capability');
      await userEvent.click(capabilitiesHeader);

      await waitFor(() => {
        // Look for the badge specifically, not just any text
        const capabilityBadges = document.querySelectorAll('.modern-capability-type-badge');
        expect(capabilityBadges.length).toBeGreaterThan(0);
        expect(capabilityBadges[0].textContent).toBe('Manufacturing');
        expect(screen.getByText('85% Local')).toBeInTheDocument();
      });
    });
  });

  describe('Bookmark Functionality', () => {
    beforeEach(() => {
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
    });

    test('shows unbookmarked state initially', async () => {
      // Return false directly, not wrapped in { data: false }
      mockBookmarkService.isBookmarked.mockResolvedValue(false);
      
      const { container } = renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        user: mockUsers.free,
      });

      // Wait for company data to load first
      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      });

      // Find bookmark button directly by class
      await waitFor(() => {
        const bookmarkButton = container.querySelector('.bookmark-action');
        expect(bookmarkButton).toBeTruthy();
        expect(bookmarkButton).not.toHaveClass('bookmarked');
        expect(bookmarkButton.textContent).toContain('Bookmark');
        expect(bookmarkButton.textContent).toContain('Save this company');
      }, { timeout: 3000 });
    });

    test('shows bookmarked state when company is bookmarked', async () => {
      // Return true directly
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

      // Wait for company data to load
      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      });

      // Find bookmark button
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

      // Summary should be collapsed initially
      expect(screen.queryByText(mockCompanyData.description)).not.toBeInTheDocument();

      // Click to expand
      const summaryHeader = screen.getByText('Company Summary').closest('.collapsible-header');
      await userEvent.click(summaryHeader);

      await waitFor(() => {
        expect(screen.getByText(mockCompanyData.description)).toBeInTheDocument();
      });

      // Click to collapse
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

      // Click to expand
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

      // Contact should be collapsed initially
      expect(screen.queryByText('contact@techsolutions.com.au')).not.toBeInTheDocument();

      // Click to expand
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

      // Click to expand
      const projectsHeader = screen.getByText('Past Projects').closest('.collapsible-header-projects');
      await userEvent.click(projectsHeader);

      await waitFor(() => {
        expect(screen.getByText('Infrastructure Project')).toBeInTheDocument();
        expect(screen.getByText('Manufacturing Solution')).toBeInTheDocument();
      });
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

      // Expand capabilities
      const capabilitiesHeader = screen.getByText('Items & Services').closest('.collapsible-header-capability');
      await userEvent.click(capabilitiesHeader);

      await waitFor(() => {
        // Should show first 6 capabilities
        expect(screen.getByText('Capability 1')).toBeInTheDocument();
        expect(screen.getByText('Capability 6')).toBeInTheDocument();
        expect(screen.queryByText('Capability 7')).not.toBeInTheDocument();
      });

      // Click next page
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
  });

  describe('Contact Actions', () => {
    beforeEach(() => {
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
      mockBookmarkService.isBookmarked.mockResolvedValue({ data: false });
      window.open = jest.fn();
      delete window.location;
      window.location = { href: '' };
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

      // Should not show verified badge
      expect(screen.queryByText(/ICN Verified/)).not.toBeInTheDocument();
      
      // Should handle missing address
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

      // Should not show capabilities section
      expect(screen.queryByText('Items & Services')).not.toBeInTheDocument();
    });

    test('handles bookmark click without authentication', async () => {
      mockCompanyService.getById.mockResolvedValue({ data: mockCompanyData });
      mockBookmarkService.isBookmarked.mockResolvedValue(false);

      const { container } = renderWithProviders(<CompanyDetailPage />, {
        initialEntries: ['/company/1'],
        // No user provided - simulating unauthenticated state
      });

      // Wait for company data to load
      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
      });

      // Find bookmark button - should still render even without auth
      let bookmarkButton;
      await waitFor(() => {
        bookmarkButton = container.querySelector('.bookmark-action');
        expect(bookmarkButton).toBeTruthy();
      }, { timeout: 3000 });
      
      // Click should trigger navigation attempt
      await userEvent.click(bookmarkButton);
      
      // Bookmark service should not be called when not authenticated
      await waitFor(() => {
        expect(mockBookmarkService.addBookmark).not.toHaveBeenCalled();
      }, { timeout: 500 });
    });
  });
});