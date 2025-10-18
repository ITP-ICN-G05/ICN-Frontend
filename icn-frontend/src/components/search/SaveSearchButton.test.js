import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SaveSearchButton from './SaveSearchButton';

const mockSearchParams = {
  query: 'technology',
  filters: {
    sectors: ['Technology'],
    distance: 50,
  },
};

const mockSavedSearchService = {
  saveSearch: jest.fn(),
};

const mockNavigate = jest.fn();

jest.mock('../../services/serviceFactory', () => ({
  getSavedSearchService: () => mockSavedSearchService,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../hooks/useTierAccess', () => ({
  useTierAccess: () => ({
    hasAccess: jest.fn(() => true),
  }),
}));

const renderButton = (props = {}) => {
  const defaultProps = {
    searchParams: mockSearchParams,
    resultCount: 10,
  };
  
  return render(
    <BrowserRouter>
      <SaveSearchButton {...defaultProps} {...props} />
    </BrowserRouter>
  );
};

describe('SaveSearchButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    window.alert = jest.fn();
    window.confirm = jest.fn(() => true);
    mockSavedSearchService.saveSearch.mockResolvedValue({ success: true });
  });

  describe('Rendering', () => {
    it('renders save search button', () => {
      renderButton();
      expect(screen.getByText('💾 Save Search')).toBeInTheDocument();
    });

    it('shows saving state', async () => {
      mockSavedSearchService.saveSearch.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      const user = { id: 1, tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user));
      
      renderButton();
      
      const button = screen.getByText('💾 Save Search');
      fireEvent.click(button);
      
      // Modal should appear
      await waitFor(() => {
        expect(screen.getByText('Save Search')).toBeInTheDocument();
      });
      
      // Submit the form
      const saveButton = screen.getByRole('button', { name: /Save Search/i });
      fireEvent.click(saveButton);
      
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('disables button when saving', async () => {
      mockSavedSearchService.saveSearch.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      const user = { id: 1, tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user));
      
      renderButton();
      
      fireEvent.click(screen.getByText('💾 Save Search'));
      
      await waitFor(() => {
        expect(screen.getByText('Save Search')).toBeInTheDocument();
      });
      
      const saveButton = screen.getByRole('button', { name: /Save Search/i });
      fireEvent.click(saveButton);
      
      expect(saveButton).toBeDisabled();
    });
  });

  describe('Authentication', () => {
    it('shows alert when user is not logged in', () => {
      renderButton();
      
      const button = screen.getByText('💾 Save Search');
      fireEvent.click(button);
      
      expect(window.alert).toHaveBeenCalledWith('Please log in to save searches');
    });

    it('opens modal when user is logged in', async () => {
      const user = { id: 1, tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user));
      
      renderButton();
      
      const button = screen.getByText('💾 Save Search');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Save Search')).toBeInTheDocument();
      });
    });
  });

  describe('Tier Access', () => {
    it('shows upgrade prompt for free tier users', () => {
      const mockUseTierAccess = require('../../hooks/useTierAccess').useTierAccess;
      mockUseTierAccess.mockReturnValue({
        hasAccess: jest.fn(() => false),
      });
      
      const user = { id: 1, tier: 'free' };
      localStorage.setItem('user', JSON.stringify(user));
      
      renderButton();
      
      const button = screen.getByText('💾 Save Search');
      fireEvent.click(button);
      
      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('Saved searches require Plus or Premium')
      );
    });

    it('navigates to pricing when user confirms upgrade', () => {
      const mockUseTierAccess = require('../../hooks/useTierAccess').useTierAccess;
      mockUseTierAccess.mockReturnValue({
        hasAccess: jest.fn(() => false),
      });
      
      window.confirm = jest.fn(() => true);
      
      const user = { id: 1, tier: 'free' };
      localStorage.setItem('user', JSON.stringify(user));
      
      renderButton();
      
      const button = screen.getByText('💾 Save Search');
      fireEvent.click(button);
      
      expect(mockNavigate).toHaveBeenCalledWith('/pricing');
    });

    it('does not navigate when user cancels upgrade', () => {
      const mockUseTierAccess = require('../../hooks/useTierAccess').useTierAccess;
      mockUseTierAccess.mockReturnValue({
        hasAccess: jest.fn(() => false),
      });
      
      window.confirm = jest.fn(() => false);
      
      const user = { id: 1, tier: 'free' };
      localStorage.setItem('user', JSON.stringify(user));
      
      renderButton();
      
      const button = screen.getByText('💾 Save Search');
      fireEvent.click(button);
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Modal Interaction', () => {
    beforeEach(() => {
      const user = { id: 1, tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user));
    });

    it('passes search params to modal', async () => {
      renderButton();
      
      const button = screen.getByText('💾 Save Search');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('10 results found')).toBeInTheDocument();
      });
    });

    it('closes modal when cancel is clicked', async () => {
      renderButton();
      
      fireEvent.click(screen.getByText('💾 Save Search'));
      
      await waitFor(() => {
        expect(screen.getByText('Save Search')).toBeInTheDocument();
      });
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Save Search')).not.toBeInTheDocument();
      });
    });

    it('saves search with entered data', async () => {
      renderButton();
      
      fireEvent.click(screen.getByText('💾 Save Search'));
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Search Name/)).toBeInTheDocument();
      });
      
      const nameInput = screen.getByLabelText(/Search Name/);
      fireEvent.change(nameInput, { target: { value: 'My Custom Search' } });
      
      const saveButton = screen.getAllByText('Save Search')[1]; // Second one is in modal
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockSavedSearchService.saveSearch).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'My Custom Search',
            query: 'technology',
            resultCount: 10,
          })
        );
      });
    });

    it('shows success alert after saving', async () => {
      renderButton();
      
      fireEvent.click(screen.getByText('💾 Save Search'));
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Search Name/)).toBeInTheDocument();
      });
      
      const saveButton = screen.getAllByText('Save Search')[1];
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Search saved successfully!');
      });
    });

    it('shows error alert on save failure', async () => {
      mockSavedSearchService.saveSearch.mockRejectedValue(
        new Error('Failed to save')
      );
      
      renderButton();
      
      fireEvent.click(screen.getByText('💾 Save Search'));
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Search Name/)).toBeInTheDocument();
      });
      
      const saveButton = screen.getAllByText('Save Search')[1];
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Failed to save');
      });
    });

    it('closes modal after successful save', async () => {
      renderButton();
      
      fireEvent.click(screen.getByText('💾 Save Search'));
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Search Name/)).toBeInTheDocument();
      });
      
      const saveButton = screen.getAllByText('Save Search')[1];
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.queryByLabelText(/Search Name/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty search params', () => {
      const user = { id: 1, tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user));
      
      renderButton({ searchParams: {}, resultCount: 0 });
      
      expect(screen.getByText('💾 Save Search')).toBeInTheDocument();
    });

    it('handles undefined result count', () => {
      const user = { id: 1, tier: 'plus' };
      localStorage.setItem('user', JSON.stringify(user));
      
      renderButton({ resultCount: undefined });
      
      expect(screen.getByText('💾 Save Search')).toBeInTheDocument();
    });
  });
});