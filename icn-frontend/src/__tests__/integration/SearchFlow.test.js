// src/__tests__/integration/SearchFlow.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SearchPage from '../../pages/search/SearchPage';
import { mockUsers, mockCompanies, mockGeolocation } from '../../utils/testUtils';

// Mock services
jest.mock('../../services/icnDataService', () => ({
  searchCompanies: jest.fn(() => mockCompanies),
  getCompanies: jest.fn(() => mockCompanies),
  getStatistics: jest.fn(() => ({
    totalCompanies: 2,
    verified: 1,
    unverified: 1,
  })),
}));

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

  it('completes full search flow', async () => {
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <SearchPage user={mockUsers.premium} dataLoaded={true} />
      </BrowserRouter>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });

    // Enter search query
    const searchInput = screen.getByPlaceholderText(/Search companies/i);
    await user.type(searchInput, 'technology');

    // Apply filters
    const techFilter = screen.getByLabelText('Technology');
    await user.click(techFilter);

    // Verify results appear
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    // Click on a result
    const companyCard = screen.getByText('Tech Solutions Ltd').closest('.company-card-search');
    await user.click(companyCard);

    // Verify navigation or modal appears
    // This depends on your implementation
  });

  it('handles filter changes correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <SearchPage user={mockUsers.premium} dataLoaded={true} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });

    // Change distance filter
    const distanceSlider = screen.getByRole('slider');
    fireEvent.change(distanceSlider, { target: { value: 20 } });

    // Verify distance updated
    expect(screen.getByText('20 km')).toBeInTheDocument();

    // Select multiple sectors
    const sectors = ['Technology', 'Manufacturing'];
    for (const sector of sectors) {
      const checkbox = screen.getByLabelText(sector);
      await user.click(checkbox);
    }

    // Clear all filters
    const clearButton = screen.getByText('Clear All');
    await user.click(clearButton);

    // Verify filters cleared
    const techCheckbox = screen.getByLabelText('Technology');
    expect(techCheckbox).not.toBeChecked();
  });

  it('handles bookmark interaction', async () => {
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <SearchPage user={mockUsers.premium} dataLoaded={true} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
    });

    // Find and click bookmark button
    const bookmarkButtons = screen.getAllByRole('button', { name: /bookmark/i });
    if (bookmarkButtons.length > 0) {
      await user.click(bookmarkButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText(/bookmarked/i)).toBeInTheDocument();
      });
    }
  });
});

