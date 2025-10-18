import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SavedSearchModal from './SavedSearchModal';

const mockOnSave = jest.fn();
const mockOnClose = jest.fn();

const defaultProps = {
  onSave: mockOnSave,
  onClose: mockOnClose,
  defaultQuery: 'technology',
  filters: {
    sectors: ['Technology'],
    distance: 50,
  },
  resultCount: 10,
};

describe('SavedSearchModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });

  describe('Rendering', () => {
    it('renders modal', () => {
      render(<SavedSearchModal {...defaultProps} />);
      expect(screen.getByText('Save Search')).toBeInTheDocument();
    });

    it('displays result count', () => {
      render(<SavedSearchModal {...defaultProps} />);
      expect(screen.getByText('10 results found')).toBeInTheDocument();
    });

    it('displays active filters', () => {
      render(<SavedSearchModal {...defaultProps} />);
      expect(screen.getByText('Active filters:')).toBeInTheDocument();
      expect(screen.getByText(/sectors: Technology/)).toBeInTheDocument();
      expect(screen.getByText(/distance: 50/)).toBeInTheDocument();
    });

    it('does not show filters section if no filters', () => {
      render(<SavedSearchModal {...defaultProps} filters={{}} />);
      expect(screen.queryByText('Active filters:')).not.toBeInTheDocument();
    });

    it('renders form fields', () => {
      render(<SavedSearchModal {...defaultProps} />);
      expect(screen.getByLabelText(/Search Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Enable email alerts/)).toBeInTheDocument();
    });

    it('pre-fills name with default query', () => {
      render(<SavedSearchModal {...defaultProps} />);
      const nameInput = screen.getByLabelText(/Search Name/);
      expect(nameInput.value).toBe('Search: technology');
    });

    it('uses default name if no query provided', () => {
      render(<SavedSearchModal {...defaultProps} defaultQuery="" />);
      const nameInput = screen.getByLabelText(/Search Name/);
      expect(nameInput.value).toBe('My Search');
    });
  });

  describe('Form Interaction', () => {
    it('updates name field', () => {
      render(<SavedSearchModal {...defaultProps} />);
      const nameInput = screen.getByLabelText(/Search Name/);
      
      fireEvent.change(nameInput, { target: { value: 'Custom Name' } });
      expect(nameInput.value).toBe('Custom Name');
    });

    it('updates description field', () => {
      render(<SavedSearchModal {...defaultProps} />);
      const descInput = screen.getByLabelText(/Description/);
      
      fireEvent.change(descInput, { target: { value: 'My description' } });
      expect(descInput.value).toBe('My description');
    });

    it('toggles email alerts checkbox', () => {
      render(<SavedSearchModal {...defaultProps} />);
      const checkbox = screen.getByLabelText(/Enable email alerts/);
      
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('shows alert frequency dropdown when alerts enabled', () => {
      render(<SavedSearchModal {...defaultProps} />);
      const checkbox = screen.getByLabelText(/Enable email alerts/);
      
      fireEvent.click(checkbox);
      
      expect(screen.getByLabelText(/Alert Frequency/)).toBeInTheDocument();
    });

    it('hides alert frequency when alerts disabled', () => {
      render(<SavedSearchModal {...defaultProps} />);
      expect(screen.queryByLabelText(/Alert Frequency/)).not.toBeInTheDocument();
    });

    it('changes alert frequency', () => {
      render(<SavedSearchModal {...defaultProps} />);
      
      const checkbox = screen.getByLabelText(/Enable email alerts/);
      fireEvent.click(checkbox);
      
      const frequencySelect = screen.getByLabelText(/Alert Frequency/);
      fireEvent.change(frequencySelect, { target: { value: 'weekly' } });
      
      expect(frequencySelect.value).toBe('weekly');
    });
  });

  describe('Form Submission', () => {
    it('calls onSave with form data', () => {
      render(<SavedSearchModal {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/Search Name/);
      fireEvent.change(nameInput, { target: { value: 'Test Search' } });
      
      const form = nameInput.closest('form');
      fireEvent.submit(form);
      
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Search',
          description: '',
          enableAlerts: false,
          alertFrequency: 'daily',
        })
      );
    });

    it('requires name field', () => {
      render(<SavedSearchModal {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/Search Name/);
      fireEvent.change(nameInput, { target: { value: '' } });
      
      const form = nameInput.closest('form');
      fireEvent.submit(form);
      
      expect(window.alert).toHaveBeenCalledWith('Please enter a name for your saved search');
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('trims whitespace from name', () => {
      render(<SavedSearchModal {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/Search Name/);
      fireEvent.change(nameInput, { target: { value: '   ' } });
      
      const form = nameInput.closest('form');
      fireEvent.submit(form);
      
      expect(window.alert).toHaveBeenCalled();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('includes alert settings when enabled', () => {
      render(<SavedSearchModal {...defaultProps} />);
      
      const alertCheckbox = screen.getByLabelText(/Enable email alerts/);
      fireEvent.click(alertCheckbox);
      
      const frequencySelect = screen.getByLabelText(/Alert Frequency/);
      fireEvent.change(frequencySelect, { target: { value: 'instant' } });
      
      const form = alertCheckbox.closest('form');
      fireEvent.submit(form);
      
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          enableAlerts: true,
          alertFrequency: 'instant',
        })
      );
    });
  });

  describe('Modal Controls', () => {
    it('calls onClose when cancel button clicked', () => {
      render(<SavedSearchModal {...defaultProps} />);
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when close button (×) clicked', () => {
      render(<SavedSearchModal {...defaultProps} />);
      
      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when overlay clicked', () => {
      const { container } = render(<SavedSearchModal {...defaultProps} />);
      
      const overlay = container.querySelector('.modal-overlay');
      fireEvent.click(overlay);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('does not close when modal content clicked', () => {
      const { container } = render(<SavedSearchModal {...defaultProps} />);
      
      const modal = container.querySelector('.saved-search-modal');
      fireEvent.click(modal);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Saving State', () => {
    it('disables form during save', () => {
      render(<SavedSearchModal {...defaultProps} saving={true} />);
      
      const nameInput = screen.getByLabelText(/Search Name/);
      const descInput = screen.getByLabelText(/Description/);
      const alertCheckbox = screen.getByLabelText(/Enable email alerts/);
      const cancelButton = screen.getByText('Cancel');
      const saveButton = screen.getByRole('button', { name: /Saving/i });
      
      expect(nameInput).toBeDisabled();
      expect(descInput).toBeDisabled();
      expect(alertCheckbox).toBeDisabled();
      expect(cancelButton).toBeDisabled();
      expect(saveButton).toBeDisabled();
    });

    it('shows saving text on button', () => {
      render(<SavedSearchModal {...defaultProps} saving={true} />);
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('prevents overlay close during save', () => {
      const { container } = render(<SavedSearchModal {...defaultProps} saving={true} />);
      
      const overlay = container.querySelector('.modal-overlay');
      fireEvent.click(overlay);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Filter Display', () => {
    it('displays array filters correctly', () => {
      const filters = {
        sectors: ['Technology', 'Manufacturing'],
        capabilities: ['Design', 'Assembly'],
      };
      
      render(<SavedSearchModal {...defaultProps} filters={filters} />);
      
      expect(screen.getByText(/sectors: Technology, Manufacturing/)).toBeInTheDocument();
      expect(screen.getByText(/capabilities: Design, Assembly/)).toBeInTheDocument();
    });

    it('displays scalar filters correctly', () => {
      const filters = {
        distance: 75,
        size: 'Large',
      };
      
      render(<SavedSearchModal {...defaultProps} filters={filters} />);
      
      expect(screen.getByText(/distance: 75/)).toBeInTheDocument();
      expect(screen.getByText(/size: Large/)).toBeInTheDocument();
    });

    it('skips empty filter values', () => {
      const filters = {
        sectors: [],
        distance: 0,
        verified: false,
      };
      
      render(<SavedSearchModal {...defaultProps} filters={filters} />);
      
      expect(screen.queryByText(/sectors:/)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      render(<SavedSearchModal {...defaultProps} />);
      
      expect(screen.getByLabelText(/Search Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Enable email alerts/)).toBeInTheDocument();
    });

    it('marks required fields', () => {
      render(<SavedSearchModal {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/Search Name/);
      expect(nameInput).toHaveAttribute('required');
    });

    it('provides placeholder text', () => {
      render(<SavedSearchModal {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/Search Name/);
      const descInput = screen.getByLabelText(/Description/);
      
      expect(nameInput).toHaveAttribute('placeholder');
      expect(descInput).toHaveAttribute('placeholder');
    });
  });
});