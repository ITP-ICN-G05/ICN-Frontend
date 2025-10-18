import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookmarkButton from './BookmarkButton';
import { renderWithProviders } from '../../utils/testUtils';

const mockCompany = {
  id: 1,
  name: 'Test Company',
};

const mockBookmarkService = {
  addBookmark: jest.fn(),
  removeBookmark: jest.fn(),
  getBookmarkStats: jest.fn(),
};

const mockBookmarkContext = {
  isBookmarked: jest.fn(() => false),
  reloadBookmarks: jest.fn(),
};

jest.mock('../../services/serviceFactory', () => ({
  getBookmarkService: () => mockBookmarkService,
}));

jest.mock('../../contexts/BookmarkContext', () => ({
  useBookmarks: () => mockBookmarkContext,
}));

jest.mock('../../hooks/useTierAccess', () => ({
  useTierAccess: () => ({
    hasAccess: jest.fn(() => true),
    getLimit: jest.fn(() => 10),
  }),
}));

describe('BookmarkButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    window.alert = jest.fn();
    mockBookmarkService.addBookmark.mockResolvedValue({ success: true });
    mockBookmarkService.removeBookmark.mockResolvedValue({ success: true });
    mockBookmarkService.getBookmarkStats.mockResolvedValue({ total: 5 });
  });

  describe('Rendering', () => {
    it('renders bookmark button with default size', () => {
      renderWithProviders(<BookmarkButton company={mockCompany} />);
      expect(screen.getByRole('button')).toHaveClass('bookmark-btn-medium');
    });

    it('renders with small size', () => {
      renderWithProviders(<BookmarkButton company={mockCompany} size="small" />);
      expect(screen.getByRole('button')).toHaveClass('bookmark-btn-small');
    });

    it('renders with large size', () => {
      renderWithProviders(<BookmarkButton company={mockCompany} size="large" />);
      expect(screen.getByRole('button')).toHaveClass('bookmark-btn-large');
    });

    it('shows label by default', () => {
      renderWithProviders(<BookmarkButton company={mockCompany} />);
      expect(screen.getByText('Bookmark')).toBeInTheDocument();
    });

    it('hides label when showLabel is false', () => {
      renderWithProviders(<BookmarkButton company={mockCompany} showLabel={false} />);
      expect(screen.queryByText('Bookmark')).not.toBeInTheDocument();
    });

    it('shows unfilled star icon when not bookmarked', () => {
      mockBookmarkContext.isBookmarked.mockReturnValue(false);
      renderWithProviders(<BookmarkButton company={mockCompany} />);
      expect(screen.getByText('☆')).toBeInTheDocument();
    });

    it('shows filled star icon when bookmarked', () => {
      mockBookmarkContext.isBookmarked.mockReturnValue(true);
      renderWithProviders(<BookmarkButton company={mockCompany} />);
      expect(screen.getByText('★')).toBeInTheDocument();
    });
  });

  describe('Authentication', () => {
    it('shows alert when user is not logged in', () => {
      renderWithProviders(<BookmarkButton company={mockCompany} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(window.alert).toHaveBeenCalledWith('Please log in to bookmark companies');
    });

    it('allows bookmarking when user is logged in', async () => {
      const user = { id: 1, name: 'Test User' };
      localStorage.setItem('user', JSON.stringify(user));
      
      renderWithProviders(<BookmarkButton company={mockCompany} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockBookmarkService.addBookmark).toHaveBeenCalledWith(mockCompany.id);
      });
    });
  });

  describe('Bookmark Actions', () => {
    beforeEach(() => {
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test User' }));
    });

    it('adds bookmark when not bookmarked', async () => {
      mockBookmarkContext.isBookmarked.mockReturnValue(false);
      
      renderWithProviders(<BookmarkButton company={mockCompany} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockBookmarkService.addBookmark).toHaveBeenCalledWith(mockCompany.id);
        expect(mockBookmarkContext.reloadBookmarks).toHaveBeenCalled();
      });
    });

    it('removes bookmark when already bookmarked', async () => {
      mockBookmarkContext.isBookmarked.mockReturnValue(true);
      
      renderWithProviders(<BookmarkButton company={mockCompany} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockBookmarkService.removeBookmark).toHaveBeenCalledWith(mockCompany.id);
        expect(mockBookmarkContext.reloadBookmarks).toHaveBeenCalled();
      });
    });

    it('shows loading state during bookmark action', async () => {
      mockBookmarkService.addBookmark.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      renderWithProviders(<BookmarkButton company={mockCompany} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it('updates button state after successful bookmark', async () => {
      renderWithProviders(<BookmarkButton company={mockCompany} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Bookmarked')).toBeInTheDocument();
      });
    });

    it('handles bookmark error', async () => {
      mockBookmarkService.addBookmark.mockRejectedValue(new Error('Failed to bookmark'));
      
      renderWithProviders(<BookmarkButton company={mockCompany} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Failed to bookmark');
      });
    });
  });

  describe('Tier Access', () => {
    beforeEach(() => {
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test User' }));
    });

    it('checks bookmark limit for free tier users', async () => {
      const mockUseTierAccess = require('../../hooks/useTierAccess').useTierAccess;
      mockUseTierAccess.mockReturnValue({
        hasAccess: jest.fn(() => false),
        getLimit: jest.fn(() => 5),
      });
      
      mockBookmarkService.getBookmarkStats.mockResolvedValue({ total: 5 });
      
      renderWithProviders(<BookmarkButton company={mockCompany} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          'Bookmark limit reached (5 max). Upgrade your plan to bookmark more companies.'
        );
      });
    });

    it('allows unlimited bookmarks for premium users', async () => {
      const mockUseTierAccess = require('../../hooks/useTierAccess').useTierAccess;
      mockUseTierAccess.mockReturnValue({
        hasAccess: jest.fn(() => true),
        getLimit: jest.fn(() => -1),
      });
      
      renderWithProviders(<BookmarkButton company={mockCompany} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockBookmarkService.addBookmark).toHaveBeenCalled();
      });
    });
  });

  describe('Event Handling', () => {
    it('stops event propagation on click', () => {
      localStorage.setItem('user', JSON.stringify({ id: 1 }));
      const onParentClick = jest.fn();
      
      const { container } = renderWithProviders(
        <div onClick={onParentClick}>
          <BookmarkButton company={mockCompany} />
        </div>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(onParentClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has appropriate title for unbookmarked state', () => {
      renderWithProviders(<BookmarkButton company={mockCompany} />);
      expect(screen.getByRole('button')).toHaveAttribute('title', 'Add bookmark');
    });

    it('has appropriate title for bookmarked state', () => {
      mockBookmarkContext.isBookmarked.mockReturnValue(true);
      renderWithProviders(<BookmarkButton company={mockCompany} />);
      expect(screen.getByRole('button')).toHaveAttribute('title', 'Remove bookmark');
    });

    it('disables button when loading', async () => {
      localStorage.setItem('user', JSON.stringify({ id: 1 }));
      mockBookmarkService.addBookmark.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      renderWithProviders(<BookmarkButton company={mockCompany} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(button).toBeDisabled();
    });
  });
});