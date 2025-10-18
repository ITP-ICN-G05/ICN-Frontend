import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UpgradePrompt from './UpgradePrompt';
import { useTierAccess } from '../../hooks/useTierAccess';

jest.mock('../../hooks/useTierAccess');
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderPrompt = (props = {}) => {
  return render(
    <BrowserRouter>
      <UpgradePrompt {...props} />
    </BrowserRouter>
  );
};

describe('UpgradePrompt', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useTierAccess.mockReturnValue({
      userTier: 'free',
      canUpgrade: jest.fn(() => true),
    });
  });

  it('renders full prompt by default', () => {
    renderPrompt();

    expect(screen.getByText('Upgrade Your Plan')).toBeInTheDocument();
    expect(screen.getByText('Upgrade to access this feature')).toBeInTheDocument();
    expect(screen.getByText('View Plans')).toBeInTheDocument();
  });

  it('renders compact version when compact is true', () => {
    renderPrompt({ compact: true });

    expect(screen.getByText('🔒 Upgrade')).toBeInTheDocument();
    expect(screen.queryByText('Upgrade Your Plan')).not.toBeInTheDocument();
  });

  it('displays custom message', () => {
    renderPrompt({ message: 'Custom upgrade message' });

    expect(screen.getByText('Custom upgrade message')).toBeInTheDocument();
  });

  it('shows current tier', () => {
    renderPrompt();

    expect(screen.getByText(/Current plan:/)).toBeInTheDocument();
    expect(screen.getByText('free')).toBeInTheDocument();
  });

  it('navigates to pricing page when clicked', () => {
    renderPrompt();

    const button = screen.getByText('View Plans');
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/pricing');
  });

  it('navigates to pricing in compact mode', () => {
    renderPrompt({ compact: true });

    const button = screen.getByText('🔒 Upgrade');
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/pricing');
  });

  it('does not render if user cannot upgrade', () => {
    useTierAccess.mockReturnValue({
      userTier: 'premium',
      canUpgrade: jest.fn(() => false),
    });

    const { container } = renderPrompt();

    expect(container.firstChild).toBeNull();
  });

  it('renders emoji in full version', () => {
    renderPrompt();

    expect(screen.getByText('⬆️')).toBeInTheDocument();
  });

  it('accepts feature prop', () => {
    renderPrompt({ feature: 'ADVANCED_SEARCH' });

    // Component should still render even with feature prop
    expect(screen.getByText('Upgrade Your Plan')).toBeInTheDocument();
  });
});