import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FilterPanel from './FilterPanel';

const mockFilters = {
  distance: 50,
  sectors: [],
  capabilities: [],
  size: '',
  ownership: [],
  verified: false,
};

const mockUseTierAccess = {
  hasAccess: jest.fn(() => true),
};

jest.mock('../../hooks/useTierAccess', () => ({
  useTierAccess: () => mockUseTierAccess,
}));

const renderFilterPanel = (props = {}) => {
  const defaultProps = {
    filters: mockFilters,
    onFilterChange: jest.fn(),
    onClearFilters: jest.fn(),
  };
  
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <FilterPanel {...defaultProps} {...props} />
    </BrowserRouter>
  );
};

describe('FilterPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });

  describe('Rendering', () => {
    it('renders filter panel', () => {
      renderFilterPanel();
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('renders all filter groups', () => {
      renderFilterPanel();
      expect(screen.getByText('Distance')).toBeInTheDocument();
      expect(screen.getByText('Sectors')).toBeInTheDocument();
      expect(screen.getByText('Capabilities')).toBeInTheDocument();
      expect(screen.getByText('Company Size')).toBeInTheDocument();
      expect(screen.getByText('Ownership')).toBeInTheDocument();
    });

    it('renders Clear All button', () => {
      renderFilterPanel();
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('renders premium badge for ownership filters', () => {
      mockUseTierAccess.hasAccess.mockReturnValue(false);
      renderFilterPanel();
      expect(screen.getByText('Premium')).toBeInTheDocument();
    });
  });

  describe('Distance Filter', () => {
    it('displays current distance value', () => {
      renderFilterPanel({ filters: { ...mockFilters, distance: 75 } });
      expect(screen.getByText('75 km')).toBeInTheDocument();
    });

    it('calls onFilterChange when distance slider changes', () => {
      const mockOnChange = jest.fn();
      renderFilterPanel({ onFilterChange: mockOnChange });
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: 30 } });
      
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ distance: 30 })
      );
    });

    it('accepts distance values from 1 to 100', () => {
      renderFilterPanel();
      const slider = screen.getByRole('slider');
      
      expect(slider).toHaveAttribute('min', '1');
      expect(slider).toHaveAttribute('max', '100');
    });
  });

  describe('Sector Filters', () => {
    it('renders all sector options', () => {
      renderFilterPanel();
      const sectors = ['Technology', 'Manufacturing', 'Services', 'Logistics', 'Environment', 'Automotive'];
      
      // Get the Sectors section specifically
      const sectorsSection = screen.getByRole('heading', { name: 'Sectors' }).closest('.filter-group');
      
      sectors.forEach(sector => {
        expect(within(sectorsSection).getByText(sector)).toBeInTheDocument();
      });
    });

    it('checks selected sectors', () => {
      const filters = { ...mockFilters, sectors: ['Technology', 'Manufacturing'] };
      renderFilterPanel({ filters });
      
      // Scope to the Sectors section
      const sectorsSection = screen.getByRole('heading', { name: 'Sectors' }).closest('.filter-group');
      
      const techCheckbox = within(sectorsSection).getByLabelText('Technology');
      const mfgCheckbox = within(sectorsSection).getByLabelText('Manufacturing');
      
      expect(techCheckbox).toBeChecked();
      expect(mfgCheckbox).toBeChecked();
    });

    it('calls onFilterChange when sector is selected', () => {
      const mockOnChange = jest.fn();
      renderFilterPanel({ onFilterChange: mockOnChange });
      
      const techCheckbox = screen.getByLabelText('Technology');
      fireEvent.click(techCheckbox);
      
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          sectors: ['Technology']
        })
      );
    });

    it('adds sector to existing selections', () => {
      const mockOnChange = jest.fn();
      const filters = { ...mockFilters, sectors: ['Technology'] };
      renderFilterPanel({ filters, onFilterChange: mockOnChange });
      
      const servicesCheckbox = screen.getByLabelText('Services');
      fireEvent.click(servicesCheckbox);
      
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          sectors: ['Technology', 'Services']
        })
      );
    });

    it('removes sector when unchecked', () => {
      const mockOnChange = jest.fn();
      const filters = { ...mockFilters, sectors: ['Technology', 'Manufacturing'] };
      renderFilterPanel({ filters, onFilterChange: mockOnChange });
      
      const techCheckbox = screen.getByLabelText('Technology');
      fireEvent.click(techCheckbox);
      
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          sectors: ['Manufacturing']
        })
      );
    });
  });

  describe('Capability Filters', () => {
    it('renders all capability options', () => {
      renderFilterPanel();
      const capabilities = ['Manufacturing', 'Supply Chain', 'Design', 'Assembly', 'Distribution', 'Maintenance'];
      
      // Get the Capabilities section specifically
      const capabilitiesSection = screen.getByRole('heading', { name: 'Capabilities' }).closest('.filter-group');
      
      capabilities.forEach(capability => {
        expect(within(capabilitiesSection).getByText(capability)).toBeInTheDocument();
      });
    });

    it('handles capability selection', () => {
      const mockOnChange = jest.fn();
      renderFilterPanel({ onFilterChange: mockOnChange });
      
      const designCheckbox = screen.getByLabelText('Design');
      fireEvent.click(designCheckbox);
      
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          capabilities: ['Design']
        })
      );
    });
  });

  describe('Company Size Filter', () => {
    it('renders company size radio buttons', () => {
      renderFilterPanel();
      expect(screen.getByLabelText('Small')).toBeInTheDocument();
      expect(screen.getByLabelText('Medium')).toBeInTheDocument();
      expect(screen.getByLabelText('Large')).toBeInTheDocument();
    });

    it('selects company size', () => {
      const mockOnChange = jest.fn();
      renderFilterPanel({ onFilterChange: mockOnChange });
      
      const mediumRadio = screen.getByLabelText('Medium');
      fireEvent.click(mediumRadio);
      
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ size: 'Medium' })
      );
    });

    it('shows selected size as checked', () => {
      const filters = { ...mockFilters, size: 'Large' };
      renderFilterPanel({ filters });
      
      const largeRadio = screen.getByLabelText('Large');
      expect(largeRadio).toBeChecked();
    });
  });

  describe('Ownership Filters (Premium)', () => {
    it('renders ownership options', () => {
      renderFilterPanel();
      expect(screen.getByText('Female-owned')).toBeInTheDocument();
      expect(screen.getByText('First Nations-owned')).toBeInTheDocument();
      expect(screen.getByText('Social Enterprise')).toBeInTheDocument();
      expect(screen.getByText('Australian Disability Enterprise')).toBeInTheDocument();
    });

    it('allows selection when user has premium access', () => {
      mockUseTierAccess.hasAccess.mockReturnValue(true);
      const mockOnChange = jest.fn();
      renderFilterPanel({ onFilterChange: mockOnChange });
      
      const femaleOwnedCheckbox = screen.getByLabelText('Female-owned');
      fireEvent.click(femaleOwnedCheckbox);
      
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('shows alert when non-premium user tries to use ownership filter', () => {
      mockUseTierAccess.hasAccess.mockReturnValue(false);
      renderFilterPanel();
      
      const femaleOwnedCheckbox = screen.getByLabelText('Female-owned');
      fireEvent.click(femaleOwnedCheckbox);
      
      expect(window.alert).toHaveBeenCalledWith(
        'Demographic filters require Premium tier. Upgrade to access this feature.'
      );
    });

    it('disables ownership checkboxes for free users', () => {
      mockUseTierAccess.hasAccess.mockReturnValue(false);
      renderFilterPanel();
      
      const femaleOwnedCheckbox = screen.getByLabelText('Female-owned');
      expect(femaleOwnedCheckbox).toBeDisabled();
    });

    it('shows upgrade hint for non-premium users', () => {
      mockUseTierAccess.hasAccess.mockReturnValue(false);
      renderFilterPanel();
      
      expect(screen.getByText(/Upgrade to Premium/)).toBeInTheDocument();
    });
  });

  describe('Verified Filter', () => {
    it('renders verified companies checkbox', () => {
      renderFilterPanel();
      expect(screen.getByText('Verified Companies Only')).toBeInTheDocument();
    });

    it('toggles verified filter', () => {
      const mockOnChange = jest.fn();
      renderFilterPanel({ onFilterChange: mockOnChange });
      
      const verifiedCheckbox = screen.getByLabelText('Verified Companies Only');
      fireEvent.click(verifiedCheckbox);
      
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ verified: true })
      );
    });

    it('shows verified as checked when true', () => {
      const filters = { ...mockFilters, verified: true };
      renderFilterPanel({ filters });
      
      const verifiedCheckbox = screen.getByLabelText('Verified Companies Only');
      expect(verifiedCheckbox).toBeChecked();
    });
  });

  describe('Clear Filters', () => {
    it('calls onClearFilters when Clear All is clicked', () => {
      const mockOnClear = jest.fn();
      renderFilterPanel({ onClearFilters: mockOnClear });
      
      const clearButton = screen.getByText('Clear All');
      fireEvent.click(clearButton);
      
      expect(mockOnClear).toHaveBeenCalled();
    });
  });
});