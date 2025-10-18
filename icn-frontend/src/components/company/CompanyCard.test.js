import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CompanyCard from './CompanyCard';

const mockCompany = {
  id: 1,
  name: 'Tech Solutions Ltd',
  type: 'Manufacturer',
  employees: 150,
  distance: 5.2,
  description: 'Leading technology manufacturer specializing in advanced components',
  sectors: ['Technology', 'Manufacturing'],
  capabilities: ['Design', 'Manufacturing', 'Assembly'],
  ownership: ['Female-owned'],
  verified: true,
};

const mockUnverifiedCompany = {
  ...mockCompany,
  id: 2,
  name: 'Startup Inc',
  verified: false,
  ownership: [],
};

describe('CompanyCard', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders company name correctly', () => {
    render(<CompanyCard company={mockCompany} onClick={mockOnClick} />);
    expect(screen.getByText('Tech Solutions Ltd')).toBeInTheDocument();
  });

  it('renders company type', () => {
    render(<CompanyCard company={mockCompany} onClick={mockOnClick} />);
    expect(screen.getByText('Manufacturer')).toBeInTheDocument();
  });

  it('renders employee count', () => {
    render(<CompanyCard company={mockCompany} onClick={mockOnClick} />);
    expect(screen.getByText('150 employees')).toBeInTheDocument();
  });

  it('renders distance', () => {
    render(<CompanyCard company={mockCompany} onClick={mockOnClick} />);
    expect(screen.getByText(/5.2 km/)).toBeInTheDocument();
  });

  it('renders company description', () => {
    render(<CompanyCard company={mockCompany} onClick={mockOnClick} />);
    expect(screen.getByText(/Leading technology manufacturer/)).toBeInTheDocument();
  });

  it('shows verified icon for verified companies', () => {
    render(<CompanyCard company={mockCompany} onClick={mockOnClick} />);
    const verifiedIcon = screen.getByTitle('Verified');
    expect(verifiedIcon).toBeInTheDocument();
    expect(verifiedIcon).toHaveClass('verified-icon');
  });

  it('does not show verified icon for unverified companies', () => {
    render(<CompanyCard company={mockUnverifiedCompany} onClick={mockOnClick} />);
    expect(screen.queryByTitle('Verified')).not.toBeInTheDocument();
  });

  it('renders all sectors', () => {
    render(<CompanyCard company={mockCompany} onClick={mockOnClick} />);
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Manufacturing')).toBeInTheDocument();
  });

  it('renders capabilities with limit of 3', () => {
    const companyWithManyCaps = {
      ...mockCompany,
      capabilities: ['Design', 'Manufacturing', 'Assembly', 'Distribution', 'Testing'],
    };
    render(<CompanyCard company={companyWithManyCaps} onClick={mockOnClick} />);
    
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('Manufacturing')).toBeInTheDocument();
    expect(screen.getByText('Assembly')).toBeInTheDocument();
    expect(screen.queryByText('Distribution')).not.toBeInTheDocument();
    expect(screen.queryByText('Testing')).not.toBeInTheDocument();
  });

  it('renders ownership badges', () => {
    render(<CompanyCard company={mockCompany} onClick={mockOnClick} />);
    expect(screen.getByText('Female-owned')).toBeInTheDocument();
  });

  it('does not render ownership section if empty', () => {
    const { container } = render(
      <CompanyCard company={mockUnverifiedCompany} onClick={mockOnClick} />
    );
    expect(container.querySelector('.company-ownership')).not.toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    render(<CompanyCard company={mockCompany} onClick={mockOnClick} />);
    const card = screen.getByText('Tech Solutions Ltd').closest('.company-card-search');
    fireEvent.click(card);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<CompanyCard company={mockCompany} onClick={mockOnClick} />);
    expect(container.querySelector('.company-card-search')).toBeInTheDocument();
    expect(container.querySelector('.company-card-header')).toBeInTheDocument();
    expect(container.querySelector('.company-info')).toBeInTheDocument();
  });

  it('handles empty sectors array', () => {
    const companyNoSectors = { ...mockCompany, sectors: [] };
    render(<CompanyCard company={companyNoSectors} onClick={mockOnClick} />);
    const sectorsLabel = screen.getByText('Sectors:');
    expect(sectorsLabel).toBeInTheDocument();
  });

  it('handles empty capabilities array', () => {
    const companyNoCaps = { ...mockCompany, capabilities: [] };
    render(<CompanyCard company={companyNoCaps} onClick={mockOnClick} />);
    const capsLabel = screen.getByText('Capabilities:');
    expect(capsLabel).toBeInTheDocument();
  });

  it('renders multiple ownership badges', () => {
    const companyMultiOwned = {
      ...mockCompany,
      ownership: ['Female-owned', 'First Nations-owned', 'Social Enterprise'],
    };
    render(<CompanyCard company={companyMultiOwned} onClick={mockOnClick} />);
    
    expect(screen.getByText('Female-owned')).toBeInTheDocument();
    expect(screen.getByText('First Nations-owned')).toBeInTheDocument();
    expect(screen.getByText('Social Enterprise')).toBeInTheDocument();
  });

  it('handles undefined onClick gracefully', () => {
    expect(() => {
      render(<CompanyCard company={mockCompany} />);
    }).not.toThrow();
  });
});