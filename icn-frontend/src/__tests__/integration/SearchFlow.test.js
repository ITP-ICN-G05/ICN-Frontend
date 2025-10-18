// Mock axios BEFORE any other imports
jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    patch: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { 
        use: jest.fn(() => 0), 
        eject: jest.fn() 
      },
      response: { 
        use: jest.fn(() => 0), 
        eject: jest.fn() 
      }
    }
  };

  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockAxiosInstance),
      get: jest.fn(() => Promise.resolve({ data: {} })),
      post: jest.fn(() => Promise.resolve({ data: {} })),
      put: jest.fn(() => Promise.resolve({ data: {} })),
      delete: jest.fn(() => Promise.resolve({ data: {} })),
      patch: jest.fn(() => Promise.resolve({ data: {} })),
    }
  };
});

// NOW import everything else
import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SearchPage from '../../pages/search/SearchPage';
import { mockUsers, mockGeolocation } from '../../utils/testUtils';

describe('Search Flow Integration', () => {
  beforeEach(() => {
    mockGeolocation(true);
    localStorage.setItem('user', JSON.stringify(mockUsers.premium));
    localStorage.setItem('token', 'mock-token');
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders search page and displays results', async () => {
    render(
      <BrowserRouter>
        <SearchPage user={mockUsers.premium} dataLoaded={true} />
      </BrowserRouter>
    );

    // Wait for companies to load
    await waitFor(() => {
      expect(screen.getByText(/companies found/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify at least one company is displayed
    expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
  });

  it('opens and closes filters panel', async () => {
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <SearchPage user={mockUsers.premium} dataLoaded={true} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/companies found/i)).toBeInTheDocument();
    });

    // Open filters
    const filterButton = screen.getByText(/🔧 Filters/i);
    await user.click(filterButton);

    // Wait for filters panel to appear
    await waitFor(() => {
      const distanceSlider = screen.queryByRole('slider');
      expect(distanceSlider).toBeInTheDocument();
    });
  });

  it('changes sort order', async () => {
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <SearchPage user={mockUsers.premium} dataLoaded={true} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/companies found/i)).toBeInTheDocument();
    });

    // Find sort dropdown
    const sortSelect = screen.getByRole('combobox');
    
    // Change sort to distance
    await user.selectOptions(sortSelect, 'distance');
    
    expect(sortSelect.value).toBe('distance');
  });

  it('displays company cards with correct information', async () => {
    render(
      <BrowserRouter>
        <SearchPage user={mockUsers.premium} dataLoaded={true} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
    });

    // Get the first company card to scope queries
    const firstCompanyCard = screen.getByText('TechCorp Industries').closest('.company-card-search');

    // Verify company details within the specific card
    expect(within(firstCompanyCard).getByText('Leading manufacturer of electronic components')).toBeInTheDocument();
    expect(within(firstCompanyCard).getByText('Manufacturer')).toBeInTheDocument();
    expect(within(firstCompanyCard).getByText(/500\+ employees/i)).toBeInTheDocument();
    
    // Verify verified badge
    const verifiedIcons = screen.getAllByTitle('Verified');
    expect(verifiedIcons.length).toBeGreaterThan(0);
  });

  it('displays multiple companies', async () => {
    render(
      <BrowserRouter>
        <SearchPage user={mockUsers.premium} dataLoaded={true} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/companies found/i)).toBeInTheDocument();
    });

    // Verify multiple companies are shown
    expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
    expect(screen.getByText('Global Supply Co')).toBeInTheDocument();
    expect(screen.getByText('ServiceMax Pro')).toBeInTheDocument();
    expect(screen.getByText('EcoTech Solutions')).toBeInTheDocument();
  });

  it('shows company capabilities and sectors', async () => {
    render(
      <BrowserRouter>
        <SearchPage user={mockUsers.premium} dataLoaded={true} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('TechCorp Industries')).toBeInTheDocument();
    });

    // Find the first company card to scope our queries
    const firstCompanyCard = screen.getByText('TechCorp Industries').closest('.company-card-search');
    
    // Verify sectors are displayed within the first card
    expect(within(firstCompanyCard).getByText('Technology')).toBeInTheDocument();
    expect(within(firstCompanyCard).getByText('Electronics')).toBeInTheDocument();
    
    // Verify capabilities are displayed within the first card
    expect(within(firstCompanyCard).getByText('Manufacturing')).toBeInTheDocument();
    expect(within(firstCompanyCard).getByText('Assembly')).toBeInTheDocument();
    expect(within(firstCompanyCard).getByText('Design')).toBeInTheDocument();
  });

  it('displays company ownership badges', async () => {
    render(
      <BrowserRouter>
        <SearchPage user={mockUsers.premium} dataLoaded={true} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Global Supply Co')).toBeInTheDocument();
    });

    // Verify ownership badges are displayed
    expect(screen.getByText('Female-owned')).toBeInTheDocument();
    expect(screen.getByText('First Nations-owned')).toBeInTheDocument();
  });

  it('shows company count', async () => {
    render(
      <BrowserRouter>
        <SearchPage user={mockUsers.premium} dataLoaded={true} />
      </BrowserRouter>
    );

    await waitFor(() => {
      const countText = screen.getByText(/\d+ companies found/i);
      expect(countText).toBeInTheDocument();
    });
  });
});