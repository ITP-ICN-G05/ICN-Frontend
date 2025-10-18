import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IllustrationsPage from '../illustrations/IllustrationsPage';

describe('IllustrationsPage', () => {
  const renderComponent = () => {
    return render(<IllustrationsPage />);
  };

  test('renders illustrations page', () => {
    renderComponent();
    
    expect(screen.getByText('Illustrations & Graphics')).toBeInTheDocument();
    expect(screen.getByText(/Custom illustrations and visual elements/)).toBeInTheDocument();
  });

  test('renders filter tabs', () => {
    renderComponent();
    
    expect(screen.getByText(/All/)).toBeInTheDocument();
    expect(screen.getByText('Hero Images')).toBeInTheDocument();
    expect(screen.getByText('Icons')).toBeInTheDocument();
    expect(screen.getByText('Patterns')).toBeInTheDocument();
    expect(screen.getByText('Backgrounds')).toBeInTheDocument();
  });

  test('filters illustrations by category', () => {
    renderComponent();
    
    // Initially shows all illustrations
    expect(screen.getByText('Network Connections')).toBeInTheDocument();
    expect(screen.getByText('Location Pin')).toBeInTheDocument();
    
    // Filter by hero category
    const heroTab = screen.getByText('Hero Images');
    fireEvent.click(heroTab);
    
    expect(screen.getByText('Network Connections')).toBeInTheDocument();
    expect(screen.getByText('Company Building')).toBeInTheDocument();
    expect(screen.queryByText('Location Pin')).not.toBeInTheDocument();
  });

  test('filters by icons category', () => {
    renderComponent();
    
    const iconsTab = screen.getByText('Icons');
    fireEvent.click(iconsTab);
    
    expect(screen.getByText('Location Pin')).toBeInTheDocument();
    expect(screen.getByText('Verified Badge')).toBeInTheDocument();
    expect(screen.queryByText('Network Connections')).not.toBeInTheDocument();
  });

  test('filters by patterns category', () => {
    renderComponent();
    
    const patternsTab = screen.getByText('Patterns');
    fireEvent.click(patternsTab);
    
    expect(screen.getByText('Search Pattern')).toBeInTheDocument();
    expect(screen.queryByText('Location Pin')).not.toBeInTheDocument();
  });

  test('filters by backgrounds category', () => {
    renderComponent();
    
    const backgroundsTab = screen.getByText('Backgrounds');
    fireEvent.click(backgroundsTab);
    
    expect(screen.getByText('Wave Background')).toBeInTheDocument();
    expect(screen.queryByText('Location Pin')).not.toBeInTheDocument();
  });

  test('shows all illustrations when all tab is clicked', () => {
    renderComponent();
    
    // Filter to icons first
    const iconsTab = screen.getByText('Icons');
    fireEvent.click(iconsTab);
    
    expect(screen.queryByText('Network Connections')).not.toBeInTheDocument();
    
    // Click All tab
    const allTab = screen.getByText(/^All$/);
    fireEvent.click(allTab);
    
    expect(screen.getByText('Network Connections')).toBeInTheDocument();
    expect(screen.getByText('Location Pin')).toBeInTheDocument();
  });

  test('displays illustration cards with titles and descriptions', () => {
    renderComponent();
    
    expect(screen.getByText('Network Connections')).toBeInTheDocument();
    expect(screen.getByText('Interconnected nodes representing supplier network')).toBeInTheDocument();
    
    expect(screen.getByText('Location Pin')).toBeInTheDocument();
    expect(screen.getByText('Map marker for company locations')).toBeInTheDocument();
  });

  test('displays color palettes for each illustration', () => {
    renderComponent();
    
    const colorSwatches = document.querySelectorAll('.color-swatch');
    expect(colorSwatches.length).toBeGreaterThan(0);
  });

  test('opens modal when illustration is clicked', async () => {
    renderComponent();
    
    const illustrationCard = screen.getByText('Network Connections').closest('.illustration-card');
    fireEvent.click(illustrationCard);
    
    await waitFor(() => {
      expect(screen.getByText('Download SVG')).toBeInTheDocument();
      expect(screen.getByText('Download PNG')).toBeInTheDocument();
      expect(screen.getByText('Copy Code')).toBeInTheDocument();
    });
  });

  test('closes modal when close button is clicked', async () => {
    renderComponent();
    
    const illustrationCard = screen.getByText('Network Connections').closest('.illustration-card');
    fireEvent.click(illustrationCard);
    
    await waitFor(() => {
      expect(screen.getByText('Download SVG')).toBeInTheDocument();
    });
    
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Download SVG')).not.toBeInTheDocument();
    });
  });

  test('closes modal when clicking outside', async () => {
    renderComponent();
    
    const illustrationCard = screen.getByText('Network Connections').closest('.illustration-card');
    fireEvent.click(illustrationCard);
    
    await waitFor(() => {
      expect(screen.getByText('Download SVG')).toBeInTheDocument();
    });
    
    const modal = document.querySelector('.illustration-modal');
    fireEvent.click(modal);
    
    await waitFor(() => {
      expect(screen.queryByText('Download SVG')).not.toBeInTheDocument();
    });
  });

  test('renders style guide section', () => {
    renderComponent();
    
    expect(screen.getByText('Visual Style Guide')).toBeInTheDocument();
    expect(screen.getByText('Color Palette')).toBeInTheDocument();
    expect(screen.getByText('Typography')).toBeInTheDocument();
    expect(screen.getByText('Spacing System')).toBeInTheDocument();
  });

  test('displays color palette with color codes', () => {
    renderComponent();
    
    expect(screen.getByText('Primary Orange')).toBeInTheDocument();
    expect(screen.getByText('#F99F1C')).toBeInTheDocument();
    expect(screen.getByText('Navy')).toBeInTheDocument();
    expect(screen.getByText('#003366')).toBeInTheDocument();
    expect(screen.getByText('Success Green')).toBeInTheDocument();
    expect(screen.getByText('#B6D289')).toBeInTheDocument();
  });

  test('displays typography samples', () => {
    renderComponent();
    
    expect(screen.getByText('Heading 1')).toBeInTheDocument();
    expect(screen.getByText('Heading 2')).toBeInTheDocument();
    expect(screen.getByText('Body text sample')).toBeInTheDocument();
  });

  test('displays spacing system', () => {
    renderComponent();
    
    expect(screen.getByText('8px')).toBeInTheDocument();
    expect(screen.getByText('16px')).toBeInTheDocument();
    expect(screen.getByText('24px')).toBeInTheDocument();
    expect(screen.getByText('32px')).toBeInTheDocument();
    expect(screen.getByText('48px')).toBeInTheDocument();
  });

  test('renders download section', () => {
    renderComponent();
    
    expect(screen.getByText('Download Assets')).toBeInTheDocument();
    expect(screen.getByText('Get our complete illustration pack and brand guidelines')).toBeInTheDocument();
  });

  test('displays download buttons', () => {
    renderComponent();
    
    expect(screen.getByText('Illustration Pack')).toBeInTheDocument();
    expect(screen.getByText('Brand Guidelines')).toBeInTheDocument();
    expect(screen.getByText('Figma Library')).toBeInTheDocument();
  });

  test('displays SVG previews', () => {
    renderComponent();
    
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });

  test('active filter tab has active class', () => {
    renderComponent();
    
    const allTab = screen.getByText(/^All$/).closest('.filter-tab');
    expect(allTab).toHaveClass('active');
    
    const heroTab = screen.getByText('Hero Images');
    fireEvent.click(heroTab);
    
    expect(heroTab.closest('.filter-tab')).toHaveClass('active');
    expect(allTab).not.toHaveClass('active');
  });

  test('displays category counts in filter tabs', () => {
    renderComponent();
    
    // Check that counts are displayed
    const filterTabs = document.querySelectorAll('.filter-tab .count');
    expect(filterTabs.length).toBeGreaterThan(0);
  });

  test('renders hero illustration SVG', () => {
    renderComponent();
    
    const heroSvg = document.querySelector('.hero-svg');
    expect(heroSvg).toBeInTheDocument();
  });

  test('modal does not close when clicking inside modal content', async () => {
    renderComponent();
    
    const illustrationCard = screen.getByText('Network Connections').closest('.illustration-card');
    fireEvent.click(illustrationCard);
    
    await waitFor(() => {
      expect(screen.getByText('Download SVG')).toBeInTheDocument();
    });
    
    const modalContent = document.querySelector('.modal-content');
    fireEvent.click(modalContent);
    
    // Modal should still be open
    expect(screen.getByText('Download SVG')).toBeInTheDocument();
  });

  test('illustration cards display correct categories', () => {
    renderComponent();
    
    // Each illustration should be visible in its category
    const allIllustrations = [
      'Network Connections',
      'Location Pin',
      'Search Pattern',
      'Wave Background',
      'Company Building',
      'Verified Badge'
    ];
    
    allIllustrations.forEach(title => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });
});